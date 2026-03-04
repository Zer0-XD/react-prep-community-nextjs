import { Outfit } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/features/ThemeProvider";
import NavStyleProvider from "@/components/features/NavStyleProvider";
import ColorSchemeProvider from "@/components/features/ColorSchemeProvider";
import { Analytics } from "@vercel/analytics/next"

const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "React Interview Prep",
  description:
    "Study 300+ React interview questions with flashcards, confidence tracking, and live coding exercises.",
};

// Inline script runs before React hydrates — prevents theme + nav-style + color-scheme + ui-theme flash
const antiFlash = `(function(){try{var t=localStorage.getItem('theme')||'dark';if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}try{var n=localStorage.getItem('nav-style')||'sidebar';document.documentElement.setAttribute('data-nav',n)}catch(e){}try{var s=localStorage.getItem('color-scheme')||'violet';document.documentElement.setAttribute('data-scheme',s)}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: antiFlash }} />
      </head>
      <body
        className={`${fontSans.variable} antialiased`}
      >
        <Analytics />
        <ThemeProvider>
          <ColorSchemeProvider>
            <NavStyleProvider>{children}</NavStyleProvider>
          </ColorSchemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
