import { Route, Routes, Link, NavLink } from 'react-router-dom';
import PatientListPage from './pages/PatientListPage';
import PatientDetailPage from './pages/PatientDetailPage';
import PatientEditPage from './pages/PatientEditPage';
import PatientCreatePage from './pages/PatientCreatePage';

function App() {
  return (
    <div className="app-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">Smart patient monitoring</p>
          <h1>HealthPulse Dashboard</h1>
          <p className="hero-copy">
            Manage patient records and predict potential health risks using AI</p>
        </div>
        <nav className="top-nav" aria-label="Primary">
          <Link to="/patients" className="nav-link">Patients</Link>
          <NavLink to="/patients/new" className="nav-link">Add Patient</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<PatientListPage />} />
        <Route path="/patients" element={<PatientListPage />} />
        <Route path="/patients/new" element={<PatientCreatePage />} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
        <Route path="/patients/:id/edit" element={<PatientEditPage />} />
      </Routes>
    </div>
  );
}

export default App;
