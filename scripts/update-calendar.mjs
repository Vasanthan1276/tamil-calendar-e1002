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
  "பால்": "Milk",
  "தயிர்": "Curd",
  "நெய்": "Ghee",
  "எலுமிச்சை": "Lemon",
  "சர்க்கரை": "Sugar",

  "இன்று அதிகாலை": "Until",
  "இன்று காலை": "Until",
  "இன்று மதியம்": "Until",
  "இன்று மாலை": "Until",
  "இன்று இரவு": "Until",
  "அதிகாலை": "AM",
  "காலை": "AM",
  "மதியம்": "PM",
  "மாலை": "PM",
  "இரவு": "PM",
  "மணி": "",
  "வரை": "",
  "பின்பு": "then",

  "கா / AM": "AM",
  "மா / PM": "PM",
  "கா": "AM",
  "மா": "PM",

  "பிரதமை": "Prathamai",
  "துவிதியை": "Dwitiya",
  "திருதியை": "Tritiya",
  "சதுர்த்தி": "Chaturthi",
  "பஞ்சமி": "Panchami",
  "சஷ்டி": "Sashti",
  "சப்தமி": "Saptami",
  "அஷ்டமி": "Ashtami",
  "நவமி": "Navami",
  "தசமி": "Dasami",
  "ஏகாதசி": "Ekadashi",
  "ஏகாதேசி": "Ekadashi",
  "துவாதசி": "Dwadashi",
  "திரயோதசி": "Trayodashi",
  "சதுர்த்தசி": "Chaturdashi",
  "அமாவாசை": "Amavasai",
  "பௌர்ணமி": "Pournami",
  "பூர்ணிமா": "Pournami",

  "அஸ்வினி": "Ashwini",
  "பரணி": "Bharani",
  "கிருத்திகை": "Krittika",
  "ரோகிணி": "Rohini",
  "மிருகசீரிடம்": "Mrigashirsha",
  "மிருகசீரிஷம்": "Mrigashirsha",
  "மிருகசிரிடம்": "Mrigashirsha",
  "மிருகசிரிஷம்": "Mrigashirsha",
  "திருவாதிரை": "Thiruvathirai",
  "புனர்பூசம்": "Punarpoosam",
  "பூசம்": "Poosam",
  "ஆயில்யம்": "Ayilyam",
  "மகம்": "Magam",
  "பூரம்": "Pooram",
  "உத்திரம்": "Uthiram",
  "அஸ்தம்": "Hastham",
  "ஹஸ்தம்": "Hastham",
  "சுவாதி": "Swathi",
  "விசாகம்": "Visakam",
  "அனுஷம்": "Anusham",
  "கேட்டை": "Kettai",
  "மூலம்": "Moolam",
  "பூராடம்": "Pooradam",
  "உத்திராடம்": "Uthiradam",
  "திருவோணம்": "Thiruvonam",
  "அவிட்டம்": "Avittam",
  "சதயம்": "Sadayam",
  "பூரட்டாதி": "Poorattadhi",
  "உத்திரட்டாதி": "Uthirattadhi",
  "ரேவதி": "Revathi",

  "சம நோக்கு நாள்": "Balanced day",
  "மேல் நோக்கு நாள்": "Upward-looking day",
  "கீழ் நோக்கு நாள்": "Downward-looking day",

  "மருந்து உண்ண": "taking medicine",
  "பேட்டி காண": "attending meetings or interviews",
  "யாத்திரை செய்ய": "travel",
  "யாத்திரை போக": "going on a journey or travel",
  "சிறந்த நாள்": "a favourable day",

  "ஆயுதம் பழக": "practising with tools or weapons",
  "வார்படஞ் செய்ய": "making plans, drawings, or layouts",
  "வார்படம் செய்ய": "making plans, drawings, or layouts",
  "சுபம் பேச": "having auspicious discussions",

  "கல்வி கற்க": "studying or learning",
  "கடை திறக்க": "opening a shop",
  "வியாபாரம் தொடங்க": "starting business",
  "புது வேலை தொடங்க": "starting new work",
  "விதை விதைக்க": "sowing seeds",
  "உழவு செய்ய": "farming work",
  "விவசாயம் செய்ய": "agriculture work",
  "புது வீடு புக": "entering a new house",
  "வாகனம் வாங்க": "buying a vehicle",
  "நகை வாங்க": "buying jewellery",
  "பணம் கொடுக்க": "giving money",
  "பணம் வாங்க": "receiving money",

  "மிதுன லக்னம்": "Gemini ascendant",
  "இருப்பு நாழிகை": "Balance",
  "வினாடி": "seconds"
};

