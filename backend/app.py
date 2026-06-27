import json
import os
import urllib.request
from datetime import date, datetime
from pathlib import Path
from typing import Any, Dict, List, Tuple

from flask import Flask, Response, jsonify, request
from flask_cors import CORS

try:
    from .supabase_client import get_supabase_client
except ImportError:  # pragma: no cover - fallback for script execution
    from supabase_client import get_supabase_client

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
DIST_DIR = FRONTEND_DIR / "dist"

app = Flask(__name__)
CORS(app)
app.config["JSON_SORT_KEYS"] = False


def serialize_patient(row: Dict[str, Any]) -> Dict[str, Any]:
    if not row:
        return {}
    return {
        "id": row.get("id"),
        "full_name": row.get("full_name"),
        "dob": row.get("dob"),
        "email": row.get("email"),
        "glucose": row.get("glucose"),
        "haemoglobin": row.get("haemoglobin"),
        "cholesterol": row.get("cholesterol"),
        "remarks": row.get("remarks"),
        "created_at": row.get("created_at"),
        "risk_level":row.get("risk_level"),
    }


def fetch_patients(search_query: str = "") -> List[Dict[str, Any]]:
    try:
        client = get_supabase_client()
        response = client.table("patients").select("*").order("created_at", desc=True).execute()
        rows = response.data or []
    except Exception:
        return []

    if search_query:
        normalized = search_query.lower()
        rows = [row for row in rows if normalized in str(row.get("full_name", "")).lower() or normalized in str(row.get("email", "")).lower()]
    return [serialize_patient(row) for row in rows]


def fetch_patient_by_id(patient_id: int) -> Dict[str, Any]:
    try:
        client = get_supabase_client()
        response = client.table("patients").select("*").eq("id", patient_id).execute()
        rows = response.data or []
    except Exception:
        return {}
    if not rows:
        return {}
    return serialize_patient(rows[0])

import traceback
def create_patient(payload: Dict[str, Any]) -> Dict[str, Any]:
    try:
        client = get_supabase_client()
        response = client.table("patients").insert(payload).execute()
        rows = response.data or []
    except Exception as e:
        print("CREATE_PATIENT ERROR:",e)
        traceback.print_exc()
        raise
    if not rows:
        return {}
    return serialize_patient(rows[0])


