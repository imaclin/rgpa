import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { LocalBusinessJsonLd } from "@/components/seo/json-ld";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: {
    default: "RG Property Advisors | Greater Cleveland Real Estate",
    template: "%s | RG Property Advisors",
  },
  description:
    "Greater Cleveland's top 1% real estate advisors. Specializing in residential, multi-family, distressed assets, and vacant land in Lakewood, Bay Village, Westlake, and surrounding Cleveland Metro areas.",
  keywords: [
    "RG Property Advisors",
    "Cleveland real estate",
    "Lakewood real estate",
    "Bay Village real estate",
    "Westlake real estate",
    "Cleveland homes for sale",
    "investment properties Cleveland",
    "distressed assets Ohio",
    "multi-family Cleveland",
    "sell my home Cleveland",
    "buy a home Cleveland",
    "vacant land Ohio",
    "real estate advisor Cleveland",
    "Keller Williams Cleveland",
  ],
  authors: [{ name: "RG Property Advisors" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rgpropertyadvisors.com",
    siteName: "RG Property Advisors",
    title: "RG Property Advisors | Greater Cleveland Real Estate",
    description:
      "Greater Cleveland's top 1% real estate advisors. Experts in Lakewood, Bay Village, and the Cleveland Metro area.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RG Property Advisors | Greater Cleveland Real Estate",
    description:
      "Greater Cleveland's top 1% real estate advisors specializing in residential, multi-family, and investment properties.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <LocalBusinessJsonLd />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
