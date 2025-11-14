# Vercel Deployment Guide - Backend

## Required Environment Variables

You **MUST** configure these environment variables in your Vercel project dashboard before the backend will work properly.

### How to Add Environment Variables in Vercel:
1. Go to your project dashboard on Vercel
2. Click on **Settings** > **Environment Variables**
3. Add each variable below with its corresponding value

---

### Environment Variables to Configure:

#### **1. NODE_ENV**
- **Value**: `production`
- **Description**: Sets the application to production mode

#### **2. MONGODB_URI**
- **Value**: Your MongoDB connection string
- **Example**: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- **Description**: Database connection string for MongoDB Atlas
- **⚠️ CRITICAL**: Without this, the backend will crash on startup

#### **3. JWT_SECRET**
- **Value**: A long random string (minimum 32 characters)
- **Example**: `your_secure_jwt_secret_key_here_change_in_production_min_32_chars`
- **Description**: Secret key for signing JWT tokens
- **⚠️ SECURITY**: Use a strong, unique value in production

#### **4. JWT_EXPIRES_TIME**
- **Value**: `7d`
- **Description**: JWT token expiration time

#### **5. COOKIE_EXPIRE**
- **Value**: `7`
- **Description**: Cookie expiration in days

#### **6. SESSION_SECRET**
- **Value**: A long random string (minimum 32 characters)
- **Example**: `your_secure_session_secret_key_here_change_in_production_min_32_chars`
- **Description**: Secret key for express-session
- **⚠️ SECURITY**: Use a strong, unique value in production

#### **7. CLIENT_URL**
- **Value**: Your frontend Vercel URL
- **Example**: `https://your-frontend-app.vercel.app`
- **Description**: Frontend URL for CORS and OAuth redirects
- **⚠️ CRITICAL**: Must match your actual frontend URL exactly

#### **8. GOOGLE_CLIENT_ID** (Optional - for Google OAuth)
- **Value**: Your Google OAuth client ID
- **Description**: Get this from [Google Cloud Console](https://console.cloud.google.com/)
- **Note**: Required only if using Google OAuth login

#### **9. GOOGLE_CLIENT_SECRET** (Optional - for Google OAuth)
- **Value**: Your Google OAuth client secret
- **Description**: Get this from [Google Cloud Console](https://console.cloud.google.com/)
- **Note**: Required only if using Google OAuth login

#### **10. GOOGLE_CALLBACK_URL** (Optional - for Google OAuth)
- **Value**: `https://your-backend.vercel.app/api/auth/google/callback`
- **Example**: `https://f2cposbackend.vercel.app/api/auth/google/callback`
- **Description**: OAuth callback URL for Google authentication
- **Note**: Must also be added to Google Cloud Console authorized redirect URIs

---

## Deployment Steps

### 1. **Set Environment Variables**
Add all the environment variables listed above to your Vercel project.

### 2. **Configure Google OAuth (if using)**
If you're using Google OAuth login:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   - `https://your-backend.vercel.app/api/auth/google/callback`
5. Save the changes

### 3. **Deploy the Backend**
```bash
# Make sure you're in the backend directory
cd backend

# Deploy to Vercel
vercel --prod
```

### 4. **Update Frontend Environment Variables**
Make sure your frontend has the correct backend API URL:
```
VITE_API_URL=https://your-backend.vercel.app
```

### 5. **Test the Deployment**
After deployment, test these endpoints:

**Health Check:**
```bash
curl https://your-backend.vercel.app/api/health
```

**Login Test:**
```bash
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## Troubleshooting

### Issue: 500 FUNCTION_INVOCATION_FAILED
**Causes:**
- Missing environment variables (especially `MONGODB_URI`, `JWT_SECRET`)
- Invalid MongoDB connection string
- CORS issues

**Solution:**
1. Check Vercel logs: `vercel logs your-deployment-url`
2. Verify all environment variables are set correctly
3. Check MongoDB Atlas allows connections from `0.0.0.0/0` (Vercel IPs)

### Issue: CORS Preflight Errors
**Causes:**
- Frontend URL not matching `CLIENT_URL` environment variable
- Missing CORS headers

**Solution:**
1. Set `CLIENT_URL` to your exact frontend URL
2. Verify CORS configuration in `backend/config/corsOptions.js`
3. Check browser console for the blocked origin
4. Temporarily, the backend allows all origins in production for debugging

### Issue: MongoDB Connection Failed
**Causes:**
- Invalid connection string
- Network access restrictions in MongoDB Atlas
- Missing environment variable

**Solution:**
1. Go to MongoDB Atlas dashboard
2. Navigate to **Network Access**
3. Add IP address `0.0.0.0/0` to allow all connections (Vercel uses dynamic IPs)
4. Verify the connection string is correct

### Issue: Google OAuth Not Working
**Causes:**
- Missing or incorrect Google OAuth credentials
- Callback URL not authorized in Google Console

**Solution:**
1. Verify `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` are set
2. Check Google Cloud Console authorized redirect URIs
3. Ensure callback URL matches exactly (including https://)

---

## Viewing Logs

To debug issues, view your Vercel deployment logs:

```bash
# View latest logs
vercel logs

# View logs for specific deployment
vercel logs <deployment-url>
```

Or check logs in the Vercel dashboard under **Deployments** > **View Function Logs**.

---

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env` files to version control
- Use strong, unique secrets for `JWT_SECRET` and `SESSION_SECRET` in production
- Restrict MongoDB network access after testing
- Remove the temporary "allow all origins" CORS setting after confirming your frontend URL
- Regularly rotate secrets and credentials
- Monitor Vercel logs for suspicious activity

---

## Support

If you encounter issues:
1. Check Vercel logs first
2. Verify all environment variables are set
3. Test API endpoints directly using curl or Postman
4. Check MongoDB Atlas connection and network access
5. Review CORS configuration and frontend URL settings
