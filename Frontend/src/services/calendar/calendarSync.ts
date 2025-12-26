/**
 * Calendar Sync Service
 * OAuth integration for Google Calendar, Microsoft Outlook, and Apple Calendar
 */

import type { CalendarEvent, RecurrencePattern } from '../../types/workspace';

// ============================================================
// TYPES
// ============================================================

export type CalendarProvider = 'google' | 'microsoft' | 'apple';

export type CalendarConnection = {
  id: string;
  provider: CalendarProvider;
  email: string;
  displayName: string;
  connected: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  calendars: ExternalCalendar[];
  lastSync?: Date;
  syncEnabled: boolean;
};

export type ExternalCalendar = {
  id: string;
  name: string;
  color?: string;
  primary?: boolean;
  syncEnabled: boolean;
  readOnly?: boolean;
};

export type SyncResult = {
  success: boolean;
  eventsImported: number;
  eventsExported: number;
  errors: string[];
  lastSync: Date;
};

export type ExternalEvent = {
  id: string;
  calendarId: string;
  provider: CalendarProvider;
  title: string;
  start: Date;
  end: Date;
  isAllDay?: boolean;
  location?: string;
  description?: string;
  attendees?: { email: string; name?: string; status?: string }[];
  recurrence?: RecurrencePattern;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink?: string;
  organizer?: { email: string; name?: string };
};

// ============================================================
// OAUTH CONFIGURATION
// ============================================================

// OAuth endpoints and configuration for each provider
export const OAUTH_CONFIG = {
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revokeEndpoint: 'https://oauth2.googleapis.com/revoke',
    calendarApiBase: 'https://www.googleapis.com/calendar/v3',
    scopes: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    responseType: 'code',
    accessType: 'offline',
    prompt: 'consent',
  },
  microsoft: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
    tenantId: 'common', // Use 'common' for multi-tenant
    authEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    revokeEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/logout',
    graphApiBase: 'https://graph.microsoft.com/v1.0',
    scopes: [
      'openid',
      'profile',
      'email',
      'offline_access',
      'Calendars.ReadWrite',
      'User.Read',
    ],
    responseType: 'code',
    responseMode: 'query',
  },
  apple: {
    clientId: import.meta.env.VITE_APPLE_CLIENT_ID || '', // Your Services ID
    teamId: import.meta.env.VITE_APPLE_TEAM_ID || '',
    keyId: import.meta.env.VITE_APPLE_KEY_ID || '',
    authEndpoint: 'https://appleid.apple.com/auth/authorize',
    tokenEndpoint: 'https://appleid.apple.com/auth/token',
    revokeEndpoint: 'https://appleid.apple.com/auth/revoke',
    // Note: Apple doesn't have a public Calendar API like Google/Microsoft
    // Integration typically uses CalDAV protocol
    caldavEndpoint: 'https://caldav.icloud.com',
    scopes: ['name', 'email'],
    responseType: 'code id_token',
    responseMode: 'form_post',
  },
};

// ============================================================
// OAUTH FLOW HELPERS
// ============================================================

/**
 * Generate a random state parameter for CSRF protection
 */
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate PKCE code verifier and challenge
 */
async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const verifier = btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // Create SHA-256 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  const challenge = btoa(String.fromCharCode(...hashArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return { verifier, challenge };
}

/**
 * Get redirect URI for OAuth callback
 */
function getRedirectUri(): string {
  return `${window.location.origin}/auth/callback`;
}

// ============================================================
// GOOGLE CALENDAR INTEGRATION
// ============================================================

