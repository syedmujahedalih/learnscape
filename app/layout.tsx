import type { Metadata } from "next";
import { headers } from "next/headers";
import { JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ variable: "--font-sans", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "p99.local";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const title = "P99 — The inference systems lab.";
  const description = "Master LLM inference by fighting production incidents: predict the bottleneck, tune the serving stack, replay the workload, and diagnose the result.";
  return { title, description, icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" }, openGraph: { title, description, images: [`${protocol}://${host}/og.png`] }, twitter: { card: "summary_large_image", title, description, images: [`${protocol}://${host}/og.png`] } };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${manrope.variable} ${mono.variable} antialiased`}>{children}</body></html>;
}
