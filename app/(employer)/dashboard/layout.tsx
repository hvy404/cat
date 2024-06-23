import type { Metadata } from "next";
import { Inter, Merriweather, Source_Serif_4 } from "next/font/google";
import { ThemeProvider } from "@/components/themeProvider";
//import { GoogleAnalytics } from "@next/third-parties/google";
//import { GoogleTagManager } from "@next/third-parties/google";
import "../../globals.css";
import "./style.css";
//import MainFooter from "./footer";
import { TooltipProvider } from "@/components/ui/tooltip";


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
    <html lang="en" suppressHydrationWarning>
      {/*       <GoogleAnalytics gaId="G-NZ56WBWWEQ" />
      <GoogleTagManager gtmId="GTM-K839NR2" /> */}
      <body className={`${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div>
            <TooltipProvider delayDuration={350}>{children}</TooltipProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
