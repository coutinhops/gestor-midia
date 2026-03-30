import { AuthClient } from 'google-auth-library';
import { GoogleAdsApi } from 'google-ads-api/build';

const clientId = process.env.GADS_CLIENT_ID;
const clientSecret = process.env.GADS_CLIENT_SECRET;
const redirectUri = process.env.GADS_REDIRECT_URI || 'http://localhost:3000/api/gads/callback';

export const client = new AuthClient({ clientId, clientSecret, redirectUris: [redirectUri] });

export async function getAdsClient(accessToken: string) {
  const client = new GoogleAdsApi()
  await client.set {token: accessToken}
  return client
}
