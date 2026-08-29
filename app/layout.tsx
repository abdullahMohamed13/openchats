import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist, Plus_Jakarta_Sans, Press_Start_2P } from "next/font/google";

import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import ConvexClientProvider from "@/providers/ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const brogetta = localFont({
  src: "../src/assets/fonts/BROGETTA-Regular.otf",
  variable: "--font-brogetta",
});

const quera = localFont({
  src: "../src/assets/fonts/Quera DEMO.otf",
  variable: "--font-quera",
});

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  variable: "--font-press-start",
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://openchats.qzz.io"),
  title: {
    default: "OpenChats | Organized Communication for Teams & Communities",
    template: "%s | OpenChats",
  },
  description:
    "OpenChats brings your workspaces, channels, and direct messages together in one organized place. Chat in real time with your team, club, or community on desktop and mobile.",
  keywords: [
    "team chat",
    "community platform",
    "workspaces",
    "channels",
    "direct messages",
    "real-time messaging",
    "team communication",
    "group chat",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "OpenChats",
    title: "OpenChats | Organized Communication for Teams & Communities",
    description:
      "Bring your teams, workspaces, channels, and direct conversations together in one place.",
    images: [{ url: "/logo.webp", width: 477, height: 523, alt: "OpenChats logo" }],
  },
  twitter: {
    card: "summary",
    title: "OpenChats | Organized Communication for Teams & Communities",
    description:
      "Bring your teams, workspaces, channels, and direct conversations together in one place.",
    images: ["/logo.webp"],
  },
  icons: {
    icon: [{ url: "/logo.webp", type: "image/webp" }],
    apple: [{ url: "/logo.webp" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
			lang="en"
      data-scroll-behavior="smooth"
			className={cn("h-full", "antialiased", "bg-primary", "font-body",
				jakartaSans.variable, quera.variable, brogetta.variable, geist.variable, pressStart.variable)}
    >
      <body>
				<ConvexClientProvider>
					{children}
				</ConvexClientProvider>
				<Toaster />
      </body>
    </html>
  );
}