# Render Environment Variables Setup

## Required Environment Variables for Carbon-tracker Backend

Set these in Render Dashboard → Environment:

```
PORT=3000
MONGO_URI=mongodb+srv://uditgoyal0905_db_user:cPj0aBMxcrpwT5LH@pep.jf5v015.mongodb.net/?appName=PEP
JWT_SECRET=mysecret
JWT_EXPIRE=7d
EMAIL_USER=uditgoyal90532@gmail.com
EMAIL_PASS=qwmuuxkoejhjvely
```

## Steps to Set Environment Variables in Render:

1. Go to https://dashboard.render.com
2. Click on your **Carbon-tracker** backend service
3. Click **Environment** tab (left sidebar)
4. Add each variable:
   - Key: `EMAIL_USER`, Value: `uditgoyal90532@gmail.com`
   - Key: `EMAIL_PASS`, Value: `qwmuuxkoejhjvely`
   - (add others if missing)
5. Click **Save**
6. Wait for auto-redeployment

## After Setting Variables:

✅ OTP emails will start working
✅ User registration will function properly
✅ Password reset emails will be sent

## Test OTP After Deployment:

Use this endpoint:
```
POST https://carbon-tracker-1-xqwt.onrender.com/api/auth/send-otp
Body: { "email": "your@email.com" }
```
