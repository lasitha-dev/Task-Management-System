# CTSE Assignment 01: Secure Microservice-Based Task Management System

## 📌 Project Overview
In this application, users will be able to track their progression in a seamless fashion through an intuitive Kanban-based workflow. This project is developed for the **Current Trends in Software Engineering (SE4010)** module at **SLIIT**. 

The system demonstrates a secure, microservice-based architecture leveraging the **MERN stack**, designed to fulfill the core objectives of modern **Cloud Computing** and **DevOps** practices.

**Deadline:** March 14, 2026

---

## 🏗️ System Architecture
To provide a seamless progression tracking experience, the application is divided into four independently deployable microservices:

1.  **User Management Service:** Facilitates secure access with admin monitoring and public registration.
2.  **Task Management Service:** The core engine allowing users to modify, delete, and drag-and-drop tasks in a Kanban style.
3.  **Notifications Management Service:** Ensures real-time updates via in-app and email alerts for task changes and deadlines.
4.  **Reporting & Analytics Service:** Empowers users to monitor their productivity through detailed data insights.

---

## 🚀 DevOps & Cloud Capabilities
This repository implements the following requirements as per the assignment brief:

* **Automated CI/CD:** Pipelines for automated builds and cloud deployment.
* **Containerization:** Each service is containerized using **Docker**.
* **Managed Cloud Hosting:** Deployed using cloud-specific container services (e.g., AWS ECS or Azure Container Apps).
* **DevSecOps:** Integration of SAST tools like **SonarCloud** or **Snyk** for continuous security scanning.
* **Security Best Practices:** Implementation of IAM roles and principles of least privilege.

---

## 🛠 Tech Stack
* **Frontend:** React.js (MERN)
* **Backend:** Node.js, Express.js (MERN)
* **Database:** MongoDB Atlas
* **DevOps:** Docker, GitHub Actions, Snyk/SonarCloud
* **Cloud:** AWS/Azure (Free Tier)

---

## 📂 Repository Structure
* `/user-management` - Identity and Access Management
* `/task-management` - Kanban Task Lifecycle
* `/notifications-management` - Communication Hub
* `/reporting-analytics` - Productivity Insights

---
**Institution:** SLIIT | Faculty of Computing  
**Module:** Current Trends in Software Engineering (SE4010)
