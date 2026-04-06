# Madrid Round Robin (RR) App - User Guide 🚀

![Madrid RR Presentation Cover](file:///C:/Users/Javier/.gemini/antigravity/brain/3fd1c470-4ac8-43d5-bc2b-68666523af97/madrid_rr_presentation_cover_1775404622382.png)

## 📌 Executive Summary
The **Madrid RR App** is a specialized real-time tool designed to optimize ticket assignment and team balancing for the IPC GSOC Madrid site. It ensures fair workload distribution, multi-timezone awareness, and seamless communication between shifts.

---

## 🛠️ Key Features

### 1. Smart Round Robin & Balancing
- **Automatic Assignment**: Rotates tickets among available members.
- **Workload Balancing**: From 16:00 Madrid time, the system automatically balances the **Late Shift** if their load is below 50% of the **Early Shift**, ensuring both teams remain synchronized.

### 2. Multi-Timezone Dashboard
- **Madrid / NY Toggle**: Switch the entire interface (clock, logs, headers) between Madrid and New York time with one click.
- **Dynamic Headers**: Shift hours automatically reflect the selected timezone (e.g., 14:00-23:00 in Madrid becomes 08:00-17:00 in NY).

### 3. Automatic Teams Notifications 💬
- **Zero-Friction Alerting**: When a ticket is assigned, the app automatically opens a **Microsoft Teams** chat with the recipient.
- **Pre-filled English Message**: *"Hi [Name], I have assigned the ticket [INC...] to you. Please check it. Thanks!"*
- You only need to press **Enter** to send.

---

## 📋 Operational Workflow

### Step 1: Assigning a Ticket
1. Enter the **Ticket Number** (INC + 8 digits).
2. (Optional) Enter the **UCN** and **Customer**.
3. Click **"Assign Ticket"**.
4. The system updates the Round Robin index and prepares the Teams notification.

### Step 2: Team Management
- **Break State**: Toggle members ON/OFF to exclude them from the Round Robin temporarily.
- **Drag & Drop**: Re-order team members or move them between Early and Late shifts instantly.
- **NC Point**: The NC slot (Position 0) is automatically highlighted with a corner tag when active.

### Step 3: Daily Handover
- After the shift, navigate to the **History** or **Overview** tab.
- Click **"Create Handover Email"** to generate a perfectly formatted `.eml` file for **Outlook**.
- Includes **Critical Incidents** and a **"FINAL CHECK-OFF"** table for warm handshakes.

---

## 🔒 Security & Data Integrity
- **Real-time Sanitization**: Input fields block invalid characters (symbols/special chars) instantly.
- **Cloud Persistence**: All data is synchronized in real-time via **Firebase Firestore**, so the whole team sees the same state simultaneously.
- **History Logs**: Every action (assignment, edit, reset) is logged with a timestamp for accountability.

---

> [!TIP]
> **To start using the app:** Simply visit the provided URL in your browser. All your changes are saved automatically. No login required!

> [!IMPORTANT]
> **Teams Setup:** Ensure your Microsoft Teams app is open before assigning tickets to experience the automatic notification feature seamlessly. 

---

*Desarrollado para IPC GSOC Madrid - Optimización y Excelencia Operativa.*
