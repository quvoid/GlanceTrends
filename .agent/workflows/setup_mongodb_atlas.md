---
description: How to set up a free MongoDB Atlas Cluster for Vercel
---

# Setup MongoDB Atlas for Vercel

Follow these exact steps to create a free cloud database accessible by Vercel.

## 1. Create an Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Sign up (Google Sign-in is fastest).

## 2. Deploy a Free Cluster
1. You will be asked to "Deploy a cloud database".
2. Select **M0** (Free, Shared).
3. Provider: **AWS** (default is fine).
4. Region: Choose one close to you (e.g., **N. Virginia** or **Mumbai** if you're in India).
5. Name: Leave as `Cluster0`.
6. Click **Create Deployment**.

## 3. Create a Database User
1. **Username**: `admin` (or whatever you prefer).
2. **Password**: Click "Autogenerate Secure Password" and **COPY IT NOW**. You won't see it again.
   - *Example*: `v8x92nm...`
3. Click **Create Database User**.

## 4. Allow Network Access (CRITICAL)
1. Scroll down to "Network Access".
2. Click **Add IP Address**.
3. Select **Allow Access from Anywhere** (`0.0.0.0/0`).
   - * Why? Vercel's servers change IP addresses constantly. You cannot whitelist just one.*
4. Click **Confirm**.

## 5. Get Connection String
1. Go back to the **Overview** or **Database** tab.
2. Click **Connect**.
3. Click **Drivers**.
4. You will see a string like:
   `mongodb+srv://admin:<db_password>@cluster0.p8xyz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
5. **Copy this string.**

## 6. Update Vercel
1. Go to your Vercel Project Dashboard.
2. Settings -> **Environment Variables**.
3. Add:
   - Key: `DATABASE_URL`
   - Value: Paste the string from step 5.
   - **IMPORTANT**: Replace `<db_password>` with the actual password you copied in Step 3.
4. Redeploy your project (Deployments -> Redeploy).
