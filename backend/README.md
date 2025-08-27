# DecisionTree Backend

A comprehensive Node.js/Express backend for the DecisionTree application that transforms abstract decision-making into interactive, visual storytelling.

## 🚀 Features

- **JWT Authentication** - Secure user registration and login
- **Decision Management** - Full CRUD operations for decisions and factors
- **Gamification System** - XP, levels, badges, and streaks
- **Statistics & Analytics** - Decision patterns and insights
- **Future Self Integration** - Reflection-based decision weighting
- **MongoDB Integration** - Scalable data storage
- **TypeScript** - Type-safe development
- **Express.js** - Fast and minimal web framework
- **Comprehensive Validation** - Input validation with express-validator

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js with TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT tokens
- **Validation:** express-validator
- **Security:** Helmet, CORS, Rate Limiting

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/        # Request handlers
│   │   ├── authController.ts
│   │   └── decisionController.ts
│   ├── models/            # Database models
│   │   ├── User.ts
│   │   ├── Decision.ts
│   │   └── index.ts
│   ├── routes/            # API routes
│   │   ├── authRoutes.ts
│   │   └── decisionRoutes.ts
│   ├── middleware/        # Custom middleware
│   │   ├── auth.ts
│   │   └── validation.ts
│   ├── config/           # Configuration files
│   │   └── database.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── index.ts          # Main server file
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## ⚙️ Setup Instructions

### Prerequisites

- Node.js 18 or higher
- MongoDB (local installation or cloud service like MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/decisiontree
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start MongoDB:**
   - **Local MongoDB:** `mongod`
   - **Or use MongoDB Atlas** by updating MONGODB_URI

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123"
  }
  ```

#### Login User
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123"
  }
  ```

#### Get User Profile
- **GET** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <jwt_token>`

### Decision Endpoints

All decision endpoints require authentication (JWT token in Authorization header).

#### Create Decision
- **POST** `/api/decisions`
- **Body:**
  ```json
  {
    "title": "Should I change careers?",
    "description": "Considering a transition from marketing to software development",
    "factors": [
      {
        "name": "Financial Impact",
        "weight": 75,
        "category": "financial"
      }
    ],
    "status": "draft"
  }
  ```

#### Get All Decisions
- **GET** `/api/decisions`
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `status`: Filter by status (draft, active, resolved)
  - `search`: Search in title and description

#### Get Single Decision
- **GET** `/api/decisions/:id`

#### Update Decision
- **PUT** `/api/decisions/:id`
- **Body:** Same as create decision

#### Delete Decision
- **DELETE** `/api/decisions/:id`

#### Get User Statistics
- **GET** `/api/decisions/stats`

### Health Check
- **GET** `/api/health`

## 🗄️ Data Models

### User Model
```typescript
{
  email: string;
  passwordHash: string;
  gamification: {
    level: number;
    xp: number;
    streak: number;
    badges: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Decision Model
```typescript
{
  userId: string;
  title: string;
  description: string;
  factors: Factor[];
  status: "draft" | "active" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}
```

### Factor Model
```typescript
{
  id: string;
  name: string;
  weight: number; // 0-100
  category: "financial" | "personal" | "career" | "health";
  description?: string;
  uncertainty?: number; // 0-1
  timeHorizon?: "immediate" | "short" | "long";
}
```

## 🔐 Security Features

- **Rate Limiting:** 100 requests per 15 minutes per IP
- **CORS Protection:** Configured for frontend origin
- **Helmet Security:** Security headers
- **JWT Authentication:** Secure token-based auth
- **Password Hashing:** bcrypt with salt rounds
- **Input Validation:** Comprehensive validation rules

## 🎮 Gamification System

Users earn XP and level up based on activities:
- **Creating Decision:** 50 XP
- **Completing Decision:** 100 XP
- **Streak Bonus:** Daily activity streak
- **Badges:** Achievement-based rewards

## 🧪 Testing

Test the API endpoints:

```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'

# Login user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'
```

## 🚀 Production Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

3. **Environment Variables for Production:**
   - Set `NODE_ENV=production`
   - Use a strong `JWT_SECRET`
   - Configure production `MONGODB_URI`
   - Set appropriate `CORS_ORIGIN`

## 📝 Development Commands

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm start        # Start production server
npm run lint     # Run linter (if configured)
```

## 🔄 Future Enhancements

Phase 2 features to implement:
- Decision tree generation algorithms
- Monte Carlo outcome simulation
- Future self reflection system
- Advanced analytics and insights
- WebSocket real-time updates
- File upload for decision exports

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is part of the DecisionTree application suite.