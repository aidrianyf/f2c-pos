# 🧪 Manual Backend Testing Guide

Quick manual tests to verify everything is working before building the frontend.

---

## 🚀 Step 1: Start the Server

```bash
# Make sure port 5000 is free first
lsof -ti:5000 | xargs kill -9

# Start the server
npm run dev
```

You should see:
```
╔════════════════════════════════════════╗
║   🌱 Farm to Cup POS System 🌱        ║
╚════════════════════════════════════════╝
Server running in development mode
Port: 5000
MongoDB Connected: ...
```

---

## ✅ Quick Tests (Copy & Paste in Terminal)

### Test 1: Health Check
```bash
curl http://localhost:5000/api/health
```
**Expected:** `{"success":true,"message":"Farm to Cup POS API is running",...}`

---

### Test 2: Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@farmtocup.com","password":"Admin@123"}'
```
**Expected:** JSON with `"success":true`, user object, and token

---

### Test 3: Get Products
```bash
curl http://localhost:5000/api/products
```
**Expected:** JSON array with 9 products

---

### Test 4: Get Categories
```bash
curl http://localhost:5000/api/categories
```
**Expected:** JSON array with 7 categories

---

## 🎯 If All Tests Pass:

✅ **Backend is working perfectly!**
✅ **MongoDB connection is good!**
✅ **Ready to build frontend!**

---

## ❌ If Tests Fail:

1. Check server is running (`npm run dev`)
2. Check MongoDB is connected (should see in server output)
3. Make sure you ran `npm run seed`
4. Check port 5000 isn't blocked by firewall

---

## 📱 Or Use Postman/Thunder Client

Import these requests:

**1. Login:**
- Method: POST
- URL: `http://localhost:5000/api/auth/login`
- Body (JSON):
```json
{
  "email": "admin@farmtocup.com",
  "password": "Admin@123"
}
```

**2. Get Products:**
- Method: GET
- URL: `http://localhost:5000/api/products`

**3. Create Order:**
- Method: POST
- URL: `http://localhost:5000/api/orders`
- Headers: Cookie from login
- Body (JSON):
```json
{
  "items": [
    {
      "product": "PRODUCT_ID_HERE",
      "size": "12oz",
      "temperature": "hot",
      "quantity": 2,
      "modifiers": []
    }
  ],
  "paymentMethod": "cash",
  "amountPaid": 500
}
```

---

**That's it! If these work, everything is good to go! 🚀**
