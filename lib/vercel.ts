import { createDeployment } from '@vercel/client';

export async function deployToVercel(agencyId: string, subdomain: string) {
  try {
    const deployment = await createDeployment({
      token: process.env.VERCEL_API_TOKEN!,
      projectId: process.env.VERCEL_PROJECT_ID!,
      files: [
        {
          file: 'config.json',
          data: JSON.stringify({ agencyId, subdomain }),
        },
      ],
      env: {
        AGENCY_ID: agencyId,
        SUBDOMAIN: subdomain,
      },
    });

    return deployment;
  } catch (error) {
    console.error('Error deploying to Vercel:', error);
    throw error;
  }
}