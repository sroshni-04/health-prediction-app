import type { Patient, PatientFormValues } from './types';

const API_BASE = 
'https://health-prediction-backend-z8pk.onrender.com/api';

export async function fetchPatients(query = ''): Promise<Patient[]> {
  const url = `${API_BASE}/patients${query ? `?q=${encodeURIComponent(query)}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Unable to load patients');
  }
  return response.json();
}

export async function fetchPatient(id: string): Promise<Patient> {
  const response = await fetch(`${API_BASE}/patients/${id}`);
  if (!response.ok) {
    throw new Error('Unable to load patient');
  }
  return response.json();
}

export async function createPatient(values: PatientFormValues): Promise<Patient> {
  const response = await fetch(`${API_BASE}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values)
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.details?.join(' ') || data.error || 'Unable to create patient');
  }
  return response.json();
}

export async function updatePatient(id: string, values: PatientFormValues): Promise<Patient> {
  const response = await fetch(`${API_BASE}/patients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values)
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.details?.join(' ') || data.error || 'Unable to update patient');
  }
  return response.json();
}

export async function deletePatient(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/patients/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error('Unable to delete patient');
  }
}
