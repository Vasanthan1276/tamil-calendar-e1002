import fs from "node:fs/promises";
import { chromium } from "playwright";

const SOURCE_URL =
  "https://www.tamildailycalendar.com/tamil_daily_calendar.php";

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({
    viewport: { width: 800, height: 480 },
    deviceScaleFactor: 1
  });

  // Reproduce the SAME crop that the old E1002 page used.
  // The iframe is only used here, inside GitHub Actions.
  // The E1002 itself will never load the remote iframe.
  await page.setContent(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
html,body{
  margin:0;
  padding:0;
  width:800px;
  height:480px;
  overflow:hidden;
  background:white;
}
.wrapper{
  width:800px;
  height:480px;
  overflow:hidden;
  position:relative;
}
iframe{
  width:1400px;
  height:2200px;
  border:none;
  transform:scale(0.73);
  transform-origin:top left;
  position:absolute;
  top:-175px;
  left:-75px;
}
</style>
</head>
<body>
<div class="wrapper">
  <iframe id="calendar" src="${SOURCE_URL}"></iframe>
</div>
</body>
</html>`, { waitUntil: "domcontentloaded" });

  // Give the remote calendar enough time to finish painting.
  await page.waitForTimeout(8000);

  const frame = page.frames().find(
    f => f.url().includes("tamildailycalendar.com/tamil_daily_calendar.php")
  );

  if (!frame) {
    throw new Error("Tamil calendar iframe did not load.");
  }

  await page.screenshot({
    path: "tamil-calendar.png",
    type: "png",
    fullPage: false
  });

  console.log("Captured Tamil calendar crop to tamil-calendar.png");
} finally {
  await browser.close();
}

// Generate the tiny static E1002 page.
// No iframe, no JavaScript, no remote fetch.
const html = `<!doctype html>
<html lang="ta">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=800,height=480,initial-scale=1">
<title>Tamil Daily Calendar</title>
<style>
html,body{
  margin:0;
  padding:0;
  width:800px;
  height:480px;
  overflow:hidden;
  background:white;
}
img{
  display:block;
  width:800px;
  height:480px;
  object-fit:cover;
}
</style>
</head>
<body>
<img src="tamil-calendar.png" alt="Tamil Daily Calendar">
</body>
</html>
`;

await fs.writeFile("index.html", html, "utf8");
console.log("Generated fully static index.html");
