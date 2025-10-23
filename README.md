# Farm to Cup POS System

A complete Point of Sale system built for Farm to Cup Philippines coffee shop.

## 🚀 Features

### For Cashiers:
- **POS Interface** - Quick order processing with product grid
- Product search and category filtering
- Shopping cart with quantity management
- Cash payment with automatic change calculation
- Order completion with auto-generated order numbers (FTC-YYYYMMDD-0001)

### For Admins:
- **Dashboard** - Overview of daily and total sales
- **Advanced Finance Tracking** ⭐ (Main Feature)
  - Real-time Profit & Loss statements
  - Revenue vs Expenses tracking
  - Profit margin calculations
  - Financial health indicators
- **Product Management** - Add/edit menu items (supports 135+ items)
- **User Management** - Create and manage cashier/admin accounts
- Recent orders table

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- MongoDB Atlas
- JWT Authentication (HTTP-only cookies)
- Security: Rate limiting, XSS protection, NoSQL injection protection
- Password requirements: 8+ chars with complexity

**Frontend:**
- React + Vite
- Tailwind CSS
- React Router
- Axios
- React Toastify

## 📦 Installation

### Backend Setup:
```bash
cd backend
npm install
# Configure .env file (MongoDB URI already set)
npm run seed  # Seed initial data
PORT=5001 node server.js
```

### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Default Credentials

**Admin Account:**
- Email: admin@farmtocup.com
- Password: Admin@123

**Cashier Account:**
- Email: cashier@farmtocup.com
- Password: Cashier@123

## 📱 Access

- Frontend: http://localhost:5173
- Backend API: http://localhost:5001/api

## 🎯 User Roles

**Admin** - Full access to:
- Dashboard with sales stats
- Finance tracking (P&L, expenses, profit)
- Product management
- User management

**Cashier** - Access to:
- POS interface only
- Process orders and payments

## 📊 Key Pages

1. **Login** - Role-based authentication
2. **Cashier POS** - Product selection, cart, checkout
3. **Admin Dashboard** - Sales overview and recent orders
4. **Finance Page** - P&L statement, revenue/expense tracking
5. **Products Page** - Add/edit menu items
6. **Users Page** - Manage staff accounts

## 🔒 Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt (10 rounds)
- Account lockout after 5 failed login attempts
- Strong password requirements
- NoSQL injection protection
- XSS protection
- Request size limits (10KB)
- Rate limiting (disabled for development)

## 📝 Database Models

- Users (admin/cashier)
- Categories (Espresso, Frappe, Tea, Rice Meals, etc.)
- Products (with variants and modifiers)
- Orders (with auto-generated order numbers)
- Expenses (for finance tracking)
- Discounts (promo codes)

## 🎨 Color Scheme

- Primary (Green): #059669
- Secondary (Brown): #8B4513
- Accent (Gold): #F59E0B

## 📈 Next Steps

1. Add your 135+ menu items via Products page
2. Create cashier accounts for your staff
3. Start tracking expenses for accurate profit calculations
4. Process orders through the POS
5. Monitor finances in real-time

## 🐛 Development Notes

- Rate limiting is currently disabled for easier development
- Backend runs on port 5001 (port 5000 was in use)
- MongoDB connection requires IP whitelisting

## 📄 License

Built for Farm to Cup Philippines - 2024
