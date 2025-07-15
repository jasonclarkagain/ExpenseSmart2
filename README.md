# ExpenseAI - AI-Powered Receipt Management System

![ExpenseAI Logo](https://img.shields.io/badge/ExpenseAI-Receipt%20Analysis-blue?style=for-the-badge)

## Overview

ExpenseAI is a comprehensive receipt management application that uses AI to analyze and categorize receipt images automatically. Transform your expense management with intelligent image processing, secure data storage, and comprehensive financial insights.

## 🚀 Key Features

- **AI-Powered Receipt Analysis**: OpenAI GPT-4o vision model for automatic data extraction
- **Smart Categorization**: Automatic vendor, amount, date, and category detection
- **Subscription Tiers**: 8 flexible plans from Free ($0) to Lifetime ($575.71)
- **Admin Dashboard**: Complete system analytics and user management
- **CSV Export**: Seamless integration with accounting software
- **Secure Authentication**: Replit Auth with role-based access control
- **Real-time Analytics**: Comprehensive expense tracking and insights

## 💰 Pricing Structure

| Plan | Price | Discount | Receipts/Month |
|------|-------|----------|----------------|
| Free | $0/month | - | 10 receipts |
| Pro Monthly | $4.79/month | 40% off | Unlimited |
| Pro 3-Month | $13.66 | 5% off | Unlimited |
| Pro 6-Month | $25.88 | 10% off | Unlimited |
| Pro Annual | $48.89 | 15% off | Unlimited |
| Pro 3-Year | $129.44 | 25% off | Unlimited |
| Pro 5-Year | $186.97 | 35% off | Unlimited |
| Pro Lifetime | $575.71 | 50% off | Unlimited |

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **AI**: OpenAI GPT-4o for receipt analysis
- **Payments**: Stripe for subscription management
- **Deployment**: Replit platform

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key
- Stripe API keys
- Replit account for authentication

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
SESSION_SECRET=your_session_secret
REPL_ID=your_replit_app_id
REPLIT_DOMAINS=your_replit_domain
```

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/expenseai.git
   cd expenseai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open your browser to `http://localhost:5000`
   - Sign in using Replit authentication

## 📁 Project Structure

```
expenseai/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend
│   ├── services/           # Business logic
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data access layer
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema
└── docs/                  # Documentation
```

## 🔐 Admin Access

- **Email**: admin_001@expenseai.com
- **Dashboard**: `/admin` (after authentication)
- **Capabilities**: User management, system analytics, subscription oversight

## 🎯 Features Overview

### Receipt Processing
- Drag-and-drop image upload
- AI-powered data extraction
- Confidence scoring for accuracy
- Support for multiple image formats

### Dashboard Analytics
- Expense tracking and categorization
- Monthly/yearly spending insights
- Top vendors analysis
- Category breakdown with percentages

### User Management
- Role-based access control (user/admin)
- Activity logging and audit trails
- Subscription management
- Profile customization

### Export & Integration
- CSV export for accounting software
- Customizable data fields
- Bulk operations support
- API endpoints for integration

## 🔄 API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - User logout

### Receipts
- `POST /api/receipts` - Upload and analyze receipt
- `GET /api/receipts` - List user receipts
- `GET /api/receipts/:id` - Get specific receipt
- `PUT /api/receipts/:id` - Update receipt
- `DELETE /api/receipts/:id` - Delete receipt

### Admin (Protected)
- `GET /api/admin/users` - List all users
- `GET /api/admin/stats` - System statistics
- `PUT /api/admin/users/:id/role` - Update user role

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📦 Deployment

The application is optimized for Replit deployment:

1. Import project to Replit
2. Configure environment variables
3. Run `npm run db:push` to set up database
4. Deploy using Replit's deployment feature

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs on GitHub Issues
- **Admin Access**: See `ADMIN_ACCESS.md` for admin credentials

## 🎉 Acknowledgments

- OpenAI for GPT-4o vision capabilities
- Stripe for payment processing
- Replit for hosting and authentication
- The open-source community for amazing tools

---

**Built with ❤️ for better expense management**