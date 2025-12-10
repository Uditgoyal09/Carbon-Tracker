# 🌿 Carbon Footprint Tracker - Frontend

This is the **frontend** of the Carbon Footprint Tracker web application — a MERN-stack based sustainability platform that helps users track their carbon emissions, set eco-goals, view insights, and engage in climate-positive habits.

> 🔗 Backend Repo: [Carbon-backend](https://github.com/ayush-raj-03022005/Carbon-backend)

## 🚀 Features

- 🔐 User Authentication (Register/Login)
- 🏡 Beautiful Home Page with blog-style layout
- 📊 Dashboard with charts and weekly summaries
- 📝 Activity Logging (Transport, Energy, Diet, Waste)
- 🎯 Goal Setting and Tracking
- 🏆 Achievements with dynamic badge updates
- 📈 Leaderboard with real-time rankings
- 👤 Profile Page with picture upload & password update
- 💬 Learn More Page to guide users
- 🌗 Responsive UI with dark/light compatibility

---
## ⚙️ Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Axios, Framer Motion
- **Routing**: React Router DOM
- **Charts**: Recharts
- **State Management**: React Context API
- **Image Upload**: Multer (via backend)

---

## 📁 Folder Structure

```

Carbon-frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── App.jsx
│   ├── main.jsx
├── .env
├── package.json
└── tailwind.config.js

````

---

## 🛠️ Getting Started

### Prerequisites

- Node.js & npm
- Backend server running locally (`http://localhost:5000`)

### Steps

```bash
# Clone the frontend repo
git clone https://github.com/ayush-raj-03022005/Carbon-frontend.git
cd Carbon-frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
````

### Environment Variables

Create a `.env` file in root:

```bash

VITE_API_URL=https://carbon-backend-j2dz.onrender.com
```

---

## 📦 Deployment

This project is ready to be deployed on **Vercel**.

```bash
# For Vercel Deployment
- Push to GitHub
- Connect repo to Vercel
- Add VITE_BACKEND_URL as environment variable
```

---

## 🤝 Contributing

Pull requests and stars are welcome!
Open issues or suggestions via GitHub Issues tab.

---

## 📄 License

MIT License © [Ayush Raj](https://github.com/ayush-raj-03022005)

```

---

Let me know if you want me to automatically generate badges (like Netlify/Vercel status, GitHub stars/forks, or license).
```
