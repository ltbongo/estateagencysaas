import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import crypto from 'crypto';

const prisma = new PrismaClient();

const subscriptionPlans = {
  basic: { price: 99 },
  pro: { price: 199 },
  enterprise: { price: 499 },
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await req.json();
    const plan = subscriptionPlans[planId as keyof typeof subscriptionPlans];

    if (!plan) {
      return NextResponse.json({ message: 'Invalid plan selected' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { agency: true },
    });

    if (!user || !user.agency) {
      return NextResponse.json({ message: 'User or agency not found' }, { status: 404 });
    }

    const merchantId = process.env.PAYFAST_MERCHANT_ID;
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
    const passphrase = process.env.PAYFAST_PASSPHRASE;

    if (!merchantId || !merchantKey || !passphrase) {
      throw new Error('Payfast configuration is missing');
    }

    const returnUrl = `${process.env.NEXTAUTH_URL}/dashboard/subscription/success`;
    const cancelUrl = `${process.env.NEXTAUTH_URL}/dashboard/subscription/cancel`;
    const notifyUrl = `${process.env.NEXTAUTH_URL}/api/subscription/notify`;

    const data = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      name_first: user.name?.split(' ')[0] || '',
      name_last: user.name?.split(' ').slice(1).join(' ') || '',
      email_address: user.email,
      m_payment_id: `${user.agency.id}-${planId}`,
      amount: plan.price.toFixed(2),
      item_name: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan Subscription`,
    };

    const signature = generateSignature(data, passphrase);
    data.signature = signature;

    const paymentUrl = `https://sandbox.payfast.co.za/eng/process?${new URLSearchParams(data).toString()}`;

    return NextResponse.json({ paymentUrl });
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