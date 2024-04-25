import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/themeProvider";
//import { GoogleAnalytics } from "@next/third-parties/google";
//import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";
import { MainHeader } from "./header";
//import MainFooter from "./footer";

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
    <html lang="en" suppressHydrationWarning>
      {/*       <GoogleAnalytics gaId="G-NZ56WBWWEQ" />
      <GoogleTagManager gtmId="GTM-K839NR2" /> */}
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
        {/* <Toaster /> */}
      </body>
    </html>
  );
}
