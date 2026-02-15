"""
═══════════════════════════════════════════════════════════════════════════
 ÖH WIRTSCHAFT - BACKEND API
 News & Admin System | Johannes Kepler Universität Linz
═══════════════════════════════════════════════════════════════════════════
"""

import os
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
from email.utils import formataddr
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from contextlib import contextmanager

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt

from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
import enum

# ─── CONFIGURATION ──────────────────────────────────────────────────────────
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./oeh_wirtschaft.db")
SECRET_KEY = os.environ.get("SECRET_KEY", "oeh-wirtschaft-super-secret-key-2024-jku")
MASTER_ADMIN_USERNAME = os.environ.get("MASTER_ADMIN_USERNAME", "masteradmin")
MASTER_ADMIN_PASSWORD = os.environ.get("MASTER_ADMIN_PASSWORD", "OeH_Wirtschaft_2024!")
MASTER_ADMIN_EMAIL = os.environ.get("MASTER_ADMIN_EMAIL", "master@oeh.jku.at")

# Port Configuration
INTERNAL_PORT = int(os.environ.get("BACKEND_INTERNAL_PORT", 8000))
EXTERNAL_PORT = int(os.environ.get("BACKEND_PORT", 8242))
BACKEND_HOST = os.environ.get("BACKEND_HOST", "localhost")

# SMTP Configuration
SMTP_HOST = os.environ.get("SMTP_HOST", "")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.environ.get("SMTP_FROM_EMAIL", "") or SMTP_USER  # Falls leer, nimm SMTP_USER
SMTP_FROM_NAME = os.environ.get("SMTP_FROM_NAME", "ÖH Wirtschaft JKU")
SMTP_USE_TLS = os.environ.get("SMTP_USE_TLS", "true").lower() == "true"

# Allowed Email Domains (comma-separated, e.g. "@students.jku.at,@jku.at")
ALLOWED_EMAIL_DOMAINS_RAW = os.environ.get("ALLOWED_EMAIL_DOMAINS", "@students.jku.at")
ALLOWED_EMAIL_DOMAINS = [d.strip() for d in ALLOWED_EMAIL_DOMAINS_RAW.split(",") if d.strip()]

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours

# ─── DATABASE SETUP ─────────────────────────────────────────────────────────
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# ─── ENUMS ──────────────────────────────────────────────────────────────────
class NewsPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class NewsColor(str, enum.Enum):
    BLUE = "blue"
    GOLD = "gold"
    GREEN = "green"
    RED = "red"
    PURPLE = "purple"
    SLATE = "slate"

class AdminRole(str, enum.Enum):
    MASTER = "master"
    ADMIN = "admin"
    EDITOR = "editor"

class EventColor(str, enum.Enum):
    BLUE = "blue"
    GOLD = "gold"
    GREEN = "green"
    RED = "red"
    PURPLE = "purple"
    PINK = "pink"
    TEAL = "teal"
    ORANGE = "orange"

# ─── DATABASE MODELS ────────────────────────────────────────────────────────
class Admin(Base):
    __tablename__ = "admins"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    display_name = Column(String(100), nullable=False)
    role = Column(SQLEnum(AdminRole), default=AdminRole.ADMIN)
    is_active = Column(Boolean, default=True)
    is_master = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_login = Column(DateTime, nullable=True)
    
    news_posts = relationship("News", back_populates="author")
    activity_logs = relationship("ActivityLog", back_populates="admin")

