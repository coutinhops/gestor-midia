import Fetch from 'node-fetch';
import { serialize } from 'querystring'  

const META_GRAPH = process.env.META_GRAPH || 'https://graph.instagram.com/v19/';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

export async function getMetaData(accountId: string, dates: { start: string; end: string }) {
  const queryParams = {
    metrics: ['impressions', 'clicks', 'cost'],
    date_preset: 'last_30d_',
    access_token: META_ACCESS_TOKEN
  }

  try {
    const url = `${META_GRAPH}${accountId}/insights?format=json&${serialize(queryParams)}`
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.error('Error reaching Meta API:', err);
    return null;
  }
}

/* Import all insights for an account */
export async function getMetaAccounts(accessToken: string) {
  try {
    const url = `${META_GRAPH}me/ads_accounts?access_token=${accessToken}`;
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    return { error: true };
  }
}
