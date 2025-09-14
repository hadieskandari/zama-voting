import type { Metadata } from "next";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import "@radix-ui/themes/styles.css";
import { Theme, ThemePanel } from "@radix-ui/themes";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "FHEVM Voting App - Powered by Zama FHEVM",
  description: "Frontend-only DApp to interact with a voting contract on Ethereum",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Providers>
          <Theme accentColor="teal" grayColor="sage" radius="small" scaling="90%" panelBackground="translucent" appearance="dark">
            {children}
          </Theme>
          </Providers>
      </body>
    </html>
  );
}
