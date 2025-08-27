# DecisionTree

A modern, interactive decision-making tool that helps users make informed choices through visual decision trees, factor analysis, and gamification.

## Overview

DecisionTree is a full-stack application designed to assist users in making complex decisions by breaking them down into manageable factors, visualizing outcomes, and providing AI-powered insights. The application features interactive 3D/2D visualizations, gamification elements, and a comprehensive decision tracking system.

## Features

### Core Features
- **Interactive Decision Trees** - Visual representation of decisions with 2D and 3D views
- **Factor Analysis** - Weight and categorize decision factors by importance
- **Decision Tracking** - Track decision history and outcomes
- **Statistics Dashboard** - Monitor decision-making patterns and satisfaction rates
- **Voice Input** - Add decision context using voice commands
- **AI Suggestions** - Get AI-powered factor suggestions for better decision making

### Advanced Features
- **Gamification System** - XP points, levels, badges, and streaks
- **Real-time Visualization** - Animated decision tree with interactive nodes
- **Drag & Drop Interface** - Reorder factors with intuitive drag-and-drop
- **Theme Support** - Dark/light mode with smooth transitions
- **Command Palette** - Quick actions with keyboard shortcuts (Cmd/Ctrl + K)

## Tech Stack

### Frontend
- **Framework**: Next.js 15.2.4 with React 19
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Radix UI primitives
- **3D Graphics**: React Three Fiber + Three.js
- **Icons**: Lucide React
- **Form Handling**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Security**: Helmet, CORS, rate limiting
- **Validation**: express-validator middleware

## Project Structure

```
CSSeminar/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── decision-form.tsx
│   │   ├── visualization-area.tsx
│   │   └── stats-grid.tsx
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── types/              # TypeScript type definitions
├── backend/                # Express.js backend API
│   └── src/
│       ├── controllers/    # Route controllers
│       ├── middleware/     # Custom middleware
│       ├── models/        # MongoDB schemas
│       ├── routes/        # API route definitions
│       └── types/         # TypeScript interfaces
├── plan.md                # Development roadmap
└── README.md             # This file
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (optional for development)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CSSeminar
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   
   Backend - Create `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/decisiontree
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on http://localhost:5000

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Decisions
- `GET /api/decisions` - Get user's decisions
- `POST /api/decisions` - Create new decision
- `GET /api/decisions/:id` - Get specific decision
- `PUT /api/decisions/:id` - Update decision
- `DELETE /api/decisions/:id` - Delete decision
- `GET /api/decisions/stats` - Get decision statistics

## Development Phases

The project follows a 4-phase development plan:

### Phase 1: Foundation (Weeks 1-2) ✅
- Backend API setup with authentication
- Frontend components and basic UI
- Decision CRUD operations
- Basic visualization

### Phase 2: Intelligence (Weeks 3-4)
- Advanced decision algorithms
- AI-powered suggestions
- Monte Carlo simulations
- Outcome prediction

### Phase 3: Engagement (Weeks 5-6)
- Future self reflection system
- Enhanced gamification
- Social features
- Advanced analytics

### Phase 4: Scale (Weeks 7-8)
- Performance optimization
- Advanced visualizations
- Mobile responsiveness
- Deployment preparation

## Key Features in Detail

### Decision Form
- Dynamic factor management with drag-and-drop reordering
- Category-based factor classification (financial, personal, career, health)
- Weight sliders for importance ranking
- Voice input for decision context
- AI-powered factor suggestions

### Visualization Area
- Interactive 2D/3D decision tree views
- Animated node transitions and connections
- Confidence-based color coding
- Real-time progress indicators
- Export capabilities for decision trees

### Gamification System
- XP points awarded for decision activities
- Level progression system
- Achievement badges
- Decision-making streaks
- Satisfaction rate tracking

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue in the repository or contact the development team.

---

**Current Status**: Phase 1 complete - Backend API and frontend UI fully functional with mock data. Ready for Phase 2 implementation.