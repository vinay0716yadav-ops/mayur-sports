import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mayur Sports | Authentic Cricket, Badminton, Football & Fitness Gear",
  description: "Explore available sports equipment, check live store prices, stock availability, and reserve directly via WhatsApp from Mayur Sports.",
  keywords: ["Mayur Sports", "Sports Shop", "Cricket Bats", "Badminton Rackets", "Yonex", "SS Sunridges", "Football", "Gym Equipment", "Sports Store"],
  openGraph: {
    title: "Mayur Sports | Authentic Sports Equipment & Gear",
    description: "Check live in-shop prices and product availability at Mayur Sports. Reserve your gear directly via WhatsApp!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
