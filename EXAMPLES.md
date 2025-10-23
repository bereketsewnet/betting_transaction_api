# Betting Payment Manager API - Example Requests

This file contains example curl requests for testing the API endpoints.

## Prerequisites

1. Start the API server: `npm run start:dev` or `docker-compose up`
2. Run database migrations and seeds: `npm run migrate && npm run db:seed`

## Authentication

### 1. Login as Admin

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@example.com",
    "password": "AdminPass123!"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "admin@example.com",
    "email": "admin@example.com",
    "displayName": "System Administrator",
    "role": "admin"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "expiresIn": 2592000
}
```

### 2. Refresh Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### 3. Get Profile

```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Player Management

### 1. Create Player Profile

```bash
curl -X POST http://localhost:3000/api/v1/players \
  -H "Content-Type: application/json" \
  -d '{
    "telegramId": "123456789",
    "telegramUsername": "player123",
    "languageCode": "en"
  }'
```

**Response:**
```json
{
  "message": "Player profile created successfully",
  "player": {
    "id": 1,
    "playerUuid": "550e8400-e29b-41d4-a716-446655440001",
    "telegramId": "123456789",
    "telegramUsername": "player123",
    "languageCode": "en",
    "lastActive": "2023-12-01T10:00:00.000Z"
  }
}
```

### 2. Get Player by UUID

```bash
curl -X GET http://localhost:3000/api/v1/players/550e8400-e29b-41d4-a716-446655440001
```

## Transaction Management

### 1. Create Deposit Transaction

```bash
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "playerUuid": "550e8400-e29b-41d4-a716-446655440001",
    "type": "DEPOSIT",
    "amount": 100.00,
    "currency": "USD",
    "depositBankId": 1
  }'
```

**Response:**
```json
{
  "message": "Transaction created successfully",
  "transaction": {
    "id": 1,
    "transactionUuid": "550e8400-e29b-41d4-a716-446655440002",
    "type": "DEPOSIT",
    "amount": "100.00",
    "currency": "USD",
    "status": "Pending",
    "screenshotUrl": "",
    "requestedAt": "2023-12-01T10:00:00.000Z",
    "createdAt": "2023-12-01T10:00:00.000Z"
  }
}
```

### 2. Create Withdrawal Transaction

```bash
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "playerUuid": "550e8400-e29b-41d4-a716-446655440001",
    "type": "WITHDRAW",
    "amount": 50.00,
    "currency": "USD",
    "withdrawalBankId": 1,
    "withdrawalAddress": "test-address-123"
  }'
```

### 3. Create Transaction with File Upload

```bash
curl -X POST http://localhost:3000/api/v1/transactions \
  -F "playerUuid=550e8400-e29b-41d4-a716-446655440001" \
  -F "type=DEPOSIT" \
  -F "amount=100.00" \
  -F "currency=USD" \
  -F "depositBankId=1" \
  -F "screenshot=@/path/to/screenshot.png"
```

### 4. Get Player Transactions

```bash
curl -X GET "http://localhost:3000/api/v1/transactions?playerUuid=550e8400-e29b-41d4-a716-446655440001&page=1&limit=10"
```

### 5. Get Transaction Details

```bash
curl -X GET http://localhost:3000/api/v1/transactions/1?player_uuid=550e8400-e29b-41d4-a716-446655440001
```

## Admin Operations

### 1. Get All Transactions

```bash
curl -X GET "http://localhost:3000/api/v1/admin/transactions?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. Assign Transaction to Agent

```bash
curl -X PUT http://localhost:3000/api/v1/admin/transactions/1/assign \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": 2
  }'
```

### 3. Update Transaction Status

```bash
curl -X PUT http://localhost:3000/api/v1/admin/transactions/1/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SUCCESS",
    "adminNotes": "Transaction completed successfully"
  }'
```

### 4. Get Agents with Statistics

```bash
curl -X GET http://localhost:3000/api/v1/admin/agents \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Agent Operations

### 1. Login as Agent

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "agent@example.com",
    "password": "AgentPass123!"
  }'
```

### 2. Get Assigned Tasks

```bash
curl -X GET "http://localhost:3000/api/v1/agent/tasks?status=PENDING" \
  -H "Authorization: Bearer AGENT_ACCESS_TOKEN"
```

### 3. Process Transaction

```bash
curl -X PUT http://localhost:3000/api/v1/agent/transactions/1/process \
  -H "Authorization: Bearer AGENT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SUCCESS",
    "agentNotes": "Payment verified and processed",
    "evidenceUrl": "https://example.com/receipt.jpg"
  }'
```

### 4. Upload Evidence

```bash
curl -X POST http://localhost:3000/api/v1/agent/evidence \
  -H "Authorization: Bearer AGENT_ACCESS_TOKEN" \
  -F "file=@/path/to/evidence.png"
```

### 5. Get Agent Statistics

```bash
curl -X GET http://localhost:3000/api/v1/agent/stats \
  -H "Authorization: Bearer AGENT_ACCESS_TOKEN"
