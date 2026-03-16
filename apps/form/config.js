/**
 * Configuración del formulario de onboarding.
 * Modificar WEBHOOK_URL para apuntar al webhook de n8n en producción.
 */
const CONFIG = {
  WEBHOOK_URL: "http://localhost:5678/webhook-test/onboarding",
  BRANDING: {
    title: "Registro de Membresía",
    subtitle: "Completa tus datos para comenzar tu experiencia en el gimnasio.",
    submitText: "Enviar registro",
    successMessage: "Registro enviado correctamente. Nos pondremos en contacto contigo pronto.",
    errorMessage: "No se pudo enviar el registro. Inténtalo de nuevo más tarde."
  }
};
