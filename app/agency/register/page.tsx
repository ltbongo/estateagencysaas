"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function AgencyRegistration() {
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [logo, setLogo] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [aboutUs, setAboutUs] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/agency/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, subdomain, logo, primaryColor, secondaryColor, aboutUs, contactInfo }),
    });

    const data = await response.json();

    if (response.ok) {
      toast({
        title: "Success",
        description: "Agency registered successfully.",
      });
      router.push('/dashboard');
    } else {
      toast({
        title: "Error",
        description: data.message || "An error occurred during agency registration.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Register Your Agency</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Agency Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="subdomain">Subdomain</Label>
          <Input
            id="subdomain"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="logo">Logo URL</Label>
          <Input
            id="logo"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="primaryColor">Primary Color</Label>
          <Input
            id="primaryColor"
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="secondaryColor">Secondary Color</Label>
          <Input
            id="secondaryColor"
            type="color"
            value={secondaryColor}
            onChange={(e) => setSecondaryColor(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="aboutUs">About Us</Label>
          <Input
            id="aboutUs"
            value={aboutUs}
            onChange={(e) => setAboutUs(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="contactInfo">Contact Information</Label>
          <Input
            id="contactInfo"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
          />
        </div>
        <Button type="submit">Register Agency</Button>
      </form>
    </div>
  );
}