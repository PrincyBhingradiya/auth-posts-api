# Auth + Posts API  

A secure REST API built with **Node.js, Express, MongoDB**, providing **user authentication, password reset via email, rate limiting, and post management**.  

## Features  

✅ User Registration & Login (JWT-based)  
✅ Logout with Token Blacklist  
✅ Forgot Password with Email Reset Link (Nodemailer + Gmail SMTP)  
✅ Reset Password with Expiring Token  
✅ Rate Limiting for Login & Forgot Password  
✅ Get Posts by Location (Latitude/Longitude)  
✅ Secure API routes with Authentication Middleware  

---

##  Tech Stack  

- **Node.js** + **Express.js** (Backend Framework)  
- **MongoDB + Mongoose** (Database)  
- **JWT (JSON Web Token)** for authentication  
- **bcrypt.js** for password hashing  
- **express-rate-limit** for rate limiting  
- **Nodemailer** for email sending  

---

## 📂 Folder Structure  

auth-posts-api/
│── config/ # Database connection
│── controllers/ # Business logic (auth, posts)
│── middleware/ # Auth middleware
│── models/ # Mongoose models (User, Post)
│── routes/ # API route definitions
│── .env # Environment variables (dummy values)
│── server.js # Main server entry
│── package.json # Dependencies
