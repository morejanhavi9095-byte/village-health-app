# 🏥 Village Health Awareness App - Project Summary

This document contains everything you need to manage your app. Keep this file safe!

## 📂 Project Location
*   **Folder**: `C:\Users\91958\OneDrive\Desktop\village-health-app`

## 🌐 Live Website (24/7 on Google/Phone)
*   **Host**: Render.com
*   **Public Link**: (Found on your Render Dashboard after deployment)

## 🔐 Passwords & Access
*   **Admin Password**: `admin123` (Use this to view or delete patient data).
*   **Database (MySQL)**: Set up on **Aiven.io**.
*   **Photos (Cloudinary)**: Set up on **Cloudinary.com**.

## 🚀 How to Run & Update

### 1. Run Locally (Testing)
*   Double-click **`start_app.bat`**.
*   Open browser to: `http://localhost:3000`

### 2. Share to Phone Instantly (Temporary Link)
*   Make sure the app is running.
*   Double-click **`share_app.bat`**.
*   Copy the `.loca.lt` link and use your Public IP as the password.

### 3. Update the Live Website (Permanent)
Whenever you make a change, use **Git Bash** in your folder:
```bash
git add .
git commit -m "Update my app"
git push origin main
```
*Render will see this and update your link automatically.*

## ☁️ Permanent Cloud Setup (Render Environment Variables)
Make sure these 4 keys are added to the **Environment** section on Render:
1.  **`MYSQL_URL`**: (Your Aiven Service URI)
2.  **`CLOUDINARY_CLOUD_NAME`**: (From Cloudinary Dashboard)
3.  **`CLOUDINARY_API_KEY`**: (From Cloudinary Dashboard)
4.  **`CLOUDINARY_API_SECRET`**: (From Cloudinary Dashboard)

## 📁 Key Files
*   `server.js`: The "brain" of your app (Node.js + MySQL logic).
*   `public/index.html`: The design and layout (Marathi + English).
*   `public/script.js`: The frontend logic (Search, Form, Delete).
*   `public/style.css`: The green and white healthcare theme.

---
**Project complete! Your village health app is now professional-grade and ready for use.**
