import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

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
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'IRANSansX';
              src: url('/fonts/IRANSansXFaNum-ThinD4.ttf') format('truetype');
              font-weight: 100;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'IRANSansX';
              src: url('/fonts/IRANSansXFaNum-UltraLightD4.ttf') format('truetype');
              font-weight: 200;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'IRANSansX';
              src: url('/fonts/IRANSansXFaNum-LightD4.ttf') format('truetype');
              font-weight: 300;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'IRANSansX';
              src: url('/fonts/IRANSansXFaNum-RegularD4.ttf') format('truetype');
              font-weight: 400;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'IRANSansX';
              src: url('/fonts/IRANSansXFaNum-MediumD4.ttf') format('truetype');
              font-weight: 500;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'IRANSansX';
              src: url('/fonts/IRANSansXFaNum-DemiBoldD4.ttf') format('truetype');
              font-weight: 600;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'IRANSansX';
              src: url('/fonts/IRANSansXFaNum-BoldD4.ttf') format('truetype');
              font-weight: 700;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'IRANSansX';
              src: url('/fonts/IRANSansXFaNum-ExtraBoldD4.ttf') format('truetype');
              font-weight: 800;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'IRANSansX';
              src: url('/fonts/IRANSansXFaNum-BlackD4.ttf') format('truetype');
              font-weight: 900;
              font-style: normal;
              font-display: swap;
            }
          `
        }} />
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
