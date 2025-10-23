# ✅ Setup Complete!

## 🎉 Your Betting Payment Manager API is Running!

### Server Status
- **Status**: ✅ Running
- **URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **API Base**: http://localhost:3000/api/v1

### Database Status
- **Database**: betting_payment_manager
- **Migrations**: ✅ All migrations applied successfully
- **Seeds**: ✅ Initial data seeded (roles, users, statuses, banks, languages, templates)

---

## 🔑 Default Credentials

### Admin Account
- **Email**: `admin@example.com`
- **Password**: `AdminPass123!`
- **Role**: admin

### Agent Account
- **Email**: `agent@example.com`
- **Password**: `AgentPass123!`
- **Role**: agent

---

## 🚀 Quick Start Commands

### Start Development Server
```bash
npm run dev
```

### Run Migrations
```bash
npm run migrate
```

### Seed Database
```bash
npm run db:seed
```

### Run Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
npm start
```

---

## 📚 API Endpoints

### Authentication
```bash
# Login
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "username": "admin@example.com",
  "password": "AdminPass123!"
}

# Get Profile (requires authentication)
GET http://localhost:3000/api/v1/auth/profile
Authorization: Bearer {your-access-token}
```

### Players
```bash
# Create Player
POST http://localhost:3000/api/v1/players

# Get Player
GET http://localhost:3000/api/v1/players/{playerUuid}
```

### Transactions
```bash
# Create Transaction
POST http://localhost:3000/api/v1/transactions

# Get Transaction
GET http://localhost:3000/api/v1/transactions/{id}

# Get Player Transactions
GET http://localhost:3000/api/v1/transactions?playerUuid={uuid}
```

### Admin (requires admin role)
```bash
# Get All Transactions
GET http://localhost:3000/api/v1/admin/transactions

# Assign Transaction to Agent
PUT http://localhost:3000/api/v1/admin/transactions/{id}/assign

# Update Transaction Status
PUT http://localhost:3000/api/v1/admin/transactions/{id}/status

# Get Agents
GET http://localhost:3000/api/v1/admin/agents
```

### Agent (requires agent role)
```bash
# Get Assigned Tasks
GET http://localhost:3000/api/v1/agent/tasks

# Process Transaction
PUT http://localhost:3000/api/v1/agent/transactions/{id}/process

# Get Agent Stats
GET http://localhost:3000/api/v1/agent/stats
```

---

## 🧪 Test the API

### Login Test (PowerShell)
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -Body (@{username="admin@example.com"; password="AdminPass123!"} | ConvertTo-Json) -ContentType "application/json"
$response
```

### Get Profile (PowerShell)
```powershell
$token = $response.accessToken
$headers = @{Authorization = "Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/profile" -Headers $headers
```

---

## 📁 Project Structure

```
betting_transaction_api/
├── config/                 # Database configuration
│   └── database.js
├── src/
│   ├── controllers/        # API controllers
│   ├── models/            # Sequelize models
│   ├── migrations/        # Database migrations
│   ├── seeders/          # Database seeds
│   ├── middlewares/       # Express middlewares
│   ├── routes/           # Route definitions
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── app.ts            # Express app
│   └── server.ts         # Server entry point
├── tests/                 # Test files
├── uploads/              # Local file uploads
├── .env                  # Environment variables
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

---

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Kill existing node processes
Get-Process node | Stop-Process

# Restart the server
npm run dev
```

### Database Connection Error
1. Make sure MySQL is running
2. Check `.env` file for correct database credentials
3. Verify database exists: `betting_payment_manager`

### Port Already in Use
```bash
# Find process using port 3000
Get-NetTCPConnection -LocalPort 3000

# Kill the process
Stop-Process -Id {ProcessId}
```

---

## 🔧 Environment Variables

Edit `.env` file to configure:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=betting_payment_manager
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=30d

# Telegram (optional)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# S3 (optional - defaults to local storage)
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
```

---

## 📊 Database Tables

- **roles** - User roles (admin, agent, player)
- **users** - System users
- **player_profiles** - Player information
- **transactions** - Payment transactions
- **transaction_statuses** - Transaction states
- **deposit_banks** - Deposit bank accounts
- **withdrawal_banks** - Withdrawal banks
- **transaction_evidence** - Evidence files
- **transaction_comments** - Comments on transactions
- **audit_logs** - Audit trail
- **refresh_tokens** - JWT refresh tokens
- **languages** - Supported languages
- **templates** - Message templates

---

## 🎯 Next Steps

1. ✅ Server is running
2. ✅ Database is set up
3. ✅ Default users created
4. 📝 Test the API endpoints
5. 📝 Customize for your needs
6. 📝 Set up Telegram bot (optional)
7. 📝 Configure S3 storage (optional)
8. 📝 Deploy to production

---

## 📞 Support

- Check `README.md` for detailed documentation
- Check `EXAMPLES.md` for API examples
- Review tests in `tests/` directory

---

**Built with ❤️ for the betting industry**

