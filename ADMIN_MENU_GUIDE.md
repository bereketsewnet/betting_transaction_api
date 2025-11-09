# Admin Menu Configuration Guide

## Overview
This guide helps you create a dedicated admin menu that's different from the player menu. The admin menu should focus on management and monitoring features, not transaction creation.

## Recommended Admin Menu Structure

### Main Navigation Items

1. **Dashboard / Overview**
   - Recent 24hr Transactions
   - Statistics/Summary Cards
   - Quick Actions

2. **Transactions**
   - Recent 24hr Transactions
   - All Transactions (with filters)
   - Pending Transactions
   - Completed Transactions
   - Transaction Details/Management

3. **User Management**
   - All Users
   - Agents
   - Players
   - Create User
   - User Statistics

4. **Betting Sites**
   - All Betting Sites
   - Create/Edit Betting Site
   - Site Status Management

5. **Configuration**
   - Deposit Banks
   - Withdrawal Banks
   - Templates
   - Languages

6. **Settings / Profile**
   - Admin Profile
   - Change Password
   - Logout

---

## API Endpoints for Each Menu Item

### 1. Recent 24hr Transactions
**Endpoint:** `GET /api/v1/admin/transactions/recent`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Example Request:**
```javascript
GET /api/v1/admin/transactions/recent?page=1&limit=20
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "transactions": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  },
  "filters": {
    "dateRange": "last24hours"
  }
}
```

---

### 2. All Transactions (with filters)
**Endpoint:** `GET /api/v1/admin/transactions`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `status` (optional) - Transaction status code
- `type` (optional) - 'DEPOSIT' or 'WITHDRAW'
- `agent` (optional) - Agent ID
- `dateRange` (optional) - Format: "startDate,endDate" (ISO dates)
- `amountRange` (optional) - Format: "min-max"

**Example Request:**
```javascript
GET /api/v1/admin/transactions?status=PENDING&type=DEPOSIT&page=1&limit=20
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

### 3. User Management
**Endpoints:**
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/users/statistics` - User statistics
- `GET /api/v1/admin/agents` - Get all agents
- `POST /api/v1/admin/users` - Create new user
- `GET /api/v1/admin/users/:id` - Get user by ID
- `PUT /api/v1/admin/users/:id` - Update user
- `DELETE /api/v1/admin/users/:id` - Delete user

---

### 4. Betting Sites Management
**Endpoints:**
- `GET /api/v1/admin/betting-sites` - Get all betting sites
- `GET /api/v1/admin/betting-sites/:id` - Get betting site by ID
- `POST /api/v1/admin/betting-sites` - Create betting site
- `PUT /api/v1/admin/betting-sites/:id` - Update betting site
- `DELETE /api/v1/admin/betting-sites/:id` - Delete betting site
- `PUT /api/v1/admin/betting-sites/:id/toggle-status` - Toggle site status

---

### 5. Configuration
**Deposit Banks:**
- `GET /api/v1/admin/deposit-banks`
- `POST /api/v1/admin/deposit-banks`
- `PUT /api/v1/admin/deposit-banks/:id`
- `DELETE /api/v1/admin/deposit-banks/:id`

**Withdrawal Banks:**
- `GET /api/v1/admin/withdrawal-banks`
- `POST /api/v1/admin/withdrawal-banks`
- `PUT /api/v1/admin/withdrawal-banks/:id`
- `DELETE /api/v1/admin/withdrawal-banks/:id`

**Templates:**
- `GET /api/v1/admin/templates`
- `POST /api/v1/admin/templates`
- `PUT /api/v1/admin/templates/:id`
- `DELETE /api/v1/admin/templates/:id`

**Languages:**
- `GET /api/v1/admin/languages`
- `POST /api/v1/admin/languages`
- `PUT /api/v1/admin/languages/:code`
- `DELETE /api/v1/admin/languages/:code`

---

## Frontend Implementation Example

### React Component Structure

