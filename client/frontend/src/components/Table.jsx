import React from "react";

const Table = ({ columns, data, keyField }) => (
  <div className="table-container">
    <table className="table-main">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.label}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row[keyField]}>
            {columns.map(col => (
              <td key={col.label}>
                {typeof col.render === "function"
                  ? col.render(row)
                  : row[col.field]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Table;