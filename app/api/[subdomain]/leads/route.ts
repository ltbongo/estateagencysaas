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

    const leads = await prisma.lead.findMany({
      where: {
        agencyId: agency.id,
        userId: session.user.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ leads });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { subdomain: string } }) {
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

    const { title, description } = await req.json();

    const lead = await prisma.lead.create({
      data: {
        title,
        description,
        status: 'NEW',
        user: { connect: { id: session.user.id } },
        agency: { connect: { id: agency.id } },
      },
    });

    return NextResponse.json({ message: 'Lead created successfully', lead });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}