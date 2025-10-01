const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
app.use(bodyParser.json());

let hashes = {};

app.post("/hash", (req, res) => {
  const { hash, timestamp, codechef_id } = req.body;
  hashes[timestamp] = hash;
  console.log("Received hash:", hash);
  if (codechef_id) {
    console.log("Received CodeChef ID:", codechef_id);
  }
  res.json({ status: "ok" });
});

// When video is uploaded, recompute hash
app.post("/verify", (req, res) => {
  const { timestamp, videoHash } = req.body;
  if (hashes[timestamp] && hashes[timestamp] === videoHash) {
    return res.json({ valid: true });
  }
  res.json({ valid: false });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
