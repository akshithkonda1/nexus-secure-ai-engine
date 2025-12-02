export async function startOAuth(config = {}) {
  return {
    authorizationUrl: config.redirectUri || "/oauth/microsoft",
    service: "microsoft",
    state: `state-${Date.now()}`,
  };
}

export async function completeOAuthFlow(payload = {}) {
  return {
    token: payload.code ? `token-${payload.code}-${Date.now()}` : `token-${Date.now()}`,
    service: "microsoft",
    profile: payload.profile || null,
  };
}

export async function syncData(token) {
  const timestamp = new Date().toISOString();
  return {
    service: "microsoft",
    ok: !!token,
    syncedAt: timestamp,
    items: [],
  };
}

export default { startOAuth, completeOAuthFlow, syncData };
