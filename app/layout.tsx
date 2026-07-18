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
  const title = "Learnscape — Challenge your intuition.";
  const description = "Learnscape turns STEM course material into interactive challenges: make a claim, run one clean test, and carry the rule into the next world.";
  return { title, description, icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" }, openGraph: { title, description, images: [`${protocol}://${host}/og-challenge.png`] }, twitter: { card: "summary_large_image", title, description, images: [`${protocol}://${host}/og-challenge.png`] } };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${manrope.variable} ${display.variable} antialiased`}>{children}</body></html>;
}