```

## Configuration Endpoints

### 1. Get Welcome Message

```bash
curl -X GET "http://localhost:3000/api/v1/config/welcome?lang=en"
```

### 2. Get Deposit Banks

```bash
curl -X GET http://localhost:3000/api/v1/config/deposit-banks
```

### 3. Get Withdrawal Banks

```bash
curl -X GET http://localhost:3000/api/v1/config/withdrawal-banks
```

### 4. Get Languages

```bash
curl -X GET http://localhost:3000/api/v1/config/languages
```

## User Management (Admin Only)

### 1. Register New User

```bash
curl -X POST http://localhost:3000/api/v1/admin/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newadmin@example.com",
    "password": "NewAdminPass123!",
    "displayName": "New Administrator",
    "roleId": 1,
    "isActive": true
  }'
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 2,
    "userUuid": "550e8400-e29b-41d4-a716-446655440002",
    "username": "newadmin@example.com",
    "displayName": "New Administrator",
    "role": "admin",
    "isActive": true,
    "createdAt": "2023-12-01T10:00:00.000Z"
  }
}
```

### 2. Get All Users

```bash
curl -X GET "http://localhost:3000/api/v1/admin/users?page=1&limit=20&role=1&search=admin&isActive=true" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "userUuid": "550e8400-e29b-41d4-a716-446655440001",
      "username": "admin@example.com",
      "displayName": "System Administrator",
      "isActive": true,
      "role": {
        "id": 1,
        "name": "admin",
        "description": "System Administrator"
      },
      "createdAt": "2023-12-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  },
  "statistics": {
    "totalUsers": 1,
    "roleDistribution": [
      {
        "role": "admin",
        "count": 1
      }
    ]
  }
}
```

### 3. Get User by ID

```bash
curl -X GET http://localhost:3000/api/v1/admin/users/2 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Update User

```bash
curl -X PUT http://localhost:3000/api/v1/admin/users/2 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "updatedadmin@example.com",
    "displayName": "Updated Administrator",
    "roleId": 1,
    "isActive": true
  }'
```

### 5. Change User Password

```bash
curl -X PUT http://localhost:3000/api/v1/admin/users/2/password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "NewSecurePassword123!"
  }'
```

### 6. Toggle User Status

```bash
curl -X PUT http://localhost:3000/api/v1/admin/users/2/toggle-status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "message": "User deactivated successfully",
  "user": {
    "id": 2,
    "username": "updatedadmin@example.com",
    "isActive": false
  }
}
```

### 7. Delete User

```bash
curl -X DELETE http://localhost:3000/api/v1/admin/users/2 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 8. Get User Statistics

```bash
curl -X GET http://localhost:3000/api/v1/admin/users/statistics \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "statistics": {
    "totalUsers": 5,
    "activeUsers": 4,
    "inactiveUsers": 1,
    "recentUsers": 2,
    "roleDistribution": [
      {
        "role": "admin",
        "count": 2
      },
      {
        "role": "agent",
        "count": 3
      }
    ]
  }
}
```

### 9. Get All Roles

```bash
curl -X GET http://localhost:3000/api/v1/admin/roles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "roles": [
    {
      "id": 1,
      "name": "admin",
      "description": "System Administrator",
      "isActive": true
    },
    {
      "id": 2,
      "name": "agent",
      "description": "Customer Support Agent",
      "isActive": true
    }
  ]
}
```

### 10. Create Agent User

```bash
curl -X POST http://localhost:3000/api/v1/admin/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newagent@example.com",
    "password": "AgentPass123!",
    "displayName": "New Agent",
    "roleId": 2,
    "isActive": true
  }'
```

### 11. Get Agents Only

```bash
curl -X GET "http://localhost:3000/api/v1/admin/users?role=2&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 12. Search Users

```bash
curl -X GET "http://localhost:3000/api/v1/admin/users?search=admin&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Admin Configuration Management

### 1. Create Deposit Bank

```bash
curl -X POST http://localhost:3000/api/v1/admin/deposit-banks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bankName": "New Bank",
    "accountNumber": "9876543210",
    "accountName": "Betting Payment Manager",
    "notes": "New deposit account",
    "isActive": true
  }'
```

### 2. Create Withdrawal Bank

```bash
curl -X POST http://localhost:3000/api/v1/admin/withdrawal-banks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bankName": "New Withdrawal Bank",
    "requiredFields": [
      {
        "name": "account_number",
        "label": "Account Number",
        "type": "text",
        "required": true
      },
      {
        "name": "routing_number",
        "label": "Routing Number",
        "type": "text",
        "required": true
      }
    ],
    "notes": "New withdrawal bank",
    "isActive": true
  }'
```

### 3. Create Template

```bash
curl -X POST http://localhost:3000/api/v1/admin/templates \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "languageCode": "en",
    "keyName": "custom_message",
    "content": "This is a custom message template"
  }'
```

## File Upload

### 1. Upload File

```bash
curl -X POST http://localhost:3000/api/v1/uploads \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/file.png"
```

### 2. Get Upload Configuration

```bash
curl -X GET http://localhost:3000/api/v1/uploads/config
```

## Health Check

### 1. Check API Health

```bash
curl -X GET http://localhost:3000/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-12-01T10:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

## Error Examples

### 1. Invalid Credentials

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@example.com",
    "password": "wrongpassword"
  }'
```

**Response:**
```json
{
  "error": "Invalid credentials"
}
```

### 2. Missing Authorization

```bash
curl -X GET http://localhost:3000/api/v1/admin/transactions
```

**Response:**
```json
{
  "error": "Access token required"
}
```

### 3. Validation Error

```bash
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "playerUuid": "invalid-uuid",
    "type": "DEPOSIT"
  }'
```

**Response:**
```json
{
  "error": "Validation failed",
  "details": ["\"amount\" is required"]
}
```

## Notes

1. Replace `YOUR_ACCESS_TOKEN` with the actual JWT token from login response
2. Replace `AGENT_ACCESS_TOKEN` with agent's JWT token
3. Replace UUIDs with actual values from previous responses
4. File paths should be absolute paths to existing files
5. All timestamps are in ISO 8601 format
6. Amounts are returned as strings to preserve precision
7. The API uses UTC timezone for all timestamps
