# 🇮🇳 Bharat Saarthi AI (भारत सारथी AI)

> **Empowering Indian Citizens with AI-driven Civic Grievance Redressal, Multilingual Guidance & Government Scheme Discovery.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-bharat--saarthi--ai.vercel.app-000080?style=for-the-badge&logo=vercel&logoColor=white)](https://bharat-saarthi-ai.vercel.app/)
[![React](https://img.shields.io/badge/Frontend-React_18_%7C_Vite_%7C_Tailwind-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_%7C_Python-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/AI_Engine-Google_Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![ML Model](https://img.shields.io/badge/ML_Model-Scikit--Learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)

---

## 🔗 Live Application

🌍 **Try Bharat Saarthi AI Live:** [https://bharat-saarthi-ai.vercel.app/](https://bharat-saarthi-ai.vercel.app/)

---

## 📌 Project Overview

**Bharat Saarthi AI** is an intelligent civic assistance platform designed to bridge the gap between Indian citizens and public administration. Built with **React**, **FastAPI**, **Google Gemini AI**, and **Machine Learning**, the application simplifies civic grievance reporting, offers multilingual voice/text support, and provides personalized government scheme recommendations.

Whether a citizen wants to report a pothole, check eligibility for welfare schemes, or seek answers to public service queries in their local language, **Bharat Saarthi AI** acts as a digital guide (*Saarthi*) for every citizen.

---

## ✨ Key Features

### 1. 🗣️ Multilingual AI Citizen Companion (`/chat`)
- **Voice & Text Interface:** Talk or type queries naturally. Supports built-in speech recognition.
- **Multilingual Support:** Converses seamlessly in **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.
- **Context-Aware Assistance:** Answers questions on government policies, municipal services, documentation requirements, and public welfare.

### 2. 📸 Smart Civic Complaint Reporting (`/complaint-reporting`)
- **Vision-Based AI Auto-Detection:** Upload a picture of a civic issue (e.g., potholes, garbage accumulation, damaged streetlights, water leakage). Google Gemini Vision analyzes the image to automatically detect the issue type, description, and severity.
- **Department Routing:** Automatically routes complaints to the appropriate authority (Municipal Corporation, PWD, Electricity Board, Traffic Police).
- **ML Risk Assessment Model:** Scikit-Learn model calculates a risk score (0–100) and priority level (High, Medium, Low) based on factors such as location type, severity, and traffic density.

### 3. 📊 Complaint Management Dashboard (`/dashboard`)
- **Real-Time Tracking:** View all submitted complaints with status updates (Pending, In Progress, Resolved).
- **Priority & Risk Analytics:** Filter and inspect issues by department, risk score, and severity level.

### 4. 🎯 Government Schemes Recommender (`/schemes`)
- **Personalized Eligibility Engine:** Enter basic demographic details (Age, Gender, Occupation, Income, Education Level).
- **Targeted Recommendations:** Matches citizens with relevant Central & State welfare programs (e.g., PM-Kisan, Ayushman Bharat, PM Awas Yojana, MUDRA Yojana, Sukanya Samriddhi Yojana).

### 5. 🔐 Google OAuth Authentication
- Secure login integration using **Google Identity Services** with JWT session validation and user profile storage.

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **Routing:** React Router DOM v6
- **Auth & API:** `@react-oauth/google`, Axios
- **Deployment:** Vercel

### Backend
- **Framework:** FastAPI (Python 3.10+)
- **Server:** Uvicorn / Gunicorn
- **AI Integration:** Google Generative AI (`google-generativeai` SDK - Gemini 2.5/2.0 Flash)
- **Machine Learning:** Scikit-Learn (RandomForest Classifier / Regressor for risk prediction), NumPy, Pandas
- **Database:** MySQL / TiDB Cloud support with automatic zero-config fallback to local **SQLite**
- **Authentication:** PyJWT, Google OAuth token verification

---

## 📁 Project Structure

```text
Bharat-SaarthiAI/
├── frontend/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── constants/            # Language & static constants
│   │   ├── pages/                # Page views
│   │   │   ├── LandingPage.jsx         # Homepage & Quick Actions
│   │   │   ├── AIChat.jsx              # Multilingual AI Assistant
│   │   │   ├── ComplaintReporting.jsx  # AI Complaint Submission & Image Analysis
│   │   │   ├── ComplaintDashboard.jsx  # Grievance Dashboard
│   │   │   └── GovernmentSchemes.jsx   # Welfare Scheme Matcher
│   │   ├── services/             # Axios API service handlers
│   │   ├── App.jsx               # Navigation router & main layout
│   │   └── main.jsx              # Application entry point
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.js            # Vite build configuration
│   ├── tailwind.config.js        # Tailwind styling rules
│   └── vercel.json               # Vercel deployment routing
│
├── backend/                      # FastAPI Python Backend
│   ├── uploads/                  # Storage directory for submitted complaint images
│   ├── main.py                   # FastAPI REST API endpoints & Gemini integration
│   ├── database.py               # Database initialization (MySQL/SQLite dual support)
│   ├── train_model.py            # ML model training script
│   ├── ml_model.pkl              # Pre-trained ML risk assessment model
│   ├── requirements.txt          # Python dependencies
│   ├── gunicorn_conf.py          # Production web server configuration
│   └── .env.example              # Environment variables template
│
└── README.md                     # Project documentation
```

---

## 🚀 Getting Started

Follow these instructions to set up and run **Bharat Saarthi AI** on your local machine.

### Prerequisites
- **Node.js:** v18.x or higher
- **Python:** v3.10 or higher
- **Git**

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Shruti-Bhunde/Bharat-SaarthiAI.git
cd Bharat-SaarthiAI
```

---

### 2️⃣ Backend Setup (FastAPI)

1. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```

2. **Create and activate a Python virtual environment:**
   - **Windows:**
     ```bash
     python -m venv .venv
     .venv\Scripts\activate
     ```
   - **macOS / Linux:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up Environment Variables:**
   Create a `.env` file in the `backend/` directory (or copy from `.env.example`):
   ```env
   # Required for Gemini AI Chat & Image Analysis
   GEMINI_API_KEY=your_gemini_api_key_here

   # Secret Key for JWT Authentication
   JWT_SECRET=your_jwt_secret_key

   # Database (Optional: Defaults to local SQLite if empty)
   DB_HOST=localhost
   DB_USER=
   DB_PASSWORD=
   DB_NAME=bharat_saarthi
   DB_PORT=3306
   ```

5. **(Optional) Train / Generate the ML Model:**
   ```bash
   python train_model.py
   ```

6. **Start the Backend Server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The API backend will start running at `http://localhost:8000`. You can access interactive Swagger docs at `http://localhost:8000/docs`.

---

### 3️⃣ Frontend Setup (React + Vite)

1. **Open a new terminal and navigate to the frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the `frontend/` directory (or copy from `.env.example`):
   ```env
   VITE_API_BASE=http://localhost:8000
   ```

4. **Start the Frontend Development Server:**
   ```bash
   npm run dev
   ```

5. **Access the App:**
   Open your browser and navigate to `http://localhost:5173`.

---

## 🛠️ API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/google` | Google OAuth token verification and user login |
| `POST` | `/chat` | Conversational AI companion endpoint (Gemini Powered) |
| `POST` | `/analyze-image` | Multimodal Vision analysis for civic complaint images |
| `POST` | `/predict-risk` | Machine Learning risk score and priority calculator |
| `POST` | `/submit-complaint` | Save new civic complaint to database |
| `GET` | `/complaints` | Retrieve user/all complaints |
| `PUT` | `/complaint/{id}/status` | Update status of a specific complaint |
| `POST` | `/recommend-schemes` | Fetch personalized government schemes matching user profile |

---

## 🌐 Live Deployment

- **Frontend App:** Hosted on [Vercel](https://bharat-saarthi-ai.vercel.app/)
- **Live URL:** `https://bharat-saarthi-ai.vercel.app/`

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve **Bharat Saarthi AI**:
1. Fork the Repository
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p center> Made with ❤️ for empowering Indian Citizens </p>
