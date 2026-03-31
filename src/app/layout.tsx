import type { Metadata } from "next"
import { Poppins } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SmoothScroll from "./components/SmoothScroll";

const miso = localFont({
  src: [{ path: "../fonts/VAG-Regular2.otf", weight: "400" }],
  variable: "--font-miso",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Bombay Blokes Predictions | Office Voting Game",
  description:
    "Participate in the Bombay Blokes office prediction game. Vote yes or no on daily questions, earn points for correct answers, and climb the leaderboard against your colleagues.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" className={`${miso.variable} ${poppins.variable}`}>
        <head>
        <link rel="icon" href="images/favicon.png" type="image/png" />
      </head>
      <body>
        <SmoothScroll>
        <Header />
        {children}
        <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
