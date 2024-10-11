import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { createSubdomain } from '@/lib/godaddy';
import { deployToVercel } from '@/lib/vercel';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, subdomain, logo, primaryColor, secondaryColor, aboutUs, contactInfo } = await req.json();

    // Check if subdomain is available
    const existingAgency = await prisma.agency.findUnique({ where: { subdomain } });
    if (existingAgency) {
      return NextResponse.json({ message: 'Subdomain is already taken' }, { status: 400 });
    }

    // Create agency
    const agency = await prisma.agency.create({
      data: {
        name,
        subdomain,
        logo,
        primaryColor,
        secondaryColor,
        aboutUs,
        contactInfo,
        users: {
          connect: { id: session.user.id }
        }
      },
    });

    // Update user role to AGENCY_ADMIN
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: 'AGENCY_ADMIN' }
    });

    // Provision subdomain with GoDaddy
    await createSubdomain(subdomain, process.env.MAIN_DOMAIN!);

    // Deploy to Vercel
    await deployToVercel(agency.id, subdomain);

    return NextResponse.json({ message: 'Agency registered successfully', agency });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}