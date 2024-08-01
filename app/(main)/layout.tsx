import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/themeProvider";
import "../globals.css";
import { MainHeader } from "./header";
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="max-w-7xl mx-auto">
            <MainHeader />
            {children}
            {/* <MainFooter /> */}
          </div>
          
        </ThemeProvider>
        <Toaster position="bottom-center" expand={false} /> 
      </body>
    </html>
    </ClerkProvider>
  );
}
