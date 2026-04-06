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
- Enter the **Ticket Number** (INC + 8 digits).
- Click **"Assign Ticket"**.
<img width="434" height="444" alt="image" src="https://github.com/user-attachments/assets/963ac5f7-70d8-48fa-a06e-14de5c4be92f" />
- The system assigns to the member with fewest tickets and prepares the Teams notification.
<img width="874" height="275" alt="image" src="https://github.com/user-attachments/assets/d2154823-aa0f-478c-ac49-82efc93ec65d" />

- The ticket appears in the **History** tab, ready for you to fill in the details(optional at this point).


### Step 2: Team Management
- **Break State**: Toggle members ON/OFF to exclude them from the Round Robin temporarily.
<img width="559" height="526" alt="image" src="https://github.com/user-attachments/assets/02f191be-4240-4e33-a9bd-5c2baa61150f" />

- **Drag & Drop**: Re-order team members or move them between Early and Late shifts instantly.
- **NC Point**: The first position (Position 0) in each shift list is the NC slot. The **"NC Point"** badge appears when that position is blocked from receiving tickets:
  - **Early Shift**: NC blocked from 14:00 to 20:00 (badge visible during this time)
  - **Late Shift**: NC blocked from 20:00 to 01:00 (badge visible during this time)
 

### Step 3: Fill In Ticket Details (During Your Shift)
As you work on tickets, fill in the details in the **History** tab for each ticket:

- Go to the **History** tab.
- Use the **"Name"** dropdown to filter and see only your assigned tickets.
- For each ticket, fill in:
   - **UCN**: The Unique Circuit Number or UNIGY ID
   - **Customer**: The customer name affected
   - **Notes**: Select a standard note (Chase Carrier, Chase A-end, etc.) or type a custom note
<img width="1027" height="519" alt="image" src="https://github.com/user-attachments/assets/f4eec9e5-9aa5-491e-8346-02c10ce85342" />


### Step 4: Daily Handover
- After the shift, navigate to the **History** tab.
- Filter by your name to review your tickets before handover.
- Mark tickets for handover (HO checkbox) and critical incidents (CI checkbox).
<img width="1023" height="513" alt="image" src="https://github.com/user-attachments/assets/2e904d99-7a14-41ec-a107-76b5b8cf1422" />

- Click **"Create Handover Email"** to generate a perfectly formatted `.eml` file for **Outlook**.
<img width="423" height="191" alt="image" src="https://github.com/user-attachments/assets/ce5ac1e3-b811-41a8-8e85-18f67c5bfcec" />

- Includes **Critical Incidents** (in bold) and a **table for all other handover tickets**.
<img width="1100" height="882" alt="image" src="https://github.com/user-attachments/assets/08c30d93-13dd-4c84-8d74-19ede604d126" />

- Click on “Reply to All”, change the “From” field to the GSOC email, add your signature at the bottom, and include the name of the person receiving the warm handshake.


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
