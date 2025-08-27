# DecisionTree Backend Implementation Plan

## Frontend Analysis Summary

The existing frontend is a sophisticated Next.js application with:

**Current Features:**
- Decision input form with drag-and-drop factor management
- Interactive 2D/3D tree visualization using React Three Fiber
- Gamification system with XP, levels, and badges
- Command palette for quick actions
- Voice input capabilities
- AI suggestion mockups
- Statistics dashboard with animated counters

**Mock Data Currently Used:**
- `mockStats`: Decision statistics (127 total, 89% satisfaction rate)
- `mockDecision`: Sample career change decision with 3 factors
- `mockNodes`: Tree visualization data with 7 nodes
- Hardcoded gamification data (level 3, 750 XP, badges)

## Phase-by-Phase Backend Implementation

### Phase 1: Foundation & Core API (Weeks 1-2)
**Goal:** Replace mock data with working backend APIs

**Backend Setup:**
- Node.js/Express server with TypeScript
- MongoDB database with Mongoose ODM
- JWT authentication system
- Basic CRUD endpoints for decisions

**API Endpoints to Implement:**
- `POST /api/decisions` - Create new decision
- `GET /api/decisions/:id` - Get decision by ID
- `PUT /api/decisions/:id` - Update decision
- `DELETE /api/decisions/:id` - Delete decision
- `GET /api/stats/:userId` - Get user statistics

**Database Schema:**
```typescript
Decision {
  id: ObjectId
  userId: ObjectId
  title: string
  description: string
  factors: Factor[]
  status: "draft" | "active" | "resolved"
  createdAt: Date
  updatedAt: Date
}

Factor {
  id: string
  name: string
  weight: number (0-100)
  category: "financial" | "personal" | "career" | "health"
  description?: string
  uncertainty?: number
  timeHorizon?: "immediate" | "short" | "long"
}

User {
  id: ObjectId
  email: string
  passwordHash: string
  gamification: {
    level: number
    xp: number
    streak: number
    badges: string[]
  }
}
```

### Phase 2: Advanced Decision Logic (Weeks 3-4)
**Goal:** Implement the core decision-making algorithms

**Features to Implement:**
- Decision tree generation algorithm
- Factor weighting and scoring system
- Outcome probability calculations
- Basic Monte Carlo simulation engine

**New API Endpoints:**
- `POST /api/decisions/:id/generate-tree` - Generate decision tree
- `POST /api/decisions/:id/simulate` - Run outcome simulations
- `GET /api/decisions/:id/tree` - Get generated tree data

**Enhanced Database Schema:**
```typescript
DecisionNode {
  id: string
  decisionId: ObjectId
  parentId?: string
  title: string
  type: "root" | "factor" | "outcome"
  probability?: number
  score?: number
  position: { x: number, y: number, z: number }
  children: string[]
}

Simulation {
  id: ObjectId
  decisionId: ObjectId
  scenarios: SimulationScenario[]
  confidenceInterval: number
  recommendedPath: string[]
  createdAt: Date
}
```

### Phase 3: Future Self Integration (Weeks 5-6)
**Goal:** Implement the unique "future self" reflection system

**Features to Implement:**
- Future self questionnaire system
- Regret scoring algorithm
- Visual emphasis based on reflection data
- Long-term outcome tracking

**New API Endpoints:**
- `POST /api/reflections` - Save future self interview
- `GET /api/reflections/:decisionId` - Get reflections for decision
- `PUT /api/decisions/:id/regret-weights` - Update tree based on reflections

**Enhanced Schema:**
```typescript
FutureSelfReflection {
  id: ObjectId
  decisionId: ObjectId
  userId: ObjectId
  questions: {
    question: string
    answer: string
    regretScore: number (1-10)
  }[]
  overallRegretScore: number
  valuesAlignment: number
  createdAt: Date
}
```

### Phase 4: Gamification & Analytics (Weeks 7-8)
**Goal:** Implement the gamification system and advanced analytics

**Features to Implement:**
- XP and leveling system
- Badge achievement logic
- Decision pattern analysis
- Personal insights generation

**New API Endpoints:**
- `GET /api/gamification/:userId` - Get user gamification data
- `POST /api/gamification/:userId/award-xp` - Award experience points
- `GET /api/analytics/:userId/patterns` - Analyze decision patterns
- `GET /api/analytics/:userId/insights` - Generate personal insights

**Schema Additions:**
```typescript
UserAnalytics {
  id: ObjectId
  userId: ObjectId
  decisionPatterns: {
    mostImportantFactors: string[]
    averageFactorCount: number
    preferredCategories: string[]
    decisionSpeed: number // days to resolve
  }
  satisfactionTrends: {
    date: Date
    score: number
  }[]
  insights: string[]
}
```

## Technical Architecture Details

### Backend Technology Stack
- **Runtime:** Node.js 18+
- **Framework:** Express.js with TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT tokens with refresh mechanism
- **File Storage:** AWS S3 for decision exports
- **Caching:** Redis for session management
- **API Documentation:** Swagger/OpenAPI

### Frontend Integration Changes
1. **API Client Setup:** Replace mock data calls with actual API calls using axios
2. **Authentication:** Implement login/register flow with JWT token management
3. **Real-time Updates:** Add WebSocket connection for live collaboration
4. **Error Handling:** Comprehensive error boundaries and user feedback
5. **Loading States:** Replace mock delays with proper loading indicators

### Deployment Strategy
- **Backend:** Docker containers on Railway/Heroku
- **Database:** MongoDB Atlas cluster
- **Frontend:** Vercel deployment (no changes needed)
- **CDN:** Cloudflare for static assets and API caching

## Checkpoint Deliverables

### Checkpoint 1 (End of Week 2)
- Working backend API with basic CRUD operations
- Database schema implemented
- User authentication working
- Frontend connected to real APIs (replacing mock data)

### Checkpoint 2 (End of Week 4)
- Decision tree generation working
- Monte Carlo simulation engine operational
- Enhanced tree visualization with real data
- Basic outcome probability calculations

### Checkpoint 3 (End of Week 6)
- Future self reflection system complete
- Regret-based tree weighting implemented
- Visual emphasis based on reflection scores
- Long-term decision tracking

### Checkpoint 4 (End of Week 8)
- Full gamification system operational
- Advanced analytics and insights
- Decision pattern recognition
- Export functionality for decisions

## Risk Mitigation
- **Complexity:** Start with simplified versions of algorithms, enhance iteratively
- **Performance:** Implement caching early, optimize database queries
- **User Experience:** Maintain mock data fallbacks during development
- **Data Security:** Implement proper validation and sanitization from day one