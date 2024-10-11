import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { agency: true },
    });

    if (!user || !user.agency) {
      return NextResponse.json({ message: 'User or agency not found' }, { status: 404 });
    }

    const leads = await prisma.lead.findMany({
      where: { agencyId: user.agency.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ leads });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { title, description } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { agency: true },
    });

    if (!user || !user.agency) {
      return NextResponse.json({ message: 'User or agency not found' }, { status: 404 });
    }

    const lead = await prisma.lead.create({
      data: {
        title,
        description,
        status: 'NEW',
        user: { connect: { id: user.id } },
        agency: { connect: { id: user.agency.id } },
      },
    });

    return NextResponse.json({ message: 'Lead created successfully', lead });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}