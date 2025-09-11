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

---

# Roadmap

## V1.1
- [ ] General code cleanup of unused functions in frontend pages & backend services & controllers

## V1.2
- [ ] Add Full Validation to the data in the backend  
  - [ ] EID needs to be 15 digits exactly (starting with **784**)  
  - [ ] Numbers need to have **+971** for the country code & be 13 digits in total  
  - [ ] Refine the Watch Cases for the current metrics (if they are above or below a certain range)

## V1.3
- [ ] Refine the error messages and make it more obvious which input field is incorrect

## V1.4
- [ ] Split up Admin Actions Page into multiple routes and separate pages for later **RBAC Login Setup**

## V1.5
- [ ] Session Attendance displays statistics

## V1.6
- [ ] Implement **React Context Hooks** to auto-update on the frontend when submitting data without retriggering the API to refresh data

## V1.7
- [ ] Finalize UI using **Material UI** or **Tailwind CSS**  
  - [ ] Make the UI tablet-friendly (no need for mobile dashboards)

## V1.8
- [ ] Rework the backend with an **auto-aggregator** for a `WeeklyReports` collection that runs every Sunday night

## V1.9
- [ ] Implement **JWT Authentication**

## V2.0
- [ ] Multiple User Login with Authorization & Authentication:  
  - [ ] **Coaches** can view their own sessions & session's analytics  
  - [ ] **Participants** can book sessions in advance  
  - [ ] **Admins** can view dashboards & weekly reports & create cohorts and declare them active or inactive

---

# Project Completion
- [ ] Rework Documentation & Non-Functional/Functional Requirements  
- [ ] Create **Use Case Diagrams**  
- [ ] Create a **Sequence Diagram**


