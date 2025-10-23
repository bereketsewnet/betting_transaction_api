# Betting Payment Manager API

A comprehensive backend API for managing betting payment transactions with Telegram bot integration and real-time notifications.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Admin, Agent, Player)
- **Transaction Management**: Complete CRUD operations for deposits and withdrawals
- **Real-time Notifications**: Socket.IO integration for instant updates
- **Telegram Bot Integration**: Automated notifications to players
- **File Upload Support**: S3-compatible storage with local fallback
- **Audit Logging**: Complete audit trail for all operations
- **Rate Limiting**: Protection against abuse
- **Database Migrations**: Sequelize-based migrations and seeds

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: MySQL 8.0 with Sequelize ORM
- **Authentication**: JWT with refresh tokens
- **Real-time**: Socket.IO
- **File Storage**: AWS S3 with local fallback
- **Validation**: Joi
- **Testing**: Jest

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Setup database**:
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE betting_payment_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Run migrations and seeds**:
   ```bash
   npm run migrate
   npm run db:seed
   ```

5. **Start development server**:
   ```bash
   npm run start:dev
   ```

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=betting_payment_manager
DB_USER=root
DB_PASSWORD=password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=30d

# S3 (Optional)
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Server
PORT=3000
NODE_ENV=development
```

### Default Credentials

After running seeds, you can login with:

- **Admin**: `admin@example.com` / `AdminPass123!`
- **Agent**: `agent@example.com` / `AgentPass123!`

## 📚 API Documentation

### Authentication Endpoints

```bash
# Login
POST /api/v1/auth/login
{
  "username": "admin@example.com",
  "password": "AdminPass123!"
}

# Refresh Token
POST /api/v1/auth/refresh
{
  "refreshToken": "your-refresh-token"
}

# Get Profile
GET /api/v1/auth/profile
Authorization: Bearer <access-token>
```

### Player Management

```bash
# Create Player
POST /api/v1/players
{
  "telegramId": "123456789",
  "telegramUsername": "player123",
  "languageCode": "en"
}

# Get Player
GET /api/v1/players/{playerUuid}
```

### Transaction Management

```bash
# Create Transaction
POST /api/v1/transactions
{
  "playerUuid": "uuid-here",
  "type": "DEPOSIT",
  "amount": 100.00,
  "currency": "USD",
  "depositBankId": 1
}

# Get Player Transactions
GET /api/v1/transactions?playerUuid={uuid}

# Get Transaction Details
GET /api/v1/transactions/{id}
```

### Admin Endpoints

```bash
# Get All Transactions
GET /api/v1/admin/transactions?page=1&limit=20

# Assign Transaction
PUT /api/v1/admin/transactions/{id}/assign
{
  "agentId": 2
}

# Update Status
PUT /api/v1/admin/transactions/{id}/status
{
  "status": "SUCCESS",
  "adminNotes": "Transaction completed"
}
```

### Agent Endpoints

```bash
# Get Assigned Tasks
GET /api/v1/agent/tasks?status=PENDING

# Process Transaction
PUT /api/v1/agent/transactions/{id}/process
{
  "status": "SUCCESS",
  "agentNotes": "Payment verified",
  "evidenceUrl": "https://example.com/receipt.jpg"
}
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## 📁 Project Structure

```
src/
├── controllers/          # API controllers
├── services/            # Business logic services
├── models/              # Sequelize models
├── migrations/          # Database migrations
├── seeders/            # Database seeds
├── middlewares/        # Express middlewares
├── routes/             # Route definitions
├── utils/              # Utility functions
├── config/             # Configuration files
├── app.ts              # Express app setup
└── server.ts           # Server entry point

tests/                  # Test files
```

## 🔌 Socket.IO Integration

The API includes Socket.IO for real-time notifications:

```javascript
// Connect to Socket.IO
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Listen for notifications
socket.on('admin_notification', (data) => {
  console.log('Admin notification:', data);
});

socket.on('agent_notification', (data) => {
  console.log('Agent notification:', data);
});
```

## 🤖 Telegram Bot Integration

### Setup Telegram Bot

1. Create a bot with [@BotFather](https://t.me/botfather)
2. Get your bot token
3. Set `TELEGRAM_BOT_TOKEN` in environment variables

### Bot Features

- Welcome messages for new players
- Transaction status notifications
- Error notifications
- Agent assignment alerts

## 📊 Database Schema

### Key Tables

- **users**: System users (admin, agent, player)
- **player_profiles**: Player information with Telegram integration
- **transactions**: Payment transactions (deposits/withdrawals)
- **transaction_statuses**: Transaction states (PENDING, SUCCESS, etc.)
- **deposit_banks**: Available deposit bank accounts
- **withdrawal_banks**: Withdrawal bank configurations
- **audit_logs**: Complete audit trail
- **refresh_tokens**: JWT refresh token management

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set all production values
2. **Database**: Use managed MySQL service
3. **File Storage**: Configure S3 for production
4. **SSL**: Use HTTPS in production
5. **Monitoring**: Add logging and monitoring
6. **Backup**: Regular database backups

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Joi validation for all inputs
- **CORS Configuration**: Controlled cross-origin access
- **Helmet**: Security headers
- **File Upload Validation**: Type and size restrictions

## 📈 Monitoring & Logging

- **Health Check**: `/health` endpoint
- **Request Logging**: All requests logged
- **Error Handling**: Comprehensive error responses
- **Audit Logs**: Complete operation tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

1. Check the API documentation
2. Review the test files for examples
3. Check the health endpoint: `GET /health`
4. Review logs for error details

## 🔄 API Versioning

The API uses versioning in the URL path: `/api/v1/`

Future versions will be available at `/api/v2/`, etc.

---

**Built with ❤️ for the betting industry**

<!-- # Start development server (already running)
npm run dev

# Run migrations
npm run migrate

# Seed database
npm run db:seed

# Run tests
npm test

# Build for production
npm run build
npm start -->