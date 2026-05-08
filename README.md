# 💊 Medico Guidance

A full-stack AI-powered medical guidance web application built as a Final Year Project (FYP). Medico helps users manage medicines, check drug interactions, scan prescriptions via OCR, get AI-driven symptom analysis, and receive medicine expiry reminders.

🌐 **Live Demo:** [fyp-one-zeta.vercel.app](https://fyp-one-zeta.vercel.app)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
- [Deployment](#deployment)

---

## ✨ Features

- 🔐 **Authentication** — Secure user registration and login with JWT
- 💊 **Medicine Management** — Search, add, and manage medicines with AI enrichment
- 🤖 **AI Guidance** — Groq AI-powered medical Q&A and recommendations
- 🧾 **OCR Prescription Scanning** — Extract medicine data from prescription images
- ⚠️ **Drug Interaction Checker** — Detect harmful combinations between medicines
- 🩺 **Symptom Checker** — AI-driven symptom analysis and suggestions
- 📋 **Prescription Management** — Store and manage patient prescriptions
- ⏰ **Medicine Reminders** — Scheduled reminders for medicine intake
- 📅 **Expiry Tracker** — Track and get alerts for medicine expiry dates
- 🚨 **Fake Report Detection** — Identify and flag suspicious medical reports
- 🛡️ **Admin Panel** — Admin dashboard for managing users and content

---

## 🛠 Tech Stack

### Frontend (client/)
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| React Router DOM v7 | Client-side routing |
| Tailwind CSS v4 | Styling |
| Axios | HTTP requests |
| Lucide React | Icons |
| React Hot Toast | Notifications |
| @zxing/browser | QR/Barcode scanning |
| Vite | Build tool |

### Backend (server/)
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| Groq AI API | AI-powered features |
| OCR API | Prescription text extraction |
| Nodemailer | Email notifications |
| Green API | WhatsApp notifications |

---

## 📁 Project Structure

```
fyp/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Express backend
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route handlers
│   │   ├── auth.route.js
│   │   ├── medicine.route.js
│   │   ├── ai.route.js
│   │   ├── ocr.route.js
│   │   ├── interaction.js
│   │   ├── prescription.route.js
│   │   ├── symptom.route.js
│   │   ├── reminder.routes.js
│   │   ├── expiry.route.js
│   │   ├── fakeReport.routes.js
│   │   └── admin.route.js
│   ├── server.js           # Main server entry point
│   └── .env                # Environment variables (not committed)
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Groq API key
- OCR API key

### 1. Clone the repository

```bash
git clone https://github.com/imtinannaqvi/fyp.git
cd fyp
```

### 2. Setup the Server

```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder (see [Environment Variables](#environment-variables) below).

```bash
npm start
```

Server runs on `http://localhost:5000`

### 3. Setup the Client

```bash
cd ../client
npm install
npm run dev
```

Client runs on `http://localhost:5173`

---

## 🔑 Environment Variables

Create a `server/.env` file with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
BACKEND_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
GROQ_API_KEY=your_groq_api_key
CALLMEBOT_APIKEY=your_callmebot_key
GREEN_API_INSTANCE=your_green_api_instance
GREEN_API_TOKEN=your_green_api_token
OCR_API_KEY=your_ocr_api_key
```

> ⚠️ Never commit your `.env` file. It is already added to `.gitignore`.

---

## 📡 API Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/medicine` | Get all medicines |
| POST | `/api/medicine` | Add a medicine |
| GET | `/api/interaction` | Check drug interactions |
| POST | `/api/ai` | AI medical guidance |
| POST | `/api/ocr` | Scan prescription via OCR |
| GET | `/api/prescription` | Get prescriptions |
| POST | `/api/symptom` | Symptom checker |
| GET | `/api/reminders` | Get medicine reminders |
| GET | `/api/expiry` | Check medicine expiry |
| POST | `/api/fake-report` | Flag fake reports |
| GET | `/api/admin` | Admin panel data |

---

## ☁️ Deployment

- **Frontend** → Deployed on [Vercel](https://vercel.com)
- **Backend** → Deployed on [Render](https://render.com) or similar Node.js hosting

Make sure to set all environment variables in your hosting platform's dashboard.

---

## 👨‍💻 Author

**Imtinan Naqvi**
- GitHub: [@imtinannaqvi](https://github.com/imtinannaqvi)

---

## 📄 License

This project was developed as a Final Year Project (FYP). All rights reserved.