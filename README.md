# 🧠 INTELLIGENT BUDGET ENGINE (V2.0)
> A Premium Full-Stack Financial Telemetry Dashboard with Real-Time Predictive Budget Alerting and Staggered Motion UI.

![Build Status](https://img.shields.io/badge/Build-Passing-success?style=for-the-badge&logo=github)
![Node Version](https://img.shields.io/badge/Node.js-v18+-blue?style=for-the-badge&logo=node.js)
![MongoDB Cloud](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![UI Style](https://img.shields.io/badge/Theme-Cyberpunk_Dark-purple?style=for-the-badge&logo=bootstrap)

---

## 🌌 Project Overview
The **Intelligent Budget Engine** is a production-grade personal finance dashboard designed for modern users. Built using a decoupling architecture, it combines a **Neon-Accent Glassmorphic UI** on the frontend with a powerful quantitative **Aggregation Algorithm** on the backend. 

Instead of showing boring monthly averages, the dashboard charts individual micro-transactions dynamically using an **Itemized Up-Down Zigzag Wave Flow** so users can pinpoint exactly where their money goes.

---

## ⚡ Key Engineered Features

| Feature Component | Technical Execution Description |
| :--- | :--- |
| **🧠 Algorithmic Breach Engine** | Monitors real-time inputs against target limits. Triggers a dramatic `#alertModal` instantly when budget thresholds are breached. |
| **📈 Dynamic Wave Tracking** | Uses Chart.js to map granular transaction flows. The chart updates dynamically without page reloads using relative API hooks. |
| **🎨 Advanced Glassmorphic UX** | High-fidelity dark mode backing with 3D hover lifting, micro-pulsing active nodes, custom styled webkit scrollbars, and fluid fade-in animations. |
| **📝 Full CRUD Operations** | Fully operational inline **Edit (✏️)** and **Delete (❌)** mechanisms that instantly manipulate the live MongoDB database state. |
| **🌐 Cloud-Ready Routing** | Pre-configured environment variable support (`process.env`) and static asset shims to bundle frontend and backend together on a single server host. |

---

## 🧬 System Architecture & Data Flow

```text
  [ Frontend View ]  ───( HTTP POST /api/expense )───► [ Express Server ]
         ▲                                                     │
         │                                            (Runs Budget Algorithm)
  (Triggers Neon Modal)                                        │
         │                                                     ▼
  [ 🚨 Breach Alert ] ◄───( JSON Response: triggerPopup )─── [ MongoDB Atlas ]
