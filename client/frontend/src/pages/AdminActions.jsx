import { useState, useEffect } from "react";
import {
  getCohorts,
  getSessions,
  addAttendance,
  createSession,
  registerParticipant,
  getAttendanceByEIDAndSession,
  createIncident,
  getAttendancesByEID
} from "../services/api";

const actions = [
  { value: "attendance", label: "Add Attendance" },
  { value: "session", label: "Create Session" },
  { value: "participant", label: "Register Participant" },
  { value: "incident", label: "Create Incident from Attendance" } 
];

const initialForms = {
  attendance: {
    participantId: "",
    sessionId: "",
    date: "",
    hasAttended: true,
    sessionVitals: {}
  },
  session: {
    sessionCode: "",
    siteName: "",
    siteLocation: "",
    date: "",
    coachName: "",
    cohort: "",
    stage: "Intro",
    notes: ""
  },
  participant: {
    EID: "",
    fullName: "",
    gender: "Male",
    age: "",
    cohort: "",
    status: "Active",
    contactInfo: { phoneNumber: "", email: "" },
    emergencyContact: { name: "", phoneNumber: "" },
    baselineVitals: {
      weight: "",
      Hba1c: "",
      bpSystolic: "",
      bpDiastolic: "",
      glucoseMgdl: "",
      RHR: "",
      GripStrengthSec: ""
    }
  },
  incident: {
    EID: "",
    sessionId: "", 
    severity: "Medium",
    description: "",
    actions: "",
    closure: ""
  }
};

const eidRegex = /^784\d{12}$/;
const phoneRegex = /^\+971\d{9}$/;

