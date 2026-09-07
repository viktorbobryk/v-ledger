import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "V Ledger",
  description: "Trading desk for planned vs filled trades",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
