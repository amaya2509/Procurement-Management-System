# Procurement Management System (Microservices)

A cloud-based Procurement Management System built using Spring Boot Microservices, MongoDB, Docker, and CI/CD pipelines.
This system simulates a real-world enterprise procurement workflow including Purchase Requests, Purchase Orders, Supplier Management, User Roles, and Approval Workflow.

## 🚀 Features

- ✅ User Authentication & Role-Based Access Control (RBAC)
- ✅ Purchase Request (PR) Management
- ✅ Purchase Order (PO) Management
- ✅ Supplier Management
- ✅ Approval Workflow System
- ✅ Real-time Notifications (WebSocket-based)
- ✅ Microservices Architecture
- ✅ Dockerized Deployment
- ✅ CI/CD with GitHub Actions

## 🧩 Microservices Overview

| Service | Description |
| --- | --- |
| User Service | Authentication, user management, roles (JWT-based) |
| Supplier Service | Manage suppliers |
| PR Service | Create and manage purchase requests |
| PO Service | Create purchase orders from approved PRs |
| Approval Service | Handles approval workflows for PR & PO |

## 🏗️ Architecture

- Microservices architecture
- Database per service
- REST API communication
- JWT-based security
- Docker containerization

## 🔗 Inter-Service Communication

| From | To | Purpose |
| --- | --- | --- |
| PR Service | Approval Service | Request approval |
| Approval Service | User Service | Validate approver |
| Approval Service | PR Service | Update PR status |
| PO Service | PR Service | Validate approved PR |
| PO Service | Supplier Service | Validate supplier |
| PO Service | Approval Service | Request approval |
| Approval Service | PO Service | Update PO status |

## 🔐 Security

- JWT Authentication
- Role-Based Access Control (RBAC)

Roles:

- ADMIN → Manage users
- REQUESTER → Create PR
- APPROVER → Approve PR & PO

## 🗄️ Database Design (MongoDB)

Each service maintains its own database.

Example: Purchase Request

```json
{
  "prNumber": "PR2025000001",
  "status": "PENDING_APPROVAL",
  "requestorId": "USR001",
  "supplierId": "SUP001"
}
```

## 🔔 Real-Time Notifications

Implemented using WebSockets.

Notifications triggered on:

- PR approval/rejection
- PO approval/rejection

## 🐳 Docker Setup

### Build and Run

```bash
docker-compose up --build
```

Services:

- User Service → http://localhost:8081
- Supplier Service → http://localhost:8082
- PR Service → http://localhost:8083
- PO Service → http://localhost:8084
- Approval Service → http://localhost:8085

## ⚙️ CI/CD Pipeline

Implemented using GitHub Actions.

Pipeline Steps:

- Checkout code
- Build with Maven
- Run tests
- Build Docker image
- Push to Docker Hub
- Deploy to server

## 🧪 API Endpoints (Sample)

### User Service

- POST /auth/login
- POST /users
- GET /users/{id}

### Purchase Request Service

- POST /purchase-requests
- GET /purchase-requests/{id}
- PUT /purchase-requests/{id}/status

### Purchase Order Service

- POST /purchase-orders
- GET /purchase-orders/{id}
- PUT /purchase-orders/{id}/status

### Approval Service

- POST /approvals
- PUT /approvals/{id}/approve
- PUT /approvals/{id}/reject

## 🧑‍💻 Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Spring Boot |
| Database | MongoDB |
| Security | JWT |
| Frontend | React (optional) |
| Containerization | Docker |
| CI/CD | GitHub Actions |

## 📂 Project Structure

```text
procurement-system/
│
├── user-service/
├── supplier-service/
├── pr-service/
├── po-service/
├── approval-service/
│
├── docker-compose.yml
└── README.md
```

## ▶️ How to Run Locally

Clone repository:

```bash
git clone https://github.com/your-username/procurement-system.git
```

Navigate to project:

```bash
cd procurement-system
```

Run using Docker:

```bash
docker-compose up --build
```

## 🎯 Demonstration Flow

- Login user
- Create Purchase Request
- Approver approves PR
- Create Purchase Order
- Approver approves PO
- Real-time notification shown

## 🏆 Key Highlights

- ✔ Clean microservices architecture
- ✔ Secure authentication & authorization
- ✔ Real-world ERP workflow
- ✔ Scalable and modular design
- ✔ DevOps & CI/CD integrated

## 📌 Future Improvements

- Email/SMS notifications
- Advanced reporting dashboard
- Mobile application integration
- Multi-level approval workflow
- API Gateway integration

## 👨‍💻 Author

Developed as part of CTSE Assignment - Microservices Project.

## ⭐ Contribution

Feel free to fork and enhance the project 🚀