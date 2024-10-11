import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Estate Agency SaaS Platform',
  description: 'A SaaS platform for estate agencies to manage leads and users',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
</boltArtifact>

<boltArtifact id="saas-platform-pages" title="SaaS Platform Pages">
<boltAction type="file" filePath="app/page.tsx">
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to the Estate Agency SaaS Platform
        </h1>
        <p className="mt-3 text-2xl">
          Manage your leads and grow your business
        </p>
        <div className="flex mt-6">
          <Link href="/auth/signin" passHref>
            <Button>Sign In</Button>
          </Link>
          <Link href="/auth/signup" passHref>
            <Button variant="outline" className="ml-4">Sign Up</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}