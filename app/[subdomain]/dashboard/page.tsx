"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';

interface Lead {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

interface Commission {
  id: string;
  amount: number;
  leadId: string;
  createdAt: string;
}

export default function UserDashboard({ params }: { params: { subdomain: string } }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [newLeadTitle, setNewLeadTitle] = useState('');
  const [newLeadDescription, setNewLeadDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=/${params.subdomain}/dashboard`);
    } else if (status === 'authenticated') {
      fetchLeads();
      fetchCommissions();
    }
  }, [status, router, params.subdomain]);

  const fetchLeads = async () => {
    const response = await fetch(`/api/${params.subdomain}/leads`);
    if (response.ok) {
      const data = await response.json();
      setLeads(data.leads);
    }
  };

  const fetchCommissions = async () => {
    const response = await fetch(`/api/${params.subdomain}/commissions`);
    if (response.ok) {
      const data = await response.json();
      setCommissions(data.commissions);
    }
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(`/api/${params.subdomain}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newLeadTitle, description: newLeadDescription }),
    });

    if (response.ok) {
      toast({
        title: "Success",
        description: "Lead submitted successfully.",
      });
      setNewLeadTitle('');
      setNewLeadDescription('');
      fetchLeads();
    } else {
      const data = await response.json();
      toast({
        title: "Error",
        description: data.message || "An error occurred while submitting the lead.",
        variant: "destructive",
      });
    }
  };

  const handleInviteAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(`/api/${params.subdomain}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail }),
    });

    if (response.ok) {
      toast({
        title: "Success",
        description: "Invitation sent successfully.",
      });
      setInviteEmail('');
    } else {
      const data = await response.json();
      toast({
        title: "Error",
        description: data.message || "An error occurred while sending the invitation.",
        variant: "destructive",
      });
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to your dashboard, {session.user?.name}</h1>
      <Tabs defaultValue="leads">
        <TabsList>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
        </TabsList>
        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Submit a New Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitLead} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newLeadTitle}
                    onChange={(e) => setNewLeadTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newLeadDescription}
                    onChange={(e) => setNewLeadDescription(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit">Submit Lead</Button>
              </form>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Your Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>{lead.title}</TableCell>
                      <TableCell>{lead.description}</TableCell>
                      <TableCell>{lead.status}</TableCell>
                      <TableCell>{new Date(lead.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle>Your Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Lead ID</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>R{commission.amount.toFixed(2)}</TableCell>
                      <TableCell>{commission.leadId}</TableCell>
                      <TableCell>{new Date(commission.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="affiliates">
          <Card>
            <CardHeader>
              <CardTitle>Invite Affiliates</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInviteAffiliate} className="space-y-4">
                <div>
                  <Label htmlFor="inviteEmail">Email</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit">Send Invitation</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}