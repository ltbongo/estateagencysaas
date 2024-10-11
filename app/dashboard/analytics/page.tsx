"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  totalLeads: number;
  convertedLeads: number;
  rejectedLeads: number;
  weeklyStats: {
    week: string;
    received: number;
    converted: number;
    rejected: number;
  }[];
}

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchAnalytics();
    }
  }, [status, router]);

  const fetchAnalytics = async () => {
    const response = await fetch('/api/analytics');
    if (response.ok) {
      const data = await response.json();
      setAnalyticsData(data);
    }
  };

  if (status === 'loading'|| !analyticsData) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analyticsData.totalLeads}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Converted Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analyticsData.convertedLeads}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rejected Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{analyticsData.rejectedLeads}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Weekly Lead Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analyticsData.weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="received" fill="#8884d8" />
              <Bar dataKey="converted" fill="#82ca9d" />
              <Bar dataKey="rejected" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}