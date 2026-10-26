import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LabSessionProvider } from './contexts/LabSessionContext'
import { HomePage } from './pages/HomePage'
import { QuizPage } from './pages/QuizPage'
import { UnitPage } from './pages/UnitPage'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
      <LabSessionProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="quiz" element={<QuizPage />} />
            <Route path="unit/:slug" element={<UnitPage />} />
          </Route>
        </Routes>
      </LabSessionProvider>
    </BrowserRouter>
  )
}
