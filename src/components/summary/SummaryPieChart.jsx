import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#60A5FA", "#F97316", "#34D399"];

export default function SummaryPieChart({ totals = { totalGross: 0, totalTax: 0, totalNet: 0 } }) {
  const { totalGross = 0, totalTax = 0, totalNet = 0 } = totals;
  const data = [
    { name: "Gross", value: totalGross },
    { name: "Tax", value: totalTax },
    { name: "Net", value: totalNet },
  ];

  return (
    <div style={{ width: "100%", height: 360 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={6}
            // EXACT same label logic as PayrollChart:
            // label shows "Name: <rounded percent>" where percent = round(value / totalGross * 100)
            label={(entry) =>
              entry.value
                ? `${entry.name}: ${Math.round((entry.value / (totalGross || 1)) * 100)}%`
                : ""
            }
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>

          {/* Tooltip matches PayrollChart: numeric value with one decimal */}
          <Tooltip formatter={(val) => Number(val).toFixed(1)} />

          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
