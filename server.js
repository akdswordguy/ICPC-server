const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

let hashes = {};

app.post("/hash", (req, res) => {
  const { codechef_id, video_file_hash } = req.body;
  if (!codechef_id || !video_file_hash) {
    return res.status(400).json({ status: "error", message: "Missing codechef_id or video_file_hash" });
  }
  hashes[codechef_id] = video_file_hash;
  console.log(`Received hash for ${codechef_id}: ${video_file_hash}`);
  res.json({ status: "ok" });
});

app.post("/verify", (req, res) => {
  const { codechef_id, video_file_hash } = req.body;
  if (hashes[codechef_id] && hashes[codechef_id] === video_file_hash) {
    return res.json({ valid: true });
  }
  res.json({ valid: false });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
