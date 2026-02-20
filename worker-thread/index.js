const express = require("express");
const { Worker } = require("worker_threads");

const app = express();
const PORT = process.env.PORT || 3000;

function blockingFib(n) {
  if (n <= 1) return n;
  return blockingFib(n - 1) + blockingFib(n - 2);
}

app.get("/ping", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Intentionally blocks the event loop.
app.get("/blocking", (req, res) => {
  const n = Number(req.query.n ?? 40);
  const start = Date.now();
  const result = blockingFib(n);
  res.json({ n, result, ms: Date.now() - start, mode: "blocking" });
});

// Offloads work to a worker thread so the event loop stays responsive.
app.get("/worker", (req, res) => {
  const n = Number(req.query.n ?? 40);
  const start = Date.now();

  const worker = new Worker("./worker.js", {
    workerData: { n },
  });

  worker.on("message", (result) => {
    res.json({ n, result, ms: Date.now() - start, mode: "worker" });
  });

  worker.on("error", (err) => {
    res.status(500).json({ error: err.message });
  });

  worker.on("exit", (code) => {
    if (code !== 0) {
      res.status(500).json({ error: `Worker stopped with exit code ${code}` });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
