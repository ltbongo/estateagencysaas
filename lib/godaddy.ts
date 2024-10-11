import fetch from 'node-fetch';

const GODADDY_API_URL = 'https://api.godaddy.com/v1';

export async function createSubdomain(subdomain: string, domain: string) {
  const response = await fetch(`${GODADDY_API_URL}/domains/${domain}/records`, {
    method: 'PATCH',
    headers: {
      'Authorization': `sso-key ${process.env.GODADDY_API_KEY}:${process.env.GODADDY_API_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      {
        type: 'A',
        name: subdomain,
        data: process.env.VERCEL_IP_ADDRESS,
        ttl: 600,
      },
    ]),
  });

  if (!response.ok) {
    throw new Error(`Failed to create subdomain: ${response.statusText}`);
  }

  return response.json();
}