import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AquaDesk", template: "%s | AquaDesk" },
  description: "RO service business management for customers, technicians, AMC, inventory and billing.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
