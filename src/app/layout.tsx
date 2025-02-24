import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ClassTeamUp',
  description: 'Team formation platform for classrooms',
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
      <body>
        <Toaster />
        {children}
      </body>
    </html>
  )
}