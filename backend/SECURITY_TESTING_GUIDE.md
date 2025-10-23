# 🧪 Security Testing Guide

Quick guide to test all security features before production deployment.

---

## 🚀 Prerequisites

1. Start the server: `npm run dev`
2. Seed the database: `npm run seed`
3. Use Postman, Thunder Client, or curl

---

## Test 1: Rate Limiting on Login

### Goal: Verify login rate limiting (5 attempts per 15 minutes)

**Test Steps:**
```bash
# Try 6 consecutive login attempts with wrong password
# Requests 1-5 should return 401 with attempt count
# Request 6 should return 429 (Too Many Requests)

POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@farmtocup.com",
  "password": "wrongpassword"
}

# Repeat 6 times quickly
```

**Expected Results:**
- First 5 attempts: `429 Too Many Requests` or rate limit message
- Should see: "Too many login attempts, please try again after 15 minutes"

**✅ Pass:** Rate limiter blocks after 5 attempts
**❌ Fail:** Can make unlimited attempts

---

## Test 2: Account Lockout After Failed Logins

### Goal: Verify account locks after 5 failed password attempts

**Test Steps:**
```bash
# Wait 15 minutes after Test 1 (or use different IP/clear rate limit)
# Try 5 consecutive logins with wrong password

POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "cashier@farmtocup.com",
  "password": "WrongPassword@123"
}

# Repeat 5 times
```

**Expected Results:**
- Attempts 1-4: `401 Unauthorized` with "X attempts remaining"
- Attempt 5: `423 Locked` - "Too many failed login attempts. Account locked for 15 minutes."
- Attempt 6: `423 Locked` - "Account is locked. Please try again in X minutes."

**✅ Pass:** Account locks after 5 failed attempts
**❌ Fail:** Can keep trying unlimited times

---

## Test 3: Strong Password Validation

### Goal: Verify password complexity requirements

**Test Steps:**
```bash
# Login as admin first
POST http://localhost:5000/api/auth/login
{
  "email": "admin@farmtocup.com",
  "password": "Admin@123"
}

# Try to create user with weak password
POST http://localhost:5000/api/auth/register
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@farmtocup.com",
  "password": "weak",
  "role": "cashier"
}
```

**Test Cases:**
| Password | Should Pass? | Reason |
|----------|--------------|--------|
| `weak` | ❌ | Too short, no complexity |
| `password123` | ❌ | No uppercase, no special char |
| `PASSWORD123!` | ❌ | No lowercase |
| `Password!` | ❌ | No number |
| `Pass@123` | ✅ | Meets all requirements |

**Expected Results:**
- Weak passwords: `400 Bad Request` with validation error
- Strong password: `201 Created`

**✅ Pass:** Only strong passwords accepted
**❌ Fail:** Weak passwords are accepted

---

## Test 4: NoSQL Injection Protection

### Goal: Verify MongoDB operator injection is blocked

**Test Steps:**
```bash
# Try to inject MongoDB operators in login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": { "$gt": "" },
  "password": { "$gt": "" }
}

# Try injection in query params
GET http://localhost:5000/api/products?search={"$gt":""}
```

**Expected Results:**
- Login: Should fail (not bypass authentication)
- Search: Should sanitize and search for literal string
- No unauthorized access

**✅ Pass:** Operators are sanitized
**❌ Fail:** Can bypass authentication or access unauthorized data

---

## Test 5: XSS Protection

### Goal: Verify script injection is prevented

**Test Steps:**
```bash
# Login as admin
POST http://localhost:5000/api/auth/login
{
  "email": "admin@farmtocup.com",
  "password": "Admin@123"
}

# Try to inject script in product name
POST http://localhost:5000/api/products
{
  "name": "<script>alert('XSS')</script>",
  "description": "Test product",
  "category": "CATEGORY_ID",
  "variants": [{
    "size": "12oz",
    "temperature": "hot",
    "price": 100,
    "cost": 50
  }]
}

# Retrieve the product
GET http://localhost:5000/api/products
```

**Expected Results:**
- Product created successfully
- Script tags are sanitized or escaped
- When retrieved, should not contain executable script

**✅ Pass:** Scripts are sanitized
**❌ Fail:** Raw script tags are stored

---

## Test 6: Request Size Limit

### Goal: Verify large payloads are rejected

**Test Steps:**
```bash
# Try to send payload larger than 10KB
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@farmtocup.com",
  "password": "Admin@123",
  "extraData": "<insert 11KB of random text here>"
}
```

**Expected Results:**
- `413 Payload Too Large` or similar error
- Request is rejected before processing

**✅ Pass:** Large payloads rejected
**❌ Fail:** Large payloads accepted

---

## Test 7: API Rate Limiting

### Goal: Verify general API rate limiting (100 req/15min)

**Test Steps:**
```bash
# Make 101 consecutive requests to any endpoint
# Use a script or tool to automate

for i in {1..101}
do
  curl http://localhost:5000/api/health
done
```

**Expected Results:**
- Requests 1-100: Success (200 OK)
- Request 101: `429 Too Many Requests`

**✅ Pass:** Rate limiter blocks at 101
**❌ Fail:** Unlimited requests allowed

---

## Test 8: CORS Protection

### Goal: Verify CORS blocks unauthorized origins

**Test Steps:**
```bash
# Try to make request from different origin
curl -H "Origin: http://evil-site.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:5000/api/auth/login
```

