import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "learnscape.local";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const title = "Learnscape — Step inside what you're learning";
  const description = "Interactive learning worlds that turn static textbook concepts into visible systems.";
  return { title, description, icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" }, openGraph: { title, description, images: [`${protocol}://${host}/og.png`] }, twitter: { card: "summary_large_image", title, description, images: [`${protocol}://${host}/og.png`] } };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body></html>;
}
