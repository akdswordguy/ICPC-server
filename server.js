const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const crypto = require("crypto");
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Temporary folder for uploaded videos
const upload = multer({ dest: "uploads/" });

// New data structure to hold both script and video hashes for each user
let submissions = {};

// --- HASH STORAGE (UPDATED) ---
// This endpoint now intelligently handles both script and video hashes.
app.post("/hash", (req, res) => {
  const { codechef_id, video_file_hash, script_file_hash } = req.body;

  if (!codechef_id) {
    return res.status(400).json({ status: "error", message: "Missing codechef_id" });
  }

  // If a user entry doesn't exist, create one
  if (!submissions[codechef_id]) {
    submissions[codechef_id] = {};
  }

  // If a script hash is received, store it
  if (script_file_hash) {
    submissions[codechef_id].script_file_hash = script_file_hash;
    console.log(`Received SCRIPT hash for ${codechef_id}: ${script_file_hash}`);
  }

  // If a video hash is received, store it
  if (video_file_hash) {
    submissions[codechef_id].video_file_hash = video_file_hash;
    console.log(`Received VIDEO hash for ${codechef_id}: ${video_file_hash}`);
  }
  
  // If no hash was provided in the request
  if (!script_file_hash && !video_file_hash) {
      return res.status(400).json({ status: "error", message: "No hash data provided" });
  }

  res.json({ status: "ok", received: submissions[codechef_id] });
});

// --- VERIFY MANUALLY (UPDATED) ---
// Updated to work with the new submissions data structure.
app.post("/verify", (req, res) => {
  const { codechef_id, video_file_hash } = req.body;
  const stored_video_hash = submissions[codechef_id]?.video_file_hash;

  if (stored_video_hash && stored_video_hash === video_file_hash) {
    return res.json({ valid: true });
  }
  res.json({ valid: false });
});

// --- UPLOAD & AUTO-VERIFY (UPDATED) ---
// Updated to work with the new submissions data structure.
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

  // Verify with stored video hash from the submissions object
  const stored_video_hash = submissions[codechef_id]?.video_file_hash;
  let valid = false;
  if (stored_video_hash && stored_video_hash === uploadedHash) {
    valid = true;
  }

  // Cleanup uploaded file
  fs.unlinkSync(req.file.path);

  res.json({
    valid,
    expected: stored_video_hash || "No hash was stored for this user.",
    got: uploadedHash,
    message: valid ? "✅ Video matches original recording." : "❌ Video does not match."
  });
});

// --- (Optional) Endpoint to view all stored data for debugging ---
app.get("/submissions", (req, res) => {
    res.json(submissions);
});


// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});