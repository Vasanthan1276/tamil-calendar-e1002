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
  "சம நோக்கு நாள்": "Balanced Day",
  "மிதுன லக்னம்": "Gemini Ascendant",
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

  // Remove remaining Tamil-only labels such as weekday headings.
  result = result.replace(/[\u0B80-\u0BFF]+/g, " ");
  result = clean(result);

  // Improve time formatting slightly.
  result = result.replace(/(\d{2})\.(\d{2})/g, "$1:$2");
  result = result.replace(/\s*-\s*/g, " – ");

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

function getValue(section, label, nextLabel) {
  const start = section.indexOf(label);

  if (start === -1) {
    return "Not available";
  }

  const afterStart = section.slice(start + label.length);
  const end = nextLabel ? afterStart.indexOf(nextLabel) : -1;

  const raw = end >= 0 ? afterStart.slice(0, end) : afterStart;

  return translate(raw);
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

  // Locate only today's daily-calendar section.
  const dateIndex = lines.findIndex(line =>
    /^\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i.test(line)
  );

  if (dateIndex === -1) {
    throw new Error("Could not locate today's calendar date.");
  }

  const endIndex = lines.findIndex(
    (line, index) => index > dateIndex && line.includes("Tamil Rasi Palan")
  );

  const dailyLines = lines.slice(
    dateIndex,
    endIndex === -1 ? dateIndex + 60 : endIndex
  );

  const section = dailyLines.join("\n");

  const data = {
    date: dailyLines[0] || "Not available",
    tamil_date: getValue(section, "Date", "Nalla Neram"),
    nalla_neram: getValue(section, "Nalla Neram", "Gowri Nalla Neram"),
    gowri_nalla_neram: getValue(section, "Gowri Nalla Neram", "Raahu Kaalam"),
    rahu_kaalam: getValue(section, "Raahu Kaalam", "Yemagandam"),
    yamagandam: getValue(section, "Yemagandam", "Kuligai"),
    kuligai: getValue(section, "Kuligai", "Soolam"),
    soolam: getValue(section, "Soolam", "Parigaram"),
    parigaram: getValue(section, "Parigaram", "Chandirashtamam"),
    chandrashtamam: getValue(section, "Chandirashtamam", "Naal"),
    lagnam: getValue(section, "Lagnam", "Sun Rise"),
    sunrise: getValue(section, "Sun Rise", "Sraardha Thithi"),
    thithi: getValue(section, "Thithi", "Star"),
    star: getValue(section, "Star", "Subakariyam"),
    subakariyam: getValue(section, "Subakariyam", "Tamil Rasi Palan"),
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
