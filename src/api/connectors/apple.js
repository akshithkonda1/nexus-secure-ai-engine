export async function startOAuth(config = {}) {
  return {
    authorizationUrl: config.redirectUri || "/oauth/apple",
    service: "apple",
    state: `state-${Date.now()}`,
  };
}

export async function completeOAuthFlow(payload = {}) {
  return {
    token: payload.code ? `token-${payload.code}-${Date.now()}` : `token-${Date.now()}`,
    service: "apple",
    profile: payload.profile || null,
  };
}

export async function syncData(token) {
  const timestamp = new Date().toISOString();
  return {
    service: "apple",
    ok: !!token,
    syncedAt: timestamp,
    items: [],
  };
}

export default { startOAuth, completeOAuthFlow, syncData };
