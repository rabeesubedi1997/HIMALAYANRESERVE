import type { Metadata } from "next";
import { Cormorant_Garamond, Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://himalayanreserve.coffee"),
  title: "Himalayan Reserve — The World's Highest Handcrafted Himalayan Coffee",
  description:
    "Ancestral single-estate coffee from 1,700m in Kaskikot, Nepal. Firewood-roasted, stone-ground, and served exclusively at At.mosphere Lounge, Level 122, Burj Khalifa, Dubai.",
  openGraph: {
    title: "Himalayan Reserve — Ancestral Single-Estate Kaskikot (1,700m)",
    description:
      "From the Roof of the World to the Top of the Sky. The world's most expensive handcrafted Himalayan coffee. Served exclusively at Burj Khalifa, Level 122.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${playfair.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-paper">{children}</body>
    </html>
  );
}