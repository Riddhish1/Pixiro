import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/provider/ThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import StreamProvider from "@/provider/StreamProvider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pixro-Webinar Platform",
  description: "Pixro is webinar platform with AI sales agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${manrope.variable} antialiased font-manrope`}
          suppressHydrationWarning
        >
          <StreamProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster richColors />
            </ThemeProvider>
          </StreamProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
