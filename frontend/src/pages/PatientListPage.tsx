import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deletePatient, fetchPatients } from '../api';
import type { Patient } from '../types';

function PatientListPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadPatients = async (search = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPatients(search);
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPatients();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this patient record?')) {
      return;
    }
    try {
      await deletePatient(String(id));
      await loadPatients(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete patient');
    }
  };

  return (
    <section className="card table-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Patient records</p>
          <h2>Tracked patients</h2>
        </div>
        <div className="actions">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void loadPatients(query);
              }
            }}
            placeholder="Search by name or email"
          />
          <button className="secondary-btn" type="button" onClick={() => void loadPatients(query)}>
            Search
          </button>
          <Link className="secondary-btn" to="/patients/new">
            Add Patient
          </Link>
        </div>
      </div>

      {loading && <div className="empty-state">Loading patients…</div>}
      {error && <div className="form-message">{error}</div>}
      {!loading && !error && patients.length === 0 && <div className="empty-state">No patients found yet.</div>}

      {!loading && !error && patients.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Risk</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.full_name}</td>
                  <td>{patient.email}</td>
                  <td className={`risk-${(patient.risk_level || 'low').toLowerCase()}`}>{patient.risk_level || 'Low'}</td>
                  <td>{patient.remarks}</td>
                  <td>
                    <div className="table-actions">
                      <button className="view-btn" type="button" onClick={() => navigate(`/patients/${patient.id}`)}>
                        View
                      </button>
                      <button className="edit-btn" type="button" onClick={() => navigate(`/patients/${patient.id}/edit`)}>
                        Edit
                      </button>
                      <button className="delete-btn" type="button" onClick={() => void handleDelete(patient.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default PatientListPage;
