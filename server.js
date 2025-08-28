import express from "express";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PUBLIC_DIR = path.join(__dirname, "public");

app.use(express.static(PUBLIC_DIR));

async function listHtmlFiles(dir, base = "") {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    const abs = path.join(dir, e.name);
    const rel = path.join(base, e.name);
    if (e.isDirectory()) {
      out.push(...(await listHtmlFiles(abs, rel)));
    } else if (e.isFile() && e.name.toLowerCase().endsWith(".html")) {
      out.push("/" + rel.replace(/\\/g, "/"));
    }
  }
  return out;
}

app.get("/api/html-files", async (req, res) => {
  try {
    const files = await listHtmlFiles(PUBLIC_DIR);
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: "No se pudo listar los HTML" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
