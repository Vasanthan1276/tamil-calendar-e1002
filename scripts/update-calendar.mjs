import fs from "node:fs/promises";

const URL = "https://www.tamildailycalendar.com/tamil_daily_calendar.php";

const replacements = {
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
  "சித்திரை": "Chithirai",
  "வைகாசி": "Vaikasi",

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
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function translate(value = "") {
  let result = clean(value);

  for (const [tamil, english] of Object.entries(replacements)) {
    result = result.split(tamil).join(english);
  }

  return clean(result);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getValue(text, label, nextLabel = "") {
  const start = escapeRegex(label);
  const end = nextLabel
    ? `(?=${escapeRegex(nextLabel)})`
    : "(?=Tamil Rasi Palan|$)";

  const pattern = new RegExp(`${start}\\s*([\\s\\S]*?)${end}`, "i");
  const match = text.match(pattern);

  if (!match) return "Not available";

  return clean(match[1]);
}

function removeTamilDuplicates(value) {
  return value
    .replace(/[^\x00-\x7F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const response = await fetch(URL, {
    headers: {
      "user-agent": "Mozilla/5.0 GitHub Calendar Updater"
    }
  });

  if (!response.ok) {
    throw new Error(`Calendar site returned ${response.status}`);
  }

  const html = await response.text();

  const text = clean(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );

  const data = {
    date: getValue(text, "####", "தேதி"),
    tamil_date: getValue(text, "Date", "ஞாயிறு"),
    nalla_neram: getValue(text, "Nalla Neram", "கௌரி நல்ல நேரம்"),
    gowri_nalla_neram: getValue(text, "Gowri Nalla Neram", "இராகு காலம்"),
    rahu_kaalam: getValue(text, "Raahu Kaalam", "எமகண்டம்"),
    yamagandam: getValue(text, "Yemagandam", "குளிகை"),
    kuligai: getValue(text, "Kuligai", "சூலம்"),
    soolam: getValue(text, "Soolam", "பரிகாரம்"),
    parigaram: getValue(text, "Parigaram", "சந்திராஷ்டமம்"),
    chandrashtamam: getValue(text, "Chandirashtamam", "நாள்"),
    lagnam: getValue(text, "Lagnam", "சூரிய உதயம்"),
    sunrise: getValue(text, "Sun Rise", "ஸ்ரார்த திதி"),
    thithi: getValue(text, "Thithi", "நட்சத்திரம்"),
    star: getValue(text, "Star", "சுபகாரியம்"),
    subakariyam: getValue(text, "Subakariyam", "Tamil Rasi Palan")
  };

  for (const key of Object.keys(data)) {
    data[key] = translate(removeTamilDuplicates(data[key]));
  }

  data.updated_at = new Date().toISOString();

  await fs.mkdir("data", { recursive: true });
  await fs.writeFile(
    "data/calendar.json",
    JSON.stringify(data, null, 2) + "\n",
    "utf8"
  );

  console.log(JSON.stringify(data, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
