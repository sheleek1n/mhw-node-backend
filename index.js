//dependencies
import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8000;

//api chosen
const api = axios.create({
  baseURL: "https://mhw-db.com",
  timeout: 15000,
  headers: { Accept: "application/json", "User-Agent": "mhw-proxy/1.0" },
});

app.use(cors({ origin: "http://localhost:3000", methods: ["GET"] }));
app.use(express.json());


const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const fetchAndSend = (path) => async (req, res) => {
  const { data } = await api.get(path);
  res.json(data);
};

// Routes
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.get("/api/monsters", asyncRoute(fetchAndSend("/monsters")));
app.get("/api/weapons", asyncRoute(fetchAndSend("/weapons")));
app.get("/api/locations", asyncRoute(fetchAndSend("/locations")));

// error
app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, req, res, next) => {
  const status = err.response?.status || 500;
  const msg = err.message || "Internal Server Error";
  console.error("Error:", { status, msg });
  res.status(500).json({ error: "Upstream fetch failed" });
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});