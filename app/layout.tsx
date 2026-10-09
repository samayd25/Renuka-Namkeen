import type { Metadata } from 'next';
import './globals.css';
import WhatsAppBillModal from '@/components/WhatsAppBillModal';

export const metadata: Metadata = {
  title: 'Renuka-Namakeen',
  description: 'Homemade Sweets & Snacks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body>
        {children}
        {/* Global Modal - Detects WhatsApp Redirect Automatically */}
        <WhatsAppBillModal />
      </body>
    </html>
  );
}