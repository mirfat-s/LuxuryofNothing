# Luxury of Nothing - Frontend

## 🚀 Quick Start

### Development
```bash
cd frontend
npm install
npm run dev
```

The site will open at `http://localhost:5000`

### Build (Future Implementation)
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── index.html                 # Homepage
│   ├── philosophy-products.html   # Product page
│   ├── css/                      # Stylesheets
│   │   ├── base.css             # Base styles and variables
│   │   ├── animations.css       # Animations and transitions
│   │   ├── buttons.css          # Button styles
│   │   ├── cursor.css           # Custom cursor
│   │   ├── luxury-details.css   # Luxury-specific styles
│   │   ├── modal.css            # Modal components
│   │   ├── orb.css              # Floating orb animations
│   │   ├── page-transition.css  # Page transitions
│   │   ├── product.css          # Product page styles
│   │   └── why.css              # Philosophy section styles
│   ├── js/                      # JavaScript modules
│   │   ├── main.js              # Main application logic
│   │   ├── background-squares.js # Background animations
│   │   ├── cursor.js            # Custom cursor logic
│   │   ├── orbs.js              # Orb animations
│   │   ├── config/              # Configuration files
│   │   │   └── api.js          # API endpoints and config
│   │   └── services/            # Service modules
│   │       └── paymentService.js # Payment processing
│   ├── assets/                  # Static assets
│   │   ├── fonts/               # Custom fonts
│   │   ├── pics/                # Images and media
│   │   └── data/                # Data files
│   └── models/                  # 3D models (GLTF)
│       └── void-cube.gltf       # Void cube model
├── package.json                  # Frontend dependencies
└── README.md                     # This file
```

## 🔧 Configuration

### API Configuration
Edit `src/js/config/api.js` to configure:
- Backend API endpoints
- Payment gateway settings
- Environment-specific variables

### Payment Integration
The frontend integrates with:
- **Paysera** (primary payment processor)
- **PayPal** (alternative payment method)

## 🎨 Design System

### Color Palette
- **Marble Whites**: #FDFCF9, #F9F7F3, #F4F2ED
- **Gold Accents**: #C4A572, #D4C4A0, #B8A67A
- **Text Colors**: #1A1A1A, #2C2C2C, #4A4A4A

### Typography
- **Primary**: Inter (UI elements)
- **Display**: Playfair Display (headings)
- **Serif**: Cormorant Garamond (accent text)

## 🚀 Features

- ✨ Ultra-minimalist luxury design
- 🎭 Sophisticated animations and micro-interactions
- 📱 Mobile-first responsive design
- 💳 Integrated payment processing
- 🎨 Custom cursor and interactive elements
- 🌊 Smooth page transitions
- 🎪 Floating orb animations

## 🔮 Future Improvements

- [ ] Build system with Vite/Webpack
- [ ] CSS-in-JS or CSS modules
- [ ] Component-based architecture
- [ ] State management
- [ ] Unit testing
- [ ] Performance optimization
- [ ] PWA capabilities 