const fs = require("fs");
const path = require("path");

function listHtmlFiles(dir, base = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    const abs = path.join(dir, e.name);
    const rel = path.join(base, e.name);
    if (e.isDirectory()) {
      out.push(...listHtmlFiles(abs, rel));
    } else if (e.isFile() && e.name.toLowerCase().endsWith(".html")) {
      out.push("/" + rel.replace(/\\/g, "/"));
    }
  }
  return out;
}

module.exports = (req, res) => {
  try {
    const PUBLIC_DIR = path.join(process.cwd(), "public");
    if (!fs.existsSync(PUBLIC_DIR)) {
      res.status(500).json({ error: "Carpeta public/ no encontrada en el deploy" });
      return;
    }
    const files = listHtmlFiles(PUBLIC_DIR);
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ files });
  } catch (err) {
    res.status(500).json({ error: "No se pudo listar los HTML", detail: String(err) });
  }
};