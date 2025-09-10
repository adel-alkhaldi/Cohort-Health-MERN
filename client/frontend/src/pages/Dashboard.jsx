import { useEffect, useState } from "react";
import { getCohorts, getCohortReview, getCohortKPI, getWatchCasesByCohort } from "../services/api";
import Table from "../components/Table";
import StatBox from "../components/StatBox";
import SectionTitle from "../components/SectionTitle";

const participantColumns = [
  { label: "EID", field: "EID" },
  { label: "Name", field: "fullName" },
  { label: "Gender", field: "gender" },
  { label: "Age", field: "age" },
  { label: "Status", field: "status" },
  { label: "Initial Weight", render: row => row.baselineVitals?.weight },
  { label: "Initial BP", render: row => `${row.baselineVitals?.bpSystolic}/${row.baselineVitals?.bpDiastolic}` },
  {
    label: "Latest Attendance Date",
    render: row => row.latestAttendance ? new Date(row.latestAttendance.date).toLocaleDateString() : "-"
  },
  { label: "Latest Weight", render: row => row.latestAttendance?.sessionVitals?.weight ?? "-" },
  {
    label: "Latest BP",
    render: row =>
      row.latestAttendance?.sessionVitals?.bpSystolic
        ? `${row.latestAttendance.sessionVitals.bpSystolic}/${row.latestAttendance.sessionVitals.bpDiastolic ?? ""}`
        : "-"
  },
  { label: "Attended?", render: row => row.latestAttendance?.hasAttended ? "Yes" : "No" }
];

const watchColumns = [
  { label: "Severity", field: "severity" },
  { label: "Description", field: "description" },
  { label: "Participant", render: row => row.participant?.fullName ?? "-" },
  { label: "Attendance Date", render: row => row.attendanceDate ? new Date(row.attendanceDate).toLocaleDateString() : "-" },
  {
    label: "Session Vitals",
    render: row =>
      row.sessionVitals
        ? `BP: ${row.sessionVitals.bpSystolic ?? "-"} / ${row.sessionVitals.bpDiastolic ?? "-"}, Weight: ${row.sessionVitals.weight ?? "-"}`
        : "-"
  }
];

const Dashboard = () => {
  const [cohorts, setCohorts] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState("");
  const [reviewData, setReviewData] = useState([]);
  const [cohortStats, setCohortStats] = useState(null);
  const [watchCases, setWatchCases] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCohorts().then(setCohorts);
  }, []);

  useEffect(() => {
    if (selectedCohort) {
      setLoading(true);
      Promise.all([
        getCohortReview(selectedCohort),
        getCohortKPI(selectedCohort),
        getWatchCasesByCohort(selectedCohort)
      ])
        .then(([review, stats, cases]) => {
          setReviewData(review);
          setCohortStats(stats);
          setWatchCases(cases);
        })
        .finally(() => setLoading(false));
    } else {
      setReviewData([]);
      setCohortStats(null);
      setWatchCases([]);
    }
  }, [selectedCohort]);

  return (
    <div className="reports-container">
      <SectionTitle>Cohort Review</SectionTitle>
      <div className="dashboard-cohort-select center">
        <label>
          Select Cohort:&nbsp;
          <select
            value={selectedCohort}
            onChange={e => setSelectedCohort(e.target.value)}
            required
            className="dashboard-cohort-dropdown"
          >
            <option value="">Select cohort</option>
            {cohorts.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      {cohortStats && (
        <div className="reports-stats-container">
          {[
            { label: "Total Attendances", value: cohortStats.totalAttendances },
            { label: "Avg Weight", value: cohortStats.avgWeight?.toFixed(2) },
            { label: "Avg Glucose", value: cohortStats.avgGlucose?.toFixed(2) },
            { label: "Avg BP Systolic", value: cohortStats.avgBPsys?.toFixed(2) },
            { label: "Avg BP Diastolic", value: cohortStats.avgBPdia?.toFixed(2) },
            { label: "Avg Grip Strength", value: cohortStats.avgGripStrengthSec?.toFixed(2) },
            { label: "Flag Percent", value: `${cohortStats.flagPercent?.toFixed(2)}%` },
            { label: "Retention", value: `${cohortStats.retention?.toFixed(2)}%` }
          ].map(stat => (
            <StatBox key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
      )}

      {loading && <div className="center">Loading...</div>}
      {!loading && reviewData.length > 0 && (
        <Table
          columns={participantColumns}
          data={reviewData.map(({ participant, latestAttendance }) => ({
            ...participant,
            latestAttendance
          }))}
          keyField="_id"
        />
      )}

      {!loading && watchCases.length > 0 && (
        <>
          <SectionTitle>Watch Cases for Cohort</SectionTitle>
          <Table
            columns={watchColumns}
            data={watchCases}
            keyField="incidentId"
          />
        </>
      )}

      {!loading && selectedCohort && reviewData.length === 0 && (
        <div className="center">
          No participants found for this cohort.
        </div>
      )}
    </div>
  );
};

export default Dashboard;
