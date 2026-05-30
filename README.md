# CAP Situation Report Generator

A lightweight browser-based tool for Civil Air Patrol teams to draft and export Situation Reports (SITREPs) using a DOCX template.

## Features

- Guided form for key SITREP data fields.
- Required-field validation before export, with inline highlighting.
- Draft persistence in browser `localStorage`, with automatic background saving as you type.
- Report date/time pre-filled with the current local date and time.
- Dates rendered into the document in a readable `DD MMM YYYY` format.
- One-click export to a populated `.docx` file.
- Automatic filename generation from incident name.
- Clear-form workflow that also removes saved draft data.
- Inline status messages instead of pop-up alerts.

## Project Files

- `index.html` – UI layout and form fields.
- `script.js` – draft save/load, form actions, and DOCX export logic.
- `style.css` – site styling.
- `SITREP.docx` – DOCX template consumed at export time.

## How It Works

1. Open the app in a browser.
2. Complete the SITREP form fields.
3. Optionally click **Save Draft** to store values in your current browser.
4. Click **Export SITREP** to generate a completed DOCX document.
5. Use **Clear Form** to reset all fields and remove the saved draft.

## Local Usage

Because the app fetches `SITREP.docx`, run it behind a local web server (instead of opening the HTML file directly).

### Option A: Python

```bash
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

### Option B: Node (serve)

```bash
npx serve .
```

## Template and Placeholder Notes

The export flow uses Docxtemplater with custom delimiters:

- Start delimiter: `[[`
- End delimiter: `]]`

Ensure placeholders inside `SITREP.docx` match the field keys used in `script.js` (for example `[[incidentName]]`, `[[missionNumber]]`, etc.).

## Dependencies (CDN)

Loaded via script tags in `index.html`:

- PizZip
- Docxtemplater
- FileSaver.js

## Data Storage

Draft data is stored locally under this key:

- `capSitrepDraft`

No backend services are used.
