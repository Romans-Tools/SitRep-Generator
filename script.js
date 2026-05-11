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
  return document.getElementById(id).value.trim();
}

function saveDraft() {

  const data = {};

  fields.forEach(field => {
    data[field] = getValue(field);
  });

  localStorage.setItem(
    "capSitrepDraft",
    JSON.stringify(data)
  );

  alert("Draft saved.");
}

function loadDraft() {

  const saved = localStorage.getItem("capSitrepDraft");

  if (!saved) return;

  const data = JSON.parse(saved);

  fields.forEach(field => {

    if (data[field]) {
      document.getElementById(field).value = data[field];
    }

  });
}

function clearForm() {

  if (!confirm("Clear all fields?")) return;

  fields.forEach(field => {
    document.getElementById(field).value = "";
  });

  localStorage.removeItem("capSitrepDraft");
}

async function exportSitrep() {

  try {

    const response = await fetch("SITREP.docx");

    const arrayBuffer = await response.arrayBuffer();

    const zip = new PizZip(arrayBuffer);

    const doc = new window.docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.setData({

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

    doc.render();

    const blob = doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    saveAs(blob, "CAP-SITREP.docx");

  } catch (error) {

    console.error(error);

    alert(
      "Error exporting SITREP. Make sure SITREP.docx exists and contains placeholders."
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {

  loadDraft();

  document
    .getElementById("saveBtn")
    .addEventListener("click", saveDraft);

  document
    .getElementById("clearBtn")
    .addEventListener("click", clearForm);

  document
    .getElementById("exportBtn")
    .addEventListener("click", exportSitrep);

});
