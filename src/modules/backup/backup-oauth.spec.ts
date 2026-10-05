import { parse } from 'dotenv';
import {
  parseDesktopOAuthClient,
  updateOAuthEnv,
  validateOAuthCallback,
} from './backup-oauth';

describe('personal Drive OAuth connection helpers', () => {
  const values = {
    GOOGLE_DRIVE_OAUTH_CLIENT_ID: 'test.apps.googleusercontent.com',
    GOOGLE_DRIVE_OAUTH_CLIENT_SECRET: 'test-secret',
    GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN: 'test-only/refresh-token',
  };
  it('accepts Desktop app credentials and rejects service account or web client JSON', () => {
    expect(
      parseDesktopOAuthClient(
        JSON.stringify({
          installed: {
            client_id: values.GOOGLE_DRIVE_OAUTH_CLIENT_ID,
            client_secret: values.GOOGLE_DRIVE_OAUTH_CLIENT_SECRET,
          },
        }),
      ),
    ).toEqual({
      clientId: values.GOOGLE_DRIVE_OAUTH_CLIENT_ID,
      clientSecret: values.GOOGLE_DRIVE_OAUTH_CLIENT_SECRET,
    });
    expect(() =>
      parseDesktopOAuthClient(
        JSON.stringify({ type: 'service_account', private_key: 'test-only' }),
      ),
    ).toThrow('Desktop app');
    expect(() =>
      parseDesktopOAuthClient(JSON.stringify({ web: { client_id: 'test' } })),
    ).toThrow('Desktop app');
  });
  it('does not echo malformed credential contents in errors', () => {
    expect(() =>
      parseDesktopOAuthClient('{ "client_secret": "do-not-print'),
    ).toThrow('not valid JSON');
    expect(() =>
      parseDesktopOAuthClient('{ "client_secret": "do-not-print'),
    ).not.toThrow('do-not-print');
  });
  it('accepts a callback with the expected state and exactly one authorization code', () => {
    expect(
      validateOAuthCallback(
        'GET',
        '/oauth2callback?state=expected&code=test-only-code',
        'expected',
      ),
    ).toEqual({ kind: 'code', code: 'test-only-code' });
  });
  it.each([
    '/oauth2callback?state=other&code=test',
    '/oauth2callback?code=test',
    '/oauth2callback?state=expected&state=other&code=test',
    '/oauth2callback?state=expected&code=a&code=b',
    '/oauth2callback?state=expected',
    '//example.test/oauth2callback?state=expected&code=test',
    '/\\example.test/oauth2callback?state=expected&code=test',
  ])('rejects invalid or ambiguous OAuth callback %s', (url) => {
    expect(validateOAuthCallback('GET', url, 'expected')).toEqual({
      kind: 'invalid',
    });
  });
  it('recognizes cancellation only for the expected state', () => {
    expect(
      validateOAuthCallback(
        'GET',
        '/oauth2callback?state=expected&error=access_denied',
        'expected',
      ),
    ).toEqual({ kind: 'denied' });
    expect(
      validateOAuthCallback(
        'GET',
        '/oauth2callback?state=other&error=access_denied',
        'expected',
      ),
    ).toEqual({ kind: 'invalid' });
  });
  it('ignores requests outside the callback route', () => {
    expect(validateOAuthCallback('GET', '/favicon.ico', 'expected')).toEqual({
      kind: 'not_found',
    });
    expect(
      validateOAuthCallback(
        'POST',
        '/oauth2callback?state=expected&code=test',
        'expected',
      ),
    ).toEqual({ kind: 'not_found' });
  });
  it('preserves other settings and comments, replaces duplicate OAuth keys and keeps CRLF', () => {
    const current =
      '# DB configuration\r\nMONGO_URI=mongodb://example.test/database\r\nGOOGLE_DRIVE_OAUTH_REFRESH_TOKEN=old\r\nexport GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN=older\r\n';
    const updated = updateOAuthEnv(current, values);
    expect(updated).toContain(
      '# DB configuration\r\nMONGO_URI=mongodb://example.test/database\r\n',
    );
    expect(updated.split('GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN=')).toHaveLength(2);
    expect(parse(updated)).toEqual({
      MONGO_URI: 'mongodb://example.test/database',
      ...values,
    });
    expect(updated.replace(/\r\n/g, '')).not.toContain('\n');
  });
  it('round-trips valid token symbols instead of treating them as env comments', () => {
    const updated = updateOAuthEnv('', {
      ...values,
      GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN: 'test/+token=#symbols',
    });
    expect(parse(updated).GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN).toBe(
      'test/+token=#symbols',
    );
  });
  it.each([
    '',
    "test'quote",
    'test\nOTHER_KEY=injected',
    'test\rOTHER_KEY=injected',
    'test\0token',
  ])('rejects values that could corrupt environment settings', (token) => {
    expect(() =>
      updateOAuthEnv('MONGO_URI=unchanged\n', {
        ...values,
        GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN: token,
      }),
    ).toThrow('not saved');
  });
});
