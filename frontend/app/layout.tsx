import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "Wheely Good",
  description: "Bike rentals and shop in Byron Bay",

  metadataBase: new URL("https://www.wheelygoodrides.com.au"),

  openGraph: {
    title: "Wheely Good",
    description: "Bike rentals and shop in Byron Bay",
    url: "https://www.wheelygoodrides.com.au",
    siteName: "Wheely Good",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Wheely Good",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Wheely Good",
    description: "Bike rentals and shop in Byron Bay",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}