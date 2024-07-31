import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import { ThemeProvider } from "@/components/themeProvider";
import "../../globals.css";
import "./style.css";
//import MainFooter from "./footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from 'sonner';
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'


const inter = Inter({ subsets: ["latin"] });

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
});

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
      <body className={`${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div>
            <TooltipProvider delayDuration={350}>{children}</TooltipProvider>
            <Toaster position="top-center" />
          </div>
        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
