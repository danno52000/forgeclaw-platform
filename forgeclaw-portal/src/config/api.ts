// API configuration for ForgeClaw Portal

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://forgeclaw-platform.onrender.com'
  : 'http://localhost:3001';

export { API_BASE_URL };
