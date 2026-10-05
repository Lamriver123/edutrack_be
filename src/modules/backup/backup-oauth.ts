import { timingSafeEqual } from 'node:crypto';

export class OAuthSetupError extends Error {}

export function parseDesktopOAuthClient(json: string): {
  clientId: string;
  clientSecret: string;
} {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    throw new OAuthSetupError('OAuth client file is not valid JSON.');
  }
  const installed = (value as { installed?: Record<string, unknown> } | null)
    ?.installed;
  if (
    !installed ||
    typeof installed.client_id !== 'string' ||
    !installed.client_id.endsWith('.apps.googleusercontent.com') ||
    typeof installed.client_secret !== 'string' ||
    !installed.client_secret
  ) {
    throw new OAuthSetupError(
      'Download an OAuth Client ID of type Desktop app; a service account key or Web application client is not supported by this connection tool.',
    );
  }
  return {
    clientId: installed.client_id,
    clientSecret: installed.client_secret,
  };
}

export type OAuthCallback =
  | { kind: 'not_found' }
  | { kind: 'invalid' }
  | { kind: 'denied' }
  | { kind: 'code'; code: string };

export function validateOAuthCallback(
  method: string | undefined,
  requestUrl: string,
  state: string,
): OAuthCallback {
  if (!requestUrl.startsWith('/') || requestUrl.startsWith('//'))
    return { kind: 'invalid' };
  let url: URL;
  try {
    url = new URL(requestUrl, 'http://127.0.0.1');
  } catch {
    return { kind: 'invalid' };
  }
  if (url.origin !== 'http://127.0.0.1') return { kind: 'invalid' };
  if (method !== 'GET' || url.pathname !== '/oauth2callback')
    return { kind: 'not_found' };
  const receivedState = url.searchParams.get('state') ?? '';
  const expected = Buffer.from(state);
  const received = Buffer.from(receivedState);
  if (
    url.searchParams.getAll('state').length !== 1 ||
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  )
    return { kind: 'invalid' };
  if (url.searchParams.has('error')) return { kind: 'denied' };
  const code = url.searchParams.get('code');
  if (!code || url.searchParams.getAll('code').length !== 1)
    return { kind: 'invalid' };
  return { kind: 'code', code };
}

const OAUTH_ENV_KEYS = [
  'GOOGLE_DRIVE_OAUTH_CLIENT_ID',
  'GOOGLE_DRIVE_OAUTH_CLIENT_SECRET',
  'GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN',
] as const;

export type OAuthEnvValues = Record<(typeof OAUTH_ENV_KEYS)[number], string>;

// Keep database/auth settings and comments intact; replace only OAuth keys.
export function updateOAuthEnv(
  current: string,
  values: OAuthEnvValues,
): string {
  const newline = current.includes('\r\n') ? '\r\n' : '\n';
  const lines = current.replace(/^\uFEFF/, '').split(/\r?\n/);
  for (const key of OAUTH_ENV_KEYS) {
    const value = values[key];
    if (!value || /['\r\n]/.test(value) || value.includes('\0'))
      throw new OAuthSetupError(
        `Invalid ${key}; OAuth settings were not saved.`,
      );
    const replacement = `${key}='${value}'`;
    const pattern = new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=`);
    let replaced = false;
    for (let index = 0; index < lines.length; index++) {
      if (!pattern.test(lines[index])) continue;
      if (!replaced) {
        lines[index] = replacement;
        replaced = true;
      } else {
        lines.splice(index, 1);
        index--;
      }
    }
    if (!replaced) {
      if (lines.at(-1) === '') lines.pop();
      lines.push(replacement);
    }
  }
  return lines.join(newline).replace(/(?:\r?\n)*$/, '') + newline;
}
