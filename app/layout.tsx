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
  const title = "Learnscape — Learn control through world models.";
  const description = "Build intuition for physics and controls by predicting what a learned dynamics model will do, testing its plan, and exposing where its internal world diverges from reality.";
  return { title, description, icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" }, openGraph: { title, description, images: [`${protocol}://${host}/og.png`] }, twitter: { card: "summary_large_image", title, description, images: [`${protocol}://${host}/og.png`] } };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${manrope.variable} ${display.variable} antialiased`}>{children}</body></html>;
}
