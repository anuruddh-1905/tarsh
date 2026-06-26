const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const fs = require("fs"); // 1. Imported fs module
const { Firestore } = require("@google-cloud/firestore");
const axios = require("axios");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

// 2. Startup diagnostics
console.log("\n================================================");
console.log("🚀 EXPRESS SERVER BOOTING");
console.log("================================================");
console.log("Time:", new Date().toISOString());
console.log("Node Version:", process.version);
console.log("Working Directory:", __dirname);
console.log("PORT:", process.env.PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PYTHON_ENGINE_URL:", process.env.PYTHON_ENGINE_URL);
console.log(
  "GOOGLE_APPLICATION_CREDENTIALS_JSON:",
  !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
);
console.log(
  "service-account.json exists:",
  fs.existsSync(path.join(__dirname, "service-account.json"))
);
console.log("================================================\n");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Log every incoming request
app.use((req, res, next) => {
  console.log("\n================ REQUEST ================");
  console.log(new Date().toISOString());
  console.log(req.method, req.originalUrl);
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("=========================================\n");
  next();
});

// Render injects a dynamic PORT environment variable. Fallback to 5000 locally.
const port = process.env.PORT || 5000;

// Dynamic internal or external URL for the Python Flask runtime
const PYTHON_ENGINE_URL = process.env.PYTHON_ENGINE_URL || "http://127.0.0.1:6000";

/* ---------------- CONFIG & SECURE INITIALIZATION ---------------- */

let firestoreOptions = { projectId: "prime-app-467705" };
let storageOptions = { projectId: "prime-app-467705" };

if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    firestoreOptions.credentials = credentials;
    storageOptions.credentials = credentials;
  } catch (error) {
    console.error("❌ Error parsing GOOGLE_APPLICATION_CREDENTIALS_JSON:", error.message);
  }
} else {
  const serviceKey = path.join(__dirname, "service-account.json");
  firestoreOptions.keyFilename = serviceKey;
  storageOptions.keyFilename = serviceKey;
}

const firestore = new Firestore(firestoreOptions);
const storage = new Storage(storageOptions);

const upload = multer({
  storage: multer.memoryStorage(),
});

/* ---------------- DIAGNOSTIC ENDPOINTS ---------------- */

// 4. Added diagnostic utility routes
app.get("/whoami", (req, res) => {
  res.json({
    server: "Express Backend",
    time: new Date(),
    node: process.version,
    port: process.env.PORT
  });
});

app.get("/env-check", (req, res) => {
  res.json({
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    PYTHON_ENGINE_URL: process.env.PYTHON_ENGINE_URL,
    GOOGLE_APPLICATION_CREDENTIALS_JSON: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
    SERVICE_ACCOUNT_EXISTS: fs.existsSync(path.join(__dirname, "service-account.json"))
  });
});

/* ---------------- AUTH PROXY ROUTES ---------------- */

app.post("/api/auth/signup", async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_ENGINE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("signup proxy error:", error.message);
    return res.status(500).json({ message: "signup service unavailable" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_ENGINE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("login proxy error:", error.message);
    return res.status(500).json({ message: "login service unavailable" });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_ENGINE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("reset-password proxy error:", error.message);
    return res.status(500).json({ message: "reset-password service unavailable" });
  }
});

/* ---------------- INFOGRAPHIC LIST ---------------- */

app.get("/api/infographic", async (req, res) => {
  try {
    const snapshots = await firestore.collection("infographics").get();
    const infographics = snapshots.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(infographics);
  } catch (error) {
    console.error("Error retrieving infographics:", error);
    res.status(500).json({ error: "Failed to retrieve infographics." });
  }
});

app.get("/api/infographic/download/:id", async (req, res) => {
  try {
    const docId = req.params.id;

    const file = storage
      .bucket("prime-app-infographics")
      .file(`infographics/${docId}.pdf`);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="infographic-${docId}.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");

    file.createReadStream().pipe(res);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Download failed" });
  }
});

/* ---------------- MAIN UPLOAD + PROCESS PIPELINE ---------------- */

