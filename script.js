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
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
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

  try {
    const data = JSON.parse(saved);

    fields.forEach((field) => {
      const element = document.getElementById(field);

      if (element && data[field]) {
        element.value = data[field];
      }
    });
  } catch (error) {
    console.error("Draft load error:", error);
  }
}

function clearForm() {
  if (!confirm("Clear all fields?")) return;

  fields.forEach((field) => {
    const element = document.getElementById(field);
    if (element) element.value = "";
  });

  localStorage.removeItem("capSitrepDraft");
}

async function exportSitrep() {
  try {
    if (typeof PizZip === "undefined") {
      throw new Error("PizZip library failed to load.");
    }

    if (typeof window.docxtemplater === "undefined") {
      throw new Error("Docxtemplater library failed to load.");
    }

    if (typeof saveAs === "undefined") {
      throw new Error("FileSaver library failed to load.");
    }

    const response = await fetch("/SITREP.docx");

    console.log("Template response:", response.status, response.url);

    if (!response.ok) {
      throw new Error(
        `Unable to load SITREP.docx. Status: ${response.status}. Make sure SITREP.docx is deployed in the same public/root folder as index.html.`
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    const zip = new PizZip(arrayBuffer);

    const doc = new window.docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.render({
      incidentName: getValue("incidentName"),
      missionNumber: getValue("missionNumber"),

      dateFrom: getValue("dateFrom"),
      dateTo: getValue("dateTo"),

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

      reportDate: getValue("reportDate"),
      reportTime: getValue("reportTime")
    });

    const blob = doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    saveAs(blob, "CAP-SITREP.docx");
  } catch (error) {
    console.error("SITREP Export Error:", error);

    alert("Export failed:\n\n" + error.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadDraft();

  const saveBtn = document.getElementById("saveBtn");
  const clearBtn = document.getElementById("clearBtn");
  const exportBtn = document.getElementById("exportBtn");

  if (saveBtn) saveBtn.addEventListener("click", saveDraft);
  if (clearBtn) clearBtn.addEventListener("click", clearForm);
  if (exportBtn) exportBtn.addEventListener("click", exportSitrep);
});
