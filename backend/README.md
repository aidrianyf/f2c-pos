# Farm to Cup Philippines - POS System Backend

A complete backend API for a coffee shop POS system built with MERN stack.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB URI and other settings.

3. Seed the database with sample data:
```bash
npm run seed
```

4. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## 🔑 Default Login Credentials

After seeding, you can use these accounts:

**Admin Account:**
- Email: `admin@farmtocup.com`
- Password: `Admin@123`

**Cashier Account:**
- Email: `cashier@farmtocup.com`
- Password: `Cashier@123`

**⚠️ Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

## 📚 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user (Admin only)
- `POST /login` - Login user
- `POST /logout` - Logout user
- `GET /me` - Get current user profile
- `PUT /password` - Update password

### Users (`/api/users`)
- `GET /` - Get all users (Admin only)
- `GET /:id` - Get single user (Admin only)
- `PUT /:id` - Update user (Admin only)
- `DELETE /:id` - Delete user (Admin only)
- `PATCH /:id/status` - Update user status (Admin only)

### Categories (`/api/categories`)
- `GET /` - Get all categories
- `POST /` - Create category (Admin only)
- `PUT /:id` - Update category (Admin only)
- `DELETE /:id` - Delete category (Admin only)

### Products (`/api/products`)
- `GET /` - Get all products
- `GET /:id` - Get single product
- `POST /` - Create product (Admin only)
- `PUT /:id` - Update product (Admin only)
- `DELETE /:id` - Delete product (Admin only)
- `PATCH /:id/availability` - Toggle availability (Admin only)

### Orders (`/api/orders`)
- `POST /` - Create new order (Cashier, Admin)
- `GET /` - Get all orders (Admin: all, Cashier: own)
- `GET /my-orders` - Get cashier's orders (Cashier)
- `GET /:id` - Get single order
- `PATCH /:id/cancel` - Cancel order (Admin only)

### Discounts (`/api/discounts`)
- `GET /` - Get all discounts (Admin only)
- `POST /` - Create discount (Admin only)
- `GET /validate/:code` - Validate discount code
- `PUT /:id` - Update discount (Admin only)
- `DELETE /:id` - Delete discount (Admin only)

### Expenses (`/api/expenses`)
- `GET /` - Get all expenses (Admin only)
- `GET /summary` - Get expense summary (Admin only)
- `POST /` - Create expense (Admin only)
- `PUT /:id` - Update expense (Admin only)
- `DELETE /:id` - Delete expense (Admin only)

### Analytics (`/api/analytics`)
- `GET /dashboard` - Get dashboard stats (Admin only)
- `GET /sales` - Get sales report (Admin only)
- `GET /cashiers` - Get cashier performance (Admin only)
- `GET /products` - Get product performance (Admin only)
- `GET /profit` - Get profit analysis (Admin only)

## 🛠️ Technology Stack

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **helmet** - Security
- **cors** - Cross-origin resource sharing
- **compression** - Response compression
- **morgan** - HTTP request logger

## 📝 Product Variants

Products support different sizes and temperatures:
- **Sizes**: 12oz (hot), 16oz (iced)
- **Temperatures**: hot, iced, blended

Each variant can have its own price and cost.

## 💰 Order Processing

The order system includes:
- Multiple items per order
- Product variants (size, temperature)
- Modifiers (extra shots, whipped cream, etc.)
- Discount code validation
- Payment methods (cash, gcash, card)
- Auto-generated order numbers (FTC-YYYYMMDD-0001)
- Change calculation

## 📊 Analytics Features

- Dashboard with today's and monthly stats
- Sales reports with date ranges
- Cashier performance tracking
- Product performance analysis
- Profit/loss analysis with cost tracking

## 🔐 Security Features

- ✅ **JWT Authentication** - Secure HTTP-only cookies with SameSite
- ✅ **Password Security** - bcrypt hashing with strong complexity requirements
- ✅ **Role-Based Access Control** - Admin and Cashier roles properly enforced
- ✅ **Rate Limiting** - 5 auth attempts, 100 API requests per 15 minutes
- ✅ **Account Lockout** - Lock after 5 failed login attempts for 15 minutes
- ✅ **NoSQL Injection Protection** - Sanitization with express-mongo-sanitize
- ✅ **XSS Protection** - Input sanitization with xss-clean
- ✅ **Request Size Limits** - 10KB payload limit to prevent DoS
- ✅ **Security Headers** - Helmet with CSP and HSTS configuration
- ✅ **CORS** - Restricted to specific origins
- ✅ **Error Handling** - Secure error responses without sensitive data

📄 See `SECURITY_AUDIT_REPORT.md` and `SECURITY_FIXES_APPLIED.md` for details

## 🧪 Testing

Use tools like:
- **Postman**
- **Thunder Client** (VS Code extension)
- **Insomnia**

Import the API endpoints and test with the seeded data.

## 📦 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

## 🌐 Environment Variables

```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_TIME=7d
COOKIE_EXPIRE=7
CLIENT_URL=http://localhost:5173
```

## 📄 License

ISC
