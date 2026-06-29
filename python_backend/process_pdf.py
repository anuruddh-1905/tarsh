import os
import io
import json
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
# STARTUP DIAGNOSTICS
# =========================================================

print("\n================================================")
print("🐍 PYTHON ENGINE BOOTING")
print("================================================")
print("Time:", datetime.utcnow().isoformat())
print("PORT:", os.environ.get("PORT", "NOT SET (will default to 6000)"))
print("GOOGLE_APPLICATION_CREDENTIALS_JSON:", bool(os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")))
print("GCS_BUCKET: prime-app-infographics")
print("PROJECT_ID: prime-app-467705")
print("================================================\n")

# =========================================================
# CONFIG & SECURE INITIALIZATION
# =========================================================

GCS_BUCKET = "prime-app-infographics"
PROJECT_ID = "prime-app-467705"
SERVICE_ACCOUNT_FILE = "service-account.json"

storage_client = None
firestore_client = None
bucket = None
db = None
INIT_ERROR = None

try:
    if "GOOGLE_APPLICATION_CREDENTIALS_JSON" in os.environ:
        print("✅ Using credentials from environment variable.")
        cred_json = json.loads(os.environ["GOOGLE_APPLICATION_CREDENTIALS_JSON"])
        cred = credentials.Certificate(cred_json)
        storage_client = storage.Client(credentials=cred.get_credential(), project=PROJECT_ID)
        firestore_client = firestore.Client(credentials=cred.get_credential(), project=PROJECT_ID)
    else:
        print("✅ Using credentials from service-account.json.")
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = SERVICE_ACCOUNT_FILE
        cred = credentials.Certificate(SERVICE_ACCOUNT_FILE)
        storage_client = storage.Client()
        firestore_client = firestore.Client()

    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)

    bucket = storage_client.bucket(GCS_BUCKET)
    db = firestore.client()

    print("✅ Firebase + GCS initialized successfully.")

except Exception as e:
    INIT_ERROR = str(e)
    print(f"❌ INITIALIZATION FAILED: {e}")
    # Don't crash — let the server start so /health can report the error

app = Flask(__name__)
CORS(app)

# =========================================================
# HEALTH CHECK (required by Node's /api/ping-python)
# =========================================================

@app.route("/health", methods=["GET"])
def health():
    """
    Called by Node backend's /api/ping-python to verify Python is reachable.
    Returns initialization status so you can diagnose credential issues remotely.
    """
    if INIT_ERROR:
        return jsonify({
            "status": "unhealthy",
            "error": INIT_ERROR,
            "hint": "Firebase/GCS failed to initialize — check GOOGLE_APPLICATION_CREDENTIALS_JSON",
            "time": datetime.utcnow().isoformat(),
        }), 500

    return jsonify({
        "status": "healthy",
        "time": datetime.utcnow().isoformat(),
        "gcs_bucket": GCS_BUCKET,
        "project": PROJECT_ID,
        "firebase_initialized": bool(firebase_admin._apps),
    }), 200

# =========================================================
# INPUT HANDLER
# =========================================================

def download_file_from_gcs(file_url):
    print(f"⬇️  Downloading from GCS: {file_url}")
    filename = file_url.split("/")[-1]
    blob = bucket.blob(filename)

    if not blob.exists():
        raise FileNotFoundError(f"File not found in GCS bucket: {filename}")

    buffer = io.BytesIO()
    blob.download_to_file(buffer)
    buffer.seek(0)

    print(f"✅ Downloaded: {filename}")
    return buffer, filename

# =========================================================
# NORMALIZATION LAYER
# =========================================================

def extract_data(file_buffer, filename):
    ext = filename.split(".")[-1].lower()
    print(f"📄 Extracting data from: {filename} (type: {ext})")
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
        print(f"📝 Extracted {len(text)} characters from PDF.")
        tables.append({"name": "pdf_text", "text": text})

    else:
        raise ValueError(f"Unsupported file type: .{ext}")

    print(f"✅ Extracted {len(tables)} table(s).")
    return tables

# =========================================================
# ANALYSIS MODULE
# =========================================================

def analyze_dataframe(df):
    summary = {}
    numeric_cols = df.select_dtypes(include="number").columns

    print(f"📊 Analyzing {len(numeric_cols)} numeric column(s): {list(numeric_cols)}")

    for col in numeric_cols:
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

    for col in list(numeric_cols)[:2]:
        print(f"📈 Generating chart for column: {col}")
        plt.figure(figsize=(4, 3))
        df[col].plot(kind="bar", title=col)

        chart_path = f"/tmp/{doc_id}_{col}.png"
        plt.savefig(chart_path)
        plt.close()

        chart_files.append(chart_path)
        print(f"✅ Chart saved: {chart_path}")

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

    print("⚠️  No tabular data found — PDF may be text-only. Returning empty summary.")
    return {}, []

# =========================================================
# PDF COMPOSER
# =========================================================

def create_pdf(title, numeric_summary, charts, output_path):
    print(f"📝 Composing output PDF: {output_path}")
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 18)
    c.drawString(40, height - 40, title)

    c.setFont("Helvetica", 12)
    y = height - 80

    if not numeric_summary:
        c.drawString(40, y, "No numeric data found in uploaded file.")
        y -= 20

    for col, stats in numeric_summary.items():
        c.drawString(
            40, y,
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
    print(f"✅ PDF composed successfully.")

# =========================================================
# STORAGE
# =========================================================

def upload_pdf_to_gcs(local_path, doc_id):
    destination = f"infographics/{doc_id}.pdf"
    print(f"⬆️  Uploading PDF to GCS: {destination}")
    blob = bucket.blob(destination)
    blob.upload_from_filename(local_path, content_type="application/pdf")

    url = f"https://storage.googleapis.com/{GCS_BUCKET}/{destination}"
    print(f"✅ Uploaded to: {url}")
    return url

# =========================================================
# ANALYZE ROUTE (called by Node backend)
# =========================================================

@app.route("/analyze", methods=["POST"])
def analyze():
    print("\n========== /analyze CALLED ==========")
    print("Time:", datetime.utcnow().isoformat())

    # Guard: fail fast if init failed
    if INIT_ERROR:
        print(f"❌ Cannot process — initialization failed: {INIT_ERROR}")
        return jsonify({"status": "error", "message": f"Server init failed: {INIT_ERROR}"}), 500

    try:
        data = request.json
        print("Request payload:", data)

        file_url = data.get("pdf_url")
        doc_id = data.get("infographicId") or data.get("doc_id")

        if not file_url:
            return jsonify({"status": "error", "message": "Missing: pdf_url"}), 400
        if not doc_id:
            return jsonify({"status": "error", "message": "Missing: infographicId"}), 400

        print(f"Processing doc_id: {doc_id}")
        print(f"File URL: {file_url}")

        # 1. Download
        buffer, filename = download_file_from_gcs(file_url)

        # 2. Extract
        tables = extract_data(buffer, filename)

        # 3. Analyze
        numeric_summary, charts = run_engine(tables, doc_id)

        # 4. Compose PDF
        os.makedirs("/tmp", exist_ok=True)
        pdf_path = f"/tmp/{doc_id}.pdf"
        create_pdf(
            title=f"Infographic Summary - {filename}",
            numeric_summary=numeric_summary,
            charts=charts,
            output_path=pdf_path,
        )

        # 5. Upload to GCS
        pdf_url = upload_pdf_to_gcs(pdf_path, doc_id)

        # 6. Update Firestore
        print(f"📝 Updating Firestore doc: {doc_id}")
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
        print(f"✅ Firestore updated for doc: {doc_id}")
        print("========== /analyze DONE ==========\n")

        return jsonify({"status": "success", "download_url": pdf_url})

    except FileNotFoundError as e:
        print(f"❌ File not found: {e}")
        return jsonify({"status": "error", "message": str(e)}), 404

    except ValueError as e:
        print(f"❌ Value error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 400

    except Exception as e:
        import traceback
        print("❌ Engine error:", e)
        print(traceback.format_exc())
        return jsonify({"status": "error", "message": str(e)}), 500

# =========================================================
# AUTH ROUTES
# =========================================================

@app.route("/api/auth/signup", methods=["POST"])
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

    users_ref.add({
        "username": username,
        "email": email,
        "password": generate_password_hash(password),
        "createdAt": firestore.SERVER_TIMESTAMP,
    })

    return jsonify({"message": "Account created"}), 201

@app.route("/api/auth/login", methods=["POST"])
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

@app.route("/api/auth/reset-password", methods=["POST"])
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

    query[0].reference.update({
        "password": generate_password_hash(new_password),
        "updatedAt": firestore.SERVER_TIMESTAMP,
    })

    return jsonify({"message": "Password updated successfully"}), 200

# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 6000))
    print(f"\n✅ Python engine starting on port {port}\n")
    app.run(host="0.0.0.0", port=port, debug=False)