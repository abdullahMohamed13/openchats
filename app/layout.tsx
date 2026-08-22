import type { Metadata } from "next";
import localFont from "next/font/local";
import { Plus_Jakarta_Sans, Space_Grotesk, Geist, Press_Start_2P } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";
import LayoutShell from "@/components/shared/LayoutShell";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
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
  title: "OpenChats",
  description: "All In One Chatting Website For Teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
			className={cn("h-full", "antialiased", "bg-primary", jakartaSans.variable, quera.variable, spaceGrotesk.variable, brogetta.variable, pressStart.variable, "font-sans", geist.variable)}
    >
			<body>
				<LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