const starNames = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha",
  "Thiruvathirai", "Punarpoosam", "Poosam", "Ayilyam", "Magam",
  "Pooram", "Uthiram", "Hastham", "Swathi", "Visakam", "Anusham",
  "Kettai", "Moolam", "Pooradam", "Uthiradam", "Thiruvonam",
  "Avittam", "Sadayam", "Poorattadhi", "Uthirattadhi", "Revathi"
];

const tithiNames = [
  "Prathamai", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Sashti", "Saptami", "Ashtami", "Navami", "Dasami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi",
  "Amavasai", "Pournami"
];

function clean(value = "") {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function removeDuplicateRomanTamil(result) {
  return result
    .replace(/\bMerkku\b/gi, "")
    .replace(/\bMerku\b/gi, "")
    .replace(/\bKizhakku\b/gi, "")
    .replace(/\bKilakku\b/gi, "")
    .replace(/\bKilaku\b/gi, "")
    .replace(/\bVadakku\b/gi, "")
    .replace(/\bTherku\b/gi, "")
    .replace(/\bThenku\b/gi, "")
    .replace(/\bVellam\b/gi, "")
    .replace(/\bPaal\b/gi, "")
    .replace(/\bThayir\b/gi, "")
    .replace(/\bNei\b/gi, "")
    .replace(/\bThithi\b/gi, "")
    .replace(/\bNatchathiram\b/gi, "")
    .replace(/\bSooriy[a-z]*\b/gi, "")
    .replace(/\bUdhayam\b/gi, "");
}

function removeAmPmAfterKnownNames(result) {
  const starPattern = starNames.join("|");
  const tithiPattern = tithiNames.join("|");

  return result
    .replace(
      new RegExp(`\\b(${starPattern})\\s+(?:(?:AM|PM)\\s*)+`, "gi"),
      "$1 "
    )
    .replace(
      new RegExp(`\\b(${tithiPattern})\\s+(?:(?:AM|PM)\\s*)+`, "gi"),
      "$1 "
    )
    .replace(/\b(West|East|North|South)\s+(?:(?:AM|PM)\s*)+/gi, "$1 ")
    .replace(/\b(AM|PM)(?:\s+\1)+\b/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function translate(value = "") {
  let result = clean(value);

  for (const [tamil, english] of Object.entries(replacements)) {
    result = result.split(tamil).join(english);
  }

  result = result.replace(/[\u0B80-\u0BFF]+/g, " ");
  result = removeDuplicateRomanTamil(result);

  result = result
    .replace(/(\d{1,2})\.(\d{2})/g, "$1:$2")
    .replace(/\s*-\s*/g, " – ")
    .replace(/\bAM AM\b/gi, "AM")
    .replace(/\bPM PM\b/gi, "PM")
    .replace(/\bPM\s+AM\b/gi, "PM")
    .replace(/\bAM\s+PM\b/gi, "PM")
    .replace(/\s+/g, " ")
    .trim();

  result = result
    .replace(/\bUntil\s+(AM|PM)\s+(\d{1,2}:\d{2})\b/gi, "Until $2 $1")
    .replace(/^\s*(AM|PM)\s+(\d{1,2}:\d{2})\b/gi, "Until $2 $1")
    .replace(/\b(AM|PM)\s+(\d{1,2}:\d{2})\s+\1\b/gi, "Until $2 $1");

  result = result
    .replace(/\s+then\s+(AM|PM)\s*$/gi, "")
    .replace(/\s+then\s*$/gi, "")
    .replace(/\bthen\s+(AM|PM)\b/gi, "then")
    .trim();

  result = removeAmPmAfterKnownNames(result);

  result = result
    .replace(/\bEast\s+(Kilakku|Kizhakku|Kilaku)\s*(AM|PM)?\b/gi, "East")
    .replace(/\bWest\s+(Merkku|Merku)\s*(AM|PM)?\b/gi, "West")
    .replace(/\bNorth\s+(Vadakku)\s*(AM|PM)?\b/gi, "North")
    .replace(/\bSouth\s+(Therku|Thenku)\s*(AM|PM)?\b/gi, "South");

  result = result
    .replace(/\s*,\s*,\s*/g, ", ")
    .replace(/\s*,\s*then\s*/gi, " then ")
    .replace(/^\s*[,./;:-]+\s*/g, "")
    .replace(/\s+[,./;:-]\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();

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

  if (startIndex === -1) return "Not available";

  const values = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];

    if (i > startIndex && line.startsWith(nextLabel)) break;

    if (i === startIndex) {
      values.push(line.slice(label.length).trim());
    } else {
      values.push(line);
    }
  }

  return translate(values.join(" "));
}

function addTimeSeparator(value) {
  return value.replace(/(AM|PM)\s+(\d{1,2}:\d{2})/g, "$1 / $2");
}

function inferredDayPeriod(hour) {
  return hour >= 6 && hour <= 11 ? "AM" : "PM";
}

function normalizeDaytimeRange(value) {
  if (!value || value === "Not available") return value;

  return value
    .replace(
      /(\d{1,2}):(\d{2})\s*(AM|PM)?\s*–\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/gi,
      (match, startHour, startMinute, startPeriod, endHour, endMinute, endPeriod) => {
        const start = Number(startHour);
        const end = Number(endHour);

        let startSuffix;
        let endSuffix;

        if (start >= 6 && start <= 11) {
          startSuffix = "AM";
          endSuffix = end >= 6 && end <= 11 ? "AM" : "PM";
        } else {
          startSuffix = "PM";
          endSuffix = "PM";
        }

        return `${startHour}:${startMinute} ${startSuffix} – ` +
          `${endHour}:${endMinute} ${endSuffix}`;
      }
    )
    .replace(/\b(AM|PM)(?:\s+\1)+\b/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function ensureDayPeriod(value) {
  return normalizeDaytimeRange(value);
}

function cleanGowriNeram(value) {
  if (!value || value === "Not available") return "Not available";

  let result = value
    .replace(
      /00:00\s*(?:AM|PM)?\s*–\s*00:00\s*(?:AM|PM)?/gi,
      ""
    )
    .replace(
      /(\d{1,2}):(\d{2})\s*(AM|PM)?\s*–\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/gi,
      (match, startHour, startMinute, startPeriod, endHour, endMinute, endPeriod) => {
        const start = Number(startHour);
        const end = Number(endHour);

        let startSuffix = startPeriod ? startPeriod.toUpperCase() : "";
        let endSuffix = endPeriod ? endPeriod.toUpperCase() : "";

        const sourceSaysAM = startSuffix === "AM" || endSuffix === "AM";
        const afternoonClockRange = start === 12 || (start >= 1 && start <= 5);

        // The source repeatedly labels afternoon Gowri slots such as
        // 12:15–01:15 and 01:45–02:45 as AM. Correct only this field.
        if (sourceSaysAM && afternoonClockRange) {
          startSuffix = "PM";
          endSuffix = "PM";
        } else {
          if (!startSuffix && endSuffix) startSuffix = endSuffix;
          if (!endSuffix && startSuffix) endSuffix = startSuffix;
          if (!startSuffix) startSuffix = inferredDayPeriod(start);
          if (!endSuffix) endSuffix = inferredDayPeriod(end);
        }

        return `${startHour}:${startMinute} ${startSuffix} – ` +
          `${endHour}:${endMinute} ${endSuffix}`;
      }
    );

  result = addTimeSeparator(result)
    .replace(/^\s*\/\s*/g, "")
    .replace(/\s*\/\s*$/g, "")
    .replace(/\s*\/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ")
    .trim();

  return result || "Not available";
}

function cleanTamilDate(value) {
  if (!value || value === "Not available") return "Not available";

  const tithiPattern = tithiNames.join("|");

  const result = removeAmPmAfterKnownNames(value)
    .replace(/\bToday\b/gi, " ")
    .replace(new RegExp(`\\b(?:${tithiPattern})\\b`, "gi"), " ")
    .replace(/\b(?:AM|PM)\b/gi, " ")
    .replace(/\s*–\s*/g, " – ")
    .replace(/(?:\s*–\s*){2,}/g, " – ")
    .replace(/^\s*–\s*|\s*–\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return result || "Not available";
}

function tidyNamedCalendarValue(value) {
  if (!value || value === "Not available") return "Not available";

  const result = removeAmPmAfterKnownNames(value)
    .replace(/\b(AM|PM)(?:\s+\1)+\b/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();

  return result || "Not available";
}

function tidySubakariyam(value) {
  let result = value
    .replace(/^\s*[,./;:-]+\s*/g, "")
    .replace(/\s*,\s*,\s*/g, ", ")
    .replace(/^\s*(?:AM|PM)\b[\s,;:.-]*/i, "")
    .replace(/[\s,;:.-]*\b(?:AM|PM)\s*$/i, "")
    .replace(/(^|[,;])\s*(?:AM|PM)\s*(?=[,;]|$)/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();

  if (!result || result === "Not available" || /^(?:AM|PM)$/i.test(result)) {
    return "Good for: traditional favourable activities";
  }

  result = result.replace(/\bA favourable day\b/gi, "a favourable day");

  if (!/^Good for:/i.test(result)) {
    result = `Good for: ${result}`;
  }

  result = result
    .replace(/(?:,\s*|\s+)a favourable day[.!]?$/i, "; generally a favourable day")
    .replace(/Good for:\s*(?:AM|PM)\b[\s,;:.-]*/i, "Good for: ")
    .replace(/\s+/g, " ")
    .trim();

  if (/^Good for:\s*$/i.test(result)) {
    return "Good for: traditional favourable activities";
  }

  return result;
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
    tamil_date: cleanTamilDate(
      sectionValue(dailyLines, "Date", "Nalla Neram")
    ),

    nalla_neram: addTimeSeparator(
      sectionValue(dailyLines, "Nalla Neram", "Gowri Nalla Neram")
    ),

    gowri_nalla_neram: cleanGowriNeram(
      sectionValue(dailyLines, "Gowri Nalla Neram", "Raahu Kaalam")
    ),

    rahu_kaalam: normalizeDaytimeRange(
      sectionValue(dailyLines, "Raahu Kaalam", "Yemagandam")
    ),

    yamagandam: normalizeDaytimeRange(
      sectionValue(dailyLines, "Yemagandam", "Kuligai")
    ),

    kuligai: normalizeDaytimeRange(
      sectionValue(dailyLines, "Kuligai", "Soolam")
    ),

    soolam: sectionValue(dailyLines, "Soolam", "Parigaram"),
    parigaram: sectionValue(dailyLines, "Parigaram", "Chandirashtamam"),
    chandrashtamam: sectionValue(dailyLines, "Chandirashtamam", "Naal"),
    lagnam: sectionValue(dailyLines, "Lagnam", "Sun Rise"),
    sunrise: sectionValue(dailyLines, "Sun Rise", "Sraardha Thithi"),
    sraardha_thithi: sectionValue(dailyLines, "Sraardha Thithi", "Thithi"),
    thithi: tidyNamedCalendarValue(
      sectionValue(dailyLines, "Thithi", "Star")
    ),
    star: tidyNamedCalendarValue(
      sectionValue(dailyLines, "Star", "Subakariyam")
    ),
    subakariyam: tidySubakariyam(
      sectionValue(dailyLines, "Subakariyam", "Tamil Rasi Palan")
    ),
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
