export async function startOAuth(config = {}) {
  return {
    authorizationUrl: config.redirectUri || "/oauth/email",
    service: "email",
    state: `state-${Date.now()}`,
  };
}

export async function completeOAuthFlow(payload = {}) {
  return {
    token: payload.code ? `token-${payload.code}-${Date.now()}` : `token-${Date.now()}`,
    service: "email",
    profile: payload.profile || null,
  };
}

export async function syncData(token) {
  const timestamp = new Date().toISOString();
  return {
    service: "email",
    ok: !!token,
    syncedAt: timestamp,
    items: [],
  };
}

export default { startOAuth, completeOAuthFlow, syncData };
