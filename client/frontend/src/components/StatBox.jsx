import React from "react";

const StatBox = ({ label, value }) => (
  <div className="reports-stat-box">
    <div className="reports-stat-value">{value}</div>
    <div className="reports-stat-label">{label}</div>
  </div>
);

export default StatBox;