import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-dana" }); // Placeholder for Dana

export const metadata: Metadata = {
  title: "حس‌خوب (Vita Blueprint)",
  description: "معماری بیولوژیک بدن شما با هوش مصنوعی در سال ۱۴۰۵",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vita",
  },
};

export const viewport: Viewport = {
  themeColor: "#C59D5F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>

        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['IRANSansX', 'system-ui', 'sans-serif'],
                  },
                  colors: {
                    primary: '#0B2545',
                    accent: '#C59D5F',
                    action: '#D86C45',
                    surface: '#F3F4F6',
                  }
                }
              }
            }
          `
        }} />
      </head>
      <body className="font-sans bg-surface text-primary antialiased">
        {children}
        <Toaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}
