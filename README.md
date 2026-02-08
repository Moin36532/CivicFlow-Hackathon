🏙️ CivicFlow: The Community Engine
Stop waiting for change. Start building it. > The first AI-powered platform that turns complaints into legal action, and citizens into heroes.

**

🧐 The Problem
We live in cities that are breaking. You see a pothole, you tweet about it, and nothing happens. You want to help a hungry neighbor, but you don't know where to start. The system isn't broken; it's just disconnected.

💡 The Solution
CivicFlow unifies the entire city onto a single digital grid. It uses Google Gemini 1.5 Pro to analyze issues and Geo-Location to mobilize the community.

For Government Issues: It fights bureaucracy with AI-drafted legal complaints and viral social pressure.

For Community Issues: It matches volunteers (doctors, donors) to critical needs in seconds.

🚀 Key Features
🏛️ The Bureaucracy Hacker (Govt Mode)
AI Severity Analysis: Instantly scans photos to detect danger levels (1-10) using Gemini Vision.

Legal Action: Generates professional, legally-cited complaints (referencing specific Municipal Acts) that authorities cannot ignore.

Viral Pressure: One-click generation of data-backed viral tweets to demand accountability.

Department Ranking: Tracks and publicly ranks government departments by efficiency.

🤝 The Community Engine (Volunteer Mode)
Smart Matching: Uses Vector Search to match your skills (e.g., "Medical", "Rescue") to nearby problems.

Gamified Leagues: Earn XP for every task. Grind from Bronze to the elite Diamond Tier.

Real-time Feed: Live map of needs like "O- Blood Needed" or "Food Drive Support".

🧠 Intelligence & Observability
RAG Chatbot: Context-aware AI assistant that knows local laws and safety protocols.

Opik Integration: Deep observability tracks every AI decision, ensuring safety, accuracy, and trust.

🛠️ Tech Stack
Brain: Python (FastAPI), Google Gemini 1.5 Pro, LangChain

Body: React (Vite), TypeScript, Tailwind CSS, Shadcn UI

Memory: SQLite (Vector Store), FAISS (optional for RAG)

Observability: Comet Opik

⚡ Getting Started
Follow these steps to set up the project locally.

1. Prerequisites
Python 3.9+

Node.js & npm

Google Gemini API Key

Opik API Key (Optional, for tracing)

2. Clone the Repository
Bash
git clone https://github.com/moin36532/CivicFlow-Hackathon
3. 🐍 Backend Setup (The Brain)
Navigate to the backend folder:

Bash
cd backend
Create a virtual environment and install dependencies:

Bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
Set up your environment variables: Create a .env file in the backend folder and add:

Ini, TOML
GOOGLE_API_KEY=your_gemini_api_key_here
OPIK_API_KEY=your_opik_api_key_here
Run the Server:

Bash
uvicorn main:app --reload
The backend is now running at http://127.0.0.1:8000 🧠

4. ⚛️ Frontend Setup (The Face)
Open a new terminal and navigate to the frontend folder (named Design App Identity and Flow):

Bash
cd "Design App Identity and Flow"
Install the node modules:

Bash
npm install
Start the React App:

Bash
npm run dev
The app is now running at http://localhost:5173 🚀
