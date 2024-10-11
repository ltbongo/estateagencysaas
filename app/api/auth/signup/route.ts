import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
      },
    });

    return NextResponse.json({ message: 'User created successfully', user: { id: user.id, name: user.name, email: user.email } });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}