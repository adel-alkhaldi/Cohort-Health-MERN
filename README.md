# Al-Falah Admin Dashboard

An MVP MERN stack admin dashboard for managing cohorts, sessions, participants, attendance, incidents, and reports.

---

## Prerequisites

- **Node.js** (npm comes packaged with it as well)

---

## Installation

1. **Clone the repository:**

   ```
   git clone https://github.com/adel-alkhaldi/Cohort-Health-MERN.git
   cd Cohort-Health-MERN
   ```

2. **Install backend dependencies:**

   ```
   cd server
   npm install
   ```

3. **Install frontend dependencies:**

   ```
   cd ../client/frontend
   npm install
   ```

---

## Environment Setup

### **Backend (.env)**

Create a `.env` file in the `server` folder:

```
PORT=3000
MONGO_URI=mongodb+srv://test:test@cluster0.r02bnfb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### **Frontend Port Configuration**

Incase you wanted to change ports, access vite.config.js and change the port as you wish

## Running the Project

### **Start the Backend**

In the `server` folder:

```
npm run dev
```

- The backend will run on [http://localhost:3000](http://localhost:3000).

### **Start the Frontend**

In the `client/frontend` folder:

```
npm run dev
```

- The frontend will run on [http://localhost:5000](http://localhost:5000).

---

## Usage
- Data is already populated and existing in the mongoDB atlas
- Open [http://localhost:5000](http://localhost:5000) in your browser.
- Use the sidebar to navigate between Dashboard, Weekly Reports, Watch Cases, Admin Actions, and Session Viewer.
- Use **Admin Actions** to add participants, sessions, attendance, and incidents.

