import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lucous.app"),
  title: "LUCOUS — Learn. Play. Test. Improve.",
  description:
    "LUCOUS is the AI-powered, gamified learning platform. Learn with an AI team, play to practice, test what matters, and improve every single day — for students, teachers and schools.",
  keywords: [
    "LUCOUS",
    "gamified learning",
    "AI tutor",
    "edtech",
    "skill development",
    "exam prep",
    "adaptive learning",
    "student dashboard",
    "teacher analytics",
  ],
  openGraph: {
    title: "LUCOUS — Learn. Play. Test. Improve.",
    description:
      "AI-powered gamified learning and skill development. Learning should feel like progress.",
    url: "https://lucous.app",
    siteName: "LUCOUS",
    images: [{ url: "/brand/lucous-logo.png", width: 1200, height: 630, alt: "LUCOUS" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LUCOUS — Learn. Play. Test. Improve.",
    description:
      "AI-powered gamified learning and skill development. Learning should feel like progress.",
    images: ["/brand/lucous-logo.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
