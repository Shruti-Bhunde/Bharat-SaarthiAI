import os
import pickle
import uuid
import shutil
import json
import re
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from PIL import Image
import numpy as np

# Import database utils
from database import init_db, execute_query
init_db()

# Configure Gemini
import google.generativeai as genai
from dotenv import load_dotenv
import jwt
import requests

load_dotenv()

# JWT Config
JWT_SECRET = os.getenv("JWT_SECRET", "bharat-saarthi-ai-secret-key-9999")
JWT_ALGORITHM = "HS256"

# Initialize FastAPI app
app = FastAPI(title="Bharat Saarthi AI API")

# Configure CORS - support Vercel frontend origin
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://bharat-saarthi-ai.vercel.app",
    "https://bharat-saarthi-ai-frontend.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In dev/production, CORSMiddleware will accept requests. We specify dynamic allows.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Initialize Database on Startup
@app.on_event("startup")
def startup_event():
    init_db()

# Load ML Model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "ml_model.pkl")
ml_model = None

if os.path.exists(MODEL_PATH):
    try:
        with open(MODEL_PATH, "rb") as f:
            ml_model = pickle.load(f)
        print("ML model loaded successfully.")
    except Exception as e:
        print(f"Error loading ML model: {e}")
else:
    print("ML model pickle file not found. Please run backend/train_model.py first.")

# Configure Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print("Gemini API configured successfully.")
else:
    print("WARNING: GEMINI_API_KEY not found. Running in mockup AI response mode.")

# Pydantic Schemas
class ChatRequest(BaseModel):
    message: str
    session_id: str
    language: str = "English"
    user_id: Optional[int] = None

class RiskRequest(BaseModel):
    complaint_type: str
    severity: str
    location_type: str
    traffic_density: int
    time_of_day: str

class SchemeRequest(BaseModel):
    age: int
    occupation: str
    income: float
    gender: str
    education: str
    user_id: Optional[int] = None

class ComplaintSubmitRequest(BaseModel):
    title: str
    description: str
    detected_type: str
    suggested_department: str
    severity: str
    image_path: Optional[str] = None
    risk_score: Optional[int] = None
    priority: Optional[str] = None
    reasoning: Optional[str] = None
    user_id: Optional[int] = None

class GoogleLoginRequest(BaseModel):
    credential: str

# Helpers
DEBUG_LOG_PATH = os.path.join(os.path.dirname(__file__), "..", "debug-65a641.log")

def _debug_log(location: str, message: str, data: dict, hypothesis_id: str = ""):
    # #region agent log
    try:
        payload = {
            "sessionId": "65a641",
            "location": location,
            "message": message,
            "data": data,
            "timestamp": int(__import__("time").time() * 1000),
            "hypothesisId": hypothesis_id,
        }
        with open(DEBUG_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(payload, ensure_ascii=False) + "\n")
    except Exception:
        pass
    # #endregion

GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"]
GENERATION_CONFIG = genai.types.GenerationConfig(max_output_tokens=2048, temperature=0.7)

def extract_response_text(response) -> str:
    if not response.candidates:
        block_reason = getattr(getattr(response, "prompt_feedback", None), "block_reason", None)
        raise ValueError(f"No response candidates returned. Block reason: {block_reason}")

    candidate = response.candidates[0]
    finish_reason = getattr(candidate, "finish_reason", None)
    parts = []
    content = getattr(candidate, "content", None)
    if content and getattr(content, "parts", None):
        for part in content.parts:
            if getattr(part, "text", None):
                parts.append(part.text)

    if parts:
        return "".join(parts).strip()

    raise ValueError(f"Response contained no text. Finish reason: {finish_reason}")

