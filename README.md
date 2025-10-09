# Branches - Choice Architecture Visualizer

A cutting-edge decision-making platform that combines psychology-informed design with interactive 3D visualization to help users make better, more confident decisions.

**Live Demo**: [https://branches.aahadv.com](https://branches.aahadv.com)

## Overview

Branches transforms complex decisions into beautiful, interactive visual trees. Using glassmorphic design, 3D visualization, and cognitive psychology principles, it guides users through structured decision-making while reducing stress and cognitive load.

## Key Features

### Core Decision-Making
- **Interactive Decision Trees** - Build hierarchical decision structures with outcomes, consequences, and sub-decisions
- **Smart Factor Analysis** - Weight factors by importance with visual feedback
- **Emotional Context Tracking** - Monitor stress levels, confidence, and urgency throughout the process
- **2D & 3D Visualizations** - Toggle between traditional tree view and immersive 3D cosmos mode

### Advanced Features
- **Tree Builder Modal** - Full-featured editor with drag-and-drop node management
- **Keyboard Shortcuts** - Power user features (Ctrl+K for command palette, Ctrl+S to save)
- **Undo/Redo System** - 50-level history stack for mistake-free editing
- **Search & Filter** - Find decisions by title, status, or date
- **Interactive Onboarding** - Guided tutorial that creates your first decision
- **Real-time Stats Dashboard** - Track decision count, satisfaction rates, and monthly trends

### Design Excellence
- **Glassmorphic UI** - Frosted glass effects with modern blur aesthetics
- **3D Cosmos View** - Factors orbit your decision like planets in space
- **Dark/Light Themes** - Smooth theme transitions with system preference detection
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Micro-interactions** - Subtle animations that guide and delight

### Security & Authentication
- **Google OAuth 2.0** - Secure sign-in with your Google account
- **JWT Authentication** - Token-based API security
- **User Isolation** - Decisions are private and user-specific
- **Auto-logout Cleanup** - Prevents data leakage between accounts

## Tech Stack

### Frontend
- **Framework**: Next.js 15.2.4 with React 19
- **Authentication**: NextAuth.js with Google OAuth
- **Styling**: Tailwind CSS with custom glassmorphic design system
- **3D Graphics**: React Three Fiber + Three.js
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion + custom CSS transitions
- **State Management**: React hooks with useCallback/useMemo optimization
- **Deployment**: Vercel (Edge Network)

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with middleware stack
- **Database**: MongoDB Atlas (cloud-hosted)
- **Authentication**: JWT with bcrypt password hashing
- **Security**: Helmet, CORS, rate limiting
- **Deployment**: Render (serverless backend)

### Infrastructure
- **Frontend**: Vercel (https://decision-tree-one.vercel.app)
- **Backend**: Render (https://branches-0huw.onrender.com)
- **Database**: MongoDB Atlas (cloud cluster)
- **CDN**: Cloudflare (DNS & optimization)

## Project Structure

```
CSSeminar/
├── frontend/                      # Next.js frontend application
│   ├── app/
│   │   ├── dashboard/            # Main dashboard page
│   │   ├── signup/               # Authentication pages
│   │   └── api/auth/             # NextAuth API routes
│   ├── components/
│   │   ├── ui/                   # Reusable UI primitives
│   │   ├── decision-form.tsx     # Decision creation form
│   │   ├── tree-visualization.tsx # 2D tree view
│   │   ├── decision-cosmos-3d.tsx # 3D visualization
│   │   ├── tree-builder-modal.tsx # Advanced tree editor
│   │   ├── onboarding-tutorial.tsx # Interactive tutorial
│   │   ├── decision-search-filter.tsx # Search & filter
│   │   └── stats-grid.tsx        # Statistics display
│   ├── hooks/
│   │   ├── useDecisions.ts       # Decision CRUD operations
│   │   ├── useUndoRedo.ts        # Undo/redo functionality
│   │   └── useKeyboardShortcuts.ts # Keyboard shortcuts
│   └── types/
│       └── decision.ts           # TypeScript interfaces
├── backend/                       # Express.js backend API
│   └── src/
│       ├── controllers/
│       │   ├── authController.ts # Authentication logic
│       │   └── decisionController.ts # Decision CRUD
│       ├── middleware/
│       │   ├── auth.ts          # JWT verification
│       │   └── validation.ts    # Input validation
│       ├── models/
│       │   ├── User.ts          # User schema
│       │   └── Decision.ts      # Decision schema
│       ├── routes/
│       │   ├── authRoutes.ts    # Auth endpoints
│       │   └── decisionRoutes.ts # Decision endpoints
│       └── types/
│           └── index.ts         # Backend interfaces
├── plan.md                       # Development roadmap
└── README.md                     # This file
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas account)
- Google OAuth credentials
- npm or yarn

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/aavrar/DecisionTree.git
   cd DecisionTree
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install

   # Create .env file
   cat > .env << EOF
   NODE_ENV=development
   PORT=5001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:3000
   EOF

   # Start backend
   npm run dev
   ```
   Backend runs on http://localhost:5001

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install

   # Create .env.local file
   cat > .env.local << EOF
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   NEXT_PUBLIC_API_URL=http://localhost:5001
   EOF

   # Start frontend
   npm run dev
   ```
   Frontend runs on http://localhost:3000

### Google OAuth Setup

See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for detailed instructions on:
- Creating a Google Cloud project
- Configuring OAuth consent screen
- Generating client credentials
- Setting authorized redirect URIs

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with email/password
- `POST /api/auth/login` - User login (returns JWT)
- `POST /api/auth/google-signin` - Google OAuth authentication
- `GET /api/health` - Health check endpoint

### Decisions
- `GET /api/decisions` - Get user's decisions (paginated)
- `POST /api/decisions` - Create new decision
- `GET /api/decisions/:id` - Get specific decision
- `PUT /api/decisions/:id` - Update decision
- `DELETE /api/decisions/:id` - Delete decision
- `GET /api/decisions/stats` - Get decision statistics

**Authentication**: All decision endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Development Roadmap

### Checkpoint 1 (September 25, 2024) - COMPLETE
- Decision input interface with emotional context
- Factor management with importance sliders
- Google OAuth authentication
- Basic tree visualization
- MongoDB integration
- User session management

### Checkpoint 2 (October 9, 2024) - COMPLETE
- Advanced tree interactions (zoom, pan, edit nodes)
- Tree Builder Modal with full CRUD operations
- Enhanced dashboard with statistics
- Search and filter functionality
- Keyboard shortcuts system
- Undo/redo with 50-level history
- Interactive onboarding tutorial
- 3D Cosmos visualization
- Production deployment (Vercel + Render + MongoDB Atlas)

### Checkpoint 3 (October 30, 2024) - IN PROGRESS
- Complete user dashboard with patterns analysis
- Decision outcome tracking system
- Enhanced D3.js visualization with color coding
- Psychology-informed insights
- Decision regret prediction

### Checkpoint 4 (November 20, 2024) - PLANNED
- End-to-end user experience polish
- Complex decision scenario handling
- Comprehensive error handling
- Performance optimization (Core Web Vitals)
- Full production hardening

## Extra Credit Features

### Tier 1: Game-Changing
- [COMPLETE] **3D Interactive Decision Cosmos** - Three.js immersive visualization
- [PLANNED] **AI Decision Psychology Engine** - Bias detection
- [PLANNED] **Temporal Decision Lens** - Future self simulator

### Tier 2: Technically Impressive
- [PLANNED] **Voice-Controlled Decision Creation** - Speech-to-text
- [COMPLETE] **Decision Emotional Intelligence** - Stress/confidence tracking
- [PLANNED] **Collaborative Decision Intelligence** - Sharing & advisors

### Tier 3: Professional Grade
- [PLANNED] **Decision Portfolio Analytics** - Style analysis
- [PLANNED] **Advanced Export & Reporting** - PDF reports
- [PLANNED] **Decision Coaching AI** - Real-time suggestions

## Design Philosophy

### Glassmorphism + Psychology-Informed Design
- **Frosted Glass Effects**: Blurred backgrounds with transparency layers
- **Cognitive Load Management**: Progressive disclosure, max 5 choices per node (Miller's Law)
- **Emotional Support**: Calm transitions, stress indicators, confidence building
- **Trust Architecture**: Transparent data handling, privacy-first design

### Color Psychology
- **Blue Tones**: Trust and logic (financial decisions)
- **Earth Tones**: Balance and growth (long-term planning)
- **Warm Accents**: Energy and creativity (personal decisions)

## Database Schema

### User Model
```typescript
{
  email: string
  passwordHash: string
  profile: {
    decisionMakingStyle: "analytical" | "intuitive" | "balanced"
    stressLevel: number (1-10)
    emotionalState: {
      confidence: number
      urgency: number
      anxiety: number
    }
  }
  gamification: {
    level: number
    xp: number
    streak: number
    badges: string[]
  }
}
```

### Decision Model
```typescript
{
  userId: ObjectId
  title: string
  description: string
  factors: Factor[]
  status: "draft" | "active" | "resolved" | "archived"
  emotionalContext: {
    initialStressLevel: number
    confidenceLevel: number
    urgencyRating: number
  }
}
```

### Factor Model (Nested)
```typescript
{
  id: string
  name: string
  weight: number (0-100)
  category: "financial" | "personal" | "career" | "health"
  uncertainty: number (0-100)
  emotionalWeight: number (0-100)
  regretPotential: number (0-100)
  children: TreeNodeData[] // Nested structure
}
```

## Development Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend
```bash
npm run dev          # Start with nodemon (hot reload)
npm run build        # Compile TypeScript
npm start            # Start production server
npm run lint         # Run ESLint
```

## Troubleshooting

### Backend won't connect to MongoDB
- Check MONGODB_URI in `.env`
- Ensure MongoDB Atlas allows your IP address
- Verify network connectivity

### Google OAuth errors
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Check authorized redirect URIs in Google Console
- Ensure NEXTAUTH_URL matches your domain

### CORS errors in production
- Update CORS_ORIGIN in Render environment variables
- Add frontend URL to backend CORS whitelist
- Check browser console for specific origin errors

### Frontend can't reach backend
- Verify NEXT_PUBLIC_API_URL is set correctly
- Check backend health endpoint: `curl https://branches-0huw.onrender.com/api/health`
- Ensure Render backend is not sleeping (free tier limitation)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- Use TypeScript for type safety
- Follow ESLint configuration
- Write descriptive commit messages
- Add comments for complex logic
- Test on multiple browsers

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Psychology Research**: Based on cognitive load theory, choice architecture, and decision-making research
- **Design Inspiration**: Glassmorphism trends from Dribbble and Behance 2024-2025
- **Libraries**: Built on the shoulders of giants (React, Next.js, Three.js, and many more)

## Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Contact: [your-email@example.com]
- Documentation: See [plan.md](./plan.md) for detailed roadmap

---

**Current Status**: Checkpoint 2 Complete - Production deployment live with full authentication, 3D visualization, tree editing, search/filter, keyboard shortcuts, and undo/redo functionality.
