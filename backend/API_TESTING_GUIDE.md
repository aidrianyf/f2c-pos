# API Testing Guide

Quick reference for testing the Farm to Cup POS API endpoints.

## Setup

1. Make sure the server is running: `npm run dev`
2. Seed the database: `npm run seed`
3. Use Postman or Thunder Client to test

## Base URL
```
http://localhost:5000/api
```

---

## 1. Authentication Flow

### Login as Admin
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@farmtocup.com",
  "password": "admin123"
}
```

### Login as Cashier
```http
POST /auth/login
Content-Type: application/json

{
  "email": "cashier@farmtocup.com",
  "password": "cashier123"
}
```

### Get Current User
```http
GET /auth/me
```
**Note:** Token is stored in cookie automatically

---

## 2. Products

### Get All Products
```http
GET /products
```

### Get Products by Category
```http
GET /products?category=CATEGORY_ID
```

### Search Products
```http
GET /products?search=americano
```

### Create Product (Admin Only)
```http
POST /products
Content-Type: application/json

{
  "name": "Flat White",
  "description": "Smooth espresso with microfoam",
  "category": "CATEGORY_ID",
  "variants": [
    {
      "size": "12oz",
      "temperature": "hot",
      "price": 170,
      "cost": 60
    },
    {
      "size": "16oz",
      "temperature": "iced",
      "price": 170,
      "cost": 65
    }
  ],
  "modifiers": [
    {
      "name": "Extra Shot",
      "price": 30
    }
  ],
  "isAvailable": true
}
```

---

## 3. Create Order (POS Transaction)

### Simple Order
```http
POST /orders
Content-Type: application/json

{
  "items": [
    {
      "product": "PRODUCT_ID",
      "size": "12oz",
      "temperature": "hot",
      "quantity": 2,
      "modifiers": ["Extra Shot"],
      "notes": "Extra hot"
    }
  ],
  "paymentMethod": "cash",
  "amountPaid": 400
}
```

### Order with Discount
```http
POST /orders
Content-Type: application/json

{
  "items": [
    {
      "product": "PRODUCT_ID",
      "size": "16oz",
      "temperature": "iced",
      "quantity": 1,
      "modifiers": []
    }
  ],
  "discountCode": "PROMO2024",
  "paymentMethod": "gcash",
  "amountPaid": 150
}
```

### Get Orders
```http
GET /orders
```

### Get Orders by Date Range
```http
GET /orders?startDate=2024-01-01&endDate=2024-12-31
```

---

## 4. Discounts

### Create Discount (Admin Only)
```http
POST /discounts
Content-Type: application/json

{
  "code": "WELCOME10",
  "name": "Welcome Discount",
  "type": "percentage",
  "value": 10,
  "minPurchase": 100,
  "isActive": true,
  "validFrom": "2024-01-01",
  "validUntil": "2024-12-31"
}
```

### Validate Discount Code
```http
GET /discounts/validate/WELCOME10?subtotal=200
```

---

## 5. Categories

### Get All Categories
```http
GET /categories
```

### Create Category (Admin Only)
```http
POST /categories
Content-Type: application/json

{
  "name": "Pastries",
  "description": "Fresh baked pastries",
  "icon": "🥐",
  "displayOrder": 8
}
```

---

## 6. Expenses

### Record Expense (Admin Only)
```http
POST /expenses
Content-Type: application/json

{
  "category": "supplies",
  "description": "Coffee beans purchase",
  "amount": 5000,
  "date": "2024-01-15"
}
```

### Get Expenses
```http
GET /expenses
```

### Get Expense Summary
```http
GET /expenses/summary?startDate=2024-01-01&endDate=2024-01-31
```

---

## 7. Analytics (Admin Only)

### Dashboard Stats
```http
GET /analytics/dashboard
```

### Sales Report
```http
GET /analytics/sales?startDate=2024-01-01&endDate=2024-01-31&groupBy=day
```

### Cashier Performance
```http
GET /analytics/cashiers?startDate=2024-01-01&endDate=2024-01-31
```

### Product Performance
```http
GET /analytics/products?startDate=2024-01-01&endDate=2024-01-31
```

### Profit Analysis
```http
GET /analytics/profit?startDate=2024-01-01&endDate=2024-01-31
```

---

## 8. User Management (Admin Only)

### Get All Users
```http
GET /users
```

### Create User (Register)
```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@farmtocup.com",
  "password": "password123",
  "role": "cashier"
}
```

### Update User Status
```http
PATCH /users/USER_ID/status
Content-Type: application/json

{
  "status": "inactive"
}
```

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here"
}
```

---

## Testing Tips

1. **Login First**: Always login to get authentication cookie
2. **Copy IDs**: After creating resources, copy their IDs for testing
3. **Check Categories**: Get category IDs before creating products
4. **Test Variants**: Try different size and temperature combinations
5. **Validate Discounts**: Test discount validation before creating orders
6. **Test Permissions**: Try accessing admin routes as cashier (should fail)
7. **Date Filters**: Test analytics with different date ranges

---

## Quick Test Sequence

1. Login as admin
2. Get all categories (note IDs)
3. Get all products
4. Login as cashier
5. Create an order
6. Validate a discount code
7. Create another order with discount
8. Get your orders
9. Login as admin again
10. Check dashboard analytics

---

## Health Check
```http
GET /api/health
```

Should return server status and timestamp.
