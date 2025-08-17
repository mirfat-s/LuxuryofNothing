# Luxury of Nothing - Backend

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your credentials
npm run dev
```

The server will run at `http://localhost:3000`

### Production
```bash
npm start
```

## 📁 Project Structure

```
backend/
├── server.js              # Main Express server
├── package.json           # Dependencies and scripts
├── env.example            # Environment variables template
├── .env                   # Environment variables (create from env.example)
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables
Copy `env.example` to `.env` and configure:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Paysera Configuration
PAYSERA_PROJECT_ID=your_paysera_project_id
PAYSERA_PASSWORD=your_paysera_password

# CORS Configuration
CORS_ORIGIN=http://localhost:5000

# Security
JWT_SECRET=your_jwt_secret_here
```

### Paysera Setup
1. Create account at [paysera.com](https://www.paysera.com)
2. Complete business verification
3. Get Project ID and Password from dashboard
4. Update `.env` file with credentials

## 🌐 API Endpoints

### Health Check
```
GET /health
```
Returns server status and environment info.

### Payment Processing
```
POST /api/payments/paysera/signature
```
Generates Paysera payment signature.

**Request Body:**
```json
{
  "orderid": "LON-123456789",
  "amount": "199900",
  "currency": "USD",
  "email": "customer@example.com",
  "firstname": "John",
  "lastname": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "signature": "generated_md5_hash",
  "data": {
    "projectid": "12345",
    "orderid": "LON-123456789",
    "amount": "199900",
    "currency": "USD",
    "country": "AL",
    "p_email": "customer@example.com",
    "p_firstname": "John",
    "p_lastname": "Doe",
    "test": "1"
  }
}
```

### Callback Handler
```
POST /api/payments/paysera/callback
```
Handles Paysera payment callbacks.

## 🛡️ Security Features

- CORS protection with configurable origins
- Input validation and sanitization
- Error handling without exposing internals
- Environment-based configuration

## 🚀 Deployment

### Heroku
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set PAYSERA_PROJECT_ID=your_id
heroku config:set PAYSERA_PASSWORD=your_password
git push heroku main
```

### Docker
```bash
docker build -t luxury-backend .
docker run -p 3000:3000 luxury-backend
```

### Environment Variables
Set these in your hosting platform:
- `NODE_ENV=production`
- `PAYSERA_PROJECT_ID`
- `PAYSERA_PASSWORD`
- `CORS_ORIGIN` (your frontend domain)

## 🔮 Future Improvements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication and JWT
- [ ] Order management system
- [ ] Email notifications
- [ ] Webhook verification
- [ ] Rate limiting
- [ ] Logging and monitoring
- [ ] Unit and integration tests
- [ ] API documentation (Swagger)
- [ ] Docker containerization

## 📝 API Documentation

### Error Responses
All endpoints return consistent error formats:

```json
{
  "error": "Error description",
  "message": "Detailed error message (development only)"
}
```

### Status Codes
- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Endpoint not found
- `500` - Internal server error

## 🧪 Testing

```bash
# Health check
curl http://localhost:3000/health

# Test payment signature
curl -X POST http://localhost:3000/api/payments/paysera/signature \
  -H "Content-Type: application/json" \
  -d '{
    "orderid": "TEST-123",
    "email": "test@example.com",
    "firstname": "Test",
    "lastname": "User"
  }'
``` 