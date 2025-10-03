const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const crypto = require("crypto");
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const upload = multer({ dest: "uploads/" });

let submissions = {};

app.post("/hash", (req, res) => {
  const { codechef_id, video_file_hash, script_file_hash } = req.body;

  if (!codechef_id) {
    return res.status(400).json({ status: "error", message: "Missing codechef_id" });
  }

  if (!submissions[codechef_id]) {
    submissions[codechef_id] = {};
  }

  if (script_file_hash) {
    submissions[codechef_id].script_file_hash = script_file_hash;
    console.log(`Received SCRIPT hash for ${codechef_id}: ${script_file_hash}`);
  }

  if (video_file_hash) {
    submissions[codechef_id].video_file_hash = video_file_hash;
    console.log(`Received VIDEO hash for ${codechef_id}: ${video_file_hash}`);
  }
  
  if (!script_file_hash && !video_file_hash) {
      return res.status(400).json({ status: "error", message: "No hash data provided" });
  }

  res.json({ status: "ok", received: submissions[codechef_id] });
});

app.post("/verify", (req, res) => {
  const { codechef_id, video_file_hash } = req.body;
  const stored_video_hash = submissions[codechef_id]?.video_file_hash;

  if (stored_video_hash && stored_video_hash === video_file_hash) {
    return res.json({ valid: true });
  }
  res.json({ valid: false });
});

app.post("/upload", upload.single("video"), (req, res) => {
  const { codechef_id } = req.body;
  if (!codechef_id || !req.file) {
    return res.status(400).json({ status: "error", message: "Missing ID or video" });
  }

  const fileBuffer = fs.readFileSync(req.file.path);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);
  const uploadedHash = hashSum.digest("hex");

  console.log(`Uploaded file hash for ${codechef_id}: ${uploadedHash}`);

  const stored_video_hash = submissions[codechef_id]?.video_file_hash;
  let valid = false;
  if (stored_video_hash && stored_video_hash === uploadedHash) {
    valid = true;
  }

  fs.unlinkSync(req.file.path);

  res.json({
    valid,
    expected: stored_video_hash || "No hash was stored for this user.",
    got: uploadedHash,
    message: valid ? "Video matches original recording." : "Video does not match."
  });
});

app.get("/submissions", (req, res) => {
    res.json(submissions);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});