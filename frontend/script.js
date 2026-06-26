const form = document.getElementById("patientForm");
const formTitle = document.getElementById("formTitle");
const formMessage = document.getElementById("formMessage");
const patientIdInput = document.getElementById("patientId");
const searchInput = document.getElementById("searchInput");
const resetBtn = document.getElementById("resetBtn");
const exportBtn = document.getElementById("exportBtn");
const tableBody = document.getElementById("patientTableBody");
const loadingState = document.getElementById("loadingState");
const detailsModal = document.getElementById("detailsModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const detailsContent = document.getElementById("detailsContent");
const detailsTitle = document.getElementById("detailsTitle");

const statElements = {
  totalPatients: document.getElementById("totalPatients"),
  highRisk: document.getElementById("highRisk"),
  moderateRisk: document.getElementById("moderateRisk"),
  lowRisk: document.getElementById("lowRisk"),
};

const apiBase = "/api";

function showMessage(text, isError = false) {
  formMessage.textContent = text;
  formMessage.style.color = isError ? "#ffb84d" : "#3bd588";
}

function setLoading(isLoading) {
  loadingState.style.display = isLoading ? "block" : "none";
}

function openDetailsModal(patient) {
  detailsTitle.textContent = `${patient.full_name} • Patient details`;
  detailsContent.innerHTML = `
    <div class="details-grid">
      <div><span class="detail-label">Full name</span><p>${escapeHtml(patient.full_name || "—")}</p></div>
      <div><span class="detail-label">Date of birth</span><p>${escapeHtml(patient.dob || "—")}</p></div>
      <div><span class="detail-label">Email address</span><p>${escapeHtml(patient.email || "—")}</p></div>
      <div><span class="detail-label">Glucose</span><p>${escapeHtml(patient.glucose ?? "—")}</p></div>
      <div><span class="detail-label">Haemoglobin</span><p>${escapeHtml(patient.haemoglobin ?? "—")}</p></div>
      <div><span class="detail-label">Cholesterol</span><p>${escapeHtml(patient.cholesterol ?? "—")}</p></div>
      <div class="full-width"><span class="detail-label">AI-generated remarks</span><p>${escapeHtml(patient.remarks || "—")}</p></div>
    </div>
  `;
  detailsModal.classList.remove("hidden");
  detailsModal.setAttribute("aria-hidden", "false");
}

function closeDetailsModal() {
  detailsModal.classList.add("hidden");
  detailsModal.setAttribute("aria-hidden", "true");
}

function resetForm() {
  form.reset();
  patientIdInput.value = "";
  formTitle.textContent = "Add patient record";
  showMessage("");
}

async function loadDashboard() {
  const response = await fetch(`${apiBase}/dashboard`);
  const data = await response.json();
  statElements.totalPatients.textContent = data.totalPatients;
  statElements.highRisk.textContent = data.highRisk;
  statElements.moderateRisk.textContent = data.moderateRisk;
  statElements.lowRisk.textContent = data.lowRisk;
}

async function loadPatients(query = "") {
  setLoading(true);
  try {
    const response = await fetch(`${apiBase}/patients?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error("Unable to load patients");
    }
    const data = await response.json();
    renderTable(data);
  } catch (error) {
    tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">Unable to load patients right now.</td></tr>';
  } finally {
    setLoading(false);
  }
}

function renderTable(patients) {
  if (!patients.length) {
    tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No patients found yet.</td></tr>';
    return;
  }

  tableBody.innerHTML = patients
    .map(
      (patient) => `
        <tr>
          <td>${escapeHtml(patient.full_name)}</td>
          <td>${escapeHtml(patient.email)}</td>
          <td class="risk-${(patient.risk_level || "low").toLowerCase()}">${escapeHtml(patient.risk_level || "Low")}</td>
          <td>${escapeHtml(patient.remarks)}</td>
          <td>
            <div class="table-actions">
              <button class="view-btn" data-id="${patient.id}" type="button">View</button>
              <button class="edit-btn" data-id="${patient.id}" type="button">Edit</button>
              <button class="delete-btn" data-id="${patient.id}" type="button">Delete</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function loadPatientIntoForm(id) {
  const response = await fetch(`${apiBase}/patients/${id}`);
  const patient = await response.json();
  document.getElementById("fullName").value = patient.full_name;
  document.getElementById("dob").value = patient.dob;
  document.getElementById("email").value = patient.email;
  document.getElementById("glucose").value = patient.glucose;
  document.getElementById("haemoglobin").value = patient.haemoglobin;
  document.getElementById("cholesterol").value = patient.cholesterol;
  patientIdInput.value = patient.id;
  formTitle.textContent = "Edit patient record";
  showMessage("Editing existing record.");
}

async function viewPatient(id) {
  const response = await fetch(`${apiBase}/patients/${id}`);
  if (!response.ok) {
    showMessage("Unable to load patient details.", true);
    return;
  }
  const patient = await response.json();
  openDetailsModal(patient);
}

function validateForm() {
  const fullName = document.getElementById("fullName").value.trim();
  const dob = document.getElementById("dob").value;
  const email = document.getElementById("email").value.trim();
  const glucose = document.getElementById("glucose").value;
  const haemoglobin = document.getElementById("haemoglobin").value;
  const cholesterol = document.getElementById("cholesterol").value;

  if (!fullName) {
    showMessage("Full name is required.", true);
    return false;
  }

  if (!dob) {
    showMessage("Date of birth is required.", true);
    return false;
  }

  const today = new Date();
  const selectedDate = new Date(`${dob}T00:00:00`);
  if (selectedDate > today) {
    showMessage("Date of birth cannot be in the future.", true);
    return false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    showMessage("Please enter a valid email address.", true);
    return false;
  }

  if ([glucose, haemoglobin, cholesterol].some((value) => value === "")) {
    showMessage("Blood values are required.", true);
    return false;
  }

  if ([glucose, haemoglobin, cholesterol].some((value) => Number.isNaN(Number(value)))) {
    showMessage("Blood values must be numeric.", true);
    return false;
  }

  return true;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateForm()) return;

  const payload = {
    fullName: document.getElementById("fullName").value.trim(),
    dob: document.getElementById("dob").value,
    email: document.getElementById("email").value.trim(),
    glucose: Number(document.getElementById("glucose").value),
    haemoglobin: Number(document.getElementById("haemoglobin").value),
    cholesterol: Number(document.getElementById("cholesterol").value),
  };

  const patientId = patientIdInput.value;
  const response = await fetch(`${apiBase}/patients${patientId ? `/${patientId}` : ""}`, {
    method: patientId ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    showMessage(data.details?.join(" ") || data.error || "Something went wrong.", true);
    return;
  }

  showMessage(patientId ? "Patient updated successfully." : "Patient added successfully.");
  resetForm();
  await loadDashboard();
  await loadPatients(searchInput.value.trim());
});

tableBody.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;

  const patientId = button.getAttribute("data-id");
  if (button.classList.contains("view-btn")) {
    await viewPatient(patientId);
    return;
  }

  if (button.classList.contains("edit-btn")) {
    await loadPatientIntoForm(patientId);
    return;
  }

  const response = await fetch(`${apiBase}/patients/${patientId}`, { method: "DELETE" });
  if (response.ok) {
    showMessage("Patient deleted successfully.");
    await loadDashboard();
    await loadPatients(searchInput.value.trim());
  }
});

searchInput.addEventListener("input", () => {
  loadPatients(searchInput.value.trim());
});

resetBtn.addEventListener("click", resetForm);
closeModalBtn.addEventListener("click", closeDetailsModal);
detailsModal.addEventListener("click", (event) => {
  if (event.target === detailsModal) {
    closeDetailsModal();
  }
});

exportBtn.addEventListener("click", () => {
  window.location.href = `${apiBase}/export/csv`;
});

window.addEventListener("DOMContentLoaded", async () => {
  await loadDashboard();
  await loadPatients();
});
