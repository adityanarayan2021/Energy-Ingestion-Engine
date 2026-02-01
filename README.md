# High-Scale Energy Ingestion Engine

This project is a **high-scale Fleet Energy Ingestion Engine** built with **NestJS** and **PostgreSQL / TimescaleDB**, designed to handle telemetry from 10,000+ smart meters and EV fleets in real time.  

The system provides:

- **Robust ingestion** of meter and vehicle telemetry  
- **Operational (live) tables** for dashboards  
- **Historical (cold) tables** for analytics  
- **Bulk ingestion** for high-volume telemetry  
- **Analytics endpoint** to measure efficiency and battery performance  

---

## **Table of Contents**

- [Tech Stack](#tech-stack)  
- [Features](#features)  
- [Setup & Installation](#setup--installation)  
- [Database Schema](#database-schema)  
- [API Endpoints](#api-endpoints)  
- [Bulk Ingestion](#bulk-ingestion)  
- [Analytics](#analytics)  
- [Scalability](#scalability)

---

## **Tech Stack**

- **Backend:** NestJS (TypeScript)  
- **Database:** PostgreSQL + TimescaleDB  
- **Telemetry:** Smart Meters (AC) and EV Chargers (DC)  
---

## **Features**

- Polymorphic ingestion for **Meter** and **Vehicle** streams  
- **Live tables** for current state (dashboard-friendly)  
- **History tables** (TimescaleDB hypertables) for long-term storage  
- **Bulk ingestion** endpoints for thousands of rows per request  
- Analytics endpoint calculating:
  - Total AC consumed
  - Total DC delivered
  - Efficiency (DC/AC)
  - Average battery temperature  

---

## **Setup & Installation**

### **1. Clone repository**

```bash
git clone https://github.com/adityanarayan2021/Energy-Ingestion-Engine.git
cd energy-ingestion-engine

DATABASE_URL=postgres://postgres:postgres@localhost:5432/energy
PORT=3000
ALERT_THRESHOLD=85


### 1. Start infra
docker compose up -d

### 2. Install
npm install

### 3. Prisma
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
psql -U postgres -d energy -f sql/schema_timescale.sql

### 4. Run
npm run start:dev

## APIs

POST /v1/ingest
GET /v1/analytics/performance/:vehicleId