def update_patient(patient_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    try:
        client = get_supabase_client()
        response = client.table("patients").update(payload).eq("id", patient_id).execute()
        rows = response.data or []
    except Exception:
        return {}
    if not rows:
        return {}
    return serialize_patient(rows[0])


def delete_patient(patient_id: int) -> bool:
    try:
        client = get_supabase_client()
        response = client.table("patients").delete().eq("id", patient_id).execute()
        return response.data is not None
    except Exception:
        return False


def _parse_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def validate_patient(payload: Dict[str, Any]) -> Tuple[List[str], Dict[str, Any]]:
    errors: List[str] = []
    full_name = str(payload.get("fullName", "") or "").strip()
    dob = str(payload.get("dob", "") or "").strip()
    email = str(payload.get("email", "") or "").strip()
    glucose = payload.get("glucose")
    haemoglobin = payload.get("haemoglobin")
    cholesterol = payload.get("cholesterol")

    if not full_name:
        errors.append("Full name is required.")

    if not dob:
        errors.append("Date of birth is required.")
    else:
        try:
            input_date = _parse_date(dob)
        except ValueError:
            errors.append("Date of birth must be in YYYY-MM-DD format.")
        else:
            if input_date > date.today():
                errors.append("Date of birth cannot be in the future.")

    if not email or "@" not in email or "." not in email.split("@")[-1]:
        errors.append("Please enter a valid email address.")

    for field_name, value in (("glucose", glucose), ("haemoglobin", haemoglobin), ("cholesterol", cholesterol)):
        if value is None or str(value).strip() == "":
            errors.append(f"{field_name.capitalize()} is required.")
            continue
        try:
            float(value)
        except (TypeError, ValueError):
            errors.append(f"{field_name.capitalize()} must be numeric.")

    if errors:
        return errors, {}

    return [], {
        "full_name": full_name,
        "dob": dob,
        "email": email,
        "glucose": float(glucose),
        "haemoglobin": float(haemoglobin),
        "cholesterol": float(cholesterol),
    }


def get_risk_level(glucose: float, haemoglobin: float, cholesterol: float) -> str:
    if glucose > 180 or cholesterol > 240 or haemoglobin < 10:
        return "High"
    if glucose > 140 or cholesterol > 200 or haemoglobin < 12:
        return "Moderate"
    return "Low"


def build_remarks(glucose: float, haemoglobin: float, cholesterol: float) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        try:
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": (
                                    "You are a medical support assistant. Write a concise, non-diagnostic health risk remark "
                                    f"based on glucose={glucose}, haemoglobin={haemoglobin}, and cholesterol={cholesterol}. "
                                    "Keep it reassuring, mention any values that need attention, and avoid giving diagnoses."
                                )
                            }
                        ]
                    }
                ]
            }
            req = urllib.request.Request(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + api_key,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                data = json.load(response)
                text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                if text:
                    return text
        except Exception:
            pass

    risk_level = get_risk_level(glucose, haemoglobin, cholesterol)
    if risk_level == "High":
        return "Glucose, cholesterol, or haemoglobin values suggest a high-risk profile; please consult a healthcare professional for follow-up."
    if risk_level == "Moderate":
        return "The reported values are moderately outside the healthy range and should be rechecked with a clinician soon."
    return "The reported values appear broadly within a healthy range, though routine monitoring remains important."


@app.route("/api/patients", methods=["GET", "POST"])
def patients_collection():
    print("PATIENT API CALLED")
    if request.method == "GET":
        search_query = (request.args.get("q", "") or "").strip()
        return jsonify(fetch_patients(search_query))

    payload = request.get_json(silent=True) or {}
    print("PAYLOAD RECEIVED:",payload)
    errors, valid_data = validate_patient(payload)
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400

    risk_level = get_risk_level(valid_data["glucose"], valid_data["haemoglobin"], valid_data["cholesterol"])
    remarks = build_remarks(valid_data["glucose"], valid_data["haemoglobin"], valid_data["cholesterol"])
    print("VALID DATA:",valid_data)

    patient_record = create_patient(
       
        {
            "full_name": valid_data["full_name"],
            "dob": valid_data["dob"],
            "email": valid_data["email"],
            "glucose": valid_data["glucose"],
            "haemoglobin": valid_data["haemoglobin"],
            "cholesterol": valid_data["cholesterol"],
            "risk_level":risk_level,
            "remarks": remarks,
        }
    )
    print("PATIENT RECORD:", patient_record)
    if not patient_record:
        return jsonify({"error": "Unable to create patient record"}), 500
    return jsonify(patient_record), 201


@app.route("/api/patients/<int:patient_id>", methods=["GET", "PUT", "DELETE"])
def patient_detail(patient_id: int):
    existing = fetch_patient_by_id(patient_id)
    if not existing:
        return jsonify({"error": "Patient not found"}), 404

    if request.method == "GET":
        return jsonify(existing)

    if request.method == "PUT":
        payload = request.get_json(silent=True) or {}
        errors, valid_data = validate_patient(payload)
        if errors:
            return jsonify({"error": "Validation failed", "details": errors}), 400

        risk_level = get_risk_level(valid_data["glucose"], valid_data["haemoglobin"], valid_data["cholesterol"])
        remarks = build_remarks(valid_data["glucose"], valid_data["haemoglobin"], valid_data["cholesterol"])
        updated = update_patient(
            patient_id,
            {
                "full_name": valid_data["full_name"],
                "dob": valid_data["dob"],
                "email": valid_data["email"],
                "glucose": valid_data["glucose"],
                "haemoglobin": valid_data["haemoglobin"],
                "cholesterol": valid_data["cholesterol"],
                "risk_level": risk_level,
                "remarks": remarks,
            },
        )
        if not updated:
            return jsonify({"error": "Unable to update patient record"}), 500
        return jsonify(updated)

    deleted = delete_patient(patient_id)
    if not deleted:
        return jsonify({"error": "Unable to delete patient record"}), 500
    return jsonify({"message": "Patient deleted"})


@app.route("/api/dashboard")
def dashboard():
    patients = fetch_patients()
    total = len(patients)
    high = sum(1 for patient in patients if patient.get("risk_level") == "High")
    moderate = sum(1 for patient in patients if patient.get("risk_level") == "Moderate")
    low = sum(1 for patient in patients if patient.get("risk_level") == "Low")
    avg_glucose = sum(float(patient.get("glucose") or 0) for patient in patients) / total if total else 0
    avg_haemoglobin = sum(float(patient.get("haemoglobin") or 0) for patient in patients) / total if total else 0
    avg_cholesterol = sum(float(patient.get("cholesterol") or 0) for patient in patients) / total if total else 0

    return jsonify(
        {
            "totalPatients": total,
            "highRisk": high,
            "moderateRisk": moderate,
            "lowRisk": low,
            "avgGlucose": round(avg_glucose, 2),
            "avgHaemoglobin": round(avg_haemoglobin, 2),
            "avgCholesterol": round(avg_cholesterol, 2),
        }
    )


@app.route("/api/export/csv")
def export_csv():
    rows = fetch_patients()

    output = []
    output.append("id,full_name,dob,email,glucose,haemoglobin,cholesterol,risk_level,remarks,created_at")
    for row in rows:
        output.append(
            ",".join(
                [
                    str(row["id"]),
                    str(row["full_name"]).replace(",", " "),
                    str(row["dob"]),
                    str(row["email"]),
                    str(row["glucose"]),
                    str(row["haemoglobin"]),
                    str(row["cholesterol"]),
                    str(row["risk_level"]),
                    str(row["remarks"]).replace(",", " "),
                    str(row["created_at"]),
                ]
            )
        )

    return Response(
        "\n".join(output) + "\n",
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=patients.csv"},
    )


@app.route("/api/health")
def health_check():
    return jsonify({"status": "ok"})


@app.route("/api/<path:subpath>")
def api_not_found(subpath: str):
    return jsonify({"error": "Not found"}), 404


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
