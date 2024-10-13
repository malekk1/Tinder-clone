import { Inter } from "next/font/google";
import "./globals.scss";

import AuthContextProvider from "@/app/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthContextProvider> {children}</AuthContextProvider>
      </body>
    </html>
  );
}
