import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const data: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value.toString();
    }

    const signature = data.signature;
    delete data.signature;

    const calculatedSignature = generateSignature(data, process.env.PAYFAST_PASSPHRASE!);

    if (signature !== calculatedSignature) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
    }

    const [agencyId, planId] = data.m_payment_id.split('-');

    if (data.payment_status === 'COMPLETE') {
      await prisma.agency.update({
        where: { id: agencyId },
        data: {
          subscriptionPlan: planId,
          subscriptionStatus: 'ACTIVE',
          subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      });
    }

    return NextResponse.json({ message: 'Notification processed successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

function generateSignature(data: Record<string, string>, passphrase: string): string {
  const dataString = Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return crypto
    .createHash('md5')
    .update(`${dataString}&passphrase=${passphrase}`)
    .digest('hex');
}