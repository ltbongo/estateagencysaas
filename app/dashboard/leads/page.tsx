"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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

export default function LeadsManagement() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchLeads();
    }
  }, [status, router]);

  const fetchLeads = async () => {
    const response = await fetch('/api/leads');
    if (response.ok) {
      const data = await response.json();
      setLeads(data.leads);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });

    if (response.ok) {
      toast({
        title: "Success",
        description: "Lead created successfully.",
      });
      setTitle('');
      setDescription('');
      fetchLeads();
    } else {
      const data = await response.json();
      toast({
        title: "Error",
        description: data.message || "An error occurred while creating the lead.",
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
      <h1 className="text-2xl font-bold mb-4">Leads Management</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <Button type="submit">Create Lead</Button>
      </form>
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
    </div>
  );
}