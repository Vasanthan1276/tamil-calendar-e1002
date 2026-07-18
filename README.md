# Tamil Calendar for reTerminal E1002

Test
A GitHub Pages-ready Tamil calendar dashboard designed for the Seeed Studio reTerminal E1002 / SenseCraft HMI.

## Features

- Fixed 800 × 480 layout
- E-paper friendly black-and-white design
- Tamil month and Tamil day display
- English date and weekday
- Nalla Neram and Rahu Kalam fields
- Auto-refresh every hour
- Works as a static GitHub Pages site

## Files

```text
index.html
style.css
script.js
data.js
README.md
```

## How to use with GitHub Pages

1. Create a new GitHub repository, for example:

```text
tamil-calendar-e1002
```

2. Upload all files from this folder.

3. Go to:

```text
Settings > Pages
```

4. Under **Build and deployment**, choose:

```text
Deploy from a branch
```

5. Select:

```text
main / root
```

6. Your page will be available at:

```text
https://YOUR_USERNAME.github.io/tamil-calendar-e1002/
```

## How to use with SenseCraft HMI

1. Open SenseCraft HMI.
2. Create a page for your reTerminal E1002.
3. Add a Web View / URL component if available.
4. Set the URL to your GitHub Pages link.
5. Set refresh interval in SenseCraft HMI if supported.

## Important note

The Tamil month/day calculation in `script.js` is approximate. For exact panchangam values, update `data.js` with verified daily data.

Example:

```js
window.CALENDAR_DATA = {
  "2026-05-10": {
    tamilMonth: "வைகாசி",
    tamilDay: "1",
    nallaNeram: "07:30 - 08:30 / 16:30 - 17:30",
    rahuKalam: "16:30 - 18:00",
    note: "Daily note"
  }
};
```

## Best display settings

- Width: 800 px
- Height: 480 px
- Browser zoom: 100%
- Refresh: hourly or daily
- Avoid animations for better e-paper battery life
