import { useEffect, useState } from "react";
import { getWatchCases } from "../services/api";
import Table from "../components/Table";
import SectionTitle from "../components/SectionTitle";

const watchColumns = [
  { label: "Severity", field: "severity" },
  { label: "Description", field: "description" },
  { label: "Participant", render: (row) => row.participant?.fullName ?? "-" },
  { label: "Cohort", render: (row) => row.participant?.cohort ?? "-" },
  {
    label: "Attendance Date",
    render: (row) =>
      row.attendanceDate
        ? new Date(row.attendanceDate).toLocaleDateString()
        : "-",
  },
  { label: "BP Systolic", render: (row) => row.sessionVitals?.bpSystolic ?? "-" },
  { label: "BP Diastolic", render: (row) => row.sessionVitals?.bpDiastolic ?? "-" },
  { label: "Weight", render: (row) => row.sessionVitals?.weight ?? "-" },
  { label: "Glucose (mg/dl)", render: (row) => row.sessionVitals?.glucoseMgdl ?? "-" },
  { label: "RHR", render: (row) => row.sessionVitals?.RHR ?? "-" },
  { label: "Grip Strength (Sec)", render: (row) => row.sessionVitals?.GripStrengthSec ?? "-" },
  { label: "Hba1c", render: (row) => row.sessionVitals?.Hba1c ?? "-" }
];

const Watch = () => {
  const [watchCases, setWatchCases] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getWatchCases()
      .then(setWatchCases)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="reports-container">
      <SectionTitle>All Cohorts Watch Cases</SectionTitle>
      {loading && <div className="center">Loading...</div>}
      {!loading && watchCases.length > 0 && (
        <Table columns={watchColumns} data={watchCases} keyField="incidentId" />
      )}
      {!loading && watchCases.length === 0 && (
        <div className="center">No watch cases found.</div>
      )}
    </div>
  );
};

export default Watch;