app.post(
  "/api/infographic/create",
  upload.single("pdfFile"),
  async (req, res) => {
    // 5. Upload route initial data logging
    console.log("\n========== UPLOAD START ==========");
    console.log("Time:", new Date());
    console.log("Body:", req.body);
    console.log("Headers:", req.headers);
    if (req.file) {
      console.log("Filename:", req.file.originalname);
      console.log("Mime:", req.file.mimetype);
      console.log("Size:", req.file.size);
    } else {
      console.log("No file received");
    }
    console.log("==================================");

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const bucketName = "prime-app-infographics";
    const filename = `${Date.now()}-${req.file.originalname}`;
    const file = storage.bucket(bucketName).file(filename);

    try {
      /* ---- Upload to GCS ---- */
      // 6. Detailed processing logs
      console.log("Uploading PDF to Google Cloud Storage...");
      await file.save(req.file.buffer, {
        contentType: req.file.mimetype,
      });
      console.log("GCS upload successful.");

      const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

      /* ---- Create Firestore Doc ---- */
      console.log("Creating Firestore document...");
      const newInfographic = {
        title: req.body.title || req.file.originalname,
        imageUrl: publicUrl,
        status: "processing",
        result: null,
        createdAt: new Date(),
      };

      const infographicRef = firestore.collection("infographics").doc();
      await infographicRef.set(newInfographic);
      const infographicId = infographicRef.id;
      console.log("Firestore document created:", infographicId);

      /* ---- Trigger Python engine in background ---- */
      const flaskUrl = `${PYTHON_ENGINE_URL}/analyze`;
      console.log("Calling Python Engine:", flaskUrl);
      console.log({ infographicId, pdf_url: publicUrl });

      axios
        .post(flaskUrl, {
          infographicId,
          pdf_url: publicUrl,
          title: newInfographic.title,
        })
        .then(() => {
          console.log("Python engine returned SUCCESS");
          console.log("Flask processing completed for", infographicId);
        })
        .catch(async (error) => {
          // Deep Python Engine Error Inspection
          console.log("\n========= PYTHON ERROR =========");
          console.error(error);
          console.error("Message:", error.message);
          console.error("Code:", error.code);
          if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Response:", error.response.data);
          }
          console.log("================================");

          try {
            await firestore.collection("infographics").doc(infographicId).update({
              status: "failed",
              error: error.message,
              updatedAt: new Date(),
            });
          } catch (updateError) {
            console.error("Failed to update Firestore after processing error:", updateError);
          }
        });

      /* ---- Return immediately ---- */
      res.status(202).json({
        message: "Infographic accepted for processing",
        infographicId,
      });

      console.log("📤 202 Accepted sent to frontend for", infographicId);
    } catch (error) {
      // 7. Core Route Try-Catch Error Inspection
      console.log("\n========== SERVER ERROR ==========");
      console.error(error);
      console.error("Message:", error.message);
      console.error("Code:", error.code);
      console.error("Stack:", error.stack);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Response:", error.response.data);
      }
      console.log("==================================");

      res.status(500).json({
        error: "An error occurred during the upload process.",
      });
    }
  }
);

/* ---------------- UPDATE / DELETE ---------------- */

app.put("/api/infographics/:id", async (req, res) => {
  try {
    await firestore.collection("infographics").doc(req.params.id).update(req.body);
    res.status(200).json({ message: "Infographic updated successfully!" });
  } catch (error) {
    console.error("Error updating infographic:", error);
    res.status(500).json({ error: "Failed to update data" });
  }
});

app.delete("/api/infographics/:id", async (req, res) => {
  try {
    await firestore.collection("infographics").doc(req.params.id).delete();
    res.status(200).json({ message: "Infographic deleted successfully" });
  } catch (error) {
    console.error("Error deleting infographic:", error);
    res.status(500).json({ error: "Failed to delete infographic" });
  }
});

/* ---------------- HEALTH CHECK ---------------- */

app.get("/api/test", (req, res) => {
  res.json({ message: "Background working fine!" });
});

/* ---------------- GLOBAL CRASH HANDLERS ---------------- */

// 8. Capture hidden app crashes or unhandled promise updates
process.on("uncaughtException", (err) => {
  console.log("\n******** UNCAUGHT EXCEPTION ********");
  console.error(err);
});

process.on("unhandledRejection", (err) => {
  console.log("\n******** UNHANDLED REJECTION ********");
  console.error(err);
});

/* ---------------- START SERVER ---------------- */

// 9. Structured boot logging
app.listen(port, () => {
  console.log("\n====================================");
  console.log("SERVER READY");
  console.log("Listening Port:", port);
  console.log("====================================\n");
});