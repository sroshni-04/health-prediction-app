import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPatient } from '../api';
import type { PatientFormValues } from '../types';

const emptyValues: PatientFormValues = {
  fullName: '',
  dob: '',
  email: '',
  glucose: '',
  haemoglobin: '',
  cholesterol: ''
};

function PatientCreatePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<PatientFormValues>(emptyValues);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof PatientFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createPatient(values);
      navigate('/patients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create patient');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card form-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Create</p>
          <h2>Add patient record</h2>
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
        <button className="primary-btn" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Create patient'}</button>
      </form>
    </section>
  );
}

export default PatientCreatePage;
