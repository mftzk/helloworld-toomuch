// app/layout.js
// Root layout: sets metadata and pulls in the global cosmic stylesheet.

import "./globals.css";

export const metadata = {
  title: "Hello World TOOMUCH",
  description:
    "An absurdly over-engineered Hello World — canvas starfields, 63 languages, confetti physics, a Web Audio synth and real API routes.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#05060f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
