const express = require('express');
const { register, login, logout, forgotPassword, resetPassword } = require('../controllers/authController'); 
const auth = require("../middleware/auth");
const rateLimit = require('express-rate-limit');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,  
  max: 5,                    
  message: { message: "Too many login attempts. Try again after 5 minutes." },
  standardHeaders: true,     
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { message: "Too many password reset attempts. Try again later." }
});


router.post('/register', register);
router.post('/login',loginLimiter, login);
router.post('/logout', auth, logout); 
router.post('/forgot-password',forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
