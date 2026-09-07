import fs from "fs";
import http from "http";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const artifactsDir = path.join(repoRoot, "artifacts");

fs.mkdirSync(artifactsDir, { recursive: true });

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html": return "text/html; charset=utf-8";
    case ".js": return "application/javascript; charset=utf-8";
    case ".json": return "application/json; charset=utf-8";
    case ".css": return "text/css; charset=utf-8";
    case ".png": return "image/png";
    case ".bmp": return "image/bmp";
    case ".jpg":
    case ".jpeg": return "image/jpeg";
    case ".svg": return "image/svg+xml";
    default: return "application/octet-stream";
  }
}

function startStaticServer(rootDir) {
  const server = http.createServer((req, res) => {
    try {
      const requestUrl = new URL(req.url, "http://127.0.0.1");
      let pathname = decodeURIComponent(requestUrl.pathname);

      if (pathname === "/") pathname = "/index.html";

      const safePath = path.normalize(path.join(rootDir, pathname));
      if (!safePath.startsWith(rootDir)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      let filePath = safePath;
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }

      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      res.writeHead(200, { "Content-Type": getContentType(filePath) });
      fs.createReadStream(filePath).pipe(res);
    } catch (error) {
      res.writeHead(500);
      res.end(String(error));
    }
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

async function renderPageToPng(browser, baseUrl, relativeUrl, outPath) {
  const page = await browser.newPage({
    viewport: { width: 800, height: 480 },
    deviceScaleFactor: 1
  });

  const url = `${baseUrl}/${relativeUrl}`;
  console.log(`Rendering ${url} -> ${outPath}`);

  await page.goto(url, { waitUntil: "networkidle" });

  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });

  await page.waitForTimeout(1000);

  await page.screenshot({
    path: outPath,
    type: "png"
  });

  await page.close();
}

function convertPngToBmp(inputPng, outputBmp) {
  const pythonScript = path.join(__dirname, "png_to_bmp.py");

  const result = spawnSync(
    "python",
    [pythonScript, inputPng, outputBmp],
    { stdio: "inherit" }
  );

  if (result.status !== 0) {
    throw new Error(`PNG to BMP conversion failed for ${inputPng}`);
  }
}

async function main() {
  const { server, port } = await startStaticServer(repoRoot);
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const browser = await chromium.launch({ headless: true });

    const tamilPng = path.join(artifactsDir, "tamil-e1002.png");
    const englishPng = path.join(artifactsDir, "english-e1002.png");

    await renderPageToPng(browser, baseUrl, "index.html", tamilPng);
    await renderPageToPng(browser, baseUrl, "English.html", englishPng);

    await browser.close();

    convertPngToBmp(tamilPng, path.join(repoRoot, "tamil.bmp"));
    convertPngToBmp(englishPng, path.join(repoRoot, "english.bmp"));

    console.log("Generated:");
    console.log("- tamil.bmp");
    console.log("- english.bmp");
  } finally {
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