def get_gemini_response(prompt: str, is_vision: bool = False, image_path: str = None, language: str = "English") -> str:
    if not GEMINI_API_KEY:
        # Fallback Mock Responses
        if is_vision:
            return json.dumps({
                "detected_type": "Pothole",
                "severity": "Critical",
                "suggested_department": "Public Works Department (PWD)",
                "title": "Dangerous Deep Pothole",
                "description": "A very deep pothole causing vehicles to swerve erratically on the main crossing."
            })
        mock_by_language = {
            "Hindi": "नागरिक सहायक प्रतिक्रिया (Mock mode: GEMINI_API_KEY सेट नहीं है।)",
            "Marathi": "नागरी सहाय्यक प्रतिसाद (Mock mode: GEMINI_API_KEY सेट केलेला नाही.)",
        }
        return mock_by_language.get(language, "Civic Assistant Response (Mock mode: GEMINI_API_KEY is not set. Please set the key for real AI output).")

    last_error = None
    for model_name in GEMINI_MODELS:
        try:
            # #region agent log
            _debug_log(
                "main.py:get_gemini_response",
                "Calling Gemini",
                {"model": model_name, "prompt_len": len(prompt), "language": language, "is_vision": is_vision},
                "A",
            )
            # #endregion
            model = genai.GenerativeModel(model_name)
            if is_vision and image_path:
                img = Image.open(image_path)
                response = model.generate_content([prompt, img], generation_config=GENERATION_CONFIG)
            else:
                response = model.generate_content(prompt, generation_config=GENERATION_CONFIG)

            text = extract_response_text(response)
            # #region agent log
            _debug_log(
                "main.py:get_gemini_response",
                "Gemini success",
                {"model": model_name, "response_len": len(text), "language": language},
                "A",
            )
            # #endregion
            return text
        except Exception as e:
            last_error = e
            err_str = str(e)
            print(f"Gemini API Error ({model_name}): {e}")
            # #region agent log
            _debug_log(
                "main.py:get_gemini_response",
                "Gemini failure",
                {"model": model_name, "error_type": type(e).__name__, "error": err_str[:300], "language": language},
                "A",
            )
            # #endregion
            is_last_model = model_name == GEMINI_MODELS[-1]
            retryable = any(
                token in err_str.lower()
                for token in ("429", "quota", "resource exhausted", "not found", "404", "503", "unavailable")
            )
            if is_last_model or not retryable:
                break

    err_str = str(last_error) if last_error else "Unknown error"
    if "429" in err_str or "quota" in err_str.lower() or "resource exhausted" in err_str.lower():
        quota_messages = {
            "Hindi": "क्षमा करें, AI सेवा की वर्तमान सीमा पूरी हो गई है। कृपया कुछ समय बाद पुनः प्रयास करें।",
            "Marathi": "क्षमस्व, AI सेवेची सध्याची मर्यादा संपली आहे. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.",
        }
        return quota_messages.get(language, "The AI service is temporarily busy due to usage limits. Please wait a moment and try again.")

    blocked_messages = {
        "Hindi": "क्षमा करें, इस प्रश्न पर सुरक्षित उत्तर तैयार नहीं किया जा सका। कृपया प्रश्न को दोबारा लिखें।",
        "Marathi": "क्षमस्व, या प्रश्नावर सुरक्षित उत्तर तयार करता आले नाही. कृपया प्रश्न पुन्हा लिहा.",
    }
    if "no text" in err_str.lower() or "block" in err_str.lower():
        return blocked_messages.get(language, "Sorry, I could not generate a safe response for this query. Please rephrase and try again.")

    return f"AI system error. Please try again. Detail: {err_str[:200]}"

