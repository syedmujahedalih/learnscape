import type { Metadata } from "next";
import { headers } from "next/headers";
import { DM_Serif_Display, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ variable: "--font-sans", subsets: ["latin"] });
const display = DM_Serif_Display({ variable: "--font-display", subsets: ["latin"], weight: "400" });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "learnscape.local";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const title = "Learnscape — Predict what happens. Discover why.";
  const description = "Predictive STEM learning worlds where students test intuition, compare with evidence, and transfer what they learn.";
  return { title, description, icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" }, openGraph: { title, description, images: [`${protocol}://${host}/og-pendulum.png`] }, twitter: { card: "summary_large_image", title, description, images: [`${protocol}://${host}/og-pendulum.png`] } };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${manrope.variable} ${display.variable} antialiased`}>{children}</body></html>;
}
