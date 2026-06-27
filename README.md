# 🩺 HealthPulse Dashboard

HealthPulse Dashboard is a Smart Patient Monitoring System that allows healthcare staff to manage patient records and predict potential health risks using AI-powered health analysis.

## ✨ Features

- ➕ Add new patient records
- 📋 View complete patient details
- ✏️ Edit existing patient information
- 🗑️ Delete patient records
- 🔍 Search patients by name or email
- 📊 Predict patient health risk levels (Low, Moderate, High)
- 📝 Generate health remarks based on patient metrics
- 📱 Responsive and user-friendly dashboard

## 🛠️ Tech Stack

### Frontend
- React.js
- TypeScript
- Vite
- CSS

### Backend
- Python
- Flask
- REST API

### Database
- SQLite

## 📂 Project Structure

```
health-prediction/
├── backend/
│   └── app.py
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── dataset/
├── tests/
├── requirements.txt
└── .gitignore
```

## 🚀 Installation and Setup

### Clone the Repository

```bash
git clone https://github.com/sroshni-04/health-prediction-app.git
cd health-prediction-app
```

### Backend Setup

```bash
pip install -r requirements.txt
cd backend
python app.py
```

Backend runs on:

```
http://127.0.0.1:5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

## 🔄 CRUD Operations

### Create
Add new patient records with health details.

### Read
View patient records and detailed information without entering edit mode.

### Update
Modify existing patient information.

### Delete
Remove patient records from the system.

## 📊 Patient Data Parameters

- Full Name
- Email
- Date of Birth
- Glucose Level
- Cholesterol Level
- Hemoglobin Level
- Risk Level
- Health Remarks

## 🎯 Purpose

The objective of this project is to provide a simple and efficient patient monitoring system that demonstrates full CRUD operations using modern web technologies and REST APIs while incorporating basic AI-based health risk prediction.

---

**Developed by Roshni Singh**