const AdminActions = () => {
  const [selectedAction, setSelectedAction] = useState("");
  const [form, setForm] = useState(initialForms);
  const [cohorts, setCohorts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState("");
  const [incidentAttendances, setIncidentAttendances] = useState([]);
  const [incidentEID, setIncidentEID] = useState("");
  const [loadingAttendances, setLoadingAttendances] = useState(false);

  useEffect(() => {
    getCohorts().then(setCohorts);
    getSessions().then(setSessions);
  }, []);

  const handleActionChange = (e) => {
    setSelectedAction(e.target.value);
    setMessage("");
  };

  const handleInputChange = (action, field, value) => {
    setForm((prev) => ({
      ...prev,
      [action]: { ...prev[action], [field]: value }
    }));
  };

  const handleNestedInputChange = (action, parent, field, value) => {
    setForm((prev) => ({
      ...prev,
      [action]: {
        ...prev[action],
        [parent]: { ...prev[action][parent], [field]: value }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setValidationError("");

    // --- Frontend validation for participant registration ---
    if (selectedAction === "participant") {
      const p = form.participant;
      if (!eidRegex.test(p.EID)) {
        setValidationError("EID must be 15 digits, start with 784.");
        return;
      }
      if (!phoneRegex.test(p.contactInfo.phoneNumber)) {
        setValidationError("Phone number must start with +971 and be 13 digits after +.");
        return;
      }
      if (!phoneRegex.test(p.emergencyContact.phoneNumber)) {
        setValidationError("Emergency contact phone must start with +971 and be 13 digits after +.");
        return;
      }
    }

    try {
      if (selectedAction === "attendance") {
        await addAttendance(form.attendance);
        setMessage("Attendance added successfully!");
      } else if (selectedAction === "session") {
        await createSession({
          sessionCode: form.session.sessionCode,
          site: { name: form.session.siteName, location: form.session.siteLocation },
          date: form.session.date,
          coachName: form.session.coachName,
          cohort: form.session.cohort,
          stage: form.session.stage,
          notes: form.session.notes
        });
        setMessage("Session created successfully!");
      } else if (selectedAction === "participant") {
        await registerParticipant(form.participant);
        setMessage("Participant registered successfully!");
      } else if (selectedAction === "incident") {
        const { attendanceId, severity, description, actions, closure } = form.incident;
        if (!attendanceId) throw new Error("Please select a session attendance.");
        await createIncident({
          attendanceId,
          severity,
          description,
          actions,
          closure
        });
        setMessage("Incident created successfully!");
      }
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.error || err.message));
    }
  };

  // When sessionId changes, update date automatically
  useEffect(() => {
    if (selectedAction === "attendance" && form.attendance.sessionId) {
      const selectedSession = sessions.find(s => s._id === form.attendance.sessionId);
      if (selectedSession) {
        setForm(prev => ({
          ...prev,
          attendance: {
            ...prev.attendance,
            date: selectedSession.date.slice(0, 10) // YYYY-MM-DD only
          }
        }));
      }
    }
    // eslint-disable-next-line
  }, [form.attendance.sessionId, selectedAction, sessions]);

  return (
    <div className="reports-container">
      <h2 className="admin-actions-header center">Admin Actions</h2>
      <div className="admin-actions-header center">
        <label className="admin-actions-select-label" style={{ marginRight: "1rem" }}>
          Choose Action:
        </label>
        <select
          value={selectedAction}
          onChange={handleActionChange}
          className="admin-actions-select"
        >
          <option value="">Select action</option>
          {actions.map(a => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </div>

      {selectedAction === "attendance" && (
        <form onSubmit={handleSubmit} className="admin-actions-form">
          <h3 style={{ textAlign: "center" }}>Add Attendance</h3>
          <label className="admin-actions-label">Participant EID
            <input
              type="text"
              className="admin-actions-input"
              placeholder="Participant EID"
              value={form.attendance.EID}
              onChange={e => handleInputChange("attendance", "EID", e.target.value)}
              required
            />
          </label>
          <label className="admin-actions-label">Session
            <select
              className="admin-actions-select-input"
              value={form.attendance.sessionId}
              onChange={e => handleInputChange("attendance", "sessionId", e.target.value)}
              required
            >
              <option value="">Select Session</option>
              {sessions.map(s => (
                <option key={s._id} value={s._id}>
                  {s.sessionCode} - {new Date(s.date).toLocaleDateString()} ({s.site.name})
                </option>
              ))}
            </select>
          </label>
          <label className="admin-actions-label">Date
            <input
              type="date"
              className="admin-actions-input"
              value={form.attendance.date}
              readOnly
              required
            />
          </label>
          <label className="admin-actions-label">
            Attended
            <input
              type="checkbox"
              className="admin-actions-checkbox"
              checked={form.attendance.hasAttended}
              onChange={e => handleInputChange("attendance", "hasAttended", e.target.checked)}
            />
          </label>
          <h4 style={{ marginTop: "1.5rem" }}>Session Vitals</h4>
          {["bpSystolic", "bpDiastolic", "weight", "glucoseMgdl", "RHR", "GripStrengthSec", "Hba1c"].map(field => (
            <label key={field} className="admin-actions-label">
              {field}
              <input
                type="number"
                className="admin-actions-input"
                placeholder={field}
                value={form.attendance.sessionVitals[field] || ""}
                onChange={e => setForm(prev => ({
                  ...prev,
                  attendance: {
                    ...prev.attendance,
                    sessionVitals: {
                      ...prev.attendance.sessionVitals,
                      [field]: e.target.value
                    }
                  }
                }))}
              />
            </label>
          ))}
          <button type="submit" className="admin-actions-input">Add Attendance</button>
        </form>
      )}

      {selectedAction === "session" && (
        <form onSubmit={handleSubmit} className="admin-actions-form">
          <h3 style={{ textAlign: "center" }}>Create Session</h3>
          <label className="admin-actions-label">Session Code
            <input
              type="text"
              className="admin-actions-input"
              placeholder="Session Code"
              value={form.session.sessionCode}
              onChange={e => handleInputChange("session", "sessionCode", e.target.value)}
              required
            />
          </label>
          <label className="admin-actions-label">Site Name
            <input
              type="text"
              className="admin-actions-input"
              placeholder="Site Name"
              value={form.session.siteName}
              onChange={e => handleInputChange("session", "siteName", e.target.value)}
              required
            />
          </label>
          <label className="admin-actions-label">Site Location
            <input
              type="text"
              className="admin-actions-input"
              placeholder="Site Location"
              value={form.session.siteLocation}
              onChange={e => handleInputChange("session", "siteLocation", e.target.value)}
              required
            />
          </label>
          <label className="admin-actions-label">Date
            <input
              type="date"
              className="admin-actions-input"
              value={form.session.date}
              onChange={e => handleInputChange("session", "date", e.target.value)}
              required
            />
          </label>
          <label className="admin-actions-label">Coach Name
            <input
              type="text"
              className="admin-actions-input"
              placeholder="Coach Name"
              value={form.session.coachName}
              onChange={e => handleInputChange("session", "coachName", e.target.value)}
              required
            />
          </label>
          <label className="admin-actions-label">Cohort
            <select
              className="admin-actions-select-input"
              value={form.session.cohort}
              onChange={e => handleInputChange("session", "cohort", e.target.value)}
              required
            >
              <option value="">Select Cohort</option>
              {cohorts.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="admin-actions-label">Stage
            <select
              className="admin-actions-select-input"
              value={form.session.stage}
              onChange={e => handleInputChange("session", "stage", e.target.value)}
              required
            >
              <option value="Intro">Intro</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </label>
          <label className="admin-actions-label">Notes
            <input
              type="text"
              className="admin-actions-input"
              placeholder="Notes"
              value={form.session.notes}
              onChange={e => handleInputChange("session", "notes", e.target.value)}
            />
          </label>
          <button type="submit" className="admin-actions-input">Create Session</button>
        </form>
      )}

      {selectedAction === "participant" && (
        <form onSubmit={handleSubmit} className="admin-actions-form">
          <h3 style={{ textAlign: "center" }}>Register Participant</h3>
          <label className="admin-actions-label">EID
            <input
              type="text"
              className="admin-actions-input"
              placeholder="EID"
              value={form.participant.EID}
              onChange={e => handleInputChange("participant", "EID", e.target.value)}
              required
            />
          </label>
          <label className="admin-actions-label">Full Name
            <input
              type="text"
              className="admin-actions-input"
              placeholder="Full Name"
              value={form.participant.fullName}
              onChange={e => handleInputChange("participant", "fullName", e.target.value)}
              required
            />
          </label>
          <label className="admin-actions-label">Gender
            <select
              className="admin-actions-select-input"
              value={form.participant.gender}
              onChange={e => handleInputChange("participant", "gender", e.target.value)}
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>
          <label className="admin-actions-label">Age
            <input
              type="number"
              className="admin-actions-input"
              placeholder="Age"
              value={form.participant.age}
              onChange={e => handleInputChange("participant", "age", e.target.value)}
              required
            />
          </label>
          <label className="admin-actions-label">Cohort
            <select
              className="admin-actions-select-input"
              value={form.participant.cohort}
              onChange={e => handleInputChange("participant", "cohort", e.target.value)}
              required
            >
              <option value="">Select Cohort</option>
              {cohorts.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="admin-actions-label">Status
            <select
              className="admin-actions-select-input"
              value={form.participant.status}
              onChange={e => handleInputChange("participant", "status", e.target.value)}
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Withdrawn">Withdrawn</option>
              <option value="Disqualified">Disqualified</option>
            </select>
          </label>
          <label className="admin-actions-label">Phone Number
            <input
              type="text"
              className="admin-actions-input"
              placeholder="Phone Number"
              value={form.participant.contactInfo.phoneNumber}
              onChange={e => handleNestedInputChange("participant", "contactInfo", "phoneNumber", e.target.value)}
              required
            />
          </label>
          <label className="admin-actions-label">Email
            <input
              type="email"
              className="admin-actions-input"
              placeholder="Email"
              value={form.participant.contactInfo.email}
              onChange={e => handleNestedInputChange("participant", "contactInfo", "email", e.target.value)}
              required
            />
          </label>
          <label className="admin-actions-label">Emergency Contact Name
            <input
              type="text"
              className="admin-actions-input"
              placeholder="Emergency Contact Name"
              value={form.participant.emergencyContact.name}
              onChange={e => handleNestedInputChange("participant", "emergencyContact", "name", e.target.value)}
              required
            />
          </label>
          <label className="admin-actions-label">Emergency Contact Phone
            <input
              type="text"
              className="admin-actions-input"
              placeholder="Emergency Contact Phone"
              value={form.participant.emergencyContact.phoneNumber}
              onChange={e => handleNestedInputChange("participant", "emergencyContact", "phoneNumber", e.target.value)}
              required
            />
          </label>
          <h4 style={{ marginTop: "1.5rem" }}>Baseline Vitals</h4>
          {Object.keys(form.participant.baselineVitals).map(field => (
            <label key={field} className="admin-actions-label">
              {field}
              <input
                type="number"
                className="admin-actions-input"
                placeholder={field}
                value={form.participant.baselineVitals[field]}
                onChange={e => setForm(prev => ({
                  ...prev,
                  participant: {
                    ...prev.participant,
                    baselineVitals: {
                      ...prev.participant.baselineVitals,
                      [field]: e.target.value
                    }
                  }
                }))}
                required
              />
            </label>
          ))}
          {validationError && (
            <div className="admin-actions-message error center">{validationError}</div>
          )}
          <button type="submit" className="admin-actions-input">Register Participant</button>
        </form>
      )}

      {selectedAction === "incident" && (
        <form onSubmit={handleSubmit} className="admin-actions-form">
          <h3 style={{ textAlign: "center" }}>Create Incident from Attendance</h3>
          <label className="admin-actions-label">Participant EID
            <input
              type="text"
              className="admin-actions-input"
              placeholder="Participant EID"
              value={incidentEID}
              onChange={e => {
                setIncidentEID(e.target.value);
                setForm(prev => ({
                  ...prev,
                  incident: { ...prev.incident, attendanceId: "", EID: e.target.value }
                }));
                setIncidentAttendances([]); // Clear attendances on EID change
              }}
              required
            />
            <button
              type="button"
              className="btn"
              style={{ marginLeft: "1rem", marginTop: "0" }}
              onClick={async () => {
                setLoadingAttendances(true);
                setIncidentAttendances([]);
                try {
                  const data = await getAttendancesByEID(incidentEID);
                  setIncidentAttendances(data);
                } catch {
                  setIncidentAttendances([]);
                }
                setLoadingAttendances(false);
              }}
              disabled={!incidentEID}
            >
              Get Participant's Session Attendences
            </button>
          </label>
          <label className="admin-actions-label">
            <select
              className="admin-actions-select-input"
              value={form.incident.attendanceId || ""}
              onChange={e => setForm(prev => ({
                ...prev,
                incident: { ...prev.incident, attendanceId: e.target.value }
              }))}
              required
              disabled={!incidentAttendances.length}
            >
              <option value="">Select Session</option>
              {incidentAttendances.map(att => (
                <option key={att._id} value={att._id}>
                  {att.sessionId?.sessionCode || "Session"} - {att.date ? new Date(att.date).toLocaleDateString() : ""} ({att.sessionId?.site?.name || ""})
                </option>
              ))}
            </select>
            {loadingAttendances && <span style={{ marginLeft: "1rem" }}>Loading...</span>}
          </label>
          <label className="admin-actions-label">Severity
            <select
              className="admin-actions-select-input"
              value={form.incident.severity}
              onChange={e => handleInputChange("incident", "severity", e.target.value)}
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>
          <label className="admin-actions-label">Description
            <input
              type="text"
              className="admin-actions-input"
              placeholder="Description"
              value={form.incident.description}
              onChange={e => handleInputChange("incident", "description", e.target.value)}
              required
            />
          </label>
          <label className="admin-actions-label">Actions
            <input
              type="text"
              className="admin-actions-input"
              placeholder="Actions"
              value={form.incident.actions}
              onChange={e => handleInputChange("incident", "actions", e.target.value)}
            />
          </label>
          <label className="admin-actions-label">Closure
            <input
              type="text"
              className="admin-actions-input"
              placeholder="Closure"
              value={form.incident.closure}
              onChange={e => handleInputChange("incident", "closure", e.target.value)}
            />
          </label>
          <button type="submit" className="admin-actions-input">Create Incident</button>
        </form>
      )}

      {message && (
        <div
          className={`admin-actions-message center ${message.startsWith("Error") ? "error" : "success"}`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default AdminActions;