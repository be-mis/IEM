# Email Configuration Guide for Password Reset

This guide explains how to configure email service for the password reset functionality in the IEM System.

## Overview

The system supports multiple email providers:
- **Gmail** (recommended for testing)
- **SendGrid** (recommended for production)
- **AWS SES** (for production)
- **Custom SMTP** (for any SMTP server)

---

## Option 1: Gmail (Recommended for Testing)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification**

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter "IEM System" as the name
5. Click **Generate**
6. Copy the 16-character password (remove spaces)

### Step 3: Update .env File
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM_NAME=IEM System
FRONTEND_URL=http://localhost:3000
```

### Step 4: Restart Backend Server
```bash
cd backend
npm start
```

You should see: `✅ Email server is ready to send messages`

---

## Option 2: SendGrid (Recommended for Production)

### Step 1: Create SendGrid Account
1. Sign up at: https://sendgrid.com/
2. Complete email verification
3. Create a Single Sender (verify your from email)

### Step 2: Generate API Key
1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it "IEM System"
4. Select **Full Access** or **Restricted Access** (Mail Send only)
5. Copy the API key (you'll only see it once!)

### Step 3: Update .env File
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=IEM System
FRONTEND_URL=http://localhost:3000
```

### Step 4: Restart Backend Server

---

## Option 3: AWS SES (For Production)

### Step 1: Set Up AWS SES
1. Go to AWS Console → SES
2. Verify your domain or email address
3. Request production access (if not in sandbox)

### Step 2: Create IAM User
1. Create IAM user with **AmazonSESFullAccess** policy
2. Generate **Access Key** and **Secret Key**

### Step 3: Update .env File
```env
EMAIL_SERVICE=aws-ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=IEM System
FRONTEND_URL=http://localhost:3000
```

### Step 4: Install AWS SDK
```bash
cd backend
npm install @aws-sdk/client-ses
```

### Step 5: Restart Backend Server

---

## Option 4: Custom SMTP

### Step 1: Get SMTP Credentials
Get SMTP details from your email provider:
- SMTP Host (e.g., smtp.office365.com)
- SMTP Port (usually 587 or 465)
- Username and Password

### Step 2: Update .env File
```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=IEM System
FRONTEND_URL=http://localhost:3000
```

### Step 3: Restart Backend Server

---

## Testing Email Configuration

### Method 1: Server Startup Check
When you start the backend server, look for these messages:

✅ **Email configured correctly:**
```
📧 Verifying email configuration...
✅ Email server is ready to send messages
```

❌ **Email not configured:**
```
⚠️  Email not configured - Password reset emails will not be sent
   To enable email: Set EMAIL_USER and EMAIL_PASSWORD in .env file
```

### Method 2: Test Password Reset
1. Go to: http://localhost:3000/forgot-password
2. Enter a valid email address from your users table
3. Click **Send Reset Link**

**If email is configured:**
- Check the inbox of the email address
- You should receive a password reset email

**If email is NOT configured (development mode):**
- Check the backend console logs
- The reset link will be printed in the console
- The frontend will also display the reset link

---

## Development vs Production Behavior

### Development Mode (`NODE_ENV=development`)
**Without email configured:**
- Password reset token is printed in console
- Reset link is shown in the console
- Reset link is returned in API response
- Frontend displays the reset link directly

**With email configured:**
- Email is sent normally
- Token is NOT printed in console or returned in response

### Production Mode (`NODE_ENV=production`)
- Email MUST be configured
- Reset token is NEVER exposed in API response or console
- Users must check their email for the reset link

---

## Security Best Practices

1. **Never commit .env files** to version control
2. **Use App Passwords** for Gmail (never your actual password)
3. **Rotate API keys** regularly for SendGrid/AWS
4. **Use environment variables** in production (not .env files)
5. **Enable HTTPS** in production for secure email links
6. **Set proper CORS** origins in production
7. **Monitor email sending** for abuse/spam

---

## Troubleshooting

### Error: "Invalid login credentials"
- **Gmail:** Make sure you're using an App Password, not your regular password
- **Gmail:** Verify 2-Factor Authentication is enabled
- **SMTP:** Check username and password are correct

### Error: "Connection timeout"
- Check your firewall/antivirus isn't blocking outbound SMTP
- Verify the SMTP port (try 587 or 465)
- Check if SMTP_SECURE matches the port (587=false, 465=true)

### Error: "Email server is not ready"
- Double-check all email credentials in .env
- Make sure .env file is in the backend folder
- Restart the backend server after changing .env

### Emails going to spam
- **SendGrid/AWS SES:** Set up SPF, DKIM, and DMARC records
- **Gmail:** Use a professional from-email address
- **All:** Avoid spam trigger words in email content

### Not receiving emails
- Check spam/junk folder
- Verify the email address exists in the users table
- Check backend console for error messages
- Verify email service quotas (SendGrid free tier: 100/day)

---

## Email Templates

The system includes a professional HTML email template with:
- Gradient header with branding
- Clear call-to-action button
- Security warnings and instructions
- Mobile-responsive design
- Plain text fallback

You can customize the template in:
`backend/utils/emailService.js` → `sendPasswordResetEmail()` function

---

## Cost Considerations

| Provider | Free Tier | Paid Plans |
|----------|-----------|------------|
| **Gmail** | Free (per account) | Not for bulk sending |
| **SendGrid** | 100 emails/day | $19.95/mo (50k emails) |
| **AWS SES** | 62,000/month (first 12 months) | $0.10 per 1,000 emails |
| **SMTP** | Varies by provider | Varies |

**Recommendation:** 
- Use Gmail for development/testing
- Use SendGrid or AWS SES for production

---

## Next Steps

1. Choose your email provider
2. Follow the setup guide for that provider
3. Update your `.env` file
4. Restart the backend server
5. Test the forgot password functionality
6. Monitor email delivery and adjust as needed

For questions or issues, contact your system administrator.
