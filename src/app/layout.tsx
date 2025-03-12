import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Nunito } from 'next/font/google' // Import Nunito
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Providers } from './providers'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '700'], // Include regular and bold weights
  variable: '--font-nunito', // Define a CSS variable (optional, but recommended)
})

export const metadata = {
  title: 'ClassTeamUp',
  description: 'Form teams for class projects based on skills and interests',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="en">
      <body className={`${nunito.variable} font-sans`}> {/* Apply the font */}
        <Providers>
          <div className="page-transition-wrapper">
            {children}
          </div>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}