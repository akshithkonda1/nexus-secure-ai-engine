export function validatePAT(token) {
  if (!token || typeof token !== "string") return false;
  const sanitized = token.trim();
  return sanitized.length >= 12 && /[A-Za-z]/.test(sanitized) && /\d/.test(sanitized);
}

export function validateOAuthConfig(config) {
  if (!config) return false;
  const required = ["clientId", "redirectUri"];
  return required.every((key) => config[key] && typeof config[key] === "string");
}

export function validateEmailAddress(value) {
  if (!value) return false;
  return /.+@.+\..+/.test(value);
}

export default { validatePAT, validateOAuthConfig, validateEmailAddress };
