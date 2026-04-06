# Madrid Round Robin (RR) App - User Guide 🚀

## 📌 Executive Summary
The **Madrid RR App** is a specialized real-time tool designed to optimize ticket assignment and team balancing for the IPC GSOC Madrid site. It ensures fair workload distribution, multi-timezone awareness, and seamless communication between shifts.

### Who is this for?
- **Queue Managers (QM)**: The app makes the QM role **easier and more transparent**. No more manual tracking - the system automatically assigns tickets fairly based on workload.
- **All Team Members**: Everyone can see their **real-time ticket history** and have the option to **toggle their break status** (ON/OFF) to stop receiving tickets temporarily.

---

## 🛠️ Key Features

### 1. Smart Round Robin & Load Balancing
- **Automatic Assignment**: Tickets are always assigned to the available team member with the **fewest tickets** across both shifts (Early and Late).
- **Fair Distribution**: No fixed percentage rules - the system dynamically balances based on who has the least workload at the moment of assignment.

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
4. The system assigns to the member with fewest tickets and prepares the Teams notification.
5. The ticket appears in the **History** tab, ready for you to fill in the details.

### Step 2: Team Management
- **Break State**: Toggle members ON/OFF to exclude them from the Round Robin temporarily.
- **Drag & Drop**: Re-order team members or move them between Early and Late shifts instantly.
- **NC Point**: The first position (Position 0) in each shift list is the NC slot. The **"NC Point"** badge appears when that position is blocked from receiving tickets:
  - **Early Shift**: NC blocked from 14:00 to 20:00 (badge visible during this time)
  - **Late Shift**: NC blocked from 20:00 to 01:00 (badge visible during this time)

### Step 3: Fill In Ticket Details (During Your Shift)
As you work on tickets, fill in the details in the **History** tab for each ticket:

1. Go to the **History** tab.
2. Use the **"Name"** dropdown to filter and see only your assigned tickets.
3. For each ticket, fill in:
   - **UCN**: The Unique Circuit Number or reference
   - **Customer**: The customer name affected
   - **Notes**: Select a standard note (Chase Carrier, Chase A-end, etc.) or type a custom note

### Step 4: Daily Handover
- After the shift, navigate to the **History** tab.
- Mark tickets for handover (HO checkbox) and critical incidents (CI checkbox).
- Filter by your name to review your tickets before handover.
- Click **"Create Handover Email"** to generate a perfectly formatted `.eml` file for **Outlook**.
- Includes **Critical Incidents** (in bold) and a **table for all other handover tickets**.

---

## 🔒 Security & Data Integrity
- **Real-time Sanitization**: Input fields block invalid characters (symbols/special chars) instantly while allowing spaces where needed.
- **Cloud Persistence**: All data is synchronized in real-time via **Firebase Firestore**, so the whole team sees the same state simultaneously.
- **History Logs**: Every action (assignment, edit, reset) is logged with a timestamp for accountability.

---

> [!TIP]
> **To start using the app:** Simply visit the provided URL in your browser. All your changes are saved automatically. No login required!

> [!IMPORTANT]
> **Teams Setup:** Ensure your Microsoft Teams app is open before assigning tickets to experience the automatic notification feature seamlessly. 

---

*Desarrollado para IPC GSOC Madrid - Optimización y Excelencia Operativa.*
