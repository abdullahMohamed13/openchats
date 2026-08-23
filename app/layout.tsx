import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist, Plus_Jakarta_Sans, Press_Start_2P } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";

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
			className={cn("h-full", "antialiased", "bg-primary", "font-body",
				jakartaSans.variable, quera.variable, brogetta.variable, geist.variable, pressStart.variable)}
    >
      <body>
				{children}
      </body>
    </html>
  );
}
