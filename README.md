Tamil Calendar for reTerminal E1002

Static Tamil calendar pages for the Seeed Studio reTerminal E1002 / SenseCraft HMI.

The project uses a BMP-first architecture for the physical E1002:

Remote calendar/data sources
        ↓
GitHub Actions
        ↓
HTML / PNG intermediate files
        ↓
800 × 480 BMP files
        ↓
SenseCraft HMI / reTerminal E1002

The physical E1002 should use the generated BMP files directly. It should not need to fetch calendar APIs, execute JavaScript, wait for remote pages, or render the calendar dynamically during its wake cycle.

Production E1002 pages

Use these direct URLs in SenseCraft HMI.

Tamil calendar

https://vasanthan1276.github.io/tamil-calendar-e1002/tamil.bmp

English calendar

https://vasanthan1276.github.io/tamil-calendar-e1002/english.bmp

Both BMP files are generated at:

800 × 480

These are the production E1002 outputs.

Browser / diagnostic pages

The repository also keeps HTML/PNG files for previewing, debugging, and generation purposes.

Tamil browser page

https://vasanthan1276.github.io/tamil-calendar-e1002/

or:

https://vasanthan1276.github.io/tamil-calendar-e1002/index.html

English browser page

https://vasanthan1276.github.io/tamil-calendar-e1002/English.html

Tamil intermediate PNG

https://vasanthan1276.github.io/tamil-calendar-e1002/tamil-calendar.png

These are not the preferred SenseCraft HMI links. The physical E1002 should use tamil.bmp and english.bmp.

Why BMP-first

The E1002 is battery powered and normally spends most of its time in deep sleep.

The design rule for E1002-facing pages is:

Perform API calls, calculations, HTML rendering, cropping, and image conversion in GitHub Actions. Let the E1002 download only a completed 800 × 480 BMP.

Benefits:

no runtime calendar API calls from the E1002;

no remote iframe loading on the E1002;

no JavaScript required by the physical display;

consistent dimensions across E1002 pages;

less dependence on SenseCraft HTML rendering;

simpler troubleshooting;

architecture consistent with the F1 E1002 project.

Automatic update workflow

Workflow:

.github/workflows/update-calendar.yml

Workflow name:

Update Static Tamil Calendar Pages

Automatic schedule:

15 22 * * *

This corresponds to approximately:

06:15 SGT daily

The workflow can also be started manually:

GitHub
→ Actions
→ Update Static Tamil Calendar Pages
→ Run workflow

Current generation flow

The workflow performs the following steps:

checks out the repository;

installs Node.js, Python, Playwright and Pillow;

fetches and prepares calendar data;

captures the Tamil calendar source inside GitHub Actions;

generates the fully static English calendar HTML;

renders the Tamil and English pages at 800 × 480;

converts the rendered images to BMP;

commits the refreshed outputs back to the repository.

Generated E1002 files:

tamil.bmp
english.bmp

Intermediate / browser files include:

tamil-calendar.png
index.html
English.html
data/calendar.json

Repository structure

Important files:

tamil-calendar-e1002/
│
├── .github/
│   └── workflows/
│       └── update-calendar.yml
│
├── data/
│   └── calendar.json
│
├── scripts/
│   ├── update-calendar.mjs
│   ├── capture-tamil-page.mjs
│   ├── render-english-static.mjs
│   ├── render-e1002-bmps.mjs
│   └── png_to_bmp.py
│
├── tamil.bmp
├── english.bmp
├── tamil-calendar.png
├── index.html
├── English.html
└── README.md

Data / page responsibilities

Tamil calendar

The Tamil page is captured from the remote Tamil calendar source during the GitHub Actions run.

The remote page is not loaded by the physical E1002.

Tamil calendar website
        ↓
Playwright in GitHub Actions
        ↓
tamil-calendar.png
        ↓
800 × 480 rendering
        ↓
tamil.bmp

English calendar

The English page is generated from normalized calendar data in:

data/calendar.json

The generated English.html contains its calendar values directly. GitHub Actions then renders it to:

english.bmp

The E1002 therefore does not need to calculate or fetch the English calendar values when it wakes.

SenseCraft HMI setup

For the physical E1002, use the direct BMP URLs:

Tamil:
https://vasanthan1276.github.io/tamil-calendar-e1002/tamil.bmp

English:
https://vasanthan1276.github.io/tamil-calendar-e1002/english.bmp

Target display resolution:

Width:  800
Height: 480

Important when migrating an existing SenseCraft page

If an older SenseCraft page previously used HTML, PNG, or a manually cropped source, do not assume that changing only the URL will reset the old crop/position settings.

A stale crop can produce symptoms such as:

a large black area above the image;

only a narrow strip of the calendar visible at the bottom;

the top of the page appearing while the lower part is cut off;

an apparently incorrect scale even though the BMP is 800 × 480.

If this happens:

verify the direct BMP URL in a normal browser;

reset any crop, zoom, fit, or position settings on the SenseCraft page;

preferably create a new clean SenseCraft page rather than copying an older HTML/PNG page;

add the BMP URL to the new page;

use the complete 800 × 480 frame with no additional crop;

publish only after the preview shows the full image.

This is particularly important when the page was created using Copy in SenseCraft, because the copied page may retain old image positioning/cropping settings.

Troubleshooting

Large black area or partial calendar in SenseCraft preview

First treat this as a SenseCraft crop/position issue, especially if the page was copied from an older page.

The generated tamil.bmp and english.bmp files are 800 × 480 BMP outputs. If both show the same large black area or bottom-only strip in SenseCraft, that strongly points to the page's crop/fit configuration rather than the calendar generator.

Recommended test:

create one brand-new SenseCraft page;

use english.bmp first because its layout is fully generated locally and has no remote image dependency;

do not apply any crop or zoom;

check whether the preview fills the full 800 × 480 area.

If the new English BMP page renders correctly, repeat the same process for tamil.bmp.

BMP does not update

Run the workflow manually:

Actions
→ Update Static Tamil Calendar Pages
→ Run workflow

Then confirm the latest commit includes:

tamil.bmp
english.bmp

SenseCraft still shows an old page

GitHub Pages and SenseCraft can cache previously loaded content.

Try:

verify the BMP URL in a normal browser;

wait briefly for GitHub Pages deployment;

reopen or refresh the SenseCraft page;

republish the page if required.

Tamil source capture changes unexpectedly

The Tamil page depends on the layout of the upstream Tamil calendar website during the GitHub Actions capture step.

If that website changes its layout, the capture/crop in:

scripts/capture-tamil-page.mjs

may need to be adjusted.

English values are wrong or incomplete

Check:

data/calendar.json

and:

scripts/update-calendar.mjs

The physical E1002 is only displaying the already-generated result.

E1002 project standard

From September 2026 onward, the preferred standard for physical E1002 pages is:

Data/API source
      ↓
GitHub Actions
      ↓
Pre-rendered 800 × 480 BMP
      ↓
SenseCraft HMI
      ↓
reTerminal E1002

HTML pages may still be maintained for Home Assistant, browser dashboards, previews, or debugging, but SenseCraft HMI should use direct BMP files wherever practical.

This calendar repository is the first non-F1 project migrated to that common BMP-first standard.

Current production URLs

Tamil E1002 BMP:
https://vasanthan1276.github.io/tamil-calendar-e1002/tamil.bmp

English E1002 BMP:
https://vasanthan1276.github.io/tamil-calendar-e1002/english.bmp

Tamil browser preview:
https://vasanthan1276.github.io/tamil-calendar-e1002/

English browser preview:
https://vasanthan1276.github.io/tamil-calendar-e1002/English.html
