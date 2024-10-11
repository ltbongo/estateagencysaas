import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { subdomain: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const agency = await prisma.agency.findUnique({
      where: { subdomain: params.subdomain },
    });

    if (!agency) {
      return NextResponse.json({ message: 'Agency not found' }, { status: 404 });
    }

    const commissions = await prisma.commission.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ commissions });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}