class News(Base):
    __tablename__ = "news"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    excerpt = Column(String(300), nullable=True)
    priority = Column(SQLEnum(NewsPriority), default=NewsPriority.MEDIUM)
    color = Column(SQLEnum(NewsColor), default=NewsColor.BLUE)
    is_published = Column(Boolean, default=False)
    is_pinned = Column(Boolean, default=False)
    views = Column(Integer, default=0)
    author_id = Column(Integer, ForeignKey("admins.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    published_at = Column(DateTime, nullable=True)
    
    author = relationship("Admin", back_populates="news_posts")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=False)
    action = Column(String(50), nullable=False)
    description = Column(String(500), nullable=False)
    target_type = Column(String(50), nullable=True)
    target_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    admin = relationship("Admin", back_populates="activity_logs")

class CalendarEvent(Base):
    __tablename__ = "calendar_events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    all_day = Column(Boolean, default=False)
    location = Column(String(200), nullable=True)
    color = Column(SQLEnum(EventColor), default=EventColor.BLUE)
    tags = Column(String(500), nullable=True)  # Comma-separated tags
    is_public = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("admins.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    creator = relationship("Admin")

# ─── STUDIENGANG MODELS ─────────────────────────────────────────────────────
class StudyCategory(Base):
    """Kategorien/Bereiche von Studiengängen (Bachelor, Master, MBA, ULG)"""
    __tablename__ = "study_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    display_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(20), default="blue")  # blue, gold, green, etc.
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    programs = relationship("StudyProgram", back_populates="category", cascade="all, delete-orphan")

class StudyProgram(Base):
    """Einzelne Studiengänge innerhalb einer Kategorie"""
    __tablename__ = "study_programs"
    
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("study_categories.id"), nullable=False)
    name = Column(String(200), nullable=False)
    short_name = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    category = relationship("StudyCategory", back_populates="programs")
    updates = relationship("StudyUpdate", back_populates="program", cascade="all, delete-orphan")

class StudyUpdate(Base):
    """Updates/News für einzelne Studiengänge"""
    __tablename__ = "study_updates"
    
    id = Column(Integer, primary_key=True, index=True)
    program_id = Column(Integer, ForeignKey("study_programs.id"), nullable=False)
    content = Column(Text, nullable=False)
    semester = Column(String(50), nullable=True)  # z.B. "Wintersemester 2025/26"
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_by = Column(Integer, ForeignKey("admins.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    program = relationship("StudyProgram", back_populates="updates")
    creator = relationship("Admin")

# ─── LVA (LEHRVERANSTALTUNG) MODELS ─────────────────────────────────────────
class LVA(Base):
    """Lehrveranstaltungen (Courses)"""
    __tablename__ = "lvas"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    ratings = relationship("LVARating", back_populates="lva", cascade="all, delete-orphan")

class LVARating(Base):
    """Bewertungen für LVAs"""
    __tablename__ = "lva_ratings"
    
    id = Column(Integer, primary_key=True, index=True)
    lva_id = Column(Integer, ForeignKey("lvas.id"), nullable=False)
    effort_rating = Column(Integer, nullable=False)  # 1-5 (Aufwand)
    difficulty_rating = Column(Integer, nullable=False)  # 1-5 (Schwierigkeit)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    lva = relationship("LVA", back_populates="ratings")

class VerificationCode(Base):
    """Verifizierungscodes für LVA-Bewertungen"""
    __tablename__ = "verification_codes"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(200), nullable=True)  # Nullable for admin-created codes
    code = Column(String(10), nullable=False)
    name = Column(String(100), nullable=True)  # Optional name/description for admin codes
    lva_id = Column(Integer, ForeignKey("lvas.id"), nullable=True)  # Nullable for universal codes
    is_used = Column(Boolean, default=False)
    max_uses = Column(Integer, default=1)  # How many times the code can be used
    use_count = Column(Integer, default=0)  # How many times it has been used
    is_admin_code = Column(Boolean, default=False)  # True if created by admin
    created_by_admin_id = Column(Integer, ForeignKey("admins.id"), nullable=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AppSettings(Base):
    """App-Einstellungen (z.B. Kontakt-E-Mail-Empfänger)"""
    __tablename__ = "app_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

# ─── PYDANTIC SCHEMAS ───────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    admin: dict

class AdminCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    display_name: str
    role: AdminRole = AdminRole.ADMIN

class AdminUpdate(BaseModel):
    email: Optional[EmailStr] = None
    display_name: Optional[str] = None
    role: Optional[AdminRole] = None
    is_active: Optional[bool] = None

class AdminResponse(BaseModel):
    id: int
    username: str
    email: str
    display_name: str
    role: str
    is_active: bool
    is_master: bool
    created_at: datetime
    last_login: Optional[datetime]

class NewsCreate(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    priority: NewsPriority = NewsPriority.MEDIUM
    color: NewsColor = NewsColor.BLUE
    is_published: bool = False
    is_pinned: bool = False

class NewsUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    priority: Optional[NewsPriority] = None
    color: Optional[NewsColor] = None
    is_published: Optional[bool] = None
    is_pinned: Optional[bool] = None

class NewsResponse(BaseModel):
    id: int
    title: str
    content: str
    excerpt: Optional[str]
    priority: str
    color: str
    is_published: bool
    is_pinned: bool
    views: int
    author_id: int
    author_name: str
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]

class StatsResponse(BaseModel):
    total_news: int
    published_news: int
    draft_news: int
    total_views: int
    total_admins: int
    active_admins: int
    news_by_priority: dict
    recent_activity: list

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    bereich: str = ""
    subject: Optional[str] = ""
    message: str

# Study Program Schemas
class StudyCategoryCreate(BaseModel):
    name: str
    display_name: str
    description: Optional[str] = None
    color: str = "blue"
    sort_order: int = 0

class StudyCategoryUpdate(BaseModel):
    name: Optional[str] = None
    display_name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    sort_order: Optional[int] = None

class StudyProgramCreate(BaseModel):
    category_id: int
    name: str
    short_name: Optional[str] = None
    description: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True

class StudyProgramUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = None
    short_name: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

class StudyUpdateCreate(BaseModel):
    program_id: int
    content: str
    semester: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0

class StudyUpdateUpdate(BaseModel):
    program_id: Optional[int] = None
    content: Optional[str] = None
    semester: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

# LVA Schemas
class LVACreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class LVAUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class LVAResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_active: bool
    rating_count: int
    avg_effort: Optional[float]
    avg_difficulty: Optional[float]
    avg_total: Optional[float]
    effort_text: Optional[str]
    effort_color: Optional[str]
    difficulty_text: Optional[str]
    difficulty_color: Optional[str]
    total_text: Optional[str]
    total_color: Optional[str]

class RequestCodeRequest(BaseModel):
    email: EmailStr
    lva_id: int

class VerifyCodeRequest(BaseModel):
    email: Optional[str] = None  # Optional for admin codes
    code: str
    lva_id: int

class SubmitRatingRequest(BaseModel):
    email: Optional[str] = None  # Optional for admin codes
    code: str
    lva_id: int
    effort_rating: int
    difficulty_rating: int

# Calendar Event Schemas
class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    all_day: bool = False
    location: Optional[str] = None
    color: EventColor = EventColor.BLUE
    tags: Optional[str] = None
    is_public: bool = True

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    all_day: Optional[bool] = None
    location: Optional[str] = None
    color: Optional[EventColor] = None
    tags: Optional[str] = None
    is_public: Optional[bool] = None

class EventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    start_date: datetime
    end_date: Optional[datetime]
    all_day: bool
    location: Optional[str]
    color: str
    tags: Optional[str]
    is_public: bool
    created_by: int
    creator_name: str
    created_at: datetime
    updated_at: datetime

# ─── FASTAPI APP ────────────────────────────────────────────────────────────
app = FastAPI(title="ÖH Wirtschaft API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://oehwirtschaft.at",
        "https://www.oehwirtschaft.at",
        "https://api.oehwirtschaft.at",
        "http://localhost:1237",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ─── DATABASE DEPENDENCY ────────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ─── AUTO-MIGRATION FOR NEW COLUMNS (PostgreSQL only) ───────────────────────
def run_migrations():
    """Automatically add new columns to existing tables - PostgreSQL only"""
    from sqlalchemy import text
    
    # Only run migrations for PostgreSQL
    if 'postgresql' not in DATABASE_URL:
        print("ℹ️ Migrations skipped (SQLite mode)")
        return
    
    print("🔄 Running PostgreSQL migrations...")
    
    migrations = [
        # Add new columns
        "ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT 1",
        "ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS use_count INTEGER DEFAULT 0",
        "ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS is_admin_code BOOLEAN DEFAULT FALSE",
        "ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS created_by_admin_id INTEGER",
        "ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS name VARCHAR(100)",
        # Allow NULL for email and lva_id (needed for admin codes)
        "ALTER TABLE verification_codes ALTER COLUMN email DROP NOT NULL",
        "ALTER TABLE verification_codes ALTER COLUMN lva_id DROP NOT NULL",
    ]
    
    with engine.connect() as conn:
        for migration in migrations:
            try:
                conn.execute(text(migration))
                conn.commit()
            except Exception as e:
                # Column might already exist or constraint already dropped
                pass
    
    print("✅ Migrations completed")

# ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    admin = db.query(Admin).filter(Admin.username == username).first()
    if admin is None:
        raise credentials_exception
    if not admin.is_active:
        raise HTTPException(status_code=403, detail="Admin account is deactivated")
    return admin

def log_activity(db: Session, admin_id: int, action: str, description: str, target_type: str = None, target_id: int = None):
    log = ActivityLog(
        admin_id=admin_id,
        action=action,
        description=description,
        target_type=target_type,
        target_id=target_id
    )
    db.add(log)
    db.commit()

def ensure_master_admin(db: Session):
    """Ensure master admin exists and is synced with ENV variables"""
    master = db.query(Admin).filter(Admin.is_master == True).first()
    
    if master:
        # Update existing master admin with ENV values
        master.username = MASTER_ADMIN_USERNAME
        master.email = MASTER_ADMIN_EMAIL
        master.hashed_password = get_password_hash(MASTER_ADMIN_PASSWORD)
        db.commit()
        print(f"✅ Master admin updated: {MASTER_ADMIN_USERNAME}")
    else:
        # Create new master admin
        master = Admin(
            username=MASTER_ADMIN_USERNAME,
            email=MASTER_ADMIN_EMAIL,
            hashed_password=get_password_hash(MASTER_ADMIN_PASSWORD),
            display_name="Master Administrator",
            role=AdminRole.MASTER,
            is_master=True,
            is_active=True
        )
        db.add(master)
        db.commit()
        print(f"✅ Master admin created: {MASTER_ADMIN_USERNAME}")
    return master

# ─── STARTUP EVENT ──────────────────────────────────────────────────────────
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    run_migrations()  # Auto-add new columns to existing tables
    db = SessionLocal()
    try:
        ensure_master_admin(db)
        seed_study_data(db)
        seed_lvas(db)  # Auto-seed LVAs beim ersten Start
    finally:
        db.close()
    print("═" * 50)
    print("🚀 ÖH Wirtschaft API started!")
    print(f"   Internal Port: {INTERNAL_PORT}")
    print(f"   External Port: {EXTERNAL_PORT}")
    print(f"   Host: {BACKEND_HOST}")
    print("═" * 50)

# ─── HEALTH CHECK ───────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}

# ─── AUTH ENDPOINTS ─────────────────────────────────────────────────────────
@app.post("/api/auth/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Login mit Username ODER Email möglich
    admin = db.query(Admin).filter(
        (Admin.username == request.username) | (Admin.email == request.username)
    ).first()
    
    if not admin or not verify_password(request.password, admin.hashed_password):
        raise HTTPException(status_code=401, detail="Ungültige Anmeldedaten")
    
    if not admin.is_active:
        raise HTTPException(status_code=403, detail="Account ist deaktiviert")
    
    # Update last login
    admin.last_login = datetime.now(timezone.utc)
    db.commit()
    
    # Log activity
    log_activity(db, admin.id, "LOGIN", f"{admin.display_name} hat sich angemeldet")
    
    access_token = create_access_token(data={"sub": admin.username})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "admin": {
            "id": admin.id,
            "username": admin.username,
            "email": admin.email,
            "display_name": admin.display_name,
            "role": admin.role.value,
            "is_master": admin.is_master
        }
    }

@app.get("/api/auth/me")
def get_me(current_admin: Admin = Depends(get_current_admin)):
    return {
        "id": current_admin.id,
        "username": current_admin.username,
        "email": current_admin.email,
        "display_name": current_admin.display_name,
        "role": current_admin.role.value,
        "is_master": current_admin.is_master
    }

@app.post("/api/auth/change-password")
def change_password(request: PasswordChange, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    # Master-Admin darf sein Passwort nicht über das Admin-Panel ändern
    if current_admin.is_master:
        raise HTTPException(
            status_code=403, 
            detail="Der Master admin ist nicht befugt sein Passwort zu ändern. Verwaltung liegt bei Astra Capital e.U."
        )
    
    if not verify_password(request.current_password, current_admin.hashed_password):
        raise HTTPException(status_code=400, detail="Aktuelles Passwort ist falsch")
    
    current_admin.hashed_password = get_password_hash(request.new_password)
    db.commit()
    
    log_activity(db, current_admin.id, "PASSWORD_CHANGE", f"{current_admin.display_name} hat das Passwort geändert")
    
    return {"message": "Passwort erfolgreich geändert"}

# ─── ADMIN MANAGEMENT ENDPOINTS ─────────────────────────────────────────────
@app.get("/api/admins", response_model=List[AdminResponse])
def get_admins(current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    if current_admin.role not in [AdminRole.MASTER, AdminRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    admins = db.query(Admin).all()
    return [AdminResponse(
        id=a.id,
        username=a.username,
        email=a.email,
        display_name=a.display_name,
        role=a.role.value,
        is_active=a.is_active,
        is_master=a.is_master,
        created_at=a.created_at,
        last_login=a.last_login
    ) for a in admins]

@app.post("/api/admins", response_model=AdminResponse)
def create_admin(request: AdminCreate, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    if current_admin.role != AdminRole.MASTER:
        raise HTTPException(status_code=403, detail="Nur Master-Admin kann Admins erstellen")
    
    # Check if username or email exists
    if db.query(Admin).filter(Admin.username == request.username).first():
        raise HTTPException(status_code=400, detail="Benutzername bereits vergeben")
    if db.query(Admin).filter(Admin.email == request.email).first():
        raise HTTPException(status_code=400, detail="E-Mail bereits vergeben")
    
    admin = Admin(
        username=request.username,
        email=request.email,
        hashed_password=get_password_hash(request.password),
        display_name=request.display_name,
        role=request.role,
        is_master=False
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    log_activity(db, current_admin.id, "ADMIN_CREATE", f"Admin '{admin.display_name}' erstellt", "admin", admin.id)
    
    return AdminResponse(
        id=admin.id,
        username=admin.username,
        email=admin.email,
        display_name=admin.display_name,
        role=admin.role.value,
        is_active=admin.is_active,
        is_master=admin.is_master,
        created_at=admin.created_at,
        last_login=admin.last_login
    )

@app.put("/api/admins/{admin_id}", response_model=AdminResponse)
def update_admin(admin_id: int, request: AdminUpdate, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin nicht gefunden")
    
    # Only master can edit other admins
    if current_admin.role != AdminRole.MASTER and current_admin.id != admin_id:
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    # Cannot deactivate master admin
    if admin.is_master and request.is_active == False:
        raise HTTPException(status_code=400, detail="Master-Admin kann nicht deaktiviert werden")
    
    if request.email is not None:
        admin.email = request.email
    if request.display_name is not None:
        admin.display_name = request.display_name
    if request.role is not None and current_admin.role == AdminRole.MASTER and not admin.is_master:
        admin.role = request.role
    if request.is_active is not None and current_admin.role == AdminRole.MASTER and not admin.is_master:
        admin.is_active = request.is_active
    
    db.commit()
    db.refresh(admin)
    
    log_activity(db, current_admin.id, "ADMIN_UPDATE", f"Admin '{admin.display_name}' aktualisiert", "admin", admin.id)
    
    return AdminResponse(
        id=admin.id,
        username=admin.username,
        email=admin.email,
        display_name=admin.display_name,
        role=admin.role.value,
        is_active=admin.is_active,
        is_master=admin.is_master,
        created_at=admin.created_at,
        last_login=admin.last_login
    )

@app.delete("/api/admins/{admin_id}")
def delete_admin(admin_id: int, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    if current_admin.role != AdminRole.MASTER:
        raise HTTPException(status_code=403, detail="Nur Master-Admin kann Admins löschen")
    
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin nicht gefunden")
    
    if admin.is_master:
        raise HTTPException(status_code=400, detail="Master-Admin kann nicht gelöscht werden")
    
    display_name = admin.display_name
    db.delete(admin)
    db.commit()
    
    log_activity(db, current_admin.id, "ADMIN_DELETE", f"Admin '{display_name}' gelöscht")
    
    return {"message": "Admin erfolgreich gelöscht"}

# ─── CONTACT ENDPOINT ────────────────────────────────────────────────────────
def send_contact_email(to_email: str, form: ContactForm) -> bool:
    """Send contact form via SMTP"""
    if not all([SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL]):
        print("⚠️ SMTP not configured - contact form not sent")
        return False
    
    try:
        msg = MIMEMultipart('alternative')
        bereich_prefix = f'[{form.bereich}] ' if form.bereich else ''
        msg['Subject'] = Header(f'{bereich_prefix}{form.subject or "Neue Nachricht"}', 'utf-8')
        msg['From'] = formataddr((str(Header(SMTP_FROM_NAME, 'utf-8')), SMTP_FROM_EMAIL))
        msg['To'] = to_email
        msg['Reply-To'] = form.email
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center; }}
                .header h1 {{ color: white; margin: 0; font-size: 24px; }}
                .header p {{ color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 14px; }}
                .content {{ padding: 30px; }}
                .field {{ margin-bottom: 20px; }}
                .field-label {{ font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }}
                .field-value {{ font-size: 15px; color: #1e293b; background: #f8fafc; padding: 12px 16px; border-radius: 8px; border-left: 3px solid #3b82f6; }}
                .message-box {{ background: #f1f5f9; padding: 20px; border-radius: 12px; margin-top: 20px; }}
                .message-box p {{ margin: 0; color: #334155; line-height: 1.6; white-space: pre-wrap; }}
                .footer {{ background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }}
                .footer p {{ color: #64748b; font-size: 12px; margin: 5px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📬 Neue Kontaktanfrage</h1>
                    <p>ÖH Wirtschaft Kontaktformular</p>
                </div>
                <div class="content">
                    <div class="field">
                        <div class="field-label">Name</div>
                        <div class="field-value">{form.name}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">E-Mail</div>
                        <div class="field-value"><a href="mailto:{form.email}" style="color: #3b82f6; text-decoration: none;">{form.email}</a></div>
                    </div>
                    <div class="field">
                        <div class="field-label">Bereich</div>
                        <div class="field-value">{form.bereich or 'Nicht angegeben'}</div>
                    </div>
                    <div class="field">
                        <div class="field-label">Betreff</div>
                        <div class="field-value">{form.subject or 'Kein Betreff angegeben'}</div>
                    </div>
                    <div class="message-box">
                        <div class="field-label" style="margin-bottom: 10px;">Nachricht</div>
                        <p>{form.message}</p>
                    </div>
                </div>
                <div class="footer">
                    <p>Diese E-Mail wurde automatisch generiert.</p>
                    <p>Du kannst direkt auf diese E-Mail antworten, um {form.name} zu kontaktieren.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
Neue Kontaktanfrage über das ÖH Wirtschaft Kontaktformular

Name: {form.name}
E-Mail: {form.email}
Bereich: {form.bereich or 'Nicht angegeben'}
Betreff: {form.subject or 'Kein Betreff'}

Nachricht:
{form.message}

---
Diese E-Mail wurde automatisch generiert.
Antworten Sie direkt auf diese E-Mail, um {form.name} zu kontaktieren.
        """
        
        part1 = MIMEText(text_content, 'plain', 'utf-8')
        part2 = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(part1)
        msg.attach(part2)
        
        if SMTP_USE_TLS:
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10)
            server.starttls()
        else:
            server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=10)
        
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_FROM_EMAIL, to_email, msg.as_string())
        server.quit()
        
        print(f"✅ Contact email sent to {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send contact email: {e}")
        return False

@app.post("/api/contact")
def send_contact_message(form: ContactForm, db: Session = Depends(get_db)):
    """Receive contact form submission and send email to all recipients"""
    # Get contact email recipients from settings (comma-separated)
    setting = db.query(AppSettings).filter(AppSettings.key == "contact_emails").first()
    recipient_emails = []
    if setting and setting.value:
        recipient_emails = [e.strip() for e in setting.value.split(',') if e.strip()]
    
    emails_sent = 0
    if recipient_emails:
        for recipient in recipient_emails:
            if send_contact_email(recipient, form):
                emails_sent += 1
    
    # Log to console (Activity log requires admin_id which we don't have for public contact form)
    print(f"📬 Kontaktanfrage von {form.name} ({form.email}): [{form.bereich}] {form.subject or 'Kein Betreff'} - E-Mails gesendet: {emails_sent}/{len(recipient_emails)}")
    
    return {
        "success": True,
        "message": "Nachricht erfolgreich gesendet" if emails_sent > 0 else "Nachricht wurde empfangen",
        "email_sent": emails_sent > 0,
        "recipients_count": emails_sent
    }

# ─── NEWS ENDPOINTS ─────────────────────────────────────────────────────────
@app.get("/api/news", response_model=List[NewsResponse])
def get_news(published_only: bool = True, db: Session = Depends(get_db)):
    """Get news - public endpoint for published news"""
    query = db.query(News)
    if published_only:
        query = query.filter(News.is_published == True)
    
    news_list = query.order_by(News.is_pinned.desc(), News.published_at.desc().nullsfirst(), News.created_at.desc()).all()
    
    return [NewsResponse(
        id=n.id,
        title=n.title,
        content=n.content,
        excerpt=n.excerpt,
        priority=n.priority.value,
        color=n.color.value,
        is_published=n.is_published,
        is_pinned=n.is_pinned,
        views=n.views,
        author_id=n.author_id,
        author_name=n.author.display_name if n.author else "Unbekannt",
        created_at=n.created_at,
        updated_at=n.updated_at,
        published_at=n.published_at
    ) for n in news_list]

@app.get("/api/news/all", response_model=List[NewsResponse])
def get_all_news(current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Get all news including drafts - admin only"""
    news_list = db.query(News).order_by(News.created_at.desc()).all()
    
    return [NewsResponse(
        id=n.id,
        title=n.title,
        content=n.content,
        excerpt=n.excerpt,
        priority=n.priority.value,
        color=n.color.value,
        is_published=n.is_published,
        is_pinned=n.is_pinned,
        views=n.views,
        author_id=n.author_id,
        author_name=n.author.display_name if n.author else "Unbekannt",
        created_at=n.created_at,
        updated_at=n.updated_at,
        published_at=n.published_at
    ) for n in news_list]

@app.get("/api/news/{news_id}", response_model=NewsResponse)
def get_news_by_id(news_id: int, db: Session = Depends(get_db)):
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News nicht gefunden")
    
    # Increment views
    news.views += 1
    db.commit()
    
    return NewsResponse(
        id=news.id,
        title=news.title,
        content=news.content,
        excerpt=news.excerpt,
        priority=news.priority.value,
        color=news.color.value,
        is_published=news.is_published,
        is_pinned=news.is_pinned,
        views=news.views,
        author_id=news.author_id,
        author_name=news.author.display_name if news.author else "Unbekannt",
        created_at=news.created_at,
        updated_at=news.updated_at,
        published_at=news.published_at
    )

@app.post("/api/news", response_model=NewsResponse)
def create_news(request: NewsCreate, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    news = News(
        title=request.title,
        content=request.content,
        excerpt=request.excerpt or request.content[:200] + "..." if len(request.content) > 200 else request.content,
        priority=request.priority,
        color=request.color,
        is_published=request.is_published,
        is_pinned=request.is_pinned,
        author_id=current_admin.id,
        published_at=datetime.now(timezone.utc) if request.is_published else None
    )
    db.add(news)
    db.commit()
    db.refresh(news)
    
    log_activity(db, current_admin.id, "NEWS_CREATE", f"News '{news.title}' erstellt", "news", news.id)
    
    return NewsResponse(
        id=news.id,
        title=news.title,
        content=news.content,
        excerpt=news.excerpt,
        priority=news.priority.value,
        color=news.color.value,
        is_published=news.is_published,
        is_pinned=news.is_pinned,
        views=news.views,
        author_id=news.author_id,
        author_name=current_admin.display_name,
        created_at=news.created_at,
        updated_at=news.updated_at,
        published_at=news.published_at
    )

@app.put("/api/news/{news_id}", response_model=NewsResponse)
def update_news(news_id: int, request: NewsUpdate, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News nicht gefunden")
    
    # Only author or master can edit
    if news.author_id != current_admin.id and current_admin.role != AdminRole.MASTER:
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    if request.title is not None:
        news.title = request.title
    if request.content is not None:
        news.content = request.content
    if request.excerpt is not None:
        news.excerpt = request.excerpt
    if request.priority is not None:
        news.priority = request.priority
    if request.color is not None:
        news.color = request.color
    if request.is_published is not None:
        news.is_published = request.is_published
        if request.is_published and not news.published_at:
            news.published_at = datetime.now(timezone.utc)
    if request.is_pinned is not None:
        news.is_pinned = request.is_pinned
    
    db.commit()
    db.refresh(news)
    
    log_activity(db, current_admin.id, "NEWS_UPDATE", f"News '{news.title}' aktualisiert", "news", news.id)
    
    return NewsResponse(
        id=news.id,
        title=news.title,
        content=news.content,
        excerpt=news.excerpt,
        priority=news.priority.value,
        color=news.color.value,
        is_published=news.is_published,
        is_pinned=news.is_pinned,
        views=news.views,
        author_id=news.author_id,
        author_name=news.author.display_name if news.author else "Unbekannt",
        created_at=news.created_at,
        updated_at=news.updated_at,
        published_at=news.published_at
    )

@app.delete("/api/news/{news_id}")
def delete_news(news_id: int, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News nicht gefunden")
    
    # Only author or master can delete
    if news.author_id != current_admin.id and current_admin.role != AdminRole.MASTER:
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    title = news.title
    db.delete(news)
    db.commit()
    
    log_activity(db, current_admin.id, "NEWS_DELETE", f"News '{title}' gelöscht")
    
    return {"message": "News erfolgreich gelöscht"}

# ─── STATS ENDPOINT ─────────────────────────────────────────────────────────
@app.get("/api/stats", response_model=StatsResponse)
def get_stats(current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    total_news = db.query(News).count()
    published_news = db.query(News).filter(News.is_published == True).count()
    draft_news = total_news - published_news
    
    # Sum all views
    from sqlalchemy import func
    total_views = db.query(func.sum(News.views)).scalar() or 0
    
    total_admins = db.query(Admin).count()
    active_admins = db.query(Admin).filter(Admin.is_active == True).count()
    
    # News by priority
    news_by_priority = {
        "low": db.query(News).filter(News.priority == NewsPriority.LOW).count(),
        "medium": db.query(News).filter(News.priority == NewsPriority.MEDIUM).count(),
        "high": db.query(News).filter(News.priority == NewsPriority.HIGH).count(),
        "urgent": db.query(News).filter(News.priority == NewsPriority.URGENT).count(),
    }
    
    # Recent activity
    recent_logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(10).all()
    recent_activity = [
        {
            "id": log.id,
            "action": log.action,
            "description": log.description,
            "admin_name": log.admin.display_name if log.admin else "System",
            "created_at": log.created_at.isoformat()
        }
        for log in recent_logs
    ]
    
    return StatsResponse(
        total_news=total_news,
        published_news=published_news,
        draft_news=draft_news,
        total_views=total_views,
        total_admins=total_admins,
        active_admins=active_admins,
        news_by_priority=news_by_priority,
        recent_activity=recent_activity
    )

# ─── ACTIVITY LOG ENDPOINT ──────────────────────────────────────────────────
@app.get("/api/activity")
def get_activity_logs(limit: int = 50, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    if current_admin.role not in [AdminRole.MASTER, AdminRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": log.id,
            "action": log.action,
            "description": log.description,
            "target_type": log.target_type,
            "target_id": log.target_id,
            "admin_name": log.admin.display_name if log.admin else "System",
            "created_at": log.created_at.isoformat()
        }
        for log in logs
    ]

# ─── CALENDAR EVENT ENDPOINTS ───────────────────────────────────────────────
@app.get("/api/events")
def get_events(
    month: Optional[int] = None, 
    year: Optional[int] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all public events with optional filters"""
    query = db.query(CalendarEvent).filter(CalendarEvent.is_public == True)
    
    # Filter by month/year
    if month and year:
        start = datetime(year, month, 1, tzinfo=timezone.utc)
        if month == 12:
            end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            end = datetime(year, month + 1, 1, tzinfo=timezone.utc)
        query = query.filter(CalendarEvent.start_date >= start, CalendarEvent.start_date < end)
    elif year:
        start = datetime(year, 1, 1, tzinfo=timezone.utc)
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
        query = query.filter(CalendarEvent.start_date >= start, CalendarEvent.start_date < end)
    
    # Filter by tag
    if tag:
        query = query.filter(CalendarEvent.tags.ilike(f"%{tag}%"))
    
    # Search in title/description
    if search:
        query = query.filter(
            (CalendarEvent.title.ilike(f"%{search}%")) | 
            (CalendarEvent.description.ilike(f"%{search}%"))
        )
    
    events = query.order_by(CalendarEvent.start_date.asc()).all()
    
    return [
        {
            "id": e.id,
            "title": e.title,
            "description": e.description,
            "start_date": e.start_date.isoformat(),
            "end_date": e.end_date.isoformat() if e.end_date else None,
            "all_day": e.all_day,
            "location": e.location,
            "color": e.color.value,
            "tags": e.tags,
            "is_public": e.is_public,
            "created_by": e.created_by,
            "creator_name": e.creator.display_name if e.creator else "Unbekannt",
            "created_at": e.created_at.isoformat(),
            "updated_at": e.updated_at.isoformat()
        }
        for e in events
    ]

@app.get("/api/events/tags")
def get_event_tags(db: Session = Depends(get_db)):
    """Get all unique tags from events"""
    events = db.query(CalendarEvent).filter(CalendarEvent.tags != None, CalendarEvent.tags != "").all()
    all_tags = set()
    for e in events:
        if e.tags:
            for tag in e.tags.split(","):
                all_tags.add(tag.strip())
    return sorted(list(all_tags))

@app.get("/api/events/{event_id}")
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event nicht gefunden")
    
    return {
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "start_date": event.start_date.isoformat(),
        "end_date": event.end_date.isoformat() if event.end_date else None,
        "all_day": event.all_day,
        "location": event.location,
        "color": event.color.value,
        "tags": event.tags,
        "is_public": event.is_public,
        "created_by": event.created_by,
        "creator_name": event.creator.display_name if event.creator else "Unbekannt",
        "created_at": event.created_at.isoformat(),
        "updated_at": event.updated_at.isoformat()
    }

# ─── ADMIN CALENDAR ENDPOINTS ───────────────────────────────────────────────
@app.get("/api/admin/events")
def get_all_events_admin(current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Get all events (including non-public) for admin"""
    events = db.query(CalendarEvent).order_by(CalendarEvent.start_date.desc()).all()
    
    return [
        {
            "id": e.id,
            "title": e.title,
            "description": e.description,
            "start_date": e.start_date.isoformat(),
            "end_date": e.end_date.isoformat() if e.end_date else None,
            "all_day": e.all_day,
            "location": e.location,
            "color": e.color.value,
            "tags": e.tags,
            "is_public": e.is_public,
            "created_by": e.created_by,
            "creator_name": e.creator.display_name if e.creator else "Unbekannt",
            "created_at": e.created_at.isoformat(),
            "updated_at": e.updated_at.isoformat()
        }
        for e in events
    ]

@app.post("/api/admin/events", response_model=EventResponse)
def create_event(request: EventCreate, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    event = CalendarEvent(
        title=request.title,
        description=request.description,
        start_date=request.start_date,
        end_date=request.end_date,
        all_day=request.all_day,
        location=request.location,
        color=request.color,
        tags=request.tags,
        is_public=request.is_public,
        created_by=current_admin.id
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    
    log_activity(db, current_admin.id, "EVENT_CREATE", f"Event '{event.title}' erstellt", "event", event.id)
    
    return EventResponse(
        id=event.id,
        title=event.title,
        description=event.description,
        start_date=event.start_date,
        end_date=event.end_date,
        all_day=event.all_day,
        location=event.location,
        color=event.color.value,
        tags=event.tags,
        is_public=event.is_public,
        created_by=event.created_by,
        creator_name=current_admin.display_name,
        created_at=event.created_at,
        updated_at=event.updated_at
    )

@app.put("/api/admin/events/{event_id}", response_model=EventResponse)
def update_event(event_id: int, request: EventUpdate, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event nicht gefunden")
    
    # Only creator or master can edit
    if event.created_by != current_admin.id and current_admin.role != AdminRole.MASTER:
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    update_data = request.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(event, key, value)
    
    db.commit()
    db.refresh(event)
    
    log_activity(db, current_admin.id, "EVENT_UPDATE", f"Event '{event.title}' aktualisiert", "event", event.id)
    
    return EventResponse(
        id=event.id,
        title=event.title,
        description=event.description,
        start_date=event.start_date,
        end_date=event.end_date,
        all_day=event.all_day,
        location=event.location,
        color=event.color.value,
        tags=event.tags,
        is_public=event.is_public,
        created_by=event.created_by,
        creator_name=event.creator.display_name if event.creator else "Unbekannt",
        created_at=event.created_at,
        updated_at=event.updated_at
    )

@app.delete("/api/admin/events/{event_id}")
def delete_event(event_id: int, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event nicht gefunden")
    
    # Only creator or master can delete
    if event.created_by != current_admin.id and current_admin.role != AdminRole.MASTER:
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    
    title = event.title
    db.delete(event)
    db.commit()
    
    log_activity(db, current_admin.id, "EVENT_DELETE", f"Event '{title}' gelöscht")
    
    return {"message": "Event erfolgreich gelöscht"}

# ═══════════════════════════════════════════════════════════════════════════
# STUDIENGANG-UPDATES (SGU) ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

# ─── PUBLIC: Studiengänge und Updates abrufen ───────────────────────────────
@app.get("/api/study/categories")
def get_study_categories(db: Session = Depends(get_db)):
    """Alle Kategorien mit Studiengängen abrufen (öffentlich)"""
    categories = db.query(StudyCategory).order_by(StudyCategory.sort_order, StudyCategory.name).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "display_name": c.display_name,
            "description": c.description,
            "color": c.color,
            "sort_order": c.sort_order,
            "programs": [
                {
                    "id": p.id,
                    "name": p.name,
                    "short_name": p.short_name,
                    "description": p.description,
                    "sort_order": p.sort_order,
                    "is_active": p.is_active
                }
                for p in sorted(c.programs, key=lambda x: (x.sort_order, x.name))
                if p.is_active
            ]
        }
        for c in categories
    ]

@app.get("/api/study/programs")
def get_study_programs(category_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Alle Studiengänge abrufen (optional nach Kategorie gefiltert)"""
    query = db.query(StudyProgram).filter(StudyProgram.is_active == True)
    if category_id:
        query = query.filter(StudyProgram.category_id == category_id)
    programs = query.order_by(StudyProgram.sort_order, StudyProgram.name).all()
    return [
        {
            "id": p.id,
            "category_id": p.category_id,
            "category_name": p.category.display_name if p.category else None,
            "name": p.name,
            "short_name": p.short_name,
            "description": p.description,
            "sort_order": p.sort_order
        }
        for p in programs
    ]

@app.get("/api/study/updates")
def get_study_updates(program_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Alle aktiven Updates abrufen (öffentlich)"""
    query = db.query(StudyUpdate).filter(StudyUpdate.is_active == True)
    if program_id:
        query = query.filter(StudyUpdate.program_id == program_id)
    updates = query.order_by(StudyUpdate.sort_order, StudyUpdate.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "program_id": u.program_id,
            "program_name": u.program.name if u.program else None,
            "category_name": u.program.category.display_name if u.program and u.program.category else None,
            "content": u.content,
            "semester": u.semester,
            "is_active": u.is_active,
            "sort_order": u.sort_order,
            "created_at": u.created_at.isoformat(),
            "updated_at": u.updated_at.isoformat()
        }
        for u in updates
    ]

@app.get("/api/study/updates/grouped")
def get_study_updates_grouped(db: Session = Depends(get_db)):
    """Updates nach Studiengang gruppiert (für Frontend Studium-Seite)"""
    programs = db.query(StudyProgram).filter(StudyProgram.is_active == True).all()
    result = []
    for p in programs:
        active_updates = [u for u in p.updates if u.is_active]
        if active_updates:
            result.append({
                "program_id": p.id,
                "program_name": p.name,
                "category_name": p.category.display_name if p.category else None,
                "updates": [
                    {
                        "id": u.id,
                        "content": u.content,
                        "semester": u.semester,
                        "sort_order": u.sort_order
                    }
                    for u in sorted(active_updates, key=lambda x: (x.sort_order, -x.id))
                ]
            })
    return sorted(result, key=lambda x: x["program_name"])

# ─── ADMIN: Kategorien verwalten ────────────────────────────────────────────
@app.get("/api/admin/study/categories")
def admin_get_categories(current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Alle Kategorien mit allen Infos (Admin)"""
    categories = db.query(StudyCategory).order_by(StudyCategory.sort_order, StudyCategory.name).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "display_name": c.display_name,
            "description": c.description,
            "color": c.color,
            "sort_order": c.sort_order,
            "program_count": len(c.programs),
            "created_at": c.created_at.isoformat()
        }
        for c in categories
    ]

@app.post("/api/admin/study/categories")
def admin_create_category(request: StudyCategoryCreate, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Neue Kategorie erstellen"""
    if db.query(StudyCategory).filter(StudyCategory.name == request.name).first():
        raise HTTPException(status_code=400, detail="Kategorie mit diesem Namen existiert bereits")
    
    category = StudyCategory(
        name=request.name,
        display_name=request.display_name,
        description=request.description,
        color=request.color,
        sort_order=request.sort_order
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    
    log_activity(db, current_admin.id, "CATEGORY_CREATE", f"Kategorie '{category.display_name}' erstellt", "study_category", category.id)
    
    return {"id": category.id, "message": "Kategorie erstellt"}

@app.put("/api/admin/study/categories/{category_id}")
def admin_update_category(category_id: int, request: StudyCategoryUpdate, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Kategorie aktualisieren"""
    category = db.query(StudyCategory).filter(StudyCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Kategorie nicht gefunden")
    
    update_data = request.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(category, key, value)
    
    db.commit()
    log_activity(db, current_admin.id, "CATEGORY_UPDATE", f"Kategorie '{category.display_name}' aktualisiert", "study_category", category.id)
    
    return {"message": "Kategorie aktualisiert"}

@app.delete("/api/admin/study/categories/{category_id}")
def admin_delete_category(category_id: int, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Kategorie löschen (inkl. aller Studiengänge und Updates)"""
    category = db.query(StudyCategory).filter(StudyCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Kategorie nicht gefunden")
    
    display_name = category.display_name
    db.delete(category)
    db.commit()
    
    log_activity(db, current_admin.id, "CATEGORY_DELETE", f"Kategorie '{display_name}' gelöscht")
    
    return {"message": "Kategorie gelöscht"}

# ─── ADMIN: Studiengänge verwalten ──────────────────────────────────────────
@app.get("/api/admin/study/programs")
def admin_get_programs(current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Alle Studiengänge (Admin)"""
    programs = db.query(StudyProgram).order_by(StudyProgram.category_id, StudyProgram.sort_order, StudyProgram.name).all()
    return [
        {
            "id": p.id,
            "category_id": p.category_id,
            "category_name": p.category.display_name if p.category else None,
            "name": p.name,
            "short_name": p.short_name,
            "description": p.description,
            "sort_order": p.sort_order,
            "is_active": p.is_active,
            "update_count": len([u for u in p.updates if u.is_active]),
            "created_at": p.created_at.isoformat()
        }
        for p in programs
    ]

@app.post("/api/admin/study/programs")
def admin_create_program(request: StudyProgramCreate, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Neuen Studiengang erstellen"""
    if not db.query(StudyCategory).filter(StudyCategory.id == request.category_id).first():
        raise HTTPException(status_code=400, detail="Kategorie nicht gefunden")
    
    program = StudyProgram(
        category_id=request.category_id,
        name=request.name,
        short_name=request.short_name,
        description=request.description,
        sort_order=request.sort_order,
        is_active=request.is_active
    )
    db.add(program)
    db.commit()
    db.refresh(program)
    
    log_activity(db, current_admin.id, "PROGRAM_CREATE", f"Studiengang '{program.name}' erstellt", "study_program", program.id)
    
    return {"id": program.id, "message": "Studiengang erstellt"}

@app.put("/api/admin/study/programs/{program_id}")
def admin_update_program(program_id: int, request: StudyProgramUpdate, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Studiengang aktualisieren"""
    program = db.query(StudyProgram).filter(StudyProgram.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Studiengang nicht gefunden")
    
    update_data = request.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(program, key, value)
    
    db.commit()
    log_activity(db, current_admin.id, "PROGRAM_UPDATE", f"Studiengang '{program.name}' aktualisiert", "study_program", program.id)
    
    return {"message": "Studiengang aktualisiert"}

@app.delete("/api/admin/study/programs/{program_id}")
def admin_delete_program(program_id: int, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Studiengang löschen (inkl. aller Updates)"""
    program = db.query(StudyProgram).filter(StudyProgram.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Studiengang nicht gefunden")
    
    name = program.name
    db.delete(program)
    db.commit()
    
    log_activity(db, current_admin.id, "PROGRAM_DELETE", f"Studiengang '{name}' gelöscht")
    
    return {"message": "Studiengang gelöscht"}

# ─── ADMIN: Updates verwalten ───────────────────────────────────────────────
@app.get("/api/admin/study/updates")
def admin_get_updates(current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Alle Updates (Admin)"""
    updates = db.query(StudyUpdate).order_by(StudyUpdate.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "program_id": u.program_id,
            "program_name": u.program.name if u.program else None,
            "category_name": u.program.category.display_name if u.program and u.program.category else None,
            "content": u.content,
            "semester": u.semester,
            "is_active": u.is_active,
            "sort_order": u.sort_order,
            "creator_name": u.creator.display_name if u.creator else None,
            "created_at": u.created_at.isoformat(),
            "updated_at": u.updated_at.isoformat()
        }
        for u in updates
    ]

@app.post("/api/admin/study/updates")
def admin_create_update(request: StudyUpdateCreate, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Neues Update erstellen"""
    program = db.query(StudyProgram).filter(StudyProgram.id == request.program_id).first()
    if not program:
        raise HTTPException(status_code=400, detail="Studiengang nicht gefunden")
    
    update = StudyUpdate(
        program_id=request.program_id,
        content=request.content,
        semester=request.semester,
        is_active=request.is_active,
        sort_order=request.sort_order,
        created_by=current_admin.id
    )
    db.add(update)
    db.commit()
    db.refresh(update)
    
    log_activity(db, current_admin.id, "UPDATE_CREATE", f"Update für '{program.name}' erstellt", "study_update", update.id)
    
    return {"id": update.id, "message": "Update erstellt"}

@app.put("/api/admin/study/updates/{update_id}")
def admin_update_update(update_id: int, request: StudyUpdateUpdate, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Update aktualisieren"""
    update = db.query(StudyUpdate).filter(StudyUpdate.id == update_id).first()
    if not update:
        raise HTTPException(status_code=404, detail="Update nicht gefunden")
    
    update_data = request.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(update, key, value)
    
    db.commit()
    log_activity(db, current_admin.id, "UPDATE_UPDATE", f"Update aktualisiert", "study_update", update.id)
    
    return {"message": "Update aktualisiert"}

@app.delete("/api/admin/study/updates/{update_id}")
def admin_delete_update(update_id: int, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Update löschen"""
    update = db.query(StudyUpdate).filter(StudyUpdate.id == update_id).first()
    if not update:
        raise HTTPException(status_code=404, detail="Update nicht gefunden")
    
    db.delete(update)
    db.commit()
    
    log_activity(db, current_admin.id, "UPDATE_DELETE", f"Update gelöscht")
    
    return {"message": "Update gelöscht"}

# ─── SEED: Bestehende Daten einfügen ────────────────────────────────────────
def seed_study_data(db: Session):
    """Seed initial study data if empty"""
    if db.query(StudyCategory).count() > 0:
        return  # Already seeded
    
    # Get master admin for created_by
    master = db.query(Admin).filter(Admin.is_master == True).first()
    if not master:
        return
    
    # Categories
    categories_data = [
        {"name": "bachelor", "display_name": "Bachelorstudiengänge", "color": "blue", "sort_order": 1},
        {"name": "master", "display_name": "Masterstudiengänge", "color": "gold", "sort_order": 2},
        {"name": "mba", "display_name": "MBA-Studiengänge (Executive)", "color": "blue", "sort_order": 3},
        {"name": "ulg", "display_name": "Universitätslehrgänge (ULG)", "color": "gold", "sort_order": 4},
    ]
    
    for cat_data in categories_data:
        category = StudyCategory(**cat_data)
        db.add(category)
    db.commit()
    
    # Programs
    programs_data = {
        "bachelor": [
            "BSc. Wirtschaftswissenschaften",
            "BSc. Betriebswirtschaftslehre",
            "BSc. International Business Administration",
            "BSc. (CE) Finance, Banking und Digitalisierung"
        ],
        "master": [
            "MSc. Digital Business Management",
            "MSc. Economic and Business Analytics",
            "MSc. Economics",
            "MSc. Finance and Accounting",
            "MSc. Management",
            "MSc. General Management Double Degree ESC Troyes",
            "MSc. General Management Double Degree STUST Tainan",
            "MSc. Global Business Canada/Peru",
            "MSc. Global Business Kanada/Taiwan",
            "MSc. Global Business Russland/Italien",
            "MSc. Leadership and Innovation in Organizations"
        ],
        "mba": [
            "MBA Global Executive MBA",
            "MBA Executive MBA Management & Leadership",
            "MBA Management und Leadership für Frauen",
            "MBA Health Care Management"
        ],
        "ulg": [
            "ULG Versicherungswirtschaft",
            "ULG Tourismusmanagement",
            "ULG Applied Business Excellence"
        ]
    }
    
    for cat_name, prog_list in programs_data.items():
        category = db.query(StudyCategory).filter(StudyCategory.name == cat_name).first()
        for i, prog_name in enumerate(prog_list):
            program = StudyProgram(
                category_id=category.id,
                name=prog_name,
                sort_order=i
            )
            db.add(program)
    db.commit()
    
    # Updates (existing hardcoded data)
    updates_data = [
        {"prog": "BSc. Wirtschaftswissenschaften", "items": [
            "Wissenschaftliches Arbeiten - neues Konzept: Seminar zur Bachelorarbeit ab 2025/26 nur noch 9 ECTS (statt 12). Neue LV: KS Wissenschaftliches Arbeiten fuer Wirtschaftswissenschaften: Methoden und Tools (3 ECTS).",
            "Das Modul Wissenschaftliches Arbeiten umfasst weiterhin 15 ECTS: KS Wissenschaftliches Arbeiten (3), KS Wissenschaftstheorie (3), SE Bachelorarbeit (9).",
            "Spezialisierungsfeld Economics & Psychology: Neue LVs in den Ergaenzungsfaechern Industrial Organization and Digital Economy, Public Finance, Public und Nonprofit Management, Sustainability Management.",
            "Spezialisierungsfeld Nachhaltige Team- und Personalentwicklung (WiPsy) wurde umfassend ueberarbeitet. Neue LVAs aus Soziologie, Wirtschaftspaedagogik und Soziale Kompetenz.",
            "Neues weiterfuehrendes Studium: Master Digital Society als direkt anschliessender Studiengang fuer WiWi-Bachelorabsolvent:innen anerkannt."
        ]},
        {"prog": "BSc. Betriebswirtschaftslehre", "items": [
            "Major Knowledge and Data in the Digital Enterprise wird ab WS 2025/26 nicht mehr angeboten.",
            "Einfuehrung in die Softwareentwicklung mit Python: Manuelle Zuteilung statt bisherigem Verfahren.",
            "Neue Voraussetzungen fuer IK Ethik und IK Gender und Diversity: 21 ECTS aus Core Business Knowledge + ein Fach aus Unternehmerisches Handeln."
        ]},
        {"prog": "BSc. International Business Administration", "items": [
            "Neues Pflichtmodul Mandatory Subject Elective Area: Business, Economics and Digitalization (24 ECTS) - erleichtert Anrechnung von Auslandssemester-LVAs.",
            "Anpassungen der ECTS bestehender Pflichtmodule: Int. Finance, Accounting and Taxation (24), Int. Management and Marketing (24), Digitalization and SCM (24), Economics (18).",
            "Anerkennung auf Fachebene statt LVA-Ebene moeglich. Free Electives (18 ECTS) bleiben unveraendert."
        ]},
        {"prog": "MSc. Digital Business Management", "items": [
            "Kooperationsstudium mit der FH Oberoesterreich - aktuelle Informationen direkt von der FH bereitgestellt."
        ]},
        {"prog": "MSc. Economic and Business Analytics", "items": [
            "Neue LVs: IK Data Science in Python for Economic and Business Analytics (3 ECTS), IK Algorithmics and Mathematics (3 ECTS).",
            "Neue Voraussetzung fuer SE Analytic Methods: KS Empirical Economics und IK Empirical Economics."
        ]},
        {"prog": "MSc. Economics", "items": [
            "Umbenennung: KS Labor Economics and Public Policy zu KS Labor Economics. ECTS und Inhalte bleiben unveraendert."
        ]},
        {"prog": "MSc. Finance and Accounting", "items": [
            "Keine Aenderungen."
        ]},
        {"prog": "MSc. Management", "items": [
            "Neue Competence Area: Sustainable Entrepreneurship & Circular Economy Innovation (SECEI). Empfehlung: Im 1. Semester mit KS Entrepreneurship beginnen.",
            "Neue Anerkennung: Selected Topics in Business Sciences (Master, Abroad) - 6 oder 12 ECTS im General Management Competence Elective."
        ]},
        {"prog": "MSc. General Management Double Degree ESC Troyes", "items": [
            "Fuer dieses Studienprogramm wurden fuer dieses Semester keine Aenderungen beschlossen."
        ]},
        {"prog": "MSc. General Management Double Degree STUST Tainan", "items": [
            "Fuer dieses Studienprogramm wurden fuer dieses Semester keine Aenderungen beschlossen."
        ]},
        {"prog": "MSc. Global Business Canada/Peru", "items": [
            "Fuer dieses Studienprogramm wurden fuer dieses Semester keine Aenderungen beschlossen."
        ]},
        {"prog": "MSc. Global Business Kanada/Taiwan", "items": [
            "Fuer dieses Studienprogramm wurden fuer dieses Semester keine Aenderungen beschlossen."
        ]},
        {"prog": "MSc. Global Business Russland/Italien", "items": [
            "Fuer dieses Studienprogramm wurden fuer dieses Semester keine Aenderungen beschlossen."
        ]},
        {"prog": "MSc. Leadership and Innovation in Organizations", "items": [
            "Fuer dieses Studienprogramm wurden fuer dieses Semester keine Aenderungen beschlossen."
        ]}
    ]
    
    for u_data in updates_data:
        program = db.query(StudyProgram).filter(StudyProgram.name == u_data["prog"]).first()
        if program:
            for i, content in enumerate(u_data["items"]):
                update = StudyUpdate(
                    program_id=program.id,
                    content=content,
                    semester="Wintersemester 2025/26",
                    is_active=True,
                    sort_order=i,
                    created_by=master.id
                )
                db.add(update)
    db.commit()
    print("✅ Study data seeded!")

def seed_lvas(db: Session):
    """Seed LVAs on first startup (only if table is empty)"""
    # Check if LVAs already exist
    existing_count = db.query(LVA).count()
    if existing_count > 0:
        print(f"ℹ️ LVAs already seeded ({existing_count} LVAs found)")
        return
    
    print("🔄 Seeding LVAs...")
    
    lva_names = [
        "KS Buchhaltung nach UGB", "KS Bilanzierung nach UGB", "KS Finanzmanagement kompakt", "KS Steuern",
        "KS Grundlagen der Kostenrechnung", "KS Grundlagen des Kostenmanagements und der Budgetierung",
        "KS Einführung in Marketing", "KS Einführung in Strategie & Internationales Management",
        "KS Einführung in Organisation", "KS Einführung in Veränderungs- und Innovationsmanagement",
        "KS Grundlagen der Betriebswirtschaftslehre", "KS Grundlagen des integrierten Managements",
        "IK Integrative Fragestellungen aus Finance & Accounting", "IK Jahresabschlussanalyse",
        "IK Unternehmerisches Handeln - Management", "KS Grundlagen des Nachhaltigkeitsmanagement",
        "KS Grundlagen des Supply Chain Management", "IK Ethik", "IK Gender und Diversity",
        "VL Technische und methodische Grundlagen der Digitalisierung",
        "IK Technische und methodische Grundlagen der Digitalisierung",
        "VL Management der Digitalisierung und Einsatz betrieblicher Informationssysteme",
        "UE Management der Digitalisierung und Einsatz betrieblicher Informationssysteme",
        "VL Einführung in die Softwareentwicklung mit Python", "UE Einführung in die Softwareentwicklung mit Python",
        "KS Einführung in die Volkswirtschaftslehre", "KS Einführung in die Makroökonomie",
        "KS Einführung in die Mikroökonomie", "IK Einführung in die Mikroökonomie",
        "KS Mathematik für Sozial- und Wirtschaftswissenschaften", "KS Statistik für Sozial- und Wirtschaftswissenschaften",
        "KS Öffentliches Wirtschaftsrecht", "IK Öffentliches Wirtschaftsrecht",
        "KS Privates Wirtschaftsrecht", "IK Privates Wirtschaftsrecht",
        "KS Kommunikative Fertigkeiten Englisch (B2)", "KS Wirtschaftssprache I Englisch (B2+)",
        "KS Interkulturelle Fertigkeiten Englisch (C1)", "KS Wirtschaftssprache II Englisch (C1)",
        "KS Grundlagen der Wirtschaftsprüfung", "KS Internationale Rechnungslegung",
        "KS Einkommensteuer und Körperschaftsteuer", "KS Umsatzsteuer und Verkehrsteuern",
        "IK Gewinnermittlung", "IK Konzernrechnungslegung", "IK Tax Compliance",
        "SE Seminar Steuerlehre, Unternehmensrechnung und Wirtschaftsprüfung",
        "KS Grundlagen Operatives Controlling", "KS Operatives und strategisches Kostenmanagement",
        "KS Nachhaltigkeitscontrolling", "IK IT Systeme im Controlling", "IK Management Control Systems",
        "IK Strategisches Controlling", "SE Theorieseminar", "KS Unternehmensfinanzierung",
        "KS Wertpapiermanagement", "IK Grundzüge der Finanzwirtschaft", "IK Mergers & Acquisitions",
        "KS Investmentanalyse und Risikomanagement", "KS Real Estate Finance",
        "SE Finance - Wissenschaftliches Seminar", "KS Digital Business - Grundlagen",
        "IK Digital Business Planning", "VL Modell-basierte Entscheidungsunterstützung",
        "UE Modell-basierte Entscheidungsunterstützung", "KS Operations and Supply Chain Management",
        "IK Operations and Supply Chain Management", "KS Environmental and Quality Management",
        "KS Organizing Sustainability", "IK Transportation Logistics",
        "SE Software Tools for Decision Support in Transportation Logistics",
        "IK Introduction to Intelligent Solutions for Transportation and Physical Internet",
        "SE Traffic Simulation", "SE Research Seminar in Operations, Transport and Supply Chain Management",
        "UE Model-Based Decision Support", "KS Organization", "IK Organization",
        "KS Innovation and Entrepreneurship", "IK Innovation and Entrepreneurship",
        "SE Advanced Topics in Innovation and Entrepreneurship",
        "SE Advanced Topics in Organization and Innovation", "SE Entrepreneurial and Leadership Skills",
        "SE Research Seminar in Organization, Innovation and Entrepreneurship",
        "VL Datenmodellierung", "UE Datenmodellierung", "VL Prozess- und Kommunikationsmodellierung",
        "UE Prozess- und Kommunikationsmodellierung", "VL Informationsmanagement und strategische Projektsteuerung",
        "UE Informationsmanagement und strategische Projektsteuerung",
        "SE Seminar in Planung und Gestaltung der Digitalisierung",
        "KS Essentials of Leadership and Change", "IK Essentials of Leadership and Change",
        "KS Essentials of Strategic Management", "IK Essentials of Strategic Management",
        "SE Change", "SE Leadership", "SE Stakeholder Strategy", "SE Strategy Process",
        "SE Research Seminar Strategic Leadership", "KS Strategisches Management: Grundlagen",
        "IK Strategisches Management: Vertiefung", "KS Marktorientiertes Management: Grundlagen",
        "IK Marktorientiertes Management: Vertiefung", "SE Strategisches und Marktorientiertes Management in der Praxis",
        "SE Strategisches und Marktorientiertes Management: Forschung & Theorie",
        "KS Responsible Innovation", "SE Sustainable Business Practice",
        "KS Socio-Technical Transition Management", "SE Sustainable Management Accounting",
        "SE Research Seminar Sustainability", "IK Digital Business Anwendungen", "SE Seminar Digital Business",
        "KS International Business", "IK International Market Entry", "SE Cross Cultural Management",
        "IK Special Topics in International Management", "KS Grundkurs Public und Nonprofit Management",
        "SE Seminar aus Public und Nonprofit Management 1", "SE Seminar aus Public und Nonprofit Management 2",
    ]
    
    for name in lva_names:
        lva = LVA(name=name, is_active=True)
        db.add(lva)
    
    db.commit()
    print(f"✅ {len(lva_names)} LVAs seeded!")

# ═══════════════════════════════════════════════════════════════════════════
# LVA (LEHRVERANSTALTUNG) ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

# ─── HELPER FUNCTIONS FOR LVA ───────────────────────────────────────────────
def get_rating_text_and_color(avg: float, category: str) -> tuple:
    """Convert average rating to text and color based on category"""
    if avg is None:
        return None, None
    
    if category == "effort":
        texts = ["Niedrig", "Eher niedrig", "Durchschnittlich", "Eher hoch", "Sehr hoch"]
    elif category == "difficulty":
        texts = ["Gut verständlich", "Verständlich", "Anspruchsvoll", "Sehr anspruchsvoll", "Extrem anspruchsvoll"]
    else:  # total
        texts = ["Sehr unkritisch", "Unkritisch", "Ausgewogen", "Fordernd", "Sehr fordernd"]
    
    colors = ["green", "lime", "yellow", "orange", "red"]
    
    if avg < 1.5:
        return texts[0], colors[0]
    elif avg < 2.5:
        return texts[1], colors[1]
    elif avg < 3.5:
        return texts[2], colors[2]
    elif avg < 4.5:
        return texts[3], colors[3]
    else:
        return texts[4], colors[4]

def generate_verification_code() -> str:
    """Generate a 5-character verification code (uppercase letters + numbers)"""
    characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'  # Ohne I, O, 0, 1 (Verwechslungsgefahr)
    return ''.join(random.choice(characters) for _ in range(5))

def send_verification_email(email: str, code: str, lva_name: str) -> bool:
    """Send verification code via SMTP"""
    if not all([SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL]):
        print("⚠️ SMTP not configured - code generation only (no email sent)")
        return True  # Return True to allow testing without SMTP
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = Header(f'Dein Verifizierungscode für die LVA-Bewertung', 'utf-8')
        msg['From'] = formataddr((str(Header(SMTP_FROM_NAME, 'utf-8')), SMTP_FROM_EMAIL))
        msg['To'] = email
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }}
                .container {{ max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center; }}
                .header h1 {{ color: white; margin: 0; font-size: 24px; }}
                .header p {{ color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 14px; }}
                .content {{ padding: 30px; }}
                .code-box {{ background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }}
                .code {{ font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e293b; font-family: monospace; }}
                .lva-name {{ background: #eff6ff; color: #1d4ed8; padding: 8px 16px; border-radius: 8px; display: inline-block; margin: 10px 0; font-weight: 500; }}
                .info {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }}
                .info p {{ margin: 5px 0; color: #92400e; font-size: 13px; }}
                .footer {{ background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }}
                .footer p {{ color: #64748b; font-size: 12px; margin: 5px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>ÖH Wirtschaft</h1>
                    <p>Johannes Kepler Universität Linz</p>
                </div>
                <div class="content">
                    <p style="color: #475569; margin-bottom: 20px;">Hallo!</p>
                    <p style="color: #475569;">Du hast einen Verifizierungscode angefordert, um folgende LVA zu bewerten:</p>
                    <div style="text-align: center;">
                        <span class="lva-name">{lva_name}</span>
                    </div>
                    <div class="code-box">
                        <p style="color: #64748b; margin: 0 0 10px; font-size: 14px;">Dein Verifizierungscode:</p>
                        <div class="code">{code}</div>
                    </div>
                    <div class="info">
                        <p><strong>🔒 Anonymität:</strong> Deine E-Mail-Adresse wird NICHT gespeichert.</p>
                        <p><strong>⏱️ Gültigkeit:</strong> Dieser Code ist 30 Minuten gültig.</p>
                    </div>
                </div>
                <div class="footer">
                    <p>ÖH Wirtschaft - Studienvertretung</p>
                    <p>wirtschaft@oeh.jku.at</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        ÖH Wirtschaft - Verifizierungscode
        
        Hallo!
        
        Du hast einen Verifizierungscode angefordert, um folgende LVA zu bewerten:
        {lva_name}
        
        Dein Verifizierungscode: {code}
        
        Wichtig:
        - Deine E-Mail-Adresse wird NICHT gespeichert
        - Der Code ist 30 Minuten gültig
        
        ÖH Wirtschaft - Studienvertretung
        wirtschaft@oeh.jku.at
        """
        
        part1 = MIMEText(text_content, 'plain', 'utf-8')
        part2 = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(part1)
        msg.attach(part2)
        
        if SMTP_USE_TLS:
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10)
            server.starttls()
        else:
            server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=10)
        
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_FROM_EMAIL, email, msg.as_string())
        server.quit()
        
        print(f"✅ Verification email sent to {email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False

def calculate_lva_ratings(lva: LVA) -> dict:
    """Calculate average ratings for an LVA"""
    ratings = lva.ratings
    if not ratings:
        return {
            "rating_count": 0,
            "avg_effort": None,
            "avg_difficulty": None,
            "avg_total": None,
            "effort_text": None,
            "effort_color": None,
            "difficulty_text": None,
            "difficulty_color": None,
            "total_text": None,
            "total_color": None,
        }
    
    count = len(ratings)
    avg_effort = sum(r.effort_rating for r in ratings) / count
    avg_difficulty = sum(r.difficulty_rating for r in ratings) / count
    avg_total = (avg_effort + avg_difficulty) / 2
    
    effort_text, effort_color = get_rating_text_and_color(avg_effort, "effort")
    difficulty_text, difficulty_color = get_rating_text_and_color(avg_difficulty, "difficulty")
    total_text, total_color = get_rating_text_and_color(avg_total, "total")
    
    return {
        "rating_count": count,
        "avg_effort": round(avg_effort, 2),
        "avg_difficulty": round(avg_difficulty, 2),
        "avg_total": round(avg_total, 2),
        "effort_text": effort_text,
        "effort_color": effort_color,
        "difficulty_text": difficulty_text,
        "difficulty_color": difficulty_color,
        "total_text": total_text,
        "total_color": total_color,
    }

# ─── PUBLIC LVA ENDPOINTS ───────────────────────────────────────────────────
@app.get("/api/lvas/stats")
def get_lva_stats(db: Session = Depends(get_db)):
    """Get LVA statistics (total count)"""
    total = db.query(LVA).filter(LVA.is_active == True).count()
    rated = db.query(LVA).filter(LVA.is_active == True).join(LVARating).distinct().count()
    return {"total": total, "rated": rated}

@app.get("/api/lvas/top")
def get_top_lvas(limit: int = 10, db: Session = Depends(get_db)):
    """Get top-rated LVAs only (must have at least 1 rating)"""
    lvas = db.query(LVA).filter(LVA.is_active == True).all()
    
    rated_lvas = []
    for lva in lvas:
        ratings = calculate_lva_ratings(lva)
        if ratings["rating_count"] > 0:  # NUR bewertete LVAs
            rated_lvas.append({
                "id": lva.id,
                "name": lva.name,
                "description": lva.description,
                **ratings
            })
    
    # Sort by best total rating (lowest = best), then by most ratings
    rated_lvas.sort(key=lambda x: (x["avg_total"], -x["rating_count"]))
    
    return rated_lvas[:limit]

@app.get("/api/lvas")
def get_lvas(search: Optional[str] = None, db: Session = Depends(get_db)):
    """Get all active LVAs with their ratings (public)"""
    query = db.query(LVA).filter(LVA.is_active == True)
    
    if search:
        query = query.filter(LVA.name.ilike(f"%{search}%"))
    
    lvas = query.order_by(LVA.name).all()
    
    result = []
    for lva in lvas:
        ratings = calculate_lva_ratings(lva)
        result.append({
            "id": lva.id,
            "name": lva.name,
            "description": lva.description,
            "is_active": lva.is_active,
            **ratings
        })
    
    return result

@app.get("/api/lvas/{lva_id}")
def get_lva(lva_id: int, db: Session = Depends(get_db)):
    """Get a single LVA with ratings"""
    lva = db.query(LVA).filter(LVA.id == lva_id).first()
    if not lva:
        raise HTTPException(status_code=404, detail="LVA nicht gefunden")
    
    ratings = calculate_lva_ratings(lva)
    return {
        "id": lva.id,
        "name": lva.name,
        "description": lva.description,
        "is_active": lva.is_active,
        **ratings
    }

@app.post("/api/lva/request-code")
def request_verification_code(request: RequestCodeRequest, db: Session = Depends(get_db)):
    """Request a verification code for LVA rating"""
    # Validate email domain against whitelist
    email_valid = any(request.email.endswith(domain) for domain in ALLOWED_EMAIL_DOMAINS)
    
    if not email_valid:
        allowed_domains_str = ", ".join(ALLOWED_EMAIL_DOMAINS)
        raise HTTPException(
            status_code=403, 
            detail=f"Du bist nicht berechtigt. Erlaubte E-Mail-Endungen: {allowed_domains_str}. Bei Fragen melde dich unter wirtschaft@oeh.jku.at"
        )
    
    # Check if LVA exists
    lva = db.query(LVA).filter(LVA.id == request.lva_id, LVA.is_active == True).first()
    if not lva:
        raise HTTPException(status_code=404, detail="LVA nicht gefunden")
    
    # Invalidate any existing unused codes for this email and LVA
    db.query(VerificationCode).filter(
        VerificationCode.email == request.email,
        VerificationCode.lva_id == request.lva_id,
        VerificationCode.is_used == False
    ).update({"is_used": True})
    db.commit()
    
    # Generate new code
    code = generate_verification_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
    
    verification = VerificationCode(
        email=request.email,
        code=code,
        lva_id=request.lva_id,
        expires_at=expires_at
    )
    db.add(verification)
    db.commit()
    
    # Send email
    email_sent = send_verification_email(request.email, code, lva.name)
    
    if not email_sent and SMTP_HOST:  # Only fail if SMTP is configured but failed
        raise HTTPException(status_code=500, detail="E-Mail konnte nicht gesendet werden. Bitte versuche es später erneut.")
    
    return {
        "success": True,
        "message": "Code wurde gesendet! Überprüfe dein E-Mail-Postfach.",
        "expires_in_minutes": 30
    }

@app.post("/api/lva/verify-code")
def verify_code(request: VerifyCodeRequest, db: Session = Depends(get_db)):
    """Verify a code before rating submission"""
    from sqlalchemy import text
    
    # Ensure columns exist
    ensure_admin_code_columns(db)
    
    verification = None
    is_admin_code = False
    
    # First try to find a regular user code (if email is provided)
    if request.email:
        verification = db.query(VerificationCode).filter(
            VerificationCode.email == request.email,
            VerificationCode.code == request.code.upper(),
            VerificationCode.lva_id == request.lva_id,
            VerificationCode.is_used == False
        ).first()
    
    # If not found, try to find an admin code (works for any LVA)
    if not verification:
        try:
            result = db.execute(text("""
                SELECT id, code, max_uses, use_count, expires_at 
                FROM verification_codes 
                WHERE code = :code AND is_admin_code = TRUE
            """), {"code": request.code.upper()})
            row = result.fetchone()
            if row:
                is_admin_code = True
                # Check if admin code can still be used
                max_uses = row.max_uses or 1
                use_count = row.use_count or 0
                if use_count >= max_uses:
                    raise HTTPException(status_code=400, detail="Code wurde bereits vollständig verwendet")
                # Check expiry
                expires_at = row.expires_at
                if isinstance(expires_at, str):
                    expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                if expires_at < datetime.now(timezone.utc):
                    raise HTTPException(status_code=400, detail="Code ist abgelaufen. Bitte fordere einen neuen Code an.")
                # All good
                return {"success": True, "message": "Code ist gültig", "is_admin_code": True}
        except HTTPException:
            raise
        except Exception as e:
            print(f"Admin code check error: {e}")
            pass
    
    if not verification:
        raise HTTPException(status_code=400, detail="Ungültiger Code")
    
    # Handle timezone-naive datetime for regular codes
    expires_at = verification.expires_at
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Code ist abgelaufen. Bitte fordere einen neuen Code an.")
    
    return {"success": True, "message": "Code ist gültig", "is_admin_code": is_admin_code}

@app.post("/api/lva/submit-rating")
def submit_rating(request: SubmitRatingRequest, db: Session = Depends(get_db)):
    """Submit a rating for an LVA"""
    from sqlalchemy import text
    
    # Ensure columns exist
    ensure_admin_code_columns(db)
    
    # Validate ratings
    if not (1 <= request.effort_rating <= 5) or not (1 <= request.difficulty_rating <= 5):
        raise HTTPException(status_code=400, detail="Bewertungen müssen zwischen 1 und 5 liegen")
    
    verification = None
    is_admin_code = False
    admin_code_id = None
    
    # First try to find a regular user code (if email is provided)
    if request.email:
        verification = db.query(VerificationCode).filter(
            VerificationCode.email == request.email,
            VerificationCode.code == request.code.upper(),
            VerificationCode.lva_id == request.lva_id,
            VerificationCode.is_used == False
        ).first()
    
    # If not found, try to find an admin code
    if not verification:
        try:
            result = db.execute(text("""
                SELECT id, code, max_uses, use_count, expires_at 
                FROM verification_codes 
                WHERE code = :code AND is_admin_code = TRUE
            """), {"code": request.code.upper()})
            row = result.fetchone()
            if row:
                is_admin_code = True
                admin_code_id = row.id
                max_uses = row.max_uses or 1
                use_count = row.use_count or 0
                if use_count >= max_uses:
                    raise HTTPException(status_code=400, detail="Code wurde bereits vollständig verwendet")
                # Check expiry
                expires_at = row.expires_at
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                if expires_at < datetime.now(timezone.utc):
                    raise HTTPException(status_code=400, detail="Code ist abgelaufen")
        except HTTPException:
            raise
        except:
            pass
    
    if not verification and not is_admin_code:
        raise HTTPException(status_code=400, detail="Ungültiger oder bereits verwendeter Code")
    
    # For regular codes, check expiry
    if verification:
        expires_at = verification.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Code ist abgelaufen")
    
    # Check if LVA exists
    lva = db.query(LVA).filter(LVA.id == request.lva_id).first()
    if not lva:
        raise HTTPException(status_code=404, detail="LVA nicht gefunden")
    
    # Mark code as used
    if is_admin_code:
        db.execute(text("""
            UPDATE verification_codes 
            SET use_count = use_count + 1,
                is_used = CASE WHEN use_count + 1 >= max_uses THEN TRUE ELSE is_used END
            WHERE id = :id
        """), {"id": admin_code_id})
    else:
        verification.is_used = True
    
    # Create rating (without storing email!)
    rating = LVARating(
        lva_id=request.lva_id,
        effort_rating=request.effort_rating,
        difficulty_rating=request.difficulty_rating
    )
    db.add(rating)
    db.commit()
    
    return {
        "success": True,
        "message": "Bewertung erfolgreich abgegeben! Vielen Dank für dein Feedback."
    }

# ─── ADMIN LVA ENDPOINTS ────────────────────────────────────────────────────
@app.get("/api/admin/lvas")
def admin_get_lvas(current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Get all LVAs for admin (including inactive)"""
    lvas = db.query(LVA).order_by(LVA.name).all()
    
    result = []
    for lva in lvas:
        ratings = calculate_lva_ratings(lva)
        result.append({
            "id": lva.id,
            "name": lva.name,
            "description": lva.description,
            "is_active": lva.is_active,
            "created_at": lva.created_at.isoformat(),
            "updated_at": lva.updated_at.isoformat() if lva.updated_at else None,
            **ratings
        })
    
    return result

@app.post("/api/admin/lvas")
def admin_create_lva(request: LVACreate, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Create a new LVA"""
    # Check if LVA with same name exists
    existing = db.query(LVA).filter(LVA.name == request.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="LVA mit diesem Namen existiert bereits")
    
    lva = LVA(
        name=request.name,
        description=request.description,
        is_active=request.is_active
    )
    db.add(lva)
    db.commit()
    db.refresh(lva)
    
    log_activity(db, current_admin.id, "LVA_CREATE", f"LVA '{lva.name}' erstellt", "lva", lva.id)
    
    return {"id": lva.id, "message": "LVA erstellt"}

@app.put("/api/admin/lvas/{lva_id}")
def admin_update_lva(lva_id: int, request: LVAUpdate, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Update an LVA"""
    lva = db.query(LVA).filter(LVA.id == lva_id).first()
    if not lva:
        raise HTTPException(status_code=404, detail="LVA nicht gefunden")
    
    if request.name is not None:
        # Check for duplicate name
        existing = db.query(LVA).filter(LVA.name == request.name, LVA.id != lva_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="LVA mit diesem Namen existiert bereits")
        lva.name = request.name
    
    if request.description is not None:
        lva.description = request.description
    if request.is_active is not None:
        lva.is_active = request.is_active
    
    db.commit()
    log_activity(db, current_admin.id, "LVA_UPDATE", f"LVA '{lva.name}' aktualisiert", "lva", lva.id)
    
    return {"message": "LVA aktualisiert"}

@app.delete("/api/admin/lvas/{lva_id}")
def admin_delete_lva(lva_id: int, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Delete an LVA"""
    lva = db.query(LVA).filter(LVA.id == lva_id).first()
    if not lva:
        raise HTTPException(status_code=404, detail="LVA nicht gefunden")
    
    name = lva.name
    db.delete(lva)
    db.commit()
    
    log_activity(db, current_admin.id, "LVA_DELETE", f"LVA '{name}' gelöscht")
    
    return {"message": "LVA gelöscht"}

@app.post("/api/admin/lvas/import")
def admin_import_lvas(current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Import LVAs from predefined list (one-time seed)"""
    lva_names = [
        "KS Buchhaltung nach UGB", "KS Bilanzierung nach UGB", "KS Finanzmanagement kompakt", "KS Steuern",
        "KS Grundlagen der Kostenrechnung", "KS Grundlagen des Kostenmanagements und der Budgetierung",
        "KS Einführung in Marketing", "KS Einführung in Strategie & Internationales Management",
        "KS Einführung in Organisation", "KS Einführung in Veränderungs- und Innovationsmanagement",
        "KS Grundlagen der Betriebswirtschaftslehre", "KS Grundlagen des integrierten Managements",
        "IK Integrative Fragestellungen aus Finance & Accounting", "IK Jahresabschlussanalyse",
        "IK Unternehmerisches Handeln - Management", "KS Grundlagen des Nachhaltigkeitsmanagement",
        "KS Grundlagen des Supply Chain Management", "IK Ethik", "IK Gender und Diversity",
        "VL Technische und methodische Grundlagen der Digitalisierung",
        "IK Technische und methodische Grundlagen der Digitalisierung",
        "VL Management der Digitalisierung und Einsatz betrieblicher Informationssysteme",
        "UE Management der Digitalisierung und Einsatz betrieblicher Informationssysteme",
        "VL Einführung in die Softwareentwicklung mit Python", "UE Einführung in die Softwareentwicklung mit Python",
        "KS Einführung in die Volkswirtschaftslehre", "KS Einführung in die Makroökonomie",
        "KS Einführung in die Mikroökonomie", "IK Einführung in die Mikroökonomie",
        "KS Mathematik für Sozial- und Wirtschaftswissenschaften", "KS Statistik für Sozial- und Wirtschaftswissenschaften",
        "KS Öffentliches Wirtschaftsrecht", "IK Öffentliches Wirtschaftsrecht",
        "KS Privates Wirtschaftsrecht", "IK Privates Wirtschaftsrecht",
        "KS Kommunikative Fertigkeiten Englisch (B2)", "KS Wirtschaftssprache I Englisch (B2+)",
        "KS Interkulturelle Fertigkeiten Englisch (C1)", "KS Wirtschaftssprache II Englisch (C1)",
        "KS Grundlagen der Wirtschaftsprüfung", "KS Internationale Rechnungslegung",
        "KS Einkommensteuer und Körperschaftsteuer", "KS Umsatzsteuer und Verkehrsteuern",
        "IK Gewinnermittlung", "IK Konzernrechnungslegung", "IK Tax Compliance",
        "SE Seminar Steuerlehre, Unternehmensrechnung und Wirtschaftsprüfung",
        "KS Grundlagen Operatives Controlling", "KS Operatives und strategisches Kostenmanagement",
        "KS Nachhaltigkeitscontrolling", "IK IT Systeme im Controlling", "IK Management Control Systems",
        "IK Strategisches Controlling", "SE Theorieseminar", "KS Unternehmensfinanzierung",
        "KS Wertpapiermanagement", "IK Grundzüge der Finanzwirtschaft", "IK Mergers & Acquisitions",
        "KS Investmentanalyse und Risikomanagement", "KS Real Estate Finance",
        "SE Finance - Wissenschaftliches Seminar", "KS Digital Business - Grundlagen",
        "IK Digital Business Planning", "VL Modell-basierte Entscheidungsunterstützung",
        "UE Modell-basierte Entscheidungsunterstützung", "KS Operations and Supply Chain Management",
        "IK Operations and Supply Chain Management", "KS Environmental and Quality Management",
        "KS Organizing Sustainability", "IK Transportation Logistics",
        "SE Software Tools for Decision Support in Transportation Logistics",
        "IK Introduction to Intelligent Solutions for Transportation and Physical Internet",
        "SE Traffic Simulation", "SE Research Seminar in Operations, Transport and Supply Chain Management",
        "UE Model-Based Decision Support", "KS Organization", "IK Organization",
        "KS Innovation and Entrepreneurship", "IK Innovation and Entrepreneurship",
        "SE Advanced Topics in Innovation and Entrepreneurship",
        "SE Advanced Topics in Organization and Innovation", "SE Entrepreneurial and Leadership Skills",
        "SE Research Seminar in Organization, Innovation and Entrepreneurship",
        "VL Datenmodellierung", "UE Datenmodellierung", "VL Prozess- und Kommunikationsmodellierung",
        "UE Prozess- und Kommunikationsmodellierung", "VL Informationsmanagement und strategische Projektsteuerung",
        "UE Informationsmanagement und strategische Projektsteuerung",
        "SE Seminar in Planung und Gestaltung der Digitalisierung",
        "KS Essentials of Leadership and Change", "IK Essentials of Leadership and Change",
        "KS Essentials of Strategic Management", "IK Essentials of Strategic Management",
        "SE Change", "SE Leadership", "SE Stakeholder Strategy", "SE Strategy Process",
        "SE Research Seminar Strategic Leadership", "KS Strategisches Management: Grundlagen",
        "IK Strategisches Management: Vertiefung", "KS Marktorientiertes Management: Grundlagen",
        "IK Marktorientiertes Management: Vertiefung", "SE Strategisches und Marktorientiertes Management in der Praxis",
        "SE Strategisches und Marktorientiertes Management: Forschung & Theorie",
        "KS Responsible Innovation", "SE Sustainable Business Practice",
        "KS Socio-Technical Transition Management", "SE Sustainable Management Accounting",
        "SE Research Seminar Sustainability", "IK Digital Business Anwendungen", "SE Seminar Digital Business",
        "KS International Business", "IK International Market Entry", "SE Cross Cultural Management",
        "IK Special Topics in International Management", "KS Grundkurs Public und Nonprofit Management",
        "SE Seminar aus Public und Nonprofit Management 1", "SE Seminar aus Public und Nonprofit Management 2",
    ]
    
    imported = 0
    skipped = 0
    
    for name in lva_names:
        existing = db.query(LVA).filter(LVA.name == name).first()
        if not existing:
            lva = LVA(name=name, is_active=True)
            db.add(lva)
            imported += 1
        else:
            skipped += 1
    
    db.commit()
    log_activity(db, current_admin.id, "LVA_IMPORT", f"{imported} LVAs importiert, {skipped} übersprungen")
    
    return {"imported": imported, "skipped": skipped, "message": f"{imported} LVAs erfolgreich importiert"}

# ═══════════════════════════════════════════════════════════════════════════
# APP SETTINGS ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/api/admin/settings/{key}")
def get_setting(key: str, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Get a specific setting by key"""
    setting = db.query(AppSettings).filter(AppSettings.key == key).first()
    return {"key": key, "value": setting.value if setting else None}

@app.put("/api/admin/settings/{key}")
def update_setting(key: str, value: str = None, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Update a setting (create if not exists)"""
    # Only master admin can change settings
    if current_admin.role != AdminRole.MASTER:
        raise HTTPException(status_code=403, detail="Nur Master-Admin kann Einstellungen ändern")
    
    setting = db.query(AppSettings).filter(AppSettings.key == key).first()
    
    if setting:
        setting.value = value
    else:
        setting = AppSettings(key=key, value=value)
        db.add(setting)
    
    db.commit()
    log_activity(db, current_admin.id, "SETTINGS_UPDATE", f"Einstellung '{key}' aktualisiert")
    
    return {"key": key, "value": value, "message": "Einstellung gespeichert"}

class SettingUpdate(BaseModel):
    value: Optional[str] = None

@app.post("/api/admin/settings/{key}")
def set_setting(key: str, request: SettingUpdate, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Set a setting value"""
    # Only master admin can change settings
    if current_admin.role != AdminRole.MASTER:
        raise HTTPException(status_code=403, detail="Nur Master-Admin kann Einstellungen ändern")
    
    setting = db.query(AppSettings).filter(AppSettings.key == key).first()
    
    if setting:
        setting.value = request.value
    else:
        setting = AppSettings(key=key, value=request.value)
        db.add(setting)
    
    db.commit()
    log_activity(db, current_admin.id, "SETTINGS_UPDATE", f"Einstellung '{key}' aktualisiert auf: {request.value or '(leer)'}")
    
    return {"key": key, "value": request.value, "message": "Einstellung gespeichert"}

# ═══════════════════════════════════════════════════════════════════════════
# ADMIN CODE MANAGEMENT ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

class AdminCodeCreate(BaseModel):
    name: Optional[str] = None  # Optional name/description
    max_uses: int = 1
    expires_in_days: int = 30

class AdminCodeResponse(BaseModel):
    id: int
    code: str
    name: Optional[str]
    max_uses: int
    use_count: int
    is_active: bool
    expires_at: str
    created_at: str

def ensure_admin_code_columns(db: Session):
    """Ensure admin code columns exist in verification_codes table"""
    from sqlalchemy import text
    if 'postgresql' in DATABASE_URL:
        try:
            # Add new columns
            db.execute(text("ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT 1"))
            db.execute(text("ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS use_count INTEGER DEFAULT 0"))
            db.execute(text("ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS is_admin_code BOOLEAN DEFAULT FALSE"))
            db.execute(text("ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS created_by_admin_id INTEGER"))
            db.execute(text("ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS name VARCHAR(100)"))
            # Allow NULL for email and lva_id (needed for admin codes)
            db.execute(text("ALTER TABLE verification_codes ALTER COLUMN email DROP NOT NULL"))
            db.execute(text("ALTER TABLE verification_codes ALTER COLUMN lva_id DROP NOT NULL"))
            db.commit()
        except:
            db.rollback()

@app.get("/api/admin/codes")
def get_admin_codes(current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Get all admin-created codes"""
    from sqlalchemy import text
    
    # Ensure columns exist
    ensure_admin_code_columns(db)
    
    # Use raw SQL to be safe
    try:
        result = db.execute(text("""
            SELECT id, code, name, max_uses, use_count, is_admin_code, expires_at, created_at 
            FROM verification_codes 
            WHERE is_admin_code = TRUE 
            ORDER BY created_at DESC
        """))
        rows = result.fetchall()
    except:
        return []
    
    now = datetime.now(timezone.utc)
    codes = []
    for row in rows:
        expires_at = row.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        codes.append({
            "id": row.id,
            "code": row.code,
            "name": row.name,
            "max_uses": row.max_uses or 1,
            "use_count": row.use_count or 0,
            "is_active": (row.use_count or 0) < (row.max_uses or 1) and expires_at > now,
            "expires_at": row.expires_at.isoformat(),
            "created_at": row.created_at.isoformat()
        })
    return codes

@app.post("/api/admin/codes")
def create_admin_code(
    request: AdminCodeCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new admin code for LVA ratings"""
    from sqlalchemy import text
    
    # Ensure columns exist first
    ensure_admin_code_columns(db)
    
    # Generate code automatically
    code = generate_verification_code()
    
    # Check if code already exists (regenerate if needed)
    while db.query(VerificationCode).filter(VerificationCode.code == code).first():
        code = generate_verification_code()
    
    # Create code
    verification_code = VerificationCode(
        code=code,
        name=request.name,
        email=None,
        lva_id=None,
        max_uses=max(1, request.max_uses),
        use_count=0,
        is_admin_code=True,
        created_by_admin_id=current_admin.id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=max(1, request.expires_in_days))
    )
    
    db.add(verification_code)
    db.commit()
    db.refresh(verification_code)
    
    name_info = f" ({request.name})" if request.name else ""
    log_activity(db, current_admin.id, "CODE_CREATE", f"Admin-Code erstellt: {code}{name_info} (max. {request.max_uses}x)")
    
    return {
        "id": verification_code.id,
        "code": verification_code.code,
        "name": verification_code.name,
        "max_uses": verification_code.max_uses,
        "expires_at": verification_code.expires_at.isoformat(),
        "message": "Code erfolgreich erstellt"
    }

@app.delete("/api/admin/codes/{code_id}")
def delete_admin_code(
    code_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete an admin code"""
    from sqlalchemy import text
    
    # Ensure columns exist
    ensure_admin_code_columns(db)
    
    # Use raw SQL for safer query
    try:
        result = db.execute(text("SELECT id, code FROM verification_codes WHERE id = :id AND is_admin_code = TRUE"), {"id": code_id})
        row = result.fetchone()
    except:
        raise HTTPException(status_code=404, detail="Code nicht gefunden")
    
    if not row:
        raise HTTPException(status_code=404, detail="Code nicht gefunden")
    
    code_str = row.code
    db.execute(text("DELETE FROM verification_codes WHERE id = :id"), {"id": code_id})
    db.commit()
    
    log_activity(db, current_admin.id, "CODE_DELETE", f"Admin-Code gelöscht: {code_str}")
    
    return {"message": "Code gelöscht"}

class AdminCodeUpdate(BaseModel):
    max_uses: Optional[int] = None
    expires_in_days: Optional[int] = None
    name: Optional[str] = None

@app.put("/api/admin/codes/{code_id}")
def update_admin_code(
    code_id: int,
    request: AdminCodeUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update an admin code"""
    from sqlalchemy import text
    
    # Ensure columns exist
    ensure_admin_code_columns(db)
    
    # Check if code exists
    try:
        result = db.execute(text("SELECT id, code, max_uses, use_count FROM verification_codes WHERE id = :id AND is_admin_code = TRUE"), {"id": code_id})
        row = result.fetchone()
    except:
        raise HTTPException(status_code=404, detail="Code nicht gefunden")
    
    if not row:
        raise HTTPException(status_code=404, detail="Code nicht gefunden")
    
    # Build update query
    updates = []
    params = {"id": code_id}
    
    if request.max_uses is not None:
        new_max = max(1, request.max_uses)
        # Ensure max_uses >= use_count
        if new_max < (row.use_count or 0):
            new_max = row.use_count or 1
        updates.append("max_uses = :max_uses")
        params["max_uses"] = new_max
        # Reset is_used if we increase max_uses
        updates.append("is_used = CASE WHEN :max_uses > use_count THEN FALSE ELSE is_used END")
    
    if request.expires_in_days is not None:
        new_expires = datetime.now(timezone.utc) + timedelta(days=max(1, request.expires_in_days))
        updates.append("expires_at = :expires_at")
        params["expires_at"] = new_expires
    
    if request.name is not None:
        updates.append("name = :name")
        params["name"] = request.name if request.name else None
    
    if updates:
        query = f"UPDATE verification_codes SET {', '.join(updates)} WHERE id = :id"
        db.execute(text(query), params)
        db.commit()
    
    log_activity(db, current_admin.id, "CODE_UPDATE", f"Admin-Code aktualisiert: {row.code}")
    
    return {"message": "Code aktualisiert"}
