Achievo: The AI-Powered Goal Achievement Platform
Submission for the Full-Stack Engineering Intern Assignment.

Achievo is a comprehensive web application designed to help users break down large objectives into manageable, AI-curated learning journeys. It features a real-time, conversational AI Tutor that provides context-aware guidance, assesses user understanding, and gates progress to ensure true mastery of each step.

🔗 Live Demo & Submission Links
Live Application URL: https://experimentlabs.vercel.app

Demo Video URL:

GitHub Repository URL: https://github.com/prashantttzz/experimentlabs

✨ Core Features
🔐 Authentication System:

Secure user registration and login with email/password.

JWT-based authentication for protecting API routes.

Robust input validation and real-time password strength analysis.

🎯 AI-Powered Goal Management:

Users can input high-level goals (e.g., "Become a Data Scientist").

The Google Gemini API dynamically generates a detailed, multi-week learning journey broken into structured modules ("chunks").

Each module includes a description, learning objectives, and a list of skills to master.

🧠 Conversational AI Tutor:

A simulated video chat interface for an immersive learning experience.

Real-time, persistent chat powered by Socket.IO.

Conversations are saved per module, allowing users to pick up where they left off.

The AI's responses are context-aware, referencing the user's specific goal and current learning module.

Full Markdown rendering for beautifully formatted text and syntax-highlighted code blocks.

Access to the user's webcam for a more personal, face-to-face feel.

📈 Intelligent Progress Tracking:

Progress is gated by the AI Tutor. Users cannot simply "check a box" to complete a module.

A user must request an AI Assessment, where the AI evaluates their understanding based on the chat history and module objectives.

The backend unlocks the next module only upon a "passed" assessment from the AI.

🛠️ Tech Stack

Frontend- Next.js (React), TypeScript, Tailwind CSS, TanStack Query, Socket.io-client

Backend-Node.js, Express, TypeScript, Prisma (ORM), Socket.io

Database-Supabase (PostgreSQL)

AI-Google Gemini API (for journey generation, tutoring, and assessment)

Auth-JSON Web Tokens (JWT)

🏗️ System Architecture
The application follows a modern client-server architecture.

Client (Next.js): A server-side rendered React application that handles all UI and user interaction. It uses TanStack Query for server state management, communicating with the backend via a REST API for data operations and a WebSocket connection for real-time chat.

Server (Node.js/Express): A backend that exposes a RESTful API for authentication, goal management, and data fetching. It uses Prisma as an ORM to interact with the PostgreSQL database.

Real-time Layer (Socket.IO): The server also manages a WebSocket connection for the AI Tutor chat. This allows for instant, bi-directional communication between the user and the backend AI service.

Database (Supabase/PostgreSQL): A relational database that stores all user data, goals, learning modules (chunks), and chat history.

AI Services (Gemini): All AI logic is handled securely on the backend. The server constructs detailed prompts and makes calls to the Google Gemini API for goal generation, chat responses, and progress assessment.

🚀 Getting Started
Follow these instructions to get the project running on your local machine.

Prerequisites
Node.js (v18 or later)

npm

Git

A Supabase account for the PostgreSQL database.

1. Backend Setup

# Clone the repository

git clone https://github.com/prashantttzz/experimentlabs
cd achievo/backend

# Install dependencies

npm install

# Create a .env file and add your environment variables (see .env.example)

cp .env.example .env

# Run Prisma migrations to set up the database schema

npx prisma migrate dev

# Start the backend server

npm run dev

2. Frontend Setup

# Navigate to the frontend directory

cd ../frontend

# Install dependencies

npm install

# Create a .env.local file and add your environment variables (see .env.local.example)

cp .env.local.example .env.local

# Start the frontend development server

npm run dev

The application should now be running on http://localhost:3000.

🔑 Environment Variables
You will need to create the following .env files and populate them with your own keys.

Backend (/backend/.env)
DATABASE_URL="YOUR_SUPABASE_POSTGRESQL_CONNECTION_STRING"
GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"
JWT_SECRET="YOUR_SECRET_KEY_FOR_JWT_SIGNING"

Frontend (/frontend/.env.local)
NEXT_PUBLIC_SOCKET_URL="http://localhost:4000"
