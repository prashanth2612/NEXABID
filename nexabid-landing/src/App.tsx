import { useState, useEffect } from 'react'
import LandingPage from './sections/LandingPage'
import AboutPage from './sections/AboutPage'
import CareersPage from './sections/CareersPage'

type Page = 'home' | 'about' | 'careers'

export default function App() {
  const [page, setPage] = useState<Page>('home')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page])

  return (
    <div className="grain">
      {page === 'home'    && <LandingPage  navigate={setPage} />}
      {page === 'about'   && <AboutPage    navigate={setPage} />}
      {page === 'careers' && <CareersPage  navigate={setPage} />}
    </div>
  )
}
