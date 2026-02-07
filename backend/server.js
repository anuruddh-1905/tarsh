const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const { Firestore } = require("@google-cloud/firestore");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 5000;

/* ---------------- CONFIG ---------------- */

const serviceKey = path.join(__dirname, "service-account.json");

const firestore = new Firestore({
  projectId: "prime-app-467705",
  keyFilename: serviceKey,
});

const storage = new Storage({
  projectId: "prime-app-467705",
  keyFilename: serviceKey,
});

const upload = multer({
  storage: multer.memoryStorage(),
});

/* ---------------- AUTH PROXY ROUTES ---------------- */

app.post("/api/auth/signup", async (req, res) => {
  try {
    const response = await fetch("http://127.0.0.1:6000/api/auth/signup", {
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
    const response = await fetch("http://127.0.0.1:6000/api/auth/login", {
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
    const response = await fetch(
      "http://127.0.0.1:6000/api/auth/reset-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("reset-password proxy error:", error.message);
    return res
      .status(500)
      .json({ message: "reset-password service unavailable" });
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

//  ...

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
    console.log("📥 Received upload request");

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    console.log("✅ File received:", req.file.originalname);

    const bucketName = "prime-app-infographics";
    const filename = `${Date.now()}-${req.file.originalname}`;
    const file = storage.bucket(bucketName).file(filename);

    try {
      /* ---- Upload to GCS ---- */
      console.log("⏳ Uploading to Google Cloud Storage...");
      await file.save(req.file.buffer, {
        contentType: req.file.mimetype,
      });
      console.log("✅ Upload successful");

      const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

      /* ---- Create Firestore Doc ---- */
      const newInfographic = {
        title: req.body.title || req.file.originalname,
        imageUrl: publicUrl,
        status: "uploaded",
        result: null,
        createdAt: new Date(),
      };

      const infographicRef = firestore.collection("infographics").doc();
      await infographicRef.set(newInfographic);
      const infographicId = infographicRef.id;

      /* ---- Call Flask (WAIT FOR RESULT) ---- */
      const axios = require("axios");
      const flaskUrl = "http://127.0.0.1:6000/analyze";

      const flaskResponse = await axios.post(flaskUrl, {
        infographicId,
        pdf_url: publicUrl,
        title: newInfographic.title,
      });

      console.log("Flask processing completed for", infographicId);

      /* ---- Return FINAL response to frontend ---- */
      res.status(201).json({
        message: "Infographic generated successfully",
        infographicId,
        download_url: flaskResponse.data.download_url,
      });

      console.log("📤 Response sent to frontend");
    } catch (error) {
      console.error("Error during upload or processing:", error);
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

/* ---------------- START SERVER ---------------- */

app.listen(port, () => {
  console.log(`🚀 Server is listening on port ${port}`);
});
