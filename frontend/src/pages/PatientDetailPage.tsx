import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchPatient } from '../api';
import type { Patient } from '../types';

function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      return;
    }
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchPatient(id);
        setPatient(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load patient');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  if (loading) {
    return <section className="card"><div className="empty-state">Loading patient details…</div></section>;
  }

  if (error || !patient) {
    return <section className="card"><div className="form-message">{error || 'Patient not found.'}</div></section>;
  }

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Patient overview</p>
          <h2>{patient.full_name}</h2>
        </div>
        <div className="table-actions">
          <button className="secondary-btn" type="button" onClick={() => navigate(`/patients/${patient.id}/edit`)}>
            Edit
          </button>
          <Link className="secondary-btn" to="/patients">
            Back to list
          </Link>
        </div>
      </div>

      <div className="details-grid">
        <div><span className="detail-label">Full name</span><p>{patient.full_name}</p></div>
        <div><span className="detail-label">Date of birth</span><p>{patient.dob}</p></div>
        <div><span className="detail-label">Email address</span><p>{patient.email}</p></div>
        <div><span className="detail-label">Glucose</span><p>{patient.glucose}</p></div>
        <div><span className="detail-label">Haemoglobin</span><p>{patient.haemoglobin}</p></div>
        <div><span className="detail-label">Cholesterol</span><p>{patient.cholesterol}</p></div>
        <div className="full-width"><span className="detail-label">AI-generated remarks</span><p>{patient.remarks}</p></div>
      </div>
    </section>
  );
}

export default PatientDetailPage;
