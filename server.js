const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const crypto = require("crypto");
const cors = require('cors');
app.use(cors());

const app = express();
app.use(bodyParser.json());

// Temporary folder for uploaded videos
const upload = multer({ dest: "uploads/" });

let hashes = {};

// ---------------- HASH STORAGE ----------------
app.post("/hash", (req, res) => {
  const { codechef_id, video_file_hash } = req.body;
  if (!codechef_id || !video_file_hash) {
    return res
      .status(400)
      .json({ status: "error", message: "Missing codechef_id or video_file_hash" });
  }
  hashes[codechef_id] = video_file_hash;
  console.log(`Received hash for ${codechef_id}: ${video_file_hash}`);
  res.json({ status: "ok" });
});

// ---------------- VERIFY MANUALLY ----------------
app.post("/verify", (req, res) => {
  const { codechef_id, video_file_hash } = req.body;
  if (hashes[codechef_id] && hashes[codechef_id] === video_file_hash) {
    return res.json({ valid: true });
  }
  res.json({ valid: false });
});

// ---------------- UPLOAD & AUTO-VERIFY ----------------
app.post("/upload", upload.single("video"), (req, res) => {
  const { codechef_id } = req.body;
  if (!codechef_id || !req.file) {
    return res.status(400).json({ status: "error", message: "Missing ID or video" });
  }

  // Compute SHA256 of uploaded file
  const fileBuffer = fs.readFileSync(req.file.path);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);
  const uploadedHash = hashSum.digest("hex");

  console.log(`Uploaded file hash for ${codechef_id}: ${uploadedHash}`);

  // Verify with stored hash
  let valid = false;
  if (hashes[codechef_id] && hashes[codechef_id] === uploadedHash) {
    valid = true;
  }

  // Cleanup uploaded file
  fs.unlinkSync(req.file.path);

  res.json({
    valid,
    expected: hashes[codechef_id],
    got: uploadedHash,
    message: valid ? "✅ Video matches original recording." : "❌ Video does not match."
  });
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
