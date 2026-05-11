// script.js - CAP Situation Report Generator

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

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "";
}

function updatePreview() {
  fields.forEach((field) => {
    setText(`preview-${field}`, getValue(field));
  });
}

function clearForm() {
  fields.forEach((field) => {
    const el = document.getElementById(field);
    if (el) el.value = "";
  });

  updatePreview();
}

function validateRequiredFields() {
  const required = ["incidentName", "missionNumber", "dateFrom", "dateTo", "preparedBy"];
  const missing = required.filter((field) => !getValue(field));

  if (missing.length > 0) {
    alert("Please complete the required fields before exporting.");
    return false;
  }

  return true;
}

function exportSitrep() {
  if (!validateRequiredFields()) return;

  updatePreview();
  window.print();
}

function saveDraft() {
  const data = {};

  fields.forEach((field) => {
    data[field] = getValue(field);
  });

  localStorage.setItem("capSitrepDraft", JSON.stringify(data));
  alert("Draft saved.");
}

function loadDraft() {
  const saved = localStorage.getItem("capSitrepDraft");
  if (!saved) return;

  const data = JSON.parse(saved);

  fields.forEach((field) => {
    const el = document.getElementById(field);
    if (el && data[field]) el.value = data[field];
  });

  updatePreview();
}

document.addEventListener("DOMContentLoaded", () => {
  fields.forEach((field) => {
    const el = document.getElementById(field);
    if (el) {
      el.addEventListener("input", updatePreview);
      el.addEventListener("change", updatePreview);
    }
  });

  const exportButton = document.getElementById("exportSitrep");
  const clearButton = document.getElementById("clearForm");
  const saveButton = document.getElementById("saveDraft");

  if (exportButton) exportButton.addEventListener("click", exportSitrep);
  if (clearButton) clearButton.addEventListener("click", clearForm);
  if (saveButton) saveButton.addEventListener("click", saveDraft);

  loadDraft();
  updatePreview();
});