```typescript
// AdminSidebar.tsx
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Only show admin menu if user is admin
  if (user?.role !== 'admin') {
    return null;
  }

  const menuItems = [
    {
      title: 'Dashboard',
      icon: '📊',
      path: '/admin/dashboard',
      children: [
        { title: 'Recent 24hr Transactions', path: '/admin/transactions/recent' },
        { title: 'Statistics', path: '/admin/statistics' },
      ]
    },
    {
      title: 'Transactions',
      icon: '💳',
      path: '/admin/transactions',
      children: [
        { title: 'Recent 24hr', path: '/admin/transactions/recent' },
        { title: 'All Transactions', path: '/admin/transactions' },
        { title: 'Pending', path: '/admin/transactions?status=PENDING' },
        { title: 'Completed', path: '/admin/transactions?status=COMPLETED' },
      ]
    },
    {
      title: 'User Management',
      icon: '👥',
      path: '/admin/users',
      children: [
        { title: 'All Users', path: '/admin/users' },
        { title: 'Agents', path: '/admin/agents' },
        { title: 'Create User', path: '/admin/users/create' },
        { title: 'Statistics', path: '/admin/users/statistics' },
      ]
    },
    {
      title: 'Betting Sites',
      icon: '🎰',
      path: '/admin/betting-sites',
      children: [
        { title: 'All Sites', path: '/admin/betting-sites' },
        { title: 'Create Site', path: '/admin/betting-sites/create' },
      ]
    },
    {
      title: 'Configuration',
      icon: '⚙️',
      path: '/admin/config',
      children: [
        { title: 'Deposit Banks', path: '/admin/deposit-banks' },
        { title: 'Withdrawal Banks', path: '/admin/withdrawal-banks' },
        { title: 'Templates', path: '/admin/templates' },
        { title: 'Languages', path: '/admin/languages' },
      ]
    },
  ];

  return (
    <aside className="admin-sidebar">
      <nav>
        {menuItems.map((item) => (
          <div key={item.path} className="menu-section">
            <Link 
              to={item.path}
              className={location.pathname.startsWith(item.path) ? 'active' : ''}
            >
              <span>{item.icon}</span>
              <span>{item.title}</span>
            </Link>
            {item.children && (
              <ul className="submenu">
                {item.children.map((child) => (
                  <li key={child.path}>
                    <Link 
                      to={child.path}
                      className={location.pathname === child.path ? 'active' : ''}
                    >
                      {child.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
```

---

### Conditional Menu Rendering

```typescript
// App.tsx or Layout.tsx
import { useAuth } from './contexts/AuthContext';
import AdminSidebar from './components/AdminSidebar';
import PlayerSidebar from './components/PlayerSidebar';

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      {user?.role === 'admin' ? (
        <AdminSidebar />
      ) : user?.role === 'player' ? (
        <PlayerSidebar />
      ) : (
        <AgentSidebar />
      )}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};
```

---

## What to Remove from Admin Menu

**DO NOT show these in admin menu:**
- ❌ "Create Deposit" button
- ❌ "Create Withdrawal" button
- ❌ "My Transactions" (player-focused)
- ❌ "Transaction History" (generic player view)

**Instead, show:**
- ✅ "Recent 24hr Transactions" (admin monitoring)
- ✅ "All Transactions" (with admin filters)
- ✅ "Transaction Management" (assign, update status, delete)
- ✅ "User Management"
- ✅ "System Configuration"

---

## Menu Item Icons Suggestions

- 📊 Dashboard
- 💳 Transactions
- 👥 User Management
- 🎰 Betting Sites
- ⚙️ Configuration
- 📈 Statistics
- 🔔 Notifications
- 👤 Profile
- 🚪 Logout

---

## Notes

1. **Role-Based Rendering**: Always check `user.role === 'admin'` before showing admin menu
2. **Route Protection**: Ensure all admin routes are protected on the frontend
3. **API Authentication**: All admin endpoints require `Authorization: Bearer TOKEN` header
4. **Recent Transactions**: Use the new `/admin/transactions/recent` endpoint for 24hr view
5. **Filtering**: The main transactions endpoint supports extensive filtering for admin needs

---

## Quick Reference: API Base URL

All endpoints are prefixed with: `http://localhost:3000/api/v1`

Example:
- Full URL: `http://localhost:3000/api/v1/admin/transactions/recent`
- With auth header: `Authorization: Bearer YOUR_JWT_TOKEN`

