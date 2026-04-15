# 🔍 Campus Lost & Found Portal

A full-stack web application for campus communities to report and find lost items. Built with modern technologies and featuring a beautiful glass-morphism UI design.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-61DAFB.svg)

## ✨ Features

### Core Features
- 📝 **Report Lost/Found Items** - Easy-to-use form with image uploads
- 🔍 **Smart Search & Filters** - Search by category, location, type, and keywords
- 📷 **Multi-Image Upload** - Upload up to 5 images per item via Cloudinary
- ✅ **Claim System** - Submit claims with verification questions
- 📧 **Email Notifications** - Get notified on matches and claim status updates
- 👤 **User Authentication** - Secure JWT-based authentication
- 🛡️ **Admin Dashboard** - Moderate content and manage users

### Technical Features
- 🎨 **Modern UI** - Glass-morphism design with smooth animations
- 📱 **Fully Responsive** - Works on all devices
- ⚡ **Optimized Performance** - Lazy loading and efficient queries
- 🔒 **Security** - Helmet, rate limiting, input validation

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Dropzone** - File uploads
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image storage
- **Nodemailer** - Emails
- **Express Validator** - Validation

## 📁 Project Structure

```
campus-lost-found/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   ├── cloudinary.js      # Cloudinary setup
│   │   └── email.js           # Email configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── itemController.js
│   │   ├── claimController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   └── errorHandler.js    # Error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── Item.js
│   │   └── Claim.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── items.js
│   │   ├── claims.js
│   │   └── admin.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── index.jsx
│   │   │   └── items/
│   │   │       ├── ItemCard.jsx
│   │   │       └── ItemFilters.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── index.js
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ItemsPage.jsx
│   │   │   ├── ItemDetailPage.jsx
│   │   │   ├── PostItemPage.jsx
│   │   │   ├── MyItemsPage.jsx
│   │   │   ├── MyClaimsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── AdminPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── constants.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- Cloudinary account
- SMTP email service (Gmail, SendGrid, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/campus-lost-found.git
   cd campus-lost-found
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env if needed (not required for development)
   ```

### Environment Variables

#### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/campus-lost-found

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=30d

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

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Running the Application

1. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |

### Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | List all items |
| GET | `/api/items/:id` | Get single item |
| POST | `/api/items` | Create item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |
| GET | `/api/items/user/my-items` | Get user's items |
| POST | `/api/items/:id/report` | Report item |

### Claims
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/claims` | Submit claim |
| GET | `/api/claims/my-claims` | Get user's claims |
| GET | `/api/claims/item/:itemId` | Get item claims |
| PUT | `/api/claims/:id/status` | Update claim status |
| PUT | `/api/claims/:id/cancel` | Cancel claim |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Get dashboard stats |
| GET | `/api/admin/users` | List users |
| PUT | `/api/admin/users/:id/role` | Update user role |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/reported-items` | Get reported items |
| PUT | `/api/admin/items/:id/handle-report` | Handle report |

## 🎨 Screenshots

### Home Page
- Hero section with stats
- Feature highlights
- Recent items grid
- Category browse

### Items Browse
- Filter by type, category, location
- Search functionality
- Pagination
- Responsive grid

### Item Detail
- Image gallery with thumbnails
- Claim submission form
- Verification questions
- Report functionality

### Dashboard
- My Items management
- Claims review (approve/reject)
- Profile settings
- Admin panel (for admins)

## 🚀 Deployment

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add environment variables

### Frontend (Vercel)
1. Import project from GitHub
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable: `VITE_API_URL`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/Jhas876622)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
- [Cloudinary](https://cloudinary.com/)

---

⭐ If you found this project helpful, please give it a star!
=======
# Campus_Lost_Found
