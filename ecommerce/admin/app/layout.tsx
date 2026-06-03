import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from "@/components/ui/sonner"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import './globals.css'

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin", "vietnamese"], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'GlowSkin Admin Dashboard',
  description: 'Quản trị hệ thống',
}

export const viewport: Viewport = { themeColor: '#B76E79', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`} suppressHydrationWarning>
        <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/10 to-secondary/10">
          <AdminSidebar />
          <div className="lg:pl-64">
            <main className="p-6 lg:p-8">{children}</main>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  )
}