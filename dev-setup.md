# 🚀 Development Setup Guide

## 📋 Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

## 🏗️ Project Structure

After restructuring, your project now has:

```
LuxuryofNothing/
├── frontend/           # Frontend application
│   ├── src/           # Source files (HTML, CSS, JS)
│   ├── package.json   # Frontend dependencies
│   └── README.md      # Frontend documentation
├── backend/            # Backend API server
│   ├── server.js      # Express server
│   ├── package.json   # Backend dependencies
│   └── README.md      # Backend documentation
├── assets/             # Shared assets
└── README.md           # Main project documentation
```

## 🔧 Initial Setup

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
```bash
# In backend folder
cp env.example .env
```

Edit `.env` file with your credentials:
```bash
PORT=3000
NODE_ENV=development
PAYSERA_PROJECT_ID=your_paysera_project_id
PAYSERA_PASSWORD=your_paysera_password
CORS_ORIGIN=http://localhost:5000
JWT_SECRET=your_jwt_secret_here
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## 🚀 Development Workflow

### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```
Backend runs at `http://localhost:3000`

### Terminal 2 - Frontend Development
```bash
cd frontend
npm run dev
```
Frontend opens at `http://localhost:5000`

## 🧪 Testing the Setup

### Backend Health Check
```bash
curl http://localhost:3000/health
```
Should return server status.

### Frontend
Open `http://localhost:5000` in your browser.

## 🔍 What Was Fixed

### ❌ **Before (Problems)**
- Mixed package.json files causing dependency conflicts
- Server files scattered in root directory
- No clear separation between frontend/backend
- Hardcoded configuration values
- Confusing file structure
- No proper error handling
- Mixed payment gateway documentation

### ✅ **After (Solutions)**
- **Clear separation**: Frontend and backend in separate folders
- **Proper dependencies**: Each folder has its own package.json
- **Environment configuration**: Uses .env files for sensitive data
- **Clean architecture**: API endpoints properly structured
- **Better error handling**: Consistent error responses
- **Documentation**: Separate READMEs for each component
- **Development workflow**: Clear setup and run instructions

## 🎯 Key Improvements

1. **Separation of Concerns**: Frontend and backend are now completely separate
2. **Environment Management**: Sensitive data is now in environment variables
3. **API Structure**: Clean REST API endpoints with proper error handling
4. **Development Experience**: Easy to run both services simultaneously
5. **Documentation**: Clear instructions for setup and development
6. **Maintainability**: Code is now organized and easier to maintain

## 🚨 Important Notes

- **Backend must run first** before starting frontend
- **Environment variables** must be configured in backend/.env
- **CORS is configured** to allow frontend (localhost:5000) to access backend (localhost:3000)
- **Payment integration** requires Paysera credentials

## 🔮 Next Steps

1. **Test the setup** - Make sure both services run
2. **Configure Paysera** - Add your payment gateway credentials
3. **Test payments** - Verify the payment flow works
4. **Deploy** - Use the deployment guides in each folder

## 🆘 Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify .env file exists and has correct values
- Check Node.js version (needs 18+)

### Frontend can't connect to backend
- Ensure backend is running on port 3000
- Check CORS_ORIGIN in backend/.env
- Verify API endpoints in frontend/src/js/config/api.js

### Payment issues
- Verify Paysera credentials in backend/.env
- Check browser console for API errors
- Verify backend payment endpoints are working 