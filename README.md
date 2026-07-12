# 🚀 PLCTR - Placement Management Platform

A modern Full Stack Placement Management Platform that connects **students** and **recruiters** through a secure, role-based web application.

The platform allows recruiters to post job opportunities and manage applications, while students can browse jobs, apply with resumes, and track their application status.

---

### Frontend
https://plctr.netlify.app

### Backend API
https://plctr-backend.onrender.com

### GitHub Repository
https://github.com/priyanshu0109wmt/placementtracker

---

# ✨ Features

## Student

- Student Registration & Login
- Secure JWT Authentication
- Student Dashboard
- Browse Available Jobs
- Apply to Jobs
- Upload Resume (PDF)
- Track Application Status
- Manage Student Profile

---

## Recruiter

- Recruiter Registration & Login
- Recruiter Dashboard
- Create Jobs
- Edit Jobs
- Delete Jobs
- View Applicants
- Download Student Resume

---

## Security

- JWT Authentication
- Password Hashing (bcrypt)
- Role Based Authorization
- Protected API Routes

---

# 🛠 Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript

## Backend

- Node.js
- Express.js

## Database

- MySQL

## Authentication

- JWT
- bcryptjs

## File Upload

- Multer

## Cloud Deployment

- Netlify
- Render
- Aiven MySQL

---

# ☁️ Deployment Architecture

```
                User
                  │
                  ▼
        Netlify Frontend
                  │
            REST API
                  │
                  ▼
        Render Backend
                  │
             mysql2 Driver
                  │
                  ▼
        Aiven Cloud MySQL
```

---

# 📸 Screenshots

## Home Page
<img width="1917" height="1145" alt="login" src="https://github.com/user-attachments/assets/bf8327c5-302e-49d1-ac02-a6d0d515e79a" />

## Student Dashboard
<img width="1918" height="1146" alt="student_profile" src="https://github.com/user-attachments/assets/84e46f38-eb22-47fb-8741-4f8695a8908a" />

## Recruiter Dashboard
<img width="1918" height="1151" alt="recruiter_profile" src="https://github.com/user-attachments/assets/ef127726-7344-419e-9292-339bb01bc395" />

## Available Jobs
<img width="1918" height="1151" alt="jobs" src="https://github.com/user-attachments/assets/f5273e96-28e1-4ca8-9d3d-35775a30e583" />

## Create Job
<img width="1918" height="1146" alt="create_job" src="https://github.com/user-attachments/assets/1220649b-fc9e-4e26-8af9-ca78790dddc9" />

## Applications
<img width="1918" height="1092" alt="Aiven_DB" src="https://github.com/user-attachments/assets/738a7b7f-3771-4895-a1fe-369e3da5b666" />
<img width="1918" height="1151" alt="Render_beckend" src="https://github.com/user-attachments/assets/6c70acc2-2df0-48c1-9c54-bae78f7e6edd" />

# 📁 Folder Structure

```
placementtracker
│
├── backend
│   ├── src
│   ├── uploads
│   └── package.json
│
├── frontend
│   ├── css
│   ├── js
│   ├── pages
│   └── index.html
│
├── database
│
└── screenshort
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/priyanshu0109wmt/placementtracker.git
```

Backend

```bash
cd backend
npm install
npm start
```

Frontend

Open the frontend using Live Server.

---

# Environment Variables

Create a `.env` file inside the backend directory.

```
PORT=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
```

---

# 🚀 Future Improvements

- Admin Dashboard
- Email Notifications
- Search & Filters
- Pagination
- Interview Scheduling
- Company Profiles
- Password Reset
- Notifications
- Dark Mode

---

# 👨‍💻 Author

**Priyanshu**

GitHub

https://github.com/priyanshu0109wmt

---

⭐ If you like this project, consider giving it a star.