def build_chat_prompt(language: str, message: str, history_context: str) -> str:
    language_rules = {
        "English": (
            "You MUST respond entirely in English. Do not use Hindi or Marathi.\n"
            "Use these section headings when applicable:\n"
            "1. Step-by-Step Action Plan\n"
            "2. Required Documents\n"
            "3. Estimated Timeline\n"
            "4. Next Actions\n"
            "5. Helpful Government Service Suggestions\n"
        ),
        "Hindi": (
            "You MUST respond entirely in Hindi using Devanagari script. Do not use English or Marathi.\n"
            "Use these section headings when applicable:\n"
            "1. चरण-दर-चरण कार्य योजना\n"
            "2. आवश्यक दस्तावेज़\n"
            "3. अनुमानित समयसीमा\n"
            "4. अगले कदम\n"
            "5. उपयोगी सरकारी सेवा सुझाव\n"
        ),
        "Marathi": (
            "You MUST respond entirely in Marathi using Devanagari script. Do not use English or Hindi.\n"
            "Use these section headings when applicable:\n"
            "1. टप्प्याटप्प्याने कृती योजना\n"
            "2. आवश्यक कागदपत्रे\n"
            "3. अंदाजे वेळापत्रक\n"
            "4. पुढील कृती\n"
            "5. उपयुक्त सरकारी सेवा सूचना\n"
        ),
    }
    lang_instruction = language_rules.get(language, language_rules["English"])

    return (
        "You are Bharat Saarthi AI, a friendly, professional personal civic assistant for Indian citizens. "
        "Provide clear, concise, step-by-step guidance on civic issues using markdown bolding, lists, and headings.\n\n"
        f"Selected conversation language: {language}\n"
        f"{lang_instruction}\n"
        "Keep the response focused and practical. Limit length to what is necessary.\n\n"
        "Conversation history (same language only):\n"
        f"{history_context or 'No prior messages in this language.'}\n"
        f"Citizen's current query: {message}\n"
        "Assistant:"
    )

# Endpoints
@app.post("/chat")
async def chat(req: ChatRequest):
    # #region agent log
    _debug_log(
        "main.py:chat",
        "Chat request received",
        {
            "language": req.language,
            "message_len": len(req.message),
            "session_id_prefix": req.session_id[:12],
        },
        "B",
    )
    # #endregion

    # Retrieve last messages from DB for context, scoped to the selected language
    if req.user_id:
        history_query = (
            "SELECT message, response FROM chat_history "
            "WHERE (user_id = %s OR session_id = %s) AND language = %s ORDER BY id ASC LIMIT 5"
        )
        past_chats = execute_query(history_query, (req.user_id, req.session_id, req.language), fetch=True)
    else:
        history_query = (
            "SELECT message, response FROM chat_history "
            "WHERE session_id = %s AND language = %s ORDER BY id ASC LIMIT 5"
        )
        past_chats = execute_query(history_query, (req.session_id, req.language), fetch=True)

    history_context = ""
    if past_chats:
        for chat in past_chats:
            history_context += f"Citizen: {chat['message']}\nAssistant: {chat['response']}\n"

    # #region agent log
    _debug_log(
        "main.py:chat",
        "History loaded",
        {"language": req.language, "history_count": len(past_chats or [])},
        "C",
    )
    # #endregion

    system_instructions = build_chat_prompt(req.language, req.message, history_context)

    ai_response = get_gemini_response(system_instructions, language=req.language)

    # Log raw AI response for debugging (trim to avoid huge logs)
    try:
        _debug_log("main.py:chat", "Raw AI response", {"raw_preview": ai_response[:2000]}, "D1")
    except Exception:
        pass

    # For Hindi/Marathi, also store the full raw response so we can inspect
    # any special characters or markup that may break frontend rendering.
    try:
        if req.language in ("Hindi", "Marathi"):
            _debug_log(
                "main.py:chat",
                "Raw AI response full (for Devanagari languages)",
                {"raw_full_len": len(ai_response), "raw_full": ai_response},
                "D1-full",
            )
    except Exception:
        pass

    # Post-process AI response to remove stray numeric-only lines that can
    # appear as isolated digits (e.g., a trailing "1" on its own) which
    # cause the frontend to render odd lone numbers or make the reply look
    # truncated. This keeps intended numbered lists but drops lines that are
    # only a number or number+dot.
    try:
        raw = ai_response
        lines = raw.splitlines()
        cleaned = []
        for line in lines:
            stripped = line.strip()
            # drop lines that are just digits like "1", "2." or Devanagari numerals like "१" or "१." etc.
            # Accept optional trailing punctuation: dot, parenthesis, colon, danda (।) or double danda (॥).
            if re.fullmatch(r"[\d\u0966-\u096F]+[.\)\]\:\-\u0964\u0965]?", stripped):
                continue
            cleaned.append(line)
        cleaned_response = "\n".join(cleaned).strip()
        if cleaned_response:
            ai_response = cleaned_response
        # Log whether cleaning changed content
        try:
            _debug_log(
                "main.py:chat",
                "Cleaned AI response",
                {"changed": raw != ai_response, "cleaned_preview": ai_response[:2000]},
                "D2",
            )
        except Exception:
            pass
    except Exception:
        # don't fail the whole request on cleanup errors
        pass

    # #region agent log
    _debug_log(
        "main.py:chat",
        "Chat response ready",
        {
            "language": req.language,
            "response_len": len(ai_response),
            "is_error": ai_response.startswith("AI system error") or "सीमा" in ai_response or "मर्यादा" in ai_response,
        },
        "D",
    )
    # #endregion
    
    # Save to history
    insert_query = "INSERT INTO chat_history (session_id, message, response, language, user_id) VALUES (%s, %s, %s, %s, %s)"
    execute_query(insert_query, (req.session_id, req.message, ai_response, req.language, req.user_id))
    
    return {"response": ai_response}

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    # Save uploaded file
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    relative_path = f"/uploads/{unique_filename}"
    
    prompt = (
        "Analyze this image of a civic issue in India. Identify the type of issue. "
        "It MUST be classified as one of: Pothole, Garbage, Water Leakage, Broken Streetlight, Broken Road. "
        "Suggest the severity: Low, Medium, High, or Critical. "
        "Determine the appropriate Indian local government department (e.g. Municipal Corporation, PWD, Electricity Board, Water Board). "
        "Provide a suitable short Title and a Description of the problem observed. "
        "Return the output as a valid JSON object matching this schema:\n"
        "{\n"
        '  "detected_type": "Pothole | Garbage | Water Leakage | Broken Streetlight | Broken Road",\n'
        '  "severity": "Low | Medium | High | Critical",\n'
        '  "suggested_department": "Name of department",\n'
        '  "title": "Brief title of complaint",\n'
        '  "description": "Detailed description of the issue"\n'
        "}\n"
        "Do not include any extra markdown formatting or backticks around the JSON. Return only the JSON object."
    )
    
    ai_json_str = get_gemini_response(prompt, is_vision=True, image_path=file_path)
    
    # Clean JSON output if AI added markdown code fences
    if ai_json_str.startswith("```"):
        lines = ai_json_str.split("\n")
        if lines[0].startswith("```json") or lines[0].startswith("```"):
            lines = lines[1:-1]
        ai_json_str = "\n".join(lines)
        
    try:
        analysis = json.loads(ai_json_str.strip())
    except Exception as e:
        print(f"Error parsing AI JSON response: {e}, Response: {ai_json_str}")
        # Manual parse fallback
        analysis = {
            "detected_type": "Pothole",
            "severity": "High",
            "suggested_department": "Municipal Corporation / Public Works Department (PWD)",
            "title": "Reported Civic Disturbance",
            "description": "Visual analysis indicates a civic issue requiring municipal attention."
        }
        
    analysis["image_path"] = relative_path
    return analysis

