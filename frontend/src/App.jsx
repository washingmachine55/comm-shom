import { Routes, Route, Navigate } from 'react-router-dom'
// import { useState, useEffect } from 'react'
import Layout from './components/Layout.jsx'
// import LoginPage from './pages/LoginPage.jsx'
import UploadPage from './pages/UploadPage.jsx'
import StudentPage from './pages/StudentPage.jsx'
import ComparePage from './pages/ComparePage.jsx'

import process from "node:process"
process.loadEnvFile("../.env")

export default function App() {
  // const [user, setUser] = useState(null)
  // const [checking, setChecking] = useState(true)

  // useEffect(() => {
  //   fetch(`${BACKEND}/api/auth/me', { credentials: 'include' })
  //     .then(r => r.json())
  //     .then(d => { if (d.user) setUser(d.user) })
  //     .catch(() => {})
  //     .finally(() => setChecking(false))
  // }, [])

  // if (checking) return (
  //   <div className="flex items-center justify-center h-screen bg-ink-900">
  //     <div className="w-8 h-8 border-2 rounded-full border-brand border-t-transparent animate-spin" />
  //   </div>
  // )

  const user = { id: 'admin-001', name: 'Admin', role: 'admin' }

  // if (!user) return <LoginPage onLogin={setUser} />

  return (
    // <Layout user={user} onLogout={() => setUser(null)}>
    <Layout user={user}>
      <Routes>
        <Route path="/" element={<Navigate to="/upload" replace />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/student/:id" element={<StudentPage />} />
        <Route path="/compare" element={<ComparePage />} />
      </Routes>
    </Layout>
  )
}
