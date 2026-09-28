# MedChain

**A Full-Stack Pharmaceutical Supply Chain Traceability System**

![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react\&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite\&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js\&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express\&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb\&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?logo=jsonwebtokens\&logoColor=white)
![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?logo=render\&logoColor=white)

[GitHub →](https://github.com/Nikkiraj4/MedChain)  |  [Live Demo →](https://medchain-frontend.onrender.com)

---

## The Problem

Pharmaceutical products pass through multiple stages before reaching the pharmacy. Tracking these transfers reliably can become difficult when records are fragmented or can be modified without a clear history.

A supply-chain system needs to:

* Track medicine batches from **Manufacturer → Distributor → Pharmacy**
* Maintain a record of every ownership transfer
* Restrict actions based on user roles
* Authenticate users securely
* Make unauthorized transaction modification detectable

---

## The Solution

MedChain is a full-stack web application that provides **role-based pharmaceutical supply chain traceability**.

Users can create medicine batches, transfer ownership between supply-chain participants, and maintain a transaction history.

Each transaction is linked to the previous transaction using a **SHA-256 hash**, creating a tamper-evident chain of records.

```text
User
  ↓
React + Vite Frontend
  ↓
REST API
  ↓
Node.js + Express Backend
  ↓
JWT Authentication + RBAC
  ↓
Transaction Processing
  ↓
MongoDB Atlas
```

---

## Key Features

| Feature                | Capability                                                          |
| ---------------------- | ------------------------------------------------------------------- |
| User Authentication    | JWT-based login and protected API access                            |
| Role-Based Access      | Admin, Manufacturer, Distributor and Pharmacy roles                 |
| User Management        | Admin can manage supply-chain users                                 |
| Batch Management       | Create and track medicine batches                                   |
| Batch Transfer         | Transfer ownership between authorized participants                  |
| Transaction Tracking   | Records sender, receiver, quantity, timestamp and batch information |
| Tamper-Evident Records | SHA-256 hash chaining links transactions together                   |
| Password Security      | Passwords protected using bcrypt hashing                            |
| REST APIs              | Backend APIs for authentication, users, batches and transfers       |
| Cloud Database         | MongoDB Atlas for persistent data storage                           |
| Deployment             | Frontend and backend deployed separately on Render                  |

---

## Supply Chain Workflow

```text
┌──────────────────┐
│   Manufacturer   │
│                  │
│ Create Batch     │
└────────┬─────────┘
         │
         │ Transfer
         ▼
┌──────────────────┐
│   Distributor    │
│                  │
│ Receive Batch    │
└────────┬─────────┘
         │
         │ Transfer
         ▼
┌──────────────────┐
│     Pharmacy     │
│                  │
│ Receive Batch    │
└──────────────────┘
```

Each transfer updates the current holder of the batch and creates a corresponding transaction record.

---

## Tamper-Evident Transaction Model

Every transaction contains information such as:

```text
Transaction ID
Batch ID
Sender
Receiver
Quantity
Timestamp
Previous Hash
Current Hash
```

The current transaction hash is generated using transaction data and the hash of the previous transaction.

```text
Transaction 1
     │
     │ currentHash
     ▼
Transaction 2
     │
     │ currentHash
     ▼
Transaction 3
     │
     │ currentHash
     ▼
Transaction 4
```

This creates a linked history where changes to earlier transaction data can be detected through hash verification.

---

## Authentication & Authorization

```text
Login
  ↓
Email + Password
  ↓
Password Verification
  ↓
JWT Generated
  ↓
Authenticated Request
  ↓
JWT Verification
  ↓
Role Verification
  ↓
Protected Resource
```

### Supported Roles

| Role         | Responsibilities                               |
| ------------ | ---------------------------------------------- |
| Admin        | Manage users and administrative operations     |
| Manufacturer | Create medicine batches and initiate transfers |
| Distributor  | Receive and transfer batches                   |
| Pharmacy     | Receive batches from distributors              |

JWT middleware protects authenticated routes, while role-based middleware restricts access to authorized operations.

---

## Technical Architecture

```text
MedChain/
│
├── Frontend
│   │
│   ├── React.js
│   ├── Vite
│   └── REST API Integration
│
│              │
│              ▼
│
├── Backend
│   │
│   ├── Node.js
│   ├── Express.js
│   ├── JWT Authentication
│   ├── Role-Based Access Control
│   ├── bcrypt Password Hashing
│   └── REST APIs
│
│              │
│              ▼
│
└── Database
    │
    └── MongoDB Atlas
```

---

## Project Structure

```text
MedChain/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── seedAdmin.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── ...
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

> `.env` contains private credentials and is excluded from version control.

---

## API Overview

| Method | Endpoint                    | Description                        |
| ------ | --------------------------- | ---------------------------------- |
| POST   | `/api/auth/login`           | Authenticate user and generate JWT |
| POST   | `/api/admin/users`          | Create/manage users                |
| POST   | `/api/batches`              | Create a medicine batch            |
| POST   | `/api/batches/:id/transfer` | Transfer batch ownership           |
| GET    | `/api/batches`              | Retrieve batch information         |
| GET    | `/api/transactions`         | Retrieve transaction records       |

> API endpoints may evolve as additional functionality is added.

---

## Local Development

### Prerequisites

* Node.js
* MongoDB Atlas account
* Git

### Clone the Repository

```bash
git clone https://github.com/Nikkiraj4/MedChain.git
cd MedChain
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
npm start
```

Backend:

```text
http://localhost:5000
```

### Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

---

## Technology Stack

| Technology    | Purpose                            |
| ------------- | ---------------------------------- |
| React.js      | Frontend user interface            |
| Vite          | Frontend build tool                |
| Node.js       | Backend runtime                    |
| Express.js    | REST API and server framework      |
| MongoDB       | Database                           |
| MongoDB Atlas | Cloud database hosting             |
| Mongoose      | MongoDB ODM                        |
| JWT           | Authentication                     |
| bcrypt.js     | Password hashing                   |
| SHA-256       | Tamper-evident transaction hashing |
| Render        | Cloud deployment                   |
| Git & GitHub  | Version control                    |

---

## Deployment

MedChain is deployed using **Render** for the frontend and backend, with **MongoDB Atlas** providing the cloud database.

### Production

**Frontend:**
https://medchain-frontend.onrender.com

**Backend:**
https://medchain-4h3n.onrender.com/

---

## Future Scope

* QR-based batch identification and tracking
* Complete transaction history visualization
* Enhanced dashboards for each supply-chain role
* Advanced audit and reporting functionality
* Blockchain-based distributed verification
* Notifications for batch transfers

---

## Author

**Nikita Kumari**

Bachelor of Technology — Computer Science Engineering
Delhi Skill and Entrepreneurship University (DSEU)

[GitHub](https://github.com/Nikkiraj4)

---

## Disclaimer

MedChain is an academic/project prototype focused on **pharmaceutical supply-chain traceability and tamper-evident record tracking**.

It does not independently verify the chemical composition, quality, authenticity, or regulatory approval of medicines.