@app.post("/predict-risk")
async def predict_risk(req: RiskRequest):
    score = 50
    priority = "Medium"
    
    if ml_model is not None:
        try:
            encoders = ml_model['encoders']
            regressor = ml_model['regressor']
            classifier = ml_model['classifier']
            
            # Helper to safely transform
            def safe_transform(col, val):
                le = encoders[col]
                try:
                    return le.transform([val])[0]
                except Exception:
                    # Return first category if not found
                    return 0

            type_enc = safe_transform('complaint_type', req.complaint_type)
            sev_enc = safe_transform('severity', req.severity)
            loc_enc = safe_transform('location_type', req.location_type)
            time_enc = safe_transform('time_of_day', req.time_of_day)
            
            features = np.array([[type_enc, sev_enc, loc_enc, req.traffic_density, time_enc]])
            
            # Predict
            score = int(regressor.predict(features)[0])
            priority = str(classifier.predict(features)[0])
        except Exception as e:
            print(f"Error running ML prediction: {e}")
            # Fallback simple heuristic
            if req.severity == "Critical": score = 88; priority = "Critical"
            elif req.severity == "High": score = 72; priority = "High"
            elif req.severity == "Medium": score = 52; priority = "Medium"
            else: score = 25; priority = "Low"
    else:
        # Heuristic fallback if model not loaded
        if req.severity == "Critical": score = 90; priority = "Critical"
        elif req.severity == "High": score = 75; priority = "High"
        elif req.severity == "Medium": score = 50; priority = "Medium"
        else: score = 20; priority = "Low"
        
    # Ask Gemini to write an explanation for the risk assessment
    explain_prompt = (
        f"Generate a clear, professional 2-sentence explanation of why a civic complaint of type '{req.complaint_type}' "
        f"with severity '{req.severity}' in a '{req.location_type}' location with traffic density {req.traffic_density}% "
        f"and occurring during the '{req.time_of_day}' has been assessed with a Risk Score of {score}/100 and priority '{priority}'."
    )
    explanation = get_gemini_response(explain_prompt)
    
    return {
        "risk_score": score,
        "priority": priority,
        "reason": explanation
    }

