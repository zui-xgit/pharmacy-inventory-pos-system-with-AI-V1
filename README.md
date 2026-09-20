# Pharmacy Inventory & POS System with AI (v1)

> An enterprise-grade, AI-assisted point-of-sale and inventory management platform designed to streamline pharmaceutical workflows, track stock levels, and deliver actionable insights for healthcare retail operations.

## 📌 Project Overview

Pharmacy management demands strict compliance, precise stock tracking, and real-time point-of-sale efficiency. Traditional retail systems often lack specialized inventory controls for medications (such as batch/lot tracking, expiry enforcement, and regulated dispensing workflows), leading to stock shrinkage, compliance risks, and stockout penalties.

**Pharmacy Inventory & POS System with AI (v1)** bridges this gap by offering a monolithic full-stack solution with modern SPA interactivity. It combines strict database transaction safety with intelligent stock analytics, allowing pharmacists and inventory managers to optimize procurement, streamline checkouts, and surface predictive stock insights.

### Architectural Blueprint

```
                     ┌─────────────────────────────────────────┐
                     │          Browser / Web Client           │
                     │    (React + Inertia.js + Tailwind)      │
                     └────────────────────┬────────────────────┘
                                          │  Inertia Protocol (JSON over HTTP)
                                          ▼
                     ┌─────────────────────────────────────────┐
                     │            Laravel 11 App               │
                     │  ┌───────────────────────────────────┐  │
                     │  │ Controllers / Actions / Middleware│  │
                     │  └─────────────────┬─────────────────┘  │
                     └────────────────────┼────────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     ┌────────────────────────┐                      ┌────────────────────────┐
     │    Relational DB       │                      │    AI Integration /    │
     │     (MySQL 8.0)        │                      │   External Services    │
     └────────────────────────┘                      └────────────────────────┘

```

## ⚙️ Core Features

* **Point of Sale (POS) Terminal**: High-throughput checkout interface with real-time barcode scanning, item filtering, and low-latency cart management.

* **Intelligent Stock & Expiry Tracking**: Granular batch and lot management with proactive expiry alerting and strict FIFO (First In, First Out) inventory enforcement.

* **AI-Assisted Analytics**: Integration with AI capabilities to analyze historical transaction patterns, forecast demand, and recommend reorder thresholds.

* **Transactional Integrity**: Database transactions wrapped across cart processing, stock deductions, and audit log generation to prevent race conditions during high concurrency.

* **Role-Based Access Control (RBAC)**: Fine-grained permissions separating administrative tasks, inventory adjustments, and cashier operations.

## 🛠️ Tech Stack & Architecture

| Category | Technology | Usage / Purpose | 
 | ----- | ----- | ----- | 
| **Backend Framework** | Laravel 11.x | Core API, authentication, business logic, ORM, and background queues | 
| **Frontend Framework** | React 18.x | Component-driven, dynamic UI rendering | 
| **Glue Layer** | Inertia.js | SPA functionality without client-side API boilerplate | 
| **Styling Framework** | Tailwind CSS | Utility-first responsive design system | 
| **Database** | MySQL 8.0 | ACID-compliant relational storage, indexing, and foreign key safety | 
| **Runtime & Environment** | PHP 8.x / Laravel Herd | High-performance local development environment | 
| **Version Control** | Git / GitHub | Feature branching and structured commit isolation | 

## 📐 Technical & Engineering Highlights

* **Inertia-Driven SPA Architecture**: Eliminated API overhead while maintaining client-side interactivity by using Inertia.js props for state hydration, keeping business logic strictly on the server.

* **Strict Database Transactions**: Implemented explicit Eloquent/PDO transaction blocks (`DB::transaction`) to guarantee atomic execution across order creation, stock decrements, and billing records.

* **Optimized Database Indexing**: Indexed frequently queried fields (`sku`, `barcode`, `batch_number`, `created_at`) to optimize read efficiency on multi-thousand-row product databases.

* **Component-Driven UI**: Built a scalable layout using modular React components and Tailwind styling, ensuring rapid page load and consistent design standards.

## 🚀 Local Setup & Installation

### Prerequisites

Ensure you have the following installed on your machine:

* **PHP** (>= 8.2)

* **Composer**

* **Node.js** (>= 18.x) & **npm**

* **MySQL** (>= 8.0)

### Quick Start Guide

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/pharmacy-inventory-pos-system-with-AI-V1.git
   cd pharmacy-inventory-pos-system-with-AI-V1
   ```

2. **Install Dependencies**

   ```bash
   # Install PHP dependencies
   composer install
   
   # Install Node dependencies
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

   Update your `.env` file with your local MySQL credentials:

   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=pharmacy_pos_db
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

4. **Database Setup**

   ```bash
   # Run migrations and seed baseline data
   php artisan migrate --seed
   ```

5. **Run the Development Server**

   ```bash
   # Start the Laravel backend server
   php artisan serve
   
   # In a separate terminal, start Vite for hot module replacement (HMR)
   npm run dev
   ```

6. **Access the Application**
   Open your browser and navigate to `http://127.0.0.1:8000`.



## 🖼️ Visuals & Interface

> *Note: Screen captures highlighting UI component interactions, role-based interfaces, and overall workflow execution.*

| Landing Page |
| :---: |
| ![Landing Page](docs/images/landing-page.png) |


|  Login Page |
| :---: | 
| ![Login Page](docs/images/login-page.png) |

| Owner Dashboard |
| :---: |
| ![Owner Dashboard](docs/images/owner-dashboard.png) |


|  Employee Dashboard |
| :---: |
| ![Employee Dashboard](docs/images/employee-dashboard.png) |

## 🔮 Future Roadmap

* \[ \] **Automated Supplier API Integration**: Direct electronic purchase order transmission to pharmaceutical suppliers upon low-stock alerts.

* \[ \] **Offline-First Cashier Sync**: Service Worker integration for local offline sales queueing and seamless background synchronization when connection resumes.

* \[ \] **Advanced Audit Trails**: Immutable audit logging for controlled substance tracking and regulatory audit export (PDF/CSV).

## 👤 Author & Contact

**Bernard Benetson Mbeikya**

*Full-Stack Engineer | Computer Science Professional*

* **Portfolio**: [your-portfolio-link.com](#)

* **LinkedIn**: [linkedin.com/in/your-profile](#)

* **GitHub**: [github.com/your-username](#)

* **Email**: [your-email@example.com](mailto:your-email@example.com)