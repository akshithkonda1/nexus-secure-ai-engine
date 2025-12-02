import { load, save } from "../../utils/localDB";
import { validatePAT, validateOAuthConfig } from "../../utils/validators";
import * as google from "../../api/connectors/google";
import * as microsoft from "../../api/connectors/microsoft";
import * as apple from "../../api/connectors/apple";
import * as meta from "../../api/connectors/meta";
import * as notion from "../../api/connectors/notion";
import * as canvas from "../../api/connectors/canvas";
import * as email from "../../api/connectors/email";

const STORAGE_KEY = "ryuzen_connectors_store";

const defaultConnector = (service, mode = "OAuth") => ({
  service,
  mode,
  token: null,
  status: "Needs Auth",
  lastSync: null,
  error: null,
});

const defaultState = {
  google: defaultConnector("google"),
  microsoft: defaultConnector("microsoft"),
  apple: defaultConnector("apple"),
  meta: defaultConnector("meta"),
  notion: defaultConnector("notion"),
  canvas: defaultConnector("canvas", "PAT"),
  email: defaultConnector("email", "PAT"),
};

let state = load(STORAGE_KEY, defaultState);

function persist() {
  save(STORAGE_KEY, state);
}

function recordSuccess(service, token) {
  state = {
    ...state,
    [service]: {
      ...state[service],
      token,
      status: "Connected",
      lastSync: new Date().toISOString(),
      error: null,
    },
  };
  persist();
}

export const ConnectorsStore = {
  getState() {
    return state;
  },
  update(service, updates) {
    state = { ...state, [service]: { ...state[service], ...updates } };
    persist();
  },
  async startOAuthFlow(service, config = {}) {
    const client = { google, microsoft, apple, meta, notion }[service];
    if (!client) {
      state = { ...state, [service]: { ...state[service], status: "Error", error: "Unsupported service" } };
      persist();
      return null;
    }
    if (!validateOAuthConfig(config)) {
      state = { ...state, [service]: { ...state[service], status: "Error", error: "Invalid config" } };
      persist();
      return null;
    }
    const response = await client.startOAuth(config);
    state = { ...state, [service]: { ...state[service], status: "Waiting" } };
    persist();
    return response;
  },
  async completeOAuthFlow(service, payload = {}) {
    const client = { google, microsoft, apple, meta, notion }[service];
    if (!client) return null;
    const result = await client.completeOAuthFlow(payload);
    recordSuccess(service, result.token);
    return result;
  },
  async setPersonalToken(service, token) {
    if (!validatePAT(token)) {
      state = { ...state, [service]: { ...state[service], status: "Error", error: "Invalid token" } };
      persist();
      return false;
    }
    recordSuccess(service, token.trim());
    return true;
  },
  async sync(service) {
    const client = { google, microsoft, apple, meta, notion, canvas, email }[service];
    if (!client || !state[service]) return null;
    const token = state[service].token;
    const result = await client.syncData(token);
    state = { ...state, [service]: { ...state[service], lastSync: result.syncedAt, status: result.ok ? "Connected" : "Error" } };
    persist();
    return result;
  },
};

export function exportConnectorState() {
  return ConnectorsStore.getState();
}

export default ConnectorsStore;
