import fs from "node:fs/promises";

const URL = "https://www.tamildailycalendar.com/tamil_daily_calendar.php";

const replacements = {
  "சித்திரை": "Chithirai",
  "வைகாசி": "Vaikasi",
  "ஆனி": "Aani",
  "ஆடி": "Aadi",
  "ஆவணி": "Aavani",
  "புரட்டாசி": "Purattasi",
  "ஐப்பசி": "Aippasi",
  "கார்த்திகை": "Karthigai",
  "மார்கழி": "Margazhi",
  "தை": "Thai",
  "மாசி": "Maasi",
  "பங்குனி": "Panguni",

  "பராபவ": "Parabhava",

  "மேற்கு": "West",
  "கிழக்கு": "East",
  "வடக்கு": "North",
  "தெற்கு": "South",

  "வெல்லம்": "Jaggery",

  "சம நோக்கு நாள்": "Balanced day",
  "மிதுன லக்னம்": "Gemini ascendant",
  "இருப்பு நாழிகை": "Balance",
  "வினாடி": "seconds",

  "திரயோதசி": "Trayodashi",
  "சதுர்த்தசி": "Chaturdashi",

  "அனுஷம்": "Anusham",
  "கேட்டை": "Kettai",

  "மருந்து உண்ண": "Taking medicine",
  "பேட்டி காண": "Meetings / interviews",
  "யாத்திரை செய்ய": "Travel",
  "சிறந்த நாள்": "A favourable day",

  "இன்று அதிகாலை": "Until",
  "வரை": "",
  "பின்பு": "then",

  "கா / AM": "AM",
  "மா / PM": "PM",
  "கா": "AM",
  "மா": "PM"
};

function clean(value = "") {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function translate(value = "") {
  let result = clean(value);

  for (const [tamil, english] of Object.entries(replacements)) {
    result = result.split(tamil).join(english);
  }

  // Remove duplicate Roman Tamil words left beside translated Tamil text.
  result = result
    .replace(/\bMerkku\b/gi, "")
    .replace(/\bMerku\b/gi, "")
    .replace(/\bVellam\b/gi, "")
    .replace(/\bThithi\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  // Time formatting.
  result = result
    .replace(/(\d{2})\.(\d{2})/g, "$1:$2")
    .replace(/\s*-\s*/g, " – ")
    .replace(/\bAM AM\b/g, "AM")
    .replace(/\bPM PM\b/g, "PM");

  return result || "Not available";
}

function htmlToLines(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<(br|\/p|\/div|\/tr|\/td|\/th|\/h[1-6])[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&");

  return text
    .split("\n")
    .map(clean)
    .filter(Boolean);
}

function sectionValue(lines, label, nextLabel) {
  const startIndex = lines.findIndex(line => line.startsWith(label));

  if (startIndex === -1) {
    return "Not available";
  }

  const values = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];

    if (i > startIndex && line.startsWith(nextLabel)) {
      break;
    }

    if (i === startIndex) {
      values.push(line.slice(label.length).trim());
    } else {
      values.push(line);
    }
  }

  return translate(values.join(" "));
}

function addTimeSeparator(value) {
  return value.replace(
    /(AM|PM)\s+(\d{2}:\d{2})/g,
    "$1 / $2"
  );
}

async function main() {
  const response = await fetch(URL, {
    headers: {
      "user-agent": "Mozilla/5.0 GitHub Tamil Calendar Updater"
    }
  });

  if (!response.ok) {
    throw new Error(`Calendar website returned HTTP ${response.status}`);
  }

  const html = await response.text();
  const lines = htmlToLines(html);

  const dateIndex = lines.findIndex(line =>
    /^\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i.test(line)
  );

  if (dateIndex === -1) {
    throw new Error("Could not locate today's calendar date.");
  }

  const endIndex = lines.findIndex(
    (line, index) => index > dateIndex && line.startsWith("Tamil Rasi Palan")
  );

  const dailyLines = lines.slice(
    dateIndex,
    endIndex === -1 ? dateIndex + 60 : endIndex
  );

  const data = {
    date: dailyLines[0] || "Not available",
    tamil_date: sectionValue(dailyLines, "Date", "Nalla Neram"),
    nalla_neram: addTimeSeparator(
      sectionValue(dailyLines, "Nalla Neram", "Gowri Nalla Neram")
    ),
    gowri_nalla_neram: addTimeSeparator(
      sectionValue(dailyLines, "Gowri Nalla Neram", "Raahu Kaalam")
    ),
    rahu_kaalam: sectionValue(dailyLines, "Raahu Kaalam", "Yemagandam"),
    yamagandam: sectionValue(dailyLines, "Yemagandam", "Kuligai"),
    kuligai: sectionValue(dailyLines, "Kuligai", "Soolam"),
    soolam: sectionValue(dailyLines, "Soolam", "Parigaram"),
    parigaram: sectionValue(dailyLines, "Parigaram", "Chandirashtamam"),
    chandrashtamam: sectionValue(dailyLines, "Chandirashtamam", "Naal"),
    lagnam: sectionValue(dailyLines, "Lagnam", "Sun Rise"),
    sunrise: sectionValue(dailyLines, "Sun Rise", "Sraardha Thithi"),
    sraardha_thithi: sectionValue(dailyLines, "Sraardha Thithi", "Thithi"),
    thithi: sectionValue(dailyLines, "Thithi", "Star"),
    star: sectionValue(dailyLines, "Star", "Subakariyam"),
    subakariyam: sectionValue(dailyLines, "Subakariyam", "Tamil Rasi Palan"),
    updated_at: new Date().toISOString()
  };

  await fs.mkdir("data", { recursive: true });

  await fs.writeFile(
    "data/calendar.json",
    JSON.stringify(data, null, 2) + "\n",
    "utf8"
  );

  console.log(JSON.stringify(data, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
