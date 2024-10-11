import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

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

    const { email } = await req.json();

    // Create invitation record
    const invitation = await prisma.invitation.create({
      data: {
        email,
        invitedBy: { connect: { id: session.user.id } },
        agency: { connect: { id: agency.id } },
      },
    });

    // Send invitation email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const invitationLink = `${process.env.NEXTAUTH_URL}/${params.subdomain}/register?invitation=${invitation.id}`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `Invitation to join ${agency.name}`,
      html: `
        <p>You've been invited to join ${agency.name} as an affiliate.</p>
        <p>Click the link below to register:</p>
        <a href="${invitationLink}">${invitationLink}</a>
      `,
    });

    return NextResponse.json({ message: 'Invitation sent successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}