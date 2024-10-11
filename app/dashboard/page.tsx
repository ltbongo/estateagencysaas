"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to your dashboard, {session.user?.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View and manage your leads</p>
            <Button className="mt-2">View Leads</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage your agency's agents</p>
            <Button className="mt-2">Manage Agents</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View your agency's performance</p>
            <Button className="mt-2">View Analytics</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}