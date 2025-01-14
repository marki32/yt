export const API_URL = import.meta.env.PROD 
  ? 'https://your-backend-url.vercel.app'  // This will be updated after backend deployment
  : 'http://localhost:3001';
