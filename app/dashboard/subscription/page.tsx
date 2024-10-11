"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 99,
    features: ['Up to 50 leads per month', 'Email support', 'Basic analytics'],
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 199,
    features: ['Unlimited leads', 'Priority email support', 'Advanced analytics', 'Custom branding'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 499,
    features: ['Unlimited leads', '24/7 phone support', 'Advanced analytics', 'Custom branding', 'Dedicated account manager'],
  },
];

export default function Subscription() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleSubscribe = async (planId: string) => {
    setSelectedPlan(planId);
    const response = await fetch('/api/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });

    if (response.ok) {
      const { paymentUrl } = await response.json();
      window.location.href = paymentUrl;
    } else {
      const data = await response.json();
      toast({
        title: "Error",
        description: data.message || "An error occurred while processing your subscription.",
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
      <h1 className="text-2xl font-bold mb-4">Choose a Subscription Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subscriptionPlans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-4">R{plan.price}/month</p>
              <ul className="list-disc list-inside mb-4">
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={selectedPlan === plan.id}
              >
                {selectedPlan === plan.id ? 'Processing...' : 'Subscribe'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}