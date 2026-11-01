import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/vazirmatn/index.css";
import "@fontsource-variable/lora/index.css";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { ReaderProvider } from "@/components/Reader";
import { ServiceWorker } from "@/components/ServiceWorker";
import { BASE_PATH } from "@/lib/content";
import { ProgressProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Fahrplan، برنامه مطالعه آلمانی",
  description: "برنامه روزانه، متن درس‌ها و پیگیری پیشرفت کتاب Starten wir! A2 و آمادگی آزمون ÖSD",
  manifest: `${BASE_PATH}/manifest.webmanifest`,
  icons: {
    icon: `${BASE_PATH}/icon-192.png`,
    apple: { url: `${BASE_PATH}/icon-180.png`, sizes: "180x180" },
  },
  appleWebApp: { capable: true, title: "Fahrplan", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // برای استفاده از env(safe-area-inset-*) در ناچ و نوار خانه
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF5F6" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1019" },
  ],
};

// پیش از نقاشی صفحه اجرا می‌شود تا تم انتخابی چشمک نزند
const themeScript = `try{var t=localStorage.getItem("fahrplan.theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ProgressProvider>
          <ReaderProvider>
            <AppShell>{children}</AppShell>
          </ReaderProvider>
        </ProgressProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
