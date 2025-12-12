import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportPayrollsToExcel(rows = [], prefix = "Export") {
  if (!rows || !rows.length) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], { type: "application/octet-stream" });
  saveAs(blob, `${prefix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