export const GoogleCalendar = {
  /**
   * Initiate Google OAuth flow
   */
  async authorize(): Promise<void> {
    const config = OAUTH_CONFIG.google;
    if (!config.clientId) {
      throw new Error('Google OAuth client ID not configured');
    }

    const state = generateState();
    const { verifier, challenge } = await generatePKCE();

    // Store for callback
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_verifier', verifier);
    sessionStorage.setItem('oauth_provider', 'google');

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: getRedirectUri(),
      response_type: config.responseType,
      scope: config.scopes.join(' '),
      access_type: config.accessType,
      prompt: config.prompt,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    window.location.href = `${config.authEndpoint}?${params}`;
  },

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleCallback(code: string, state: string): Promise<CalendarConnection> {
    const storedState = sessionStorage.getItem('oauth_state');
    const verifier = sessionStorage.getItem('oauth_verifier');

    if (state !== storedState) {
      throw new Error('Invalid OAuth state - possible CSRF attack');
    }

    const config = OAUTH_CONFIG.google;

    // Exchange code for tokens
    const tokenResponse = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        code,
        code_verifier: verifier || '',
        grant_type: 'authorization_code',
        redirect_uri: getRedirectUri(),
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code');
    }

    const tokens = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const userInfo = await userResponse.json();

    // Get calendars list
    const calendarsResponse = await fetch(`${config.calendarApiBase}/users/me/calendarList`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const calendarsData = await calendarsResponse.json();

    const calendars: ExternalCalendar[] = (calendarsData.items || []).map((cal: any) => ({
      id: cal.id,
      name: cal.summary,
      color: cal.backgroundColor,
      primary: cal.primary || false,
      syncEnabled: cal.primary || false,
      readOnly: cal.accessRole === 'reader',
    }));

    // Clear session storage
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_verifier');
    sessionStorage.removeItem('oauth_provider');

    return {
      id: `google-${userInfo.id}`,
      provider: 'google',
      email: userInfo.email,
      displayName: userInfo.name || userInfo.email,
      connected: true,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      calendars,
      lastSync: new Date(),
      syncEnabled: true,
    };
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(connection: CalendarConnection): Promise<CalendarConnection> {
    if (!connection.refreshToken) {
      throw new Error('No refresh token available');
    }

    const config = OAUTH_CONFIG.google;

    const response = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        refresh_token: connection.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokens = await response.json();

    return {
      ...connection,
      accessToken: tokens.access_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    };
  },

  /**
   * Fetch events from Google Calendar
   */
  async fetchEvents(
    connection: CalendarConnection,
    calendarId: string,
    timeMin: Date,
    timeMax: Date
  ): Promise<ExternalEvent[]> {
    const config = OAUTH_CONFIG.google;

    const params = new URLSearchParams({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '250',
    });

    const response = await fetch(
      `${config.calendarApiBase}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      { headers: { Authorization: `Bearer ${connection.accessToken}` } }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Google Calendar events');
    }

    const data = await response.json();

    return (data.items || []).map((event: any) => ({
      id: event.id,
      calendarId,
      provider: 'google' as CalendarProvider,
      title: event.summary || 'Untitled',
      start: new Date(event.start?.dateTime || event.start?.date),
      end: new Date(event.end?.dateTime || event.end?.date),
      isAllDay: !!event.start?.date,
      location: event.location,
      description: event.description,
      attendees: event.attendees?.map((a: any) => ({
        email: a.email,
        name: a.displayName,
        status: a.responseStatus,
      })),
      status: event.status,
      htmlLink: event.htmlLink,
      organizer: event.organizer ? {
        email: event.organizer.email,
        name: event.organizer.displayName,
      } : undefined,
    }));
  },

  /**
   * Create event in Google Calendar
   */
  async createEvent(
    connection: CalendarConnection,
    calendarId: string,
    event: Partial<CalendarEvent>
  ): Promise<ExternalEvent> {
    const config = OAUTH_CONFIG.google;

    const body: any = {
      summary: event.title,
      location: event.location,
      description: event.description,
    };

    if (event.isAllDay) {
      body.start = { date: formatDate(event.start!) };
      body.end = { date: formatDate(event.end!) };
    } else {
      body.start = { dateTime: event.start!.toISOString() };
      body.end = { dateTime: event.end!.toISOString() };
    }

    if (event.attendees) {
      body.attendees = event.attendees.map(email => ({ email }));
    }

    const response = await fetch(
      `${config.calendarApiBase}/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${connection.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create Google Calendar event');
    }

    const data = await response.json();

    return {
      id: data.id,
      calendarId,
      provider: 'google',
      title: data.summary,
      start: new Date(data.start?.dateTime || data.start?.date),
      end: new Date(data.end?.dateTime || data.end?.date),
      isAllDay: !!data.start?.date,
      location: data.location,
      description: data.description,
      htmlLink: data.htmlLink,
    };
  },

  /**
   * Disconnect Google Calendar
   */
  async disconnect(connection: CalendarConnection): Promise<void> {
    const config = OAUTH_CONFIG.google;

    if (connection.accessToken) {
      await fetch(`${config.revokeEndpoint}?token=${connection.accessToken}`, {
        method: 'POST',
      });
    }
  },
};

// ============================================================
// MICROSOFT OUTLOOK INTEGRATION
// ============================================================

export const MicrosoftOutlook = {
  /**
   * Initiate Microsoft OAuth flow
   */
  async authorize(): Promise<void> {
    const config = OAUTH_CONFIG.microsoft;
    if (!config.clientId) {
      throw new Error('Microsoft OAuth client ID not configured');
    }

    const state = generateState();
    const { verifier, challenge } = await generatePKCE();

    // Store for callback
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_verifier', verifier);
    sessionStorage.setItem('oauth_provider', 'microsoft');

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: getRedirectUri(),
      response_type: config.responseType,
      response_mode: config.responseMode,
      scope: config.scopes.join(' '),
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    window.location.href = `${config.authEndpoint}?${params}`;
  },

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleCallback(code: string, state: string): Promise<CalendarConnection> {
    const storedState = sessionStorage.getItem('oauth_state');
    const verifier = sessionStorage.getItem('oauth_verifier');

    if (state !== storedState) {
      throw new Error('Invalid OAuth state - possible CSRF attack');
    }

    const config = OAUTH_CONFIG.microsoft;

    // Exchange code for tokens
    const tokenResponse = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        code,
        code_verifier: verifier || '',
        grant_type: 'authorization_code',
        redirect_uri: getRedirectUri(),
        scope: config.scopes.join(' '),
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code');
    }

    const tokens = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch(`${config.graphApiBase}/me`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const userInfo = await userResponse.json();

    // Get calendars list
    const calendarsResponse = await fetch(`${config.graphApiBase}/me/calendars`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const calendarsData = await calendarsResponse.json();

    const calendars: ExternalCalendar[] = (calendarsData.value || []).map((cal: any) => ({
      id: cal.id,
      name: cal.name,
      color: cal.hexColor,
      primary: cal.isDefaultCalendar || false,
      syncEnabled: cal.isDefaultCalendar || false,
      readOnly: !cal.canEdit,
    }));

    // Clear session storage
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_verifier');
    sessionStorage.removeItem('oauth_provider');

    return {
      id: `microsoft-${userInfo.id}`,
      provider: 'microsoft',
      email: userInfo.mail || userInfo.userPrincipalName,
      displayName: userInfo.displayName || userInfo.mail,
      connected: true,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      calendars,
      lastSync: new Date(),
      syncEnabled: true,
    };
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(connection: CalendarConnection): Promise<CalendarConnection> {
    if (!connection.refreshToken) {
      throw new Error('No refresh token available');
    }

    const config = OAUTH_CONFIG.microsoft;

    const response = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        refresh_token: connection.refreshToken,
        grant_type: 'refresh_token',
        scope: config.scopes.join(' '),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokens = await response.json();

    return {
      ...connection,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || connection.refreshToken,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    };
  },

  /**
   * Fetch events from Microsoft Calendar
   */
  async fetchEvents(
    connection: CalendarConnection,
    calendarId: string,
    timeMin: Date,
    timeMax: Date
  ): Promise<ExternalEvent[]> {
    const config = OAUTH_CONFIG.microsoft;

    const params = new URLSearchParams({
      startDateTime: timeMin.toISOString(),
      endDateTime: timeMax.toISOString(),
      $orderby: 'start/dateTime',
      $top: '250',
    });

    const response = await fetch(
      `${config.graphApiBase}/me/calendars/${calendarId}/events?${params}`,
      { headers: { Authorization: `Bearer ${connection.accessToken}` } }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Outlook Calendar events');
    }

    const data = await response.json();

    return (data.value || []).map((event: any) => ({
      id: event.id,
      calendarId,
      provider: 'microsoft' as CalendarProvider,
      title: event.subject || 'Untitled',
      start: new Date(event.start?.dateTime + 'Z'),
      end: new Date(event.end?.dateTime + 'Z'),
      isAllDay: event.isAllDay,
      location: event.location?.displayName,
      description: event.bodyPreview,
      attendees: event.attendees?.map((a: any) => ({
        email: a.emailAddress?.address,
        name: a.emailAddress?.name,
        status: a.status?.response,
      })),
      status: event.showAs === 'free' ? 'tentative' : 'confirmed',
      htmlLink: event.webLink,
      organizer: event.organizer?.emailAddress ? {
        email: event.organizer.emailAddress.address,
        name: event.organizer.emailAddress.name,
      } : undefined,
    }));
  },

  /**
   * Create event in Microsoft Calendar
   */
  async createEvent(
    connection: CalendarConnection,
    calendarId: string,
    event: Partial<CalendarEvent>
  ): Promise<ExternalEvent> {
    const config = OAUTH_CONFIG.microsoft;

    const body: any = {
      subject: event.title,
      location: event.location ? { displayName: event.location } : undefined,
      body: event.description ? { contentType: 'text', content: event.description } : undefined,
      isAllDay: event.isAllDay || false,
    };

    if (event.isAllDay) {
      body.start = { dateTime: formatDate(event.start!), timeZone: 'UTC' };
      body.end = { dateTime: formatDate(event.end!), timeZone: 'UTC' };
    } else {
      body.start = { dateTime: event.start!.toISOString().slice(0, -1), timeZone: 'UTC' };
      body.end = { dateTime: event.end!.toISOString().slice(0, -1), timeZone: 'UTC' };
    }

    if (event.attendees) {
      body.attendees = event.attendees.map(email => ({
        emailAddress: { address: email },
        type: 'required',
      }));
    }

    const response = await fetch(
      `${config.graphApiBase}/me/calendars/${calendarId}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${connection.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create Outlook Calendar event');
    }

    const data = await response.json();

    return {
      id: data.id,
      calendarId,
      provider: 'microsoft',
      title: data.subject,
      start: new Date(data.start?.dateTime + 'Z'),
      end: new Date(data.end?.dateTime + 'Z'),
      isAllDay: data.isAllDay,
      location: data.location?.displayName,
      description: data.bodyPreview,
      htmlLink: data.webLink,
    };
  },

  /**
   * Disconnect Microsoft Calendar
   */
  async disconnect(connection: CalendarConnection): Promise<void> {
    const config = OAUTH_CONFIG.microsoft;

    // Microsoft doesn't have a token revocation endpoint like Google
    // The user should sign out from their Microsoft account
    window.open(config.revokeEndpoint, '_blank');
  },
};

// ============================================================
// APPLE CALENDAR INTEGRATION
// ============================================================

export const AppleCalendar = {
  /**
   * Initiate Apple Sign-In OAuth flow
   * Note: Apple Calendar access requires CalDAV, not a REST API
   */
  async authorize(): Promise<void> {
    const config = OAUTH_CONFIG.apple;
    if (!config.clientId) {
      throw new Error('Apple OAuth client ID not configured');
    }

    const state = generateState();
    const nonce = generateState();

    // Store for callback
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_nonce', nonce);
    sessionStorage.setItem('oauth_provider', 'apple');

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: getRedirectUri(),
      response_type: config.responseType,
      response_mode: config.responseMode,
      scope: config.scopes.join(' '),
      state,
      nonce,
    });

    window.location.href = `${config.authEndpoint}?${params}`;
  },

  /**
   * Handle OAuth callback
   * Apple uses form_post, so this would be handled server-side typically
   */
  async handleCallback(code: string, idToken: string, state: string): Promise<CalendarConnection> {
    const storedState = sessionStorage.getItem('oauth_state');

    if (state !== storedState) {
      throw new Error('Invalid OAuth state - possible CSRF attack');
    }

    const config = OAUTH_CONFIG.apple;

    // Note: Token exchange with Apple typically requires a server-side component
    // because it needs a client secret (JWT signed with your private key)
    // Here we'd call your backend API to complete the exchange

    const tokenResponse = await fetch('/api/auth/apple/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, idToken }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange Apple authorization code');
    }

    const data = await tokenResponse.json();

    // Parse the ID token to get user info
    const payload = JSON.parse(atob(idToken.split('.')[1]));

    // Clear session storage
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_nonce');
    sessionStorage.removeItem('oauth_provider');

    return {
      id: `apple-${payload.sub}`,
      provider: 'apple',
      email: payload.email || data.email,
      displayName: data.name || payload.email,
      connected: true,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      calendars: [], // CalDAV calendars would be fetched separately
      lastSync: new Date(),
      syncEnabled: true,
    };
  },

  /**
   * Note: Apple Calendar uses CalDAV protocol
   * These methods would interact with your backend that handles CalDAV
   */
  async fetchEvents(
    connection: CalendarConnection,
    calendarId: string,
    timeMin: Date,
    timeMax: Date
  ): Promise<ExternalEvent[]> {
    // CalDAV fetch would be handled by backend
    const response = await fetch('/api/calendar/apple/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${connection.accessToken}`,
      },
      body: JSON.stringify({
        calendarId,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Apple Calendar events');
    }

    return response.json();
  },

  async createEvent(
    connection: CalendarConnection,
    calendarId: string,
    event: Partial<CalendarEvent>
  ): Promise<ExternalEvent> {
    // CalDAV create would be handled by backend
    const response = await fetch('/api/calendar/apple/events', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${connection.accessToken}`,
      },
      body: JSON.stringify({ calendarId, event }),
    });

    if (!response.ok) {
      throw new Error('Failed to create Apple Calendar event');
    }

    return response.json();
  },

  async disconnect(connection: CalendarConnection): Promise<void> {
    const config = OAUTH_CONFIG.apple;

    // Revoke Apple tokens via backend
    await fetch('/api/auth/apple/revoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${connection.accessToken}`,
      },
    });
  },
};

// ============================================================
// UNIFIED SYNC SERVICE
// ============================================================

export const CalendarSyncService = {
  /**
   * Start OAuth flow for a provider
   */
  async connect(provider: CalendarProvider): Promise<void> {
    switch (provider) {
      case 'google':
        return GoogleCalendar.authorize();
      case 'microsoft':
        return MicrosoftOutlook.authorize();
      case 'apple':
        return AppleCalendar.authorize();
    }
  },

  /**
   * Handle OAuth callback based on provider
   */
  async handleCallback(
    provider: CalendarProvider,
    params: { code: string; state: string; id_token?: string }
  ): Promise<CalendarConnection> {
    switch (provider) {
      case 'google':
        return GoogleCalendar.handleCallback(params.code, params.state);
      case 'microsoft':
        return MicrosoftOutlook.handleCallback(params.code, params.state);
      case 'apple':
        return AppleCalendar.handleCallback(params.code, params.id_token || '', params.state);
    }
  },

  /**
   * Disconnect a calendar provider
   */
  async disconnect(connection: CalendarConnection): Promise<void> {
    switch (connection.provider) {
      case 'google':
        return GoogleCalendar.disconnect(connection);
      case 'microsoft':
        return MicrosoftOutlook.disconnect(connection);
      case 'apple':
        return AppleCalendar.disconnect(connection);
    }
  },

  /**
   * Refresh token if needed
   */
  async ensureValidToken(connection: CalendarConnection): Promise<CalendarConnection> {
    if (!connection.expiresAt || new Date() < connection.expiresAt) {
      return connection;
    }

    switch (connection.provider) {
      case 'google':
        return GoogleCalendar.refreshToken(connection);
      case 'microsoft':
        return MicrosoftOutlook.refreshToken(connection);
      default:
        throw new Error(`Token refresh not supported for ${connection.provider}`);
    }
  },

  /**
   * Sync events from external calendar
   */
  async syncEvents(
    connection: CalendarConnection,
    calendarId: string,
    timeMin: Date,
    timeMax: Date
  ): Promise<ExternalEvent[]> {
    const validConnection = await this.ensureValidToken(connection);

    switch (validConnection.provider) {
      case 'google':
        return GoogleCalendar.fetchEvents(validConnection, calendarId, timeMin, timeMax);
      case 'microsoft':
        return MicrosoftOutlook.fetchEvents(validConnection, calendarId, timeMin, timeMax);
      case 'apple':
        return AppleCalendar.fetchEvents(validConnection, calendarId, timeMin, timeMax);
    }
  },

  /**
   * Create event in external calendar
   */
  async createExternalEvent(
    connection: CalendarConnection,
    calendarId: string,
    event: Partial<CalendarEvent>
  ): Promise<ExternalEvent> {
    const validConnection = await this.ensureValidToken(connection);

    switch (validConnection.provider) {
      case 'google':
        return GoogleCalendar.createEvent(validConnection, calendarId, event);
      case 'microsoft':
        return MicrosoftOutlook.createEvent(validConnection, calendarId, event);
      case 'apple':
        return AppleCalendar.createEvent(validConnection, calendarId, event);
    }
  },

  /**
   * Convert external event to internal CalendarEvent format
   */
  convertToInternalEvent(externalEvent: ExternalEvent): Omit<CalendarEvent, 'id'> {
    return {
      title: externalEvent.title,
      start: externalEvent.start,
      end: externalEvent.end,
      isAllDay: externalEvent.isAllDay,
      location: externalEvent.location,
      description: externalEvent.description,
      attendees: externalEvent.attendees?.map(a => a.email),
      recurring: !!externalEvent.recurrence,
      recurrence: externalEvent.recurrence,
    };
  },

  /**
   * Get provider display info
   */
  getProviderInfo(provider: CalendarProvider): {
    name: string;
    icon: string;
    color: string;
  } {
    switch (provider) {
      case 'google':
        return { name: 'Google Calendar', icon: 'google', color: '#4285F4' };
      case 'microsoft':
        return { name: 'Outlook', icon: 'microsoft', color: '#0078D4' };
      case 'apple':
        return { name: 'Apple Calendar', icon: 'apple', color: '#000000' };
    }
  },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default CalendarSyncService;
