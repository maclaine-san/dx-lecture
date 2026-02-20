const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/ping", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString(), port: PORT });
});


app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
