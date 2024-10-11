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

    const totalLeads = await prisma.lead.count({
      where: { agencyId: user.agency.id },
    });

    const convertedLeads = await prisma.lead.count({
      where: { agencyId: user.agency.id, status: 'CONVERTED' },
    });

    const rejectedLeads = await prisma.lead.count({
      where: { agencyId: user.agency.id, status: 'REJECTED' },
    });

    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

    const weeklyStats = await prisma.$queryRaw`
      SELECT
        date_trunc('week', "createdAt") as week,
        COUNT(*) as received,
        SUM(CASE WHEN status = 'CONVERTED' THEN 1 ELSE 0 END) as converted,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected
      FROM "Lead"
      WHERE "agencyId" = ${user.agency.id}
        AND "createdAt" >= ${sixWeeksAgo}
      GROUP BY date_trunc('week', "createdAt")
      ORDER BY week DESC
      LIMIT 6
    `;

    return NextResponse.json({
      totalLeads,
      convertedLeads,
      rejectedLeads,
      weeklyStats,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}