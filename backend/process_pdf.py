import os
import io
from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS

import pandas as pd
import fitz
import matplotlib.pyplot as plt

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from google.cloud import storage
import firebase_admin
from firebase_admin import credentials, firestore

from werkzeug.security import generate_password_hash, check_password_hash

# =========================================================
# CONFIG
# =========================================================

GCS_BUCKET = "prime-app-infographics"
SERVICE_ACCOUNT_FILE = "service-account.json"
PROJECT_ID = "prime-app-467705"

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = SERVICE_ACCOUNT_FILE

cred = credentials.Certificate(SERVICE_ACCOUNT_FILE)
firebase_admin.initialize_app(cred)

storage_client = storage.Client()
bucket = storage_client.bucket(GCS_BUCKET)
firestore_client = firestore.Client()

app = Flask(__name__)
CORS(app)

# =========================================================
# INPUT HANDLER
# =========================================================

def download_file_from_gcs(file_url):
    filename = file_url.split("/")[-1]
    blob = bucket.blob(filename)

    buffer = io.BytesIO()
    blob.download_to_file(buffer)
    buffer.seek(0)

    return buffer, filename

# =========================================================
# NORMALIZATION LAYER
# =========================================================

def extract_data(file_buffer, filename):
    ext = filename.split(".")[-1].lower()
    tables = []

    if ext in ["xls", "xlsx"]:
        sheets = pd.read_excel(file_buffer, sheet_name=None)
        for name, df in sheets.items():
            tables.append({"name": name, "df": df})

    elif ext == "csv":
        df = pd.read_csv(file_buffer)
        tables.append({"name": "Sheet1", "df": df})

    elif ext == "pdf":
        text = ""
        doc = fitz.open(stream=file_buffer.read(), filetype="pdf")
        for page in doc:
            text += page.get_text()
        doc.close()
        tables.append({"name": "pdf_text", "text": text})

    else:
        raise ValueError("Unsupported file type")

    return tables

# =========================================================
# ANALYSIS MODULE
# =========================================================

def analyze_dataframe(df):
    summary = {}

    for col in df.select_dtypes(include="number").columns:
        summary[col] = {
            "min": float(df[col].min()),
            "max": float(df[col].max()),
            "mean": round(float(df[col].mean()), 2),
            "median": round(float(df[col].median()), 2),
            "std": round(float(df[col].std()), 2),
        }

    return summary

# =========================================================
# CHART ENGINE
# =========================================================

def generate_charts(df, doc_id):
    chart_files = []
    numeric_cols = df.select_dtypes(include="number").columns

    for col in numeric_cols[:2]:
        plt.figure(figsize=(4, 3))
        df[col].plot(kind="bar", title=col)

        chart_path = f"/tmp/{doc_id}_{col}.png"
        plt.savefig(chart_path)
        plt.close()

        chart_files.append(chart_path)

    return chart_files

# =========================================================
# ENGINE ORCHESTRATOR
# =========================================================

def run_engine(tables, doc_id):
    for table in tables:
        if "df" in table:
            df = table["df"]
            summary = analyze_dataframe(df)
            charts = generate_charts(df, doc_id)
            return summary, charts

    return {}, []

# =========================================================
# PDF COMPOSER
# =========================================================

def create_pdf(title, numeric_summary, charts, output_path):
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 18)
    c.drawString(40, height - 40, title)

    c.setFont("Helvetica", 12)
    y = height - 80

    for col, stats in numeric_summary.items():
        c.drawString(
            40,
            y,
            f"{col} → mean: {stats['mean']} | min: {stats['min']} | max: {stats['max']}",
        )
        y -= 14

    y -= 20

    for chart in charts:
        if y < 200:
            c.showPage()
            y = height - 200
        c.drawImage(chart, 40, y, width=500, height=200)
        y -= 220

    c.save()

# =========================================================
# STORAGE
# =========================================================

def upload_pdf_to_gcs(local_path, doc_id):
    blob = bucket.blob(f"infographics/{doc_id}.pdf")
    blob.upload_from_filename(local_path, content_type="application/pdf")

    return f"https://storage.googleapis.com/{GCS_BUCKET}/infographics/{doc_id}.pdf"

# =========================================================
# API ROUTE (ENGINE CONTROLLER)
# =========================================================

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.json
        file_url = data.get("pdf_url")
        doc_id = data.get("infographicId") or data.get("doc_id")

        if not file_url or not doc_id:
            return jsonify({"status": "error", "message": "Missing inputs"}), 400

        # 1. Input
        buffer, filename = download_file_from_gcs(file_url)

        # 2. Normalize
        tables = extract_data(buffer, filename)

        # 3. Engine
        numeric_summary, charts = run_engine(tables, doc_id)

        # 4. PDF
        os.makedirs("/tmp", exist_ok=True)
        pdf_path = f"/tmp/{doc_id}.pdf"

        create_pdf(
            title=f"Infographic Summary - {filename}",
            numeric_summary=numeric_summary,
            charts=charts,
            output_path=pdf_path,
        )

        # 5. Storage
        pdf_url = upload_pdf_to_gcs(pdf_path, doc_id)

        # 6. Metadata update
        firestore_client.collection("infographics").document(doc_id).set(
            {
                "status": "completed",
                "infographic_url": pdf_url,
                "numeric_summary": numeric_summary,
                "engine_version": "v1",
                "updatedAt": datetime.utcnow(),
            },
            merge=True,
        )

        return jsonify({"status": "success", "download_url": pdf_url})

    except Exception as e:
        print(" Engine error:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

# =========================================================
# AUTH ROUTES (UNCHANGED)
# =========================================================

db = firestore.client()

@app.post("/api/auth/signup")
def signup():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"message": "Missing Fields"}), 400

    users_ref = db.collection("users")
    if users_ref.where("email", "==", email).get():
        return jsonify({"message": "Email already exists"}), 409

    users_ref.add(
        {
            "username": username,
            "email": email,
            "password": generate_password_hash(password),
            "createdAt": firestore.SERVER_TIMESTAMP,
        }
    )

    return jsonify({"message": "Account created"}), 201

@app.post("/api/auth/login")
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Missing Fields"}), 400

    users_ref = db.collection("users")
    query = users_ref.where("email", "==", email).limit(1).get()

    if not query:
        return jsonify({"message": "Invalid credentials"}), 401

    user = query[0].to_dict()
    if not check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid credentials"}), 401

    return jsonify({"message": "Login successful"}), 200

@app.post("/api/auth/reset-password")
def reset_password():
    data = request.get_json()
    email = data.get("email")
    new_password = data.get("newPassword")

    if not email or not new_password:
        return jsonify({"message": "Missing Fields"}), 400

    users_ref = db.collection("users")
    query = users_ref.where("email", "==", email).limit(1).get()

    if not query:
        return jsonify({"message": "User not found"}), 404

    query[0].reference.update(
        {
            "password": generate_password_hash(new_password),
            "updatedAt": firestore.SERVER_TIMESTAMP,
        }
    )

    return jsonify({"message": "Password updated successfully"}), 200

# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6000, debug=True)
