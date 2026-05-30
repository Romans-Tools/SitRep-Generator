const fields = [
  "incidentName",
  "missionNumber",
  "dateFrom",
  "dateTo",
  "timeFrom",
  "timeTo",
  "currentSituation",
  "criticalIssues",
  "equipmentStatus",
  "teamStatus",
  "assetsAvailable",
  "plannedActivities",
  "additionalInfo",
  "preparedBy",
  "distribution",
  "reportDate",
  "reportTime"
];

// Fields that must be filled before a report can be exported.
const requiredFields = ["incidentName", "missionNumber"];

const DRAFT_KEY = "capSitrepDraft";
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function getValue(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
}

/**
 * Convert an ISO date (YYYY-MM-DD) from a date input into a readable
 * "DD MMM YYYY" form for the exported document. Falls back to the raw
 * value if it cannot be parsed.
 */
function formatDate(value) {
  if (!value) return "";

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  const monthIndex = Number(month) - 1;

  if (monthIndex < 0 || monthIndex > 11) return value;

  return `${Number(day)} ${MONTHS[monthIndex]} ${year}`;
}

function showStatus(message, type = "info") {
  const statusEl = document.getElementById("status");
  if (!statusEl) {
    // Fall back to alert if the status region is missing.
    window.alert(message);
    return;
  }

  statusEl.textContent = message;
  statusEl.className = `status status--${type} is-visible`;

  clearTimeout(showStatus.timer);
  showStatus.timer = setTimeout(() => {
    statusEl.classList.remove("is-visible");
  }, 4000);
}

function collectFormData() {
  const data = {};
  fields.forEach((field) => {
    data[field] = getValue(field);
  });
  return data;
}

function saveDraft({ announce = true } = {}) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(collectFormData()));
    if (announce) {
      showStatus("Draft saved to this browser.", "success");
    }
  } catch (error) {
    console.error("Draft save error:", error);
    showStatus("Could not save draft (storage unavailable).", "error");
  }
}

function loadDraft() {
  const saved = localStorage.getItem(DRAFT_KEY);
  if (!saved) return false;

  try {
    const data = JSON.parse(saved);
    let restored = false;

    fields.forEach((field) => {
      const element = document.getElementById(field);
      if (element && data[field]) {
        element.value = data[field];
        restored = true;
      }
    });

    return restored;
  } catch (error) {
    console.error("Draft load error:", error);
    return false;
  }
}

function clearForm() {
  if (!confirm("Clear all fields and remove the saved draft?")) return;

  fields.forEach((field) => {
    const element = document.getElementById(field);
    if (element) {
      element.value = "";
    }
  });

  localStorage.removeItem(DRAFT_KEY);
  showStatus("Form cleared.", "info");
}

/**
 * Highlight any missing required fields and return the list of their ids.
 */
function findMissingRequired() {
  const missing = [];

  requiredFields.forEach((field) => {
    const element = document.getElementById(field);
    if (!element) return;

    const isEmpty = !element.value.trim();
    element.classList.toggle("input-error", isEmpty);
    if (isEmpty) {
      missing.push(field);
    }
  });

  return missing;
}

function formatDocxError(error) {
  if (error.properties && error.properties.errors) {
    return error.properties.errors
      .map((err) => {
        return (
          err.properties?.explanation ||
          err.message ||
          "Unknown template error"
        );
      })
      .join("\n\n");
  }

  return error.message || "Unknown export error";
}

function buildExportFileName() {
  const incidentName = getValue("incidentName");

  if (!incidentName) {
    return "CAP-SITREP.docx";
  }

  const safeName = incidentName
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return `${safeName || "CAP-SITREP"}.docx`;
}

