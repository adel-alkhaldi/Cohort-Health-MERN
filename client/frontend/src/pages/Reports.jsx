import { useEffect, useState } from "react";
import { getAllReportWeeks, getWeeklyReport, getCohorts } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LabelList } from "recharts";
import StatBox from "../components/StatBox";
import SectionTitle from "../components/SectionTitle";
import Table from "../components/Table";

// Custom tooltip and legend classes for recharts
const tooltipProps = {
  contentStyle: { background: "var(--chart-tooltip-bg)", color: "var(--chart-tooltip-color)", border: "none" },
  labelStyle: { color: "var(--chart-tooltip-label)" }
};
const legendProps = {
  wrapperStyle: { color: "var(--chart-legend-color)", fontWeight: 600 }
};
const xAxisProps = {
  stroke: "var(--chart-axis-color)"
};
const yAxisProps = {
  stroke: "var(--chart-axis-color)"
};
const labelListProps = {
  fill: "var(--chart-label-color)"
};

const Reports = () => {
  const [weeks, setWeeks] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [cohort, setCohort] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1200 : false
  );

  useEffect(() => {
    getAllReportWeeks()
      .then(setWeeks)
      .catch(err => console.error("Weeks fetch error:", err));
    getCohorts()
      .then(setCohorts)
      .catch(err => console.error("Cohorts fetch error:", err));

    // Listen for window resize to update chart layout
    const handleResize = () => setIsMobile(window.innerWidth < 1200);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cohort || !selectedWeek) return;
    setLoading(true);
    setReport(null); // Clear previous report before fetching new
    try {
      const data = await getWeeklyReport(cohort, selectedWeek);
      setReport(data[0] || null);
    } catch (err) {
      console.error("Report fetch error:", err);
      setReport(null);
    }
    setLoading(false);
  };

  const chartData = report
    ? [
        { name: "Avg Weight", value: report.avgWeight },
        { name: "Avg Glucose", value: report.avgGlucose },
        { name: "Avg BP Systolic", value: report.avgBPsys },
        { name: "Avg BP Diastolic", value: report.avgBPdia },
        { name: "Avg Grip Strength", value: report.avgGripStrengthSec },
        { name: "Flag %", value: report.flagPercent },
        { name: "Retention %", value: report.retention }
      ]
    : [];

  const statList = report
    ? [
        { label: "Total Sessions", value: report.totalSessions },
        { label: "Total Attendances", value: report.totalAttendances },
        { label: "Cohort Participants", value: report.participantsAttended },
        { label: "Avg Weight", value: report.avgWeight?.toFixed(2) },
        { label: "Avg Glucose", value: report.avgGlucose?.toFixed(2) },
        { label: "Avg BP Systolic", value: report.avgBPsys?.toFixed(2) },
        { label: "Avg BP Diastolic", value: report.avgBPdia?.toFixed(2) },
        { label: "Avg Grip Strength", value: report.avgGripStrengthSec?.toFixed(2) },
        { label: "Flag Percent", value: `${report.flagPercent?.toFixed(2)}%` },
        { label: "Retention", value: `${report.retention?.toFixed(2)}%` },
        { label: "Incidents Count", value: report.incidentsCount }
      ]
    : [];

  const attendanceColumns = [
    { label: "Participant Name", render: att => att.participantName ?? att.participantId ?? "-" },
    { label: "Attendance Date", render: att => att.attendanceDate ? new Date(att.attendanceDate).toLocaleDateString() : "-" },
    { label: "Attended", render: att => att.hasAttended ? "Yes" : "No" },
    { label: "BP Systolic", render: att => att.sessionVitals?.bpSystolic ?? "-" },
    { label: "BP Diastolic", render: att => att.sessionVitals?.bpDiastolic ?? "-" },
    { label: "Weight", render: att => att.sessionVitals?.weight ?? "-" },
    { label: "Glucose (mg/dl)", render: att => att.sessionVitals?.glucoseMgdl ?? "-" },
    { label: "RHR", render: att => att.sessionVitals?.RHR ?? "-" },
    { label: "Grip Strength (Sec)", render: att => att.sessionVitals?.GripStrengthSec ?? "-" },
    { label: "Hba1c", render: att => att.sessionVitals?.Hba1c ?? "-" }
  ];

  return (
    <div className="reports-container">
      <SectionTitle>Weekly Cohort Report</SectionTitle>
      <form className="reports-form center" onSubmit={handleSubmit}>
        <label>
          Cohort:&nbsp;
          <select
            value={cohort}
            onChange={e => setCohort(e.target.value)}
            required
            className="select"
          >
            <option value="">Select cohort</option>
            {cohorts.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Week:&nbsp;
          <select
            value={selectedWeek}
            onChange={e => setSelectedWeek(e.target.value)}
            required
          >
            <option value="">Select week</option>
            {weeks.map(week =>
              <option key={week} value={week}>
                {new Date(week).toLocaleDateString()}
              </option>
            )}
          </select>
        </label>
        <button type="submit" disabled={loading} className="btn">
          {loading ? "Loading..." : "Generate Report"}
        </button>
      </form>

      {loading && <div className="center">Loading...</div>}

      {report && (
        <div>
          <SectionTitle>
            Report for {report.cohort} ({new Date(report.weekStart).toLocaleDateString()})
          </SectionTitle>
          <div className="reports-stats-container">
            {statList.map(stat => (
              <StatBox key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
          <div className="reports-chart-wrapper">
            <ResponsiveContainer width="100%" height={isMobile ? chartData.length * 60 : 400}>
              {isMobile ? (
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
                >
                  <XAxis type="number" {...xAxisProps} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    {...yAxisProps}
                    interval={0}
                    tick={{ fontSize: 16, fill: "var(--chart-axis-color)" }}
                  />
                  <Tooltip {...tooltipProps} />
                  <Legend {...legendProps} payload={[
                    { value: "Cohort value during week", type: "square", color: "var(--chart-legend-blue)" }
                  ]} />
                  <Bar dataKey="value" fill="var(--chart-bar-color)" barSize={32}>
                    <LabelList dataKey="value" position="right" formatter={v => v?.toFixed(2)} {...labelListProps} />
                  </Bar>
                </BarChart>
              ) : (
                <BarChart data={chartData}>
                  <XAxis dataKey="name" {...xAxisProps} interval={0} tick={{ fontSize: 14, fill: "var(--chart-axis-color)" }} />
                  <YAxis {...yAxisProps} />
                  <Tooltip {...tooltipProps} />
                  <Legend {...legendProps} payload={[
                    // Bug:Barchart label refuses to change value & color refuses to change 
                    { value: "Cohort value during week", type: "square", color: "var(--chart-legend-blue)" }
                  ]} />
                  <Bar dataKey="value" fill="var(--chart-bar-color)">
                    <LabelList dataKey="value" position="top" formatter={v => v?.toFixed(2)} {...labelListProps} />
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {report.attendanceDetails && (
            <div style={{ marginTop: "2rem" }}>
              <SectionTitle>Attendance Details for the Week</SectionTitle>
              <Table
                columns={attendanceColumns}
                data={report.attendanceDetails}
                keyField="sessionId" // Use sessionId or a unique field from backend
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;