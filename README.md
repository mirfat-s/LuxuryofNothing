# Luxury of Nothing

Ultra-minimalist site selling "nothing" as a luxury product. A conceptual art piece that satirizes luxury marketing and consumer culture.

## 🏗️ Project Structure

```
LuxuryofNothing/
├── frontend/           # Frontend application
│   ├── src/           # Source files
│   ├── package.json   # Frontend dependencies
│   └── README.md      # Frontend documentation
├── backend/            # Backend API server
│   ├── server.js      # Express server
│   ├── package.json   # Backend dependencies
│   └── README.md      # Backend documentation
├── assets/             # Shared assets
└── README.md           # This file
```

## 🚀 Quick Start

### Backend (API Server)
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your Paysera credentials
npm run dev
```
Server runs at `http://localhost:3000`

### Frontend (Website)
```bash
cd frontend
npm install
npm run dev
```
Website opens at `http://localhost:5000`

## 🎯 What This Project Is

**"Luxury of Nothing"** is a satirical luxury brand that:
- Sells absolutely nothing for €1,999
- Parodies high-end consumerism and marketing
- Demonstrates how presentation creates perceived value
- Questions our relationship with luxury and consumption

## ✨ Features

- **Ultra-minimalist luxury design** with sophisticated animations
- **Payment integration** with Paysera (Albania-focused)
- **Responsive design** optimized for all devices
- **Custom interactions** including floating orbs and custom cursor
- **Clean architecture** with separated frontend/backend concerns

## 🔧 Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Payment**: Paysera payment gateway
- **Styling**: Custom CSS with luxury design system
- **Animations**: CSS animations and JavaScript micro-interactions

## 📚 Documentation

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Payment Setup](./STRIPE_SETUP.md)

## 🌟 Design Philosophy

The project uses a refined luxury aesthetic with:
- Marble-inspired color palette
- Premium typography (Inter, Playfair Display, Cormorant Garamond)
- Sophisticated animations and micro-interactions
- Glass morphism effects and subtle shadows

## 🚀 Deployment

### Frontend
Upload `frontend/src/` contents to any static hosting service:
- Netlify (recommended)
- Vercel
- GitHub Pages
- Traditional web hosting

### Backend
Deploy `backend/` to:
- Heroku
- Railway
- DigitalOcean
- AWS/GCP

## 🔮 Future Enhancements

- [ ] Build system with Vite/Webpack
- [ ] Component-based architecture
- [ ] Database integration
- [ ] User authentication
- [ ] Order management
- [ ] Email notifications
- [ ] PWA capabilities

## 📄 License

MIT License - see LICENSE file for details

---

**Note**: This is a conceptual art project. The "product" being sold is intentionally nothing, serving as commentary on luxury marketing and consumer culture.