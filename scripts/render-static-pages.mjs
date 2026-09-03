import fs from "node:fs/promises";

const SOURCE_URL = "https://www.tamildailycalendar.com/tamil_daily_calendar.php";

function clean(value = "") {
  return String(value)
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function htmlToLines(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<(br|\/p|\/div|\/tr|\/td|\/th|\/h[1-6])[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  return text
    .split("\n")
    .map(clean)
    .filter(Boolean);
}

function findDailyLines(lines) {
  const dateIndex = lines.findIndex(line =>
    /^\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i.test(line)
  );

  if (dateIndex === -1) {
    throw new Error("Could not locate today's calendar date in source page.");
  }

  const endIndex = lines.findIndex(
    (line, index) => index > dateIndex && line.startsWith("Tamil Rasi Palan")
  );

  return lines.slice(dateIndex, endIndex === -1 ? dateIndex + 70 : endIndex);
}

function rawSectionValue(lines, label, stopLabels = []) {
  const startIndex = lines.findIndex(line => line.startsWith(label));
  if (startIndex === -1) return "Not available";

  const values = [];

  for (let i = startIndex; i < lines.length; i += 1) {
    const line = lines[i];

    if (
      i > startIndex &&
      stopLabels.some(stop => line === stop || line.startsWith(stop))
    ) {
      break;
    }

    if (i === startIndex) {
      const first = clean(line.slice(label.length));
      if (first) values.push(first);
    } else {
      values.push(line);
    }
  }

  // Remove a duplicate pure-Latin transliteration line when the preceding
  // collected value is already Tamil. Examples: வடக்கு / Vadakku, பால் / Paal.
  const filtered = [];
  for (const item of values) {
    const hasTamil = /[\u0B80-\u0BFF]/.test(item);
    const latinOnly = /^[A-Za-z\s.-]+$/.test(item);
    const previousHasTamil = filtered.length > 0 && /[\u0B80-\u0BFF]/.test(filtered[filtered.length - 1]);

    if (latinOnly && previousHasTamil && !hasTamil) continue;
    filtered.push(item);
  }

  return clean(filtered.join(" / ")) || "Not available";
}

function tamilDateValue(lines) {
  const index = lines.findIndex(line => line.startsWith("Date"));
  if (index === -1) return "Not available";

  const datePart = clean(lines[index].slice("Date".length));
  const nextLine = clean(lines[index + 1] || "");
  const weekday = /[\u0B80-\u0BFF]/.test(nextLine) ? nextLine : "";

  return clean([datePart, weekday].filter(Boolean).join(" · ")) || "Not available";
}

function formatUpdatedSgt(isoText) {
  const date = new Date(isoText);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-SG", {
    timeZone: "Asia/Singapore",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(date) + " SGT";
}

function staticPage({ language, data }) {
  const isTamil = language === "ta";
  const fontFamily = isTamil
    ? '"Noto Sans Tamil", "Nirmala UI", Arial, Helvetica, sans-serif'
    : 'Arial, Helvetica, sans-serif';

  const labels = isTamil
    ? {
        title: "தமிழ் தினசரி காலண்டர்",
        subtitle: "E1002 நிலையான தினசரி காட்சி",
        nalla: "நல்ல நேரம்",
        nallaHelp: "சுப காரியங்களுக்கு ஏற்ற நேரம்",
        gowri: "கௌரி நல்ல நேரம்",
        gowriHelp: "முக்கிய செயல்களுக்கு ஏற்ற நேரம்",
        rahu: "இராகு காலம்",
        rahuHelp: "புதிய முக்கிய வேலை தொடங்க தவிர்க்கும் நேரம்",
        yama: "எமகண்டம்",
        yamaHelp: "புதிய முக்கிய வேலை தொடங்க தவிர்க்கும் நேரம்",
        kuligai: "குளிகை",
        kuligaiHelp: "நீடித்த விளைவுகளுடன் தொடர்புடைய நேரம்",
        sunrise: "சூரிய உதயம்",
        sunriseHelp: "இந்திய நேர அடிப்படையிலான குறிப்பு",
        tithi: "திதி",
        tithiHelp: "சந்திர நாள்காட்டி நாள்",
        star: "நட்சத்திரம்",
        starHelp: "சந்திரன் இருக்கும் நட்சத்திரம்",
        soolam: "சூலம் / பரிகாரம்",
        soolamHelp: "பயண திசை குறிப்பு / பரிகாரம்",
        today: "இன்றைய குறிப்பு",
        todayHelp: "பாரம்பரியமாக நல்லதாகக் கருதப்படும் செயல்கள்",
        updated: "புதுப்பிக்கப்பட்டது",
        source: "மூலம்: TamilDailyCalendar.com · GitHub Action மூலம் நிலையான HTML"
      }
    : {
        title: "Tamil Daily Calendar",
        subtitle: "English reference display · static E1002 page",
        nalla: "Nalla Neram",
        nallaHelp: "auspicious time",
        gowri: "Gowri Nalla Neram",
        gowriHelp: "auspicious time for key activities",
        rahu: "Rahu Kaalam",
        rahuHelp: "traditionally avoid starting important work",
        yama: "Yamagandam",
        yamaHelp: "traditionally avoid starting important work",
        kuligai: "Kuligai",
        kuligaiHelp: "traditionally linked to lasting outcomes",
        sunrise: "Sunrise",
        sunriseHelp: "India-based source reference",
        tithi: "Tithi",
        tithiHelp: "lunar day / Moon phase",
        star: "Nakshatra / Star",
        starHelp: "Moon's constellation",
        soolam: "Soolam / Remedy",
        soolamHelp: "traditionally avoided travel direction / suggested remedy",
        today: "Today's Note",
        todayHelp: "traditionally favourable activities",
        updated: "Updated",
        source: "Source: TamilDailyCalendar.com · static HTML generated by GitHub Actions"
      };

  const safe = key => escapeHtml(data[key] || "Not available");
  const soolamValue = `${safe("soolam")} · ${safe("parigaram")}`;
  const updatedText = escapeHtml(formatUpdatedSgt(data.updated_at));

  return `<!doctype html>
<html lang="${isTamil ? "ta" : "en"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=800,height=480,initial-scale=1">
<title>${escapeHtml(labels.title)}</title>
<style>
:root{--ink:#111;--muted:#555;--paper:#fff;--soft:#faf8f1}
*{box-sizing:border-box}
html,body{margin:0;width:800px;height:480px;overflow:hidden;background:var(--paper);color:var(--ink);font-family:${fontFamily}}
.page{width:800px;height:480px;padding:8px 12px;display:flex;flex-direction:column}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid var(--ink);padding-bottom:5px;margin-bottom:7px}
.title{font-size:${isTamil ? "22px" : "23px"};font-weight:700;line-height:1.05}
.subtitle{margin-top:2px;font-size:10px;line-height:1.1;color:var(--muted)}
.date{max-width:390px;text-align:right;font-size:16px;font-weight:700;line-height:1.08}
.tamil-date{margin-top:2px;font-size:${isTamil ? "14px" : "13px"};font-weight:600;line-height:1.1}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 12px}
.card{min-height:53px;padding:5px 8px;border:1.5px solid var(--ink);border-radius:7px;background:var(--soft)}
.label{font-size:${isTamil ? "12px" : "11px"};font-weight:700;line-height:1.05}
.help{margin-top:1px;font-size:${isTamil ? "8.5px" : "9px"};color:var(--muted);line-height:1.05}
.value{margin-top:2px;font-size:${isTamil ? "11.5px" : "12px"};font-weight:600;line-height:1.12}
.small{font-size:${isTamil ? "10.5px" : "11px"}}
.note{margin-top:5px;padding:5px 8px;border:1px solid #777;border-radius:6px;background:var(--soft)}
.note-title{font-size:${isTamil ? "12px" : "11px"};font-weight:700;line-height:1.05}
.note-help{margin-top:1px;font-size:8.5px;color:var(--muted);line-height:1.05}
.note-value{margin-top:2px;font-size:${isTamil ? "10.5px" : "11px"};line-height:1.12;font-weight:500;word-break:break-word}
.today-note .note-value{font-size:${isTamil ? "10px" : "10px"};line-height:1.08}
.footer{margin-top:auto;padding-top:3px;border-top:1px solid #777;font-size:8.5px;color:var(--muted);line-height:1.05;display:flex;justify-content:space-between;gap:8px}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="title">${escapeHtml(labels.title)}</div>
      <div class="subtitle">${escapeHtml(labels.subtitle)}</div>
    </div>
    <div class="date">
      <div>${safe("date")}</div>
      <div class="tamil-date">${safe("tamil_date")}</div>
    </div>
  </div>

  <div class="grid">
    <div class="card"><div class="label">${escapeHtml(labels.nalla)}</div><div class="help">${escapeHtml(labels.nallaHelp)}</div><div class="value">${safe("nalla_neram")}</div></div>
    <div class="card"><div class="label">${escapeHtml(labels.gowri)}</div><div class="help">${escapeHtml(labels.gowriHelp)}</div><div class="value">${safe("gowri_nalla_neram")}</div></div>
    <div class="card"><div class="label">${escapeHtml(labels.rahu)}</div><div class="help">${escapeHtml(labels.rahuHelp)}</div><div class="value">${safe("rahu_kaalam")}</div></div>
    <div class="card"><div class="label">${escapeHtml(labels.yama)}</div><div class="help">${escapeHtml(labels.yamaHelp)}</div><div class="value">${safe("yamagandam")}</div></div>
    <div class="card"><div class="label">${escapeHtml(labels.kuligai)}</div><div class="help">${escapeHtml(labels.kuligaiHelp)}</div><div class="value">${safe("kuligai")}</div></div>
    <div class="card"><div class="label">${escapeHtml(labels.sunrise)}</div><div class="help">${escapeHtml(labels.sunriseHelp)}</div><div class="value">${safe("sunrise")}</div></div>
    <div class="card"><div class="label">${escapeHtml(labels.tithi)}</div><div class="help">${escapeHtml(labels.tithiHelp)}</div><div class="value small">${safe("thithi")}</div></div>
    <div class="card"><div class="label">${escapeHtml(labels.star)}</div><div class="help">${escapeHtml(labels.starHelp)}</div><div class="value small">${safe("star")}</div></div>
  </div>

  <div class="note">
    <div class="note-title">${escapeHtml(labels.soolam)}</div>
    <div class="note-help">${escapeHtml(labels.soolamHelp)}</div>
    <div class="note-value">${soolamValue}</div>
  </div>

  <div class="note today-note">
    <div class="note-title">${escapeHtml(labels.today)}</div>
    <div class="note-help">${escapeHtml(labels.todayHelp)}</div>
    <div class="note-value">${safe("subakariyam")}</div>
  </div>

  <div class="footer">
    <div>${escapeHtml(labels.updated)}: ${updatedText}</div>
    <div>${escapeHtml(labels.source)}</div>
  </div>
</div>
</body>
</html>
`;
}

async function fetchTamilData(updatedAt) {
  const response = await fetch(SOURCE_URL, {
    headers: {
      "user-agent": "Mozilla/5.0 GitHub Tamil Calendar Static Renderer"
    }
  });

  if (!response.ok) {
    throw new Error(`Tamil calendar source returned HTTP ${response.status}`);
  }

  const html = await response.text();
  const dailyLines = findDailyLines(htmlToLines(html));

  return {
    date: dailyLines[0] || "Not available",
    tamil_date: tamilDateValue(dailyLines),
    nalla_neram: rawSectionValue(dailyLines, "Nalla Neram", ["கௌரி நல்ல நேரம்", "Gowri Nalla Neram"]),
    gowri_nalla_neram: rawSectionValue(dailyLines, "Gowri Nalla Neram", ["இராகு காலம்", "Raahu Kaalam"]),
    rahu_kaalam: rawSectionValue(dailyLines, "Raahu Kaalam", ["எமகண்டம்", "Yemagandam"]),
    yamagandam: rawSectionValue(dailyLines, "Yemagandam", ["குளிகை", "Kuligai"]),
    kuligai: rawSectionValue(dailyLines, "Kuligai", ["சூலம்", "Soolam"]),
    soolam: rawSectionValue(dailyLines, "Soolam", ["பரிகாரம்", "Parigaram"]),
    parigaram: rawSectionValue(dailyLines, "Parigaram", ["சந்திராஷ்டமம்", "Chandirashtamam"]),
    sunrise: rawSectionValue(dailyLines, "Sun Rise", ["ஸ்ரார்த திதி", "Sraardha Thithi"]),
    thithi: rawSectionValue(dailyLines, "Thithi", ["நட்சத்திரம்", "Star"]),
    star: rawSectionValue(dailyLines, "Star", ["சுபகாரியம்", "Subakariyam"]),
    subakariyam: rawSectionValue(dailyLines, "Subakariyam", ["Tamil Rasi Palan"]),
    updated_at: updatedAt
  };
}

async function main() {
  const englishData = JSON.parse(await fs.readFile("data/calendar.json", "utf8"));
  const tamilData = await fetchTamilData(englishData.updated_at || new Date().toISOString());

  await fs.writeFile("data/calendar-tamil.json", JSON.stringify(tamilData, null, 2) + "\n", "utf8");
  await fs.writeFile("English.html", staticPage({ language: "en", data: englishData }), "utf8");
  await fs.writeFile("index.html", staticPage({ language: "ta", data: tamilData }), "utf8");

  console.log("Generated fully static calendar pages:");
  console.log(" - index.html (Tamil)");
  console.log(" - English.html (English)");
  console.log(" - data/calendar-tamil.json (debug/source snapshot)");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
