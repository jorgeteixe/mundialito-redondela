import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "Mundialito Redondela 2026 | Mundialito da Xunqueira (Resultados, Estadísticas y Calendario)",
  description:
    "Sigue los resultados en vivo, estadísticas, calendario y toda la información del Mundialito Redondela 2026 (Mundialito da Xunqueira). El mítico torneo de fútbol de calle.",
  icons: {
    icon: "/favicon.svg",
  },
  keywords: [
    "Mundialito Redondela",
    "Mundialito Xunqueira",
    "Mundialito de Redondela",
    "Mundialito da Xunqueira 2026",
    "Resultados Mundialito",
    "Estadísticas Mundialito",
    "Calendario Mundialito",
    "Fútbol de Calle Redondela",
    "Fútbol Calle Redondela",
    "A Xunqueira Redondela",
  ],
  authors: [{ name: "Mundialito Redondela" }],
  metadataBase: new URL("https://mundialitoredondela.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "Mundialito Redondela 2026 | Mundialito da Xunqueira (Resultados, Estadísticas y Calendario)",
    description:
      "Sigue los resultados en vivo, estadísticas, calendario y toda la información del Mundialito Redondela 2026 (Mundialito da Xunqueira). El mítico torneo de fútbol de calle.",
    url: "https://mundialitoredondela.com",
    siteName: "Mundialito Redondela",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image-dc1e1914.png",
        width: 1200,
        height: 628,
        alt: "Mundialito Redondela 2026 | Mundialito da Xunqueira",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Mundialito Redondela 2026 | Mundialito da Xunqueira (Resultados, Estadísticas y Calendario)",
    description:
      "Sigue los resultados en vivo, estadísticas, calendario y toda la información del Mundialito Redondela 2026 (Mundialito da Xunqueira). El mítico torneo de fútbol de calle.",
    images: ["/og-image-dc1e1914.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {children}
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              src="https://umami.teixe.es/script.js"
              data-website-id="59196bbe-1cba-4b74-b026-46d1254ab62d"
              strategy="afterInteractive"
            />
            <Script id="umami-outbound-links" strategy="afterInteractive">
              {`
                document.addEventListener('click', function(event) {
                  var a = event.target.closest('a');
                  if (a && a.href) {
                    var hostname = a.hostname;
                    if (hostname && hostname !== window.location.hostname && !a.getAttribute('data-umami-event')) {
                      a.setAttribute('data-umami-event', 'outbound-link-click');
                      a.setAttribute('data-umami-event-url', a.href);
                    }
                  }
                }, { capture: true });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
