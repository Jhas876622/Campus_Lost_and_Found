<div align="center">

# 🔍 Campus Lost & Found Portal

### A full-stack web application for campus communities to report, search, and reclaim lost items.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Site-4F46E5?style=for-the-badge)](https://campus-lost-and-found-bice.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.0.0-brightgreen?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)

**[🌐 Live Demo](https://campus-lost-and-found-bice.vercel.app/) · [📖 API Docs](#-api-endpoints) · [🐛 Report Bug](https://github.com/Jhas876622/campus-lost-found/issues) · [✨ Request Feature](https://github.com/Jhas876622/campus-lost-found/issues)**

</div>

---

## 📸 Preview

> A modern glass-morphism UI with real-time notifications, smart search, and Google OAuth — built for campus communities.

---

## ✨ Features

### 🔐 Authentication & Security
- **Google OAuth 2.0** — One-click sign-in with your Google account
- **JWT Authentication** — Secure, token-based session management
- **Bcrypt Password Hashing** — Industry-standard password security
- **Rate Limiting & Helmet** — Protection against common web attacks
- **Input Validation** — Server-side validation on all endpoints

### 📦 Core Features
- 📝 **Report Lost/Found Items** — Easy form with multi-image upload (up to 5 images)
- 🔍 **Smart Search & Filters** — Filter by category, location, type, and keywords
- 📷 **Cloudinary Image Storage** — Fast, optimized image delivery
- ✅ **Claim System** — Submit claims with verification questions
- 🔔 **Real-Time Notifications** — Instant WebSocket alerts via Socket.io
- 📧 **Email Notifications** — Automated emails for matches and claim updates
- 🛡️ **Admin Dashboard** — Moderate content, manage users, handle reports

### 🎨 UI/UX
- **Glass-morphism Design** — Modern frosted-glass aesthetic
- **Smooth Animations** — Powered by Framer Motion
- **Fully Responsive** — Seamlessly works on mobile, tablet, and desktop
- **Lazy Loading** — Optimized performance with efficient queries

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI Library |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| React Router v6 | Routing |
| Axios | HTTP Client |
| Lucide React | Icons |
| React Dropzone | File Uploads |
| React Hot Toast | Notifications |
| Socket.io Client | Real-time Events |

</td>
<td valign="top" width="50%">

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | Server & API |
| MongoDB + Mongoose | Database & ODM |
| Passport.js (Google OAuth) | Authentication |
| JWT + Bcrypt | Auth & Security |
| Cloudinary | Image Storage |
| Nodemailer | Email Service |
| Socket.io | WebSockets |
| Express Validator | Input Validation |
| Helmet | HTTP Security |

</td>
</tr>
</table>

---

## 🚀 Live Deployment

| Service | Platform | URL |
|---|---|---|
| 🌐 Frontend | Vercel | [campus-lost-and-found-bice.vercel.app](https://campus-lost-and-found-bice.vercel.app/) |
| ⚙️ Backend API | Render | `https://your-render-app.onrender.com/api` |

---

## 📁 Project Structure

```
campus-lost-found/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   ├── cloudinary.js      # Cloudinary setup
│   │   ├── email.js           # Email configuration
│   │   ├── passport.js        # Google OAuth strategy
│   │   └── socket.js          # Socket.io configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── itemController.js
│   │   ├── claimController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   └── errorHandler.js    # Global error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── Item.js
│   │   └── Claim.js
│   ├── routes/
│   │   ├── auth.js            # Auth + Google OAuth routes
│   │   ├── items.js
│   │   ├── claims.js
│   │   └── admin.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── favicon.svg
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.jsx
    │   │   │   └── index.jsx
    │   │   └── items/
    │   │       ├── ItemCard.jsx
    │   │       └── ItemFilters.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   └── index.js
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── ItemsPage.jsx
    │   │   ├── ItemDetailPage.jsx
    │   │   ├── PostItemPage.jsx
    │   │   ├── MyItemsPage.jsx
    │   │   ├── MyClaimsPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── AdminPage.jsx
    │   │   └── NotFoundPage.jsx
    │   ├── styles/
    │   │   └── index.css
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── constants.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

---

## ⚙️ Getting Started (Local Development)

### Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- Cloudinary account
- Google Cloud Console project (for OAuth)
- SMTP email service (Gmail, SendGrid, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jhas876622/campus-lost-found.git
   cd campus-lost-found
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Fill in your credentials (see below)
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   ```

### 🔑 Environment Variables

#### Backend (`backend/.env`)

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/campus-lost-found

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=30d

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@campuslf.com

# Frontend URL (for CORS & OAuth redirect)
FRONTEND_URL=http://localhost:5173
```

#### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 🔧 Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project → **APIs & Services** → **Credentials**
3. Click **Create Credentials** → **OAuth 2.0 Client IDs**
4. Set application type to **Web Application**
5. Add Authorized Redirect URIs:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://your-render-app.onrender.com/api/auth/google/callback`
6. Copy your `Client ID` and `Client Secret` into `.env`

### ▶️ Running the Application

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- 🌐 Frontend: http://localhost:5173
- ⚙️ Backend API: http://localhost:5000/api

---

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with email & password |
| POST | `/api/auth/login` | Login with email & password |
| GET | `/api/auth/google` | Initiate Google OAuth flow |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| GET | `/api/auth/me` | Get current logged-in user |
| PUT | `/api/auth/profile` | Update user profile |
| PUT | `/api/auth/password` | Change password |

### Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | List all items (with filters) |
| GET | `/api/items/:id` | Get single item detail |
| POST | `/api/items` | Create a new item |
| PUT | `/api/items/:id` | Update an item |
| DELETE | `/api/items/:id` | Delete an item |
| GET | `/api/items/user/my-items` | Get current user's items |
| POST | `/api/items/:id/report` | Report a suspicious item |

### Claims
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/claims` | Submit a new claim |
| GET | `/api/claims/my-claims` | Get current user's claims |
| GET | `/api/claims/item/:itemId` | Get all claims for an item |
| PUT | `/api/claims/:id/status` | Approve or reject a claim |
| PUT | `/api/claims/:id/cancel` | Cancel a pending claim |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard statistics |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id/role` | Update user role |
| DELETE | `/api/admin/users/:id` | Remove a user |
| GET | `/api/admin/reported-items` | View flagged items |
| PUT | `/api/admin/items/:id/handle-report` | Resolve a report |

---

## ☁️ Deployment Guide

### Backend — Render

1. Create a **New Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Add all environment variables from `backend/.env`
5. Update `GOOGLE_CALLBACK_URL` to your Render URL

### Frontend — Vercel

1. Import your repository on [Vercel](https://vercel.com)
2. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add environment variable: `VITE_API_URL=https://your-render-app.onrender.com/api`

> ⚠️ After deploying, update your **Google Cloud Console** OAuth credentials with the production callback URL.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add AmazingFeature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a **Pull Request**

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Satyam Kumar Jha**

[![GitHub](https://img.shields.io/badge/GitHub-Jhas876622-181717?style=flat&logo=github)](https://github.com/Jhas876622)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Satyam_Kumar_Jha-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/satyam-kumar-jha-27545a288)

---

## 🙏 Acknowledgements

[React](https://reactjs.org/) · [Tailwind CSS](https://tailwindcss.com/) · [Framer Motion](https://www.framer.com/motion/) · [Lucide Icons](https://lucide.dev/) · [Cloudinary](https://cloudinary.com/) · [Google OAuth](https://developers.google.com/identity) · [Socket.io](https://socket.io/)

---

<div align="center">

⭐ **If you found this project helpful, please give it a star!** ⭐

</div>
