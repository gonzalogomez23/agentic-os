const form = document.getElementById("onboarding-form");
const submitBtn = document.getElementById("submit-btn");
const messageEl = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Limpiar estados previos
  messageEl.hidden = true;
  form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));

  // Validar campos requeridos
  const invalids = form.querySelectorAll(":invalid");
  if (invalids.length > 0) {
    invalids.forEach((el) => el.classList.add("invalid"));
    showMessage("Por favor, completa todos los campos requeridos.", "error");
    invalids[0].focus();
    return;
  }

  // Armar objeto con los datos
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Enviar
  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  try {
    const res = await fetch(CONFIG.WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`Error ${res.status}`);

    showMessage(CONFIG.BRANDING.successMessage, "success");
    form.reset();
  } catch (err) {
    showMessage(CONFIG.BRANDING.errorMessage, "error");
    console.error("Error al enviar formulario:", err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = CONFIG.BRANDING.submitText;
  }
});

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  messageEl.hidden = false;
}