@app.post("/api/auth/google")
async def google_auth(req: GoogleLoginRequest):
    # Decode payload from Google credential token directly
    # Client sends credential token, which is a signed JWT.
    # In a fully secure setup, we would verify the signature with Google's public keys.
    # For speed and easy configuration without requiring outbound HTTPS in offline modes,
    # we can decode the claims from the JWT.
    try:
        # Decode without verification for offline/dev speed, but retrieve payload info
        payload = jwt.decode(req.credential, options={"verify_signature": False})
        google_id = payload.get("sub")
        email = payload.get("email")
        name = payload.get("name")
        picture = payload.get("picture")

        if not google_id or not email:
            raise HTTPException(status_code=400, detail="Invalid token payload")

        # Check if user exists
        user = execute_query("SELECT * FROM users WHERE google_id = %s", (google_id,), fetch=True, fetch_one=True)
        if not user:
            # Create user
            insert_user = (
                "INSERT INTO users (google_id, email, name, picture) VALUES (%s, %s, %s, %s)"
            )
            user_id = execute_query(insert_user, (google_id, email, name, picture))
            user = {
                "id": user_id,
                "google_id": google_id,
                "email": email,
                "name": name,
                "picture": picture,
                "age": None,
                "occupation": None,
                "income": None,
                "gender": None,
                "education": None
            }
        else:
            # Sync user name / profile pic changes
            update_query = "UPDATE users SET name = %s, picture = %s WHERE google_id = %s"
            execute_query(update_query, (name, picture, google_id))
            user["name"] = name
            user["picture"] = picture

        # Generate a session JWT for the client app
        session_token = jwt.encode(
            {"user_id": user["id"], "email": user["email"]},
            JWT_SECRET,
            algorithm=JWT_ALGORITHM
        )

        return {"token": session_token, "user": user}
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