async function exportSitrep() {
  // Validate required fields before doing any work.
  const missing = findMissingRequired();
  if (missing.length > 0) {
    const first = document.getElementById(missing[0]);
    if (first) first.focus();
    showStatus("Please fill in the highlighted required fields.", "error");
    return;
  }

  const exportBtn = document.getElementById("exportBtn");
  const originalLabel = exportBtn ? exportBtn.textContent : "";

  try {
    // Verify required libraries loaded.
    if (typeof PizZip === "undefined") {
      throw new Error("PizZip library failed to load.");
    }
    if (typeof window.docxtemplater === "undefined") {
      throw new Error("Docxtemplater library failed to load.");
    }
    if (typeof saveAs === "undefined") {
      throw new Error("FileSaver library failed to load.");
    }

    if (exportBtn) {
      exportBtn.disabled = true;
      exportBtn.textContent = "Generating…";
    }

    // Load DOCX template. Use a relative path so the tool works when
    // served from a subpath (e.g. GitHub Pages project sites).
    const response = await fetch("SITREP.docx");

    if (!response.ok) {
      throw new Error(`Unable to load SITREP.docx (HTTP ${response.status})`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const zip = new PizZip(arrayBuffer);

    const doc = new window.docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: "[[",
        end: "]]"
      }
    });

    doc.render({
      incidentName: getValue("incidentName"),
      missionNumber: getValue("missionNumber"),

      dateFrom: formatDate(getValue("dateFrom")),
      dateTo: formatDate(getValue("dateTo")),

      timeFrom: getValue("timeFrom"),
      timeTo: getValue("timeTo"),

      currentSituation: getValue("currentSituation"),
      criticalIssues: getValue("criticalIssues"),

      equipmentStatus: getValue("equipmentStatus"),
      teamStatus: getValue("teamStatus"),

      assetsAvailable: getValue("assetsAvailable"),

      plannedActivities: getValue("plannedActivities"),

      additionalInfo: getValue("additionalInfo"),

      preparedBy: getValue("preparedBy"),
      distribution: getValue("distribution"),

      reportDate: formatDate(getValue("reportDate")),
      reportTime: getValue("reportTime")
    });

    const blob = doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });

    saveAs(blob, buildExportFileName());
    showStatus("SITREP exported.", "success");
  } catch (error) {
    console.error("SITREP Export Error:", error);
    showStatus(`Export failed: ${formatDocxError(error)}`, "error");
  } finally {
    if (exportBtn) {
      exportBtn.disabled = false;
      exportBtn.textContent = originalLabel || "Export SITREP";
    }
  }
}

/**
 * Pre-fill the report date and time with the current local values when
 * they are empty, so a fresh report is stamped sensibly by default.
 */
function prefillReportTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");

  const dateEl = document.getElementById("reportDate");
  if (dateEl && !dateEl.value) {
    dateEl.value =
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }

  const timeEl = document.getElementById("reportTime");
  if (timeEl && !timeEl.value) {
    timeEl.value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }
}

// Debounced auto-save so work is not lost between manual saves.
function scheduleAutoSave() {
  clearTimeout(scheduleAutoSave.timer);
  scheduleAutoSave.timer = setTimeout(() => {
    saveDraft({ announce: false });
  }, 800);
}

document.addEventListener("DOMContentLoaded", () => {
  const restored = loadDraft();
  prefillReportTimestamp();

  if (restored) {
    showStatus("Draft restored from your last session.", "info");
  }

  const saveBtn = document.getElementById("saveBtn");
  const clearBtn = document.getElementById("clearBtn");
  const exportBtn = document.getElementById("exportBtn");

  if (saveBtn) saveBtn.addEventListener("click", () => saveDraft());
  if (clearBtn) clearBtn.addEventListener("click", clearForm);
  if (exportBtn) exportBtn.addEventListener("click", exportSitrep);

  // Auto-save on edits and clear the error highlight as the user types.
  fields.forEach((field) => {
    const element = document.getElementById(field);
    if (!element) return;

    element.addEventListener("input", () => {
      element.classList.remove("input-error");
      scheduleAutoSave();
    });
  });
});
