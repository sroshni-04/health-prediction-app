export interface Patient {
  id: number;
  full_name: string;
  dob: string;
  email: string;
  glucose: number;
  haemoglobin: number;
  cholesterol: number;
  remarks: string;
  created_at?: string;
  risk_level?: string;
}

export interface PatientFormValues {
  fullName: string;
  dob: string;
  email: string;
  glucose: string;
  haemoglobin: string;
  cholesterol: string;
}
