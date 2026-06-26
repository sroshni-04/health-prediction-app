import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPatient, updatePatient } from '../api';
import type { Patient, PatientFormValues } from '../types';

function PatientEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [values, setValues] = useState<PatientFormValues>({
    fullName: '',
    dob: '',
    email: '',
    glucose: '',
    haemoglobin: '',
    cholesterol: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchPatient(id);
        setPatient(data);
        setValues({
          fullName: data.full_name,
          dob: data.dob,
          email: data.email,
          glucose: String(data.glucose),
          haemoglobin: String(data.haemoglobin),
          cholesterol: String(data.cholesterol)
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load patient');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const handleChange = (field: keyof PatientFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updatePatient(id, values);
      navigate(`/patients/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update patient');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <section className="card"><div className="empty-state">Loading record…</div></section>;
  }

  return (
    <section className="card form-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Update</p>
          <h2>Edit patient record</h2>
        </div>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          <span>Full name</span>
          <input value={values.fullName} onChange={(event) => handleChange('fullName', event.target.value)} required />
        </label>
        <label>
          <span>Date of birth</span>
          <input type="date" value={values.dob} onChange={(event) => handleChange('dob', event.target.value)} required />
        </label>
        <label>
          <span>Email</span>
          <input type="email" value={values.email} onChange={(event) => handleChange('email', event.target.value)} required />
        </label>
        <label>
          <span>Glucose (mg/dL)</span>
          <input type="number" step="0.01" value={values.glucose} onChange={(event) => handleChange('glucose', event.target.value)} required />
        </label>
        <label>
          <span>Haemoglobin (g/dL)</span>
          <input type="number" step="0.01" value={values.haemoglobin} onChange={(event) => handleChange('haemoglobin', event.target.value)} required />
        </label>
        <label>
          <span>Cholesterol (mg/dL)</span>
          <input type="number" step="0.01" value={values.cholesterol} onChange={(event) => handleChange('cholesterol', event.target.value)} required />
        </label>
        {error && <div className="form-message">{error}</div>}
        <button className="primary-btn" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
      </form>
    </section>
  );
}

export default PatientEditPage;
