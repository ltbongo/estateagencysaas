"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';

interface Agent {
  id: string;
  name: string;
  email: string;
}

export default function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchAgents();
    }
  }, [status, router]);

  const fetchAgents = async () => {
    const response = await fetch('/api/agents');
    if (response.ok) {
      const data = await response.json();
      setAgents(data.agents);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });

    if (response.ok) {
      toast({
        title: "Success",
        description: "Agent created successfully.",
      });
      setName('');
      setEmail('');
      fetchAgents();
    } else {
      const data = await response.json();
      toast({
        title: "Error",
        description: data.message || "An error occurred while creating the agent.",
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
      <h1 className="text-2xl font-bold mb-4">Agent Management</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit">Create Agent</Button>
      </form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell>{agent.name}</TableCell>
              <TableCell>{agent.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}