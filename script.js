function pad(n) {
  return String(n).padStart(2, "0");
}

function getTamilMonthApprox(date) {
  const y = date.getFullYear();

  // Approximate Tamil month start dates. Adjust in data.js if you want exact yearly values.
  const months = [
    { name: "சித்திரை", season: "Spring / New Year period", start: new Date(y, 3, 14) },
    { name: "வைகாசி", season: "Vaikasi", start: new Date(y, 4, 15) },
    { name: "ஆனி", season: "Aani", start: new Date(y, 5, 15) },
    { name: "ஆடி", season: "Aadi", start: new Date(y, 6, 16) },
    { name: "ஆவணி", season: "Avani", start: new Date(y, 7, 17) },
    { name: "புரட்டாசி", season: "Purattasi", start: new Date(y, 8, 17) },
    { name: "ஐப்பசி", season: "Aippasi", start: new Date(y, 9, 17) },
    { name: "கார்த்திகை", season: "Karthigai", start: new Date(y, 10, 16) },
    { name: "மார்கழி", season: "Margazhi", start: new Date(y, 11, 16) },
    { name: "தை", season: "Thai", start: new Date(y, 0, 14) },
    { name: "மாசி", season: "Maasi", start: new Date(y, 1, 13) },
    { name: "பங்குனி", season: "Panguni", start: new Date(y, 2, 14) }
  ];

  let current = months[9]; // Thai fallback for Jan
  for (const m of months) {
    if (date >= m.start) current = m;
  }

  if (date < new Date(y, 3, 14)) {
    for (const m of months.slice(9)) {
      if (date >= m.start) current = m;
    }
  }

  const tamilDay = Math.floor((date - current.start) / 86400000) + 1;
  return { ...current, day: tamilDay };
}

function getRahuKalam(day) {
  // Approximate common Rahu Kalam ranges by weekday.
  const values = {
    0: "16:30 - 18:00",
    1: "07:30 - 09:00",
    2: "15:00 - 16:30",
    3: "12:00 - 13:30",
    4: "13:30 - 15:00",
    5: "10:30 - 12:00",
    6: "09:00 - 10:30"
  };
  return values[day];
}

function updateCalendar() {
  const now = new Date();
  const tamil = getTamilMonthApprox(now);

  const englishDate = now.toLocaleDateString("en-SG", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  const dayName = now.toLocaleDateString("en-SG", { weekday: "long" });

  document.getElementById("englishDate").textContent = englishDate;
  document.getElementById("dayName").textContent = dayName;
  document.getElementById("tamilMonth").textContent = tamil.name;
  document.getElementById("tamilSeason").textContent = tamil.season;
  document.getElementById("tamilDay").textContent = tamil.day;
  document.getElementById("timeNow").textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  document.getElementById("rahuKalam").textContent = getRahuKalam(now.getDay());

  if (window.CALENDAR_DATA) {
    const key = now.toISOString().slice(0, 10);
    const todayData = window.CALENDAR_DATA[key];
    if (todayData) {
      if (todayData.tamilMonth) document.getElementById("tamilMonth").textContent = todayData.tamilMonth;
      if (todayData.tamilDay) document.getElementById("tamilDay").textContent = todayData.tamilDay;
      if (todayData.nallaNeram) document.getElementById("nallaNeram").textContent = todayData.nallaNeram;
      if (todayData.rahuKalam) document.getElementById("rahuKalam").textContent = todayData.rahuKalam;
      if (todayData.note) document.getElementById("note").textContent = todayData.note;
    }
  }
}

updateCalendar();
