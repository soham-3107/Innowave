import sqlite3
import json
import os
import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "innowave_users.db")
SECRET_KEY = os.environ.get("INNOWAVE_JWT_SECRET", "innowave-marine-intelligence-super-secret-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the SQLite database schema and seeds initial demo users if not present."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        gender TEXT NOT NULL,
        role TEXT NOT NULL,
        default_region TEXT NOT NULL,
        emergency_contact_name TEXT NOT NULL,
        emergency_contact_phone TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role_details TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS data_access_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        user_email TEXT,
        user_role TEXT NOT NULL,
        action TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)
    conn.commit()

    # Check if demo users exist, if not seed them for instant testing
    cursor.execute("SELECT COUNT(*) as count FROM users")
    count = cursor.fetchone()["count"]
    if count == 0:
        # 1. Demo Fisherman
        demo_pwd_hash = hash_password("demo1234")
        cursor.execute("""
        INSERT INTO users (
            full_name, phone, email, gender, role, default_region,
            emergency_contact_name, emergency_contact_phone, password_hash, role_details
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "Capt. Rajesh Patil",
            "+91 98201 54321",
            "fisherman@innowave.in",
            "Male",
            "fisherman",
            "mumbai",
            "Sunita Patil (Wife)",
            "+91 98201 98765",
            demo_pwd_hash,
            json.dumps({
                "boat_name": "Matsya Sagar IV",
                "boat_registration": "IND-MH-01-MM-4820",
                "home_port": "Sassoon Docks, Mumbai"
            })
        ))

        # 2. Demo Researcher
        cursor.execute("""
        INSERT INTO users (
            full_name, phone, email, gender, role, default_region,
            emergency_contact_name, emergency_contact_phone, password_hash, role_details
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "Dr. Priya Nair",
            "+91 94470 12345",
            "researcher@innowave.in",
            "Female",
            "researcher",
            "kochi",
            "Dr. K. Nair (Brother)",
            "+91 94470 54321",
            demo_pwd_hash,
            json.dumps({
                "institution_name": "Central Marine Fisheries Research Institute (CMFRI)",
                "research_interest": "Pelagic Shoal Dynamics & Chlorophyll Front Convergence"
            })
        ))

        # 3. Demo Government Official
        cursor.execute("""
        INSERT INTO users (
            full_name, phone, email, gender, role, default_region,
            emergency_contact_name, emergency_contact_phone, password_hash, role_details
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "Commander Vivek Sharma",
            "+91 98110 99887",
            "official@innowave.in",
            "Male",
            "official",
            "goa",
            "ICG Duty Officer HQ",
            "+91 832 2520616",
            demo_pwd_hash,
            json.dumps({
                "department_name": "Indian Coast Guard (ICG) Regional HQ West",
                "designation": "Commanding Officer - Coastal Safety Enforcement",
                "jurisdiction": "Goa & South Maharashtra Maritime Sector"
            })
        ))
        conn.commit()

    conn.close()

def hash_password(plain_password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None

def serialize_user_row(row: sqlite3.Row) -> Dict[str, Any]:
    role_details_parsed = {}
    try:
        if row["role_details"]:
            role_details_parsed = json.loads(row["role_details"])
    except Exception:
        pass

    return {
        "id": row["id"],
        "full_name": row["full_name"],
        "phone": row["phone"],
        "email": row["email"],
        "gender": row["gender"],
        "role": row["role"],
        "default_region": row["default_region"],
        "emergency_contact_name": row["emergency_contact_name"],
        "emergency_contact_phone": row["emergency_contact_phone"],
        "role_details": role_details_parsed,
        "created_at": row["created_at"]
    }

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    res = serialize_user_row(row)
    res["password_hash"] = row["password_hash"]
    return res

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return serialize_user_row(row)

def create_user(
    full_name: str,
    phone: str,
    email: str,
    gender: str,
    role: str,
    default_region: str,
    emergency_contact_name: str,
    emergency_contact_phone: str,
    plain_password: str,
    role_details: dict
) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    pwd_hash = hash_password(plain_password)
    role_details_json = json.dumps(role_details or {})

    cursor.execute("""
    INSERT INTO users (
        full_name, phone, email, gender, role, default_region,
        emergency_contact_name, emergency_contact_phone, password_hash, role_details
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        full_name.strip(),
        phone.strip(),
        email.strip().lower(),
        gender,
        role,
        default_region,
        emergency_contact_name.strip(),
        emergency_contact_phone.strip(),
        pwd_hash,
        role_details_json
    ))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()

    return get_user_by_id(user_id)

def update_user_profile(
    user_id: int,
    full_name: Optional[str] = None,
    phone: Optional[str] = None,
    emergency_contact_name: Optional[str] = None,
    emergency_contact_phone: Optional[str] = None,
    default_region: Optional[str] = None,
    role_details: Optional[dict] = None
) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()

    updates = []
    params = []

    if full_name is not None:
        updates.append("full_name = ?")
        params.append(full_name.strip())
    if phone is not None:
        updates.append("phone = ?")
        params.append(phone.strip())
    if emergency_contact_name is not None:
        updates.append("emergency_contact_name = ?")
        params.append(emergency_contact_name.strip())
    if emergency_contact_phone is not None:
        updates.append("emergency_contact_phone = ?")
        params.append(emergency_contact_phone.strip())
    if default_region is not None:
        updates.append("default_region = ?")
        params.append(default_region.strip())
    if role_details is not None:
        updates.append("role_details = ?")
        params.append(json.dumps(role_details))

    if not updates:
        conn.close()
        return get_user_by_id(user_id)

    query = f"UPDATE users SET {', '.join(updates)} WHERE id = ?"
    params.append(user_id)

    cursor.execute(query, tuple(params))
    conn.commit()
    conn.close()

    return get_user_by_id(user_id)

def log_data_access(
    user_id: Optional[int],
    user_email: Optional[str],
    user_role: str,
    action: str,
    resource_type: str,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
) -> int:
    """Logs an audit event into data_access_log table."""
    conn = get_db_connection()
    cursor = conn.cursor()
    details_str = json.dumps(details or {}) if isinstance(details, (dict, list)) else (str(details) if details else None)
    
    cursor.execute("""
    INSERT INTO data_access_log (
        user_id, user_email, user_role, action, resource_type, details, ip_address
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        user_email.strip().lower() if user_email else None,
        user_role,
        action,
        resource_type,
        details_str,
        ip_address
    ))
    conn.commit()
    log_id = cursor.lastrowid
    conn.close()
    return log_id

def get_data_access_logs(limit: int = 50) -> list:
    """Retrieves recent security access logs."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM data_access_log
    ORDER BY created_at DESC
    LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for r in rows:
        details_parsed = {}
        try:
            if r["details"]:
                details_parsed = json.loads(r["details"])
        except Exception:
            details_parsed = r["details"]
        
        result.append({
            "id": r["id"],
            "user_id": r["user_id"],
            "user_email": r["user_email"],
            "user_role": r["user_role"],
            "action": r["action"],
            "resource_type": r["resource_type"],
            "details": details_parsed,
            "ip_address": r["ip_address"],
            "created_at": r["created_at"]
        })
    return result


