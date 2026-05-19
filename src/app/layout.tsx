import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import CustomCursor from "@/components/CustomCursor";

const ibmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
});

const ibmSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  // Fixes the Open Graph resolving warning in terminal
  metadataBase: new URL(
    process.env.NODE_ENV === "production"
      ? "https://portoflio-taupe-eight.vercel.app"
      : "http://localhost:3000"
  ),
  title: "agstn404 — personal archive",
  description: "systems builder. desktop tooling. cebu, ph. i build things that live close to the metal.",
  keywords: ["systems builder", "rust", "tauri", "desktop tooling", "cebu", "portfolio"],
  authors: [{ name: "agstn404" }],
  creator: "agstn404",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://portoflio-taupe-eight.vercel.app",
    title: "agstn404 — personal archive",
    description: "systems builder. desktop tooling. cebu, ph. i build things that live close to the metal.",
    siteName: "personal.archive",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "agstn404 — personal archive",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "agstn404 — personal archive",
    description: "systems builder. desktop tooling. cebu, ph.",
    images: ["/og.png"],
  },
};  

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* inline script: apply saved theme before paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme');
                if (t === 'light' || t === 'dark') {
                  document.documentElement.setAttribute('data-theme', t);
                } else {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className={`${ibmMono.variable} ${ibmSans.variable}`}>
        <ThemeProvider>
          {children}
          <CustomCursor />
        </ThemeProvider>
      </body>
    </html>
  );
}