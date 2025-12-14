# 🍽️ Restaurant Order Processor

A full-stack restaurant ordering application featuring JWT token-based authentication and 
authorization, secure REST APIs, and automated CI/CD deployment.While the backend includes 
admin capabilities (e.g., adding menu items, viewing all orders), these endpoints are not 
integrated into the frontend, as the assignment scope requires only order creation functionality, 
which is fully implemented on the client side

---

## 🚀 Live Deployment

The application is deployed on **AWS EC2** and can be accessed at:

**🔗 http://52.63.188.72/login**

### Test Credentials
You may either **register a new user** or use the test account below:

```
Email:    testuser@mail.to
Password: 12345
```

---

## 🔁 CI/CD Pipeline

- CI/CD pipeline is implemented using **GitHub Actions**
- Any commit merged into the **`main` branch** triggers automatic deployment
- Development workflow:
  - **Feature branches** → implement new functionality
  - **Frontend branch** → frontend-related changes
  - **Main branch** → production deployment

---

## 🧩 Application Overview

### Frontend
- React + Vite
- TypeScript
- Communicates with backend via REST APIs

### Backend
- Node.js + Express
- TypeScript
- JWT-based authentication
- SQLite (file-based, writable database)

---

## 📦 Project Structure

```
restaurant-order-processor/
├── backend/
│   ├── src/
│   ├── tests/
│   ├── dev.db
│   └── .env
└── frontend/
    ├── src/
    └── .env
```

---

## 🛠️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd restaurant-order-processor
```

---

## ⚙️ Backend Setup

```bash
cd backend
```

### Create `.env` file

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-secret-change-me"
PORT=8080
```

### Install dependencies

```bash
npm install
```

### Seed the database

```bash
npm run seed
```

> This will create the `dev.db` SQLite database file at the backend root.

### Start the backend server

```bash
npm run dev
```

### Run backend tests

```bash
npm test
```

---

## 🎨 Frontend Setup

```bash
cd frontend
```

### Create `.env` file

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Install dependencies

```bash
npm install
```

### Start the frontend server

```bash
npm run dev
```

### Run frontend tests

```bash
npm test
```

---

## 🔐 Authentication

- JWT-based authentication
- Protected backend routes
- Role-based access control supported (admin / customer)

---

## 🧪 Testing

- Unit and integration tests for both frontend and backend
- Tests can be executed independently in each module

---

## 📌 Notes

- SQLite is intentionally used as a lightweight, file-based database
- Designed to run locally and in cloud environments (AWS EC2)
- CI/CD ensures consistent automated deployment

---
