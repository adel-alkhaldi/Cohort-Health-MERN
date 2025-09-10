import { useEffect, useState } from "react";
import { getSessions, getSessionAttendances } from "../services/api";
import Table from "../components/Table";
import SectionTitle from "../components/SectionTitle";

const columns = [
  { label: "Attendance Code", field: "attendanceCode" },
  { label: "Participant EID", render: row => row.participantId?.EID ?? "-" },
  { label: "Full Name", render: row => row.participantId?.fullName ?? "-" },
  { label: "Gender", render: row => row.participantId?.gender ?? "-" },
  { label: "Age", render: row => row.participantId?.age ?? "-" },
  { label: "Cohort", render: row => row.participantId?.cohort ?? "-" },
  { label: "Status", render: row => row.participantId?.status ?? "-" },
  { label: "Date", render: row => row.date ? new Date(row.date).toLocaleDateString() : "-" },
  { label: "Attended", render: row => row.hasAttended ? "Yes" : "No" }
];

const SessionViewer = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSessions().then(setSessions);
  }, []);

  const handleSessionChange = async (e) => {
    const sessionId = e.target.value;
    setSelectedSession(sessionId);
    setAttendances([]);
    if (sessionId) {
      setLoading(true);
      try {
        const data = await getSessionAttendances(sessionId);
        setAttendances(data);
      } catch (err) {
        setAttendances([]);
      }
      setLoading(false);
    }
  };

  return (
    <div className="reports-container">
      <SectionTitle>Session Attendances Viewer</SectionTitle>
      <label>
        Select Session:&nbsp;
        <select
          value={selectedSession}
          onChange={handleSessionChange}
          className="select"
        >
          <option value="">Select Session</option>
          {sessions.map(s => (
            <option key={s._id} value={s._id}>
              {s.sessionCode} - {new Date(s.date).toLocaleDateString()} ({s.site.name})
            </option>
          ))}
        </select>
      </label>
      {loading && <div className="center">Loading...</div>}
      {!loading && attendances.length > 0 && (
        <Table columns={columns} data={attendances} keyField="_id" />
      )}
      {!loading && selectedSession && attendances.length === 0 && (
        <div className="center">No attendances found for this session.</div>
      )}
    </div>
  );
};

export default SessionViewer;