**Expected Results:**
- Request blocked or no CORS headers returned for unauthorized origin
- Only `http://localhost:5173` allowed in development

**✅ Pass:** Unauthorized origins blocked
**❌ Fail:** Any origin can access API

---

## Test 9: JWT Token Security

### Goal: Verify JWT tokens are secure

**Test Steps:**
```bash
# 1. Login and get token
POST http://localhost:5000/api/auth/login
{
  "email": "admin@farmtocup.com",
  "password": "Admin@123"
}

# 2. Check cookie attributes in browser/Postman
# Should see:
# - HttpOnly: true
# - SameSite: Strict
# - Secure: true (in production)

# 3. Try to access protected route without token
GET http://localhost:5000/api/users
# (without sending cookie)

# 4. Try with invalid token
Cookie: token=invalid_token_here
GET http://localhost:5000/api/users
```

**Expected Results:**
- Without token: `401 Unauthorized`
- Invalid token: `401 Unauthorized`
- Cookie has HttpOnly and SameSite flags
- Token expires after 7 days

**✅ Pass:** JWT properly secured
**❌ Fail:** Can access protected routes without valid token

---

## Test 10: Role-Based Access Control

### Goal: Verify cashiers can't access admin-only routes

**Test Steps:**
```bash
# 1. Login as cashier
POST http://localhost:5000/api/auth/login
{
  "email": "cashier@farmtocup.com",
  "password": "Cashier@123"
}

# 2. Try to access admin-only routes
GET http://localhost:5000/api/users
# Should fail: 403 Forbidden

POST http://localhost:5000/api/products
# Should fail: 403 Forbidden

GET http://localhost:5000/api/analytics/dashboard
# Should fail: 403 Forbidden

# 3. Try to access allowed routes
POST http://localhost:5000/api/orders
# Should succeed
```

**Expected Results:**
- Admin routes: `403 Forbidden`
- Allowed routes: Success
- Error message: "Role (cashier) is not allowed to access this resource"

**✅ Pass:** Proper role enforcement
**❌ Fail:** Cashiers can access admin routes

---

## Test 11: Account Lock Expiration

### Goal: Verify locked accounts unlock after 15 minutes

**Test Steps:**
```bash
# 1. Lock an account (from Test 2)
# Try 5 failed logins on test@farmtocup.com

# 2. Note the current time

# 3. Wait exactly 15 minutes

# 4. Try to login with correct password
POST http://localhost:5000/api/auth/login
{
  "email": "cashier@farmtocup.com",
  "password": "Cashier@123"
}
```

**Expected Results:**
- Before 15 min: `423 Locked` with countdown
- After 15 min: `200 OK` - Successful login
- Attempt counter reset to 0

**✅ Pass:** Lock expires correctly
**❌ Fail:** Account remains locked or unlocks too early

---

## Test 12: Password Change Security

### Goal: Verify old password is required to change password

**Test Steps:**
```bash
# 1. Login as cashier
POST http://localhost:5000/api/auth/login
{
  "email": "cashier@farmtocup.com",
  "password": "Cashier@123"
}

# 2. Try to change password with wrong old password
PUT http://localhost:5000/api/auth/password
{
  "oldPassword": "WrongPassword@123",
  "newPassword": "NewPassword@456"
}

# 3. Try with correct old password
PUT http://localhost:5000/api/auth/password
{
  "oldPassword": "Cashier@123",
  "newPassword": "NewPassword@456"
}
```

**Expected Results:**
- Wrong old password: `400 Bad Request` - "Old password is incorrect"
- Correct old password: `200 OK` - Password changed
- Can login with new password

**✅ Pass:** Old password verified
**❌ Fail:** Can change password without verification

---

## 📊 Test Results Template

```
Date: _____________
Tester: ___________

| Test # | Test Name | Pass/Fail | Notes |
|--------|-----------|-----------|-------|
| 1 | Rate Limiting - Login | ☐ | |
| 2 | Account Lockout | ☐ | |
| 3 | Password Validation | ☐ | |
| 4 | NoSQL Injection | ☐ | |
| 5 | XSS Protection | ☐ | |
| 6 | Request Size Limit | ☐ | |
| 7 | API Rate Limiting | ☐ | |
| 8 | CORS Protection | ☐ | |
| 9 | JWT Security | ☐ | |
| 10 | Role-Based Access | ☐ | |
| 11 | Lock Expiration | ☐ | |
| 12 | Password Change | ☐ | |

Overall Result: ☐ All Pass ☐ Some Failures

Issues Found:
_______________________________________
_______________________________________
```

---

## 🚨 Critical Issues (Report Immediately)

If any of these tests fail, DO NOT deploy to production:

- ❌ Test 1: Rate Limiting
- ❌ Test 2: Account Lockout
- ❌ Test 4: NoSQL Injection
- ❌ Test 9: JWT Security
- ❌ Test 10: Role-Based Access

---

## ✅ All Tests Pass? Next Steps:

1. Document test results
2. Review `SECURITY_AUDIT_REPORT.md` for Priority 2 items
3. Update JWT_SECRET in production .env
4. Configure production MongoDB with IP whitelist
5. Set up HTTPS with valid SSL certificate
6. Deploy to staging environment first
7. Run penetration testing
8. Schedule security review in 30 days

---

**Testing Guide Version:** 1.0
**Last Updated:** 2025-10-08
