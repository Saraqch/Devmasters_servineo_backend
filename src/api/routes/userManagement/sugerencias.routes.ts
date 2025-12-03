import { Router, Request, Response } from "express";
import fetch from "node-fetch";
import rateLimit from "express-rate-limit";

const router = Router();

// rate limit simple
const nominatimLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const cache = new Map<string, { ts: number; data: any }>();
const CACHE_TTL = 60 * 1000;

router.get("/nominatim", nominatimLimiter, async (req: Request, res: Response) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.status(400).json({ error: "Falta parámetro q" });

  const cacheKey = `nom:${q.toLowerCase()}`;
  const now = Date.now();

  const cached = cache.get(cacheKey);
  if (cached && now - cached.ts < CACHE_TTL) {
    return res.json(cached.data);
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      q
    )}&format=json&addressdetails=1&limit=5`;

    const r = await fetch(url, {
      headers: {
        "User-Agent": "ServineoApp/1.0 (contacto@tudominio.com)",
        "Referer": "http://localhost:3000/",
        "Accept-Language": "es",
      },
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return res.status(502).json({ error: `Nominatim HTTP ${r.status}`, detail: text });
    }

    const data = await r.json();
    cache.set(cacheKey, { ts: now, data });

    return res.json(data);
  } catch (err: any) {
    console.error("Error proxy Nominatim:", err);
    return res.status(500).json({ error: "Error consultando Nominatim", detail: err?.message });
  }
});

// ✅ Esta línea es CLAVE
export default router;