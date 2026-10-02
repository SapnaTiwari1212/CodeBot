import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

import Footer from './Footer.jsx'
import Navbar from './Navbar.jsx'

/**
 * Shell shared by every route: sticky navigation, page content, footer.
 * Also resets scroll position on navigation, which single page apps otherwise
 * keep from the previous page.
 */
export default function RootLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}