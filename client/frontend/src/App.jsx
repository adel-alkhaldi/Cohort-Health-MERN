import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Watch from "./pages/Watch";
import AdminActions from "./pages/AdminActions";
import SessionViewer from "./pages/SessionViewer";

function App() {
  return (
    <Router>
      <div className="app-main-layout">
        <nav className="sidebar">
          <Link to="/">Dashboard</Link>
          <Link to="/reports">Weekly Reports</Link>
          <Link to="/watch">Watch Cases</Link>
          <Link to="/admin">Admin Actions</Link>
          <Link to="/sessions/view">Session Viewer</Link>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/watch" element={<Watch />} />
            <Route path="/admin" element={<AdminActions />} />
            <Route path="/sessions/view" element={<SessionViewer />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