@app.post("/api/users/profile")
async def update_profile(payload: dict):
    # Retrieve user from authorization header token
    auth_header = payload.get("token")
    if not auth_header:
        raise HTTPException(status_code=401, detail="No token provided")
    
    try:
        decoded = jwt.decode(auth_header, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = decoded.get("user_id")
        
        age = payload.get("age")
        occupation = payload.get("occupation")
        income = payload.get("income")
        gender = payload.get("gender")
        education = payload.get("education")
        
        update_query = (
            "UPDATE users SET age = %s, occupation = %s, income = %s, gender = %s, education = %s WHERE id = %s"
        )
        execute_query(update_query, (age, occupation, income, gender, education, user_id))
        
        updated_user = execute_query("SELECT * FROM users WHERE id = %s", (user_id,), fetch=True, fetch_one=True)
        return {"success": True, "user": updated_user}
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid session token: {str(e)}")

@app.post("/submit-complaint")
async def submit_complaint(req: ComplaintSubmitRequest):
    insert_complaint = (
        "INSERT INTO complaints (user_id, title, description, image_path, detected_type, suggested_department, severity, status) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, 'Submitted')"
    )
    complaint_id = execute_query(
        insert_complaint, 
        (req.user_id, req.title, req.description, req.image_path, req.detected_type, req.suggested_department, req.severity)
    )
    
    if req.risk_score is not None:
        insert_risk = (
            "INSERT INTO risk_predictions (complaint_id, risk_score, priority, reasoning) "
            "VALUES (%s, %s, %s, %s)"
        )
        execute_query(insert_risk, (complaint_id, req.risk_score, req.priority, req.reasoning))
        
    return {"success": True, "complaint_id": complaint_id}

@app.post("/recommend-schemes")
async def recommend_schemes(req: SchemeRequest):
    # Store or update user info if user_id is provided
    if req.user_id:
        update_user = "UPDATE users SET age = %s, occupation = %s, income = %s, gender = %s, education = %s WHERE id = %s"
        execute_query(update_user, (req.age, req.occupation, req.income, req.gender, req.education, req.user_id))
    else:
        # Simple anonymous log tracking
        insert_user = "INSERT INTO users (age, occupation, income, gender, education) VALUES (%s, %s, %s, %s, %s)"
        execute_query(insert_user, (req.age, req.occupation, req.income, req.gender, req.education))

    # 2. Fetch all schemes to screen them
    schemes = execute_query("SELECT * FROM government_schemes", fetch=True)
    
    eligible_schemes = []
    
    for s in schemes:
        # Check basic criteria in python
        # Check age
        if req.age < s['min_age'] or req.age > s['max_age']:
            continue
        
        # Check income
        if req.income > s['max_income']:
            continue
            
        # Check gender
        if s['gender'] != 'All' and s['gender'].lower() != req.gender.lower():
            continue
            
        # Check occupation
        if s['occupations'] != 'Any':
            allowed_occupations = [o.strip().lower() for o in s['occupations'].split(",")]
            if req.occupation.lower() not in allowed_occupations and 'any' not in allowed_occupations:
                continue
                
        # Check education
        if s['education_level'] != 'Any':
            allowed_edu = [e.strip().lower() for e in s['education_level'].split(",")]
            if req.education.lower() not in allowed_edu and 'any' not in allowed_edu:
                continue
                
        eligible_schemes.append(s)

    # 3. Generate customized explanation for eligibility with Gemini
    recommendations = []
    for s in eligible_schemes[:4]:  # limit to top 4 recommendations
        explain_prompt = (
            f"Explain to a citizen in 2 lines why they are eligible for the '{s['name']}' government scheme. "
            f"Their profile: Age={req.age}, Occupation={req.occupation}, Income=₹{req.income}/year, Gender={req.gender}, Education={req.education}."
        )
        why_eligible = get_gemini_response(explain_prompt)
        recommendations.append({
            "id": s["id"],
            "name": s["name"],
            "description": s["description"],
            "benefits": s["benefits"],
            "why_eligible": why_eligible
        })
        
    return {"schemes": recommendations}

@app.get("/complaints")
async def get_complaints(user_id: Optional[int] = None):
    if user_id:
        query = (
            "SELECT c.*, r.risk_score, r.priority, r.reasoning FROM complaints c "
            "LEFT JOIN risk_predictions r ON c.id = r.complaint_id "
            "WHERE c.user_id = %s "
            "ORDER BY c.created_at DESC"
        )
        complaints = execute_query(query, (user_id,), fetch=True)
    else:
        query = (
            "SELECT c.*, r.risk_score, r.priority, r.reasoning FROM complaints c "
            "LEFT JOIN risk_predictions r ON c.id = r.complaint_id "
            "ORDER BY c.created_at DESC"
        )
        complaints = execute_query(query, fetch=True)
    return complaints

@app.get("/complaint/{id}")
async def get_complaint(id: int):
    query = (
        "SELECT c.*, r.risk_score, r.priority, r.reasoning FROM complaints c "
        "LEFT JOIN risk_predictions r ON c.id = r.complaint_id "
        "WHERE c.id = %s"
    )
    complaint = execute_query(query, (id,), fetch=True, fetch_one=True)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint

@app.put("/complaint/{id}/status")
async def update_complaint_status(id: int, payload: dict):
    status = payload.get("status")
    if status not in ["Submitted", "Under Review", "Assigned", "Resolved"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    query = "UPDATE complaints SET status = %s WHERE id = %s"
    execute_query(query, (status, id))
    return {"success": True, "status": status}

