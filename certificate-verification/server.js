// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { setCache, getCache } = require("./cache");

dotenv.config();
const app = express();
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Certificate Schema
const CertificateSchema = new mongoose.Schema({
  certificateId: { type: String, unique: true },
  studentName: String,
  college: String,
  internshipDomain: String,
  duration: String,
  issueDate: Date,
});

const Certificate = mongoose.model("Certificate", CertificateSchema, "details");

// Middleware: API Key
app.use((req, res, next) => {
  const key = req.headers["x-api-key"];
  if (key !== process.env.API_KEY) {
    return res.status(403).json({ message: "Forbidden: Invalid API Key" });
  }
  next();
});

// API Route: Verify Certificate
app.get("/verify/:certificateId", async (req, res) => {
  const { certificateId } = req.params;

  // Check local cache
  const cached = getCache(certificateId);
  if (cached) {
    return res.json({ source: "cache", ...cached });
  }

  try {
    const cert = await Certificate.findOne({ certificateId }).lean();
    if (!cert)
      return res.status(404).json({ message: "Certificate not found" });

    setCache(certificateId, cert, 3600); // Cache for 1 hour
    res.json({ source: "database", ...cert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
