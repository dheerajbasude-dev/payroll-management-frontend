import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * SummaryTable - improved layout to avoid glitching/truncation
 *
 * Props expected:
 * - groupedData: [{ employee, rows, totalGross, totalTax, totalNet }]
 * - sortBy, sortDir, setSortBy, setSortDir
 * - page, setPage, pageSize, setPageSize
 * - expanded, setExpanded
 *
 * This version:
 * - uses table-fixed and explicit column widths
 * - ensures ID column truncates with ellipsis
 * - prevents content overflow in small screens (min-w-0 + truncate)
 * - expansion row has correct colspan and an internal grid for amounts
 */

function latestPayDate(rows) {
  if (!rows || !rows.length) return null;
  return rows.reduce((max, r) => {
    const d = r.payDate ? new Date(r.payDate) : null;
    if (!d || isNaN(d)) return max;
    return !max || d > max ? d : max;
  }, null);
}

export default function SummaryTable({
  groupedData = [],
  sortBy,
  sortDir,
  setSortBy,
  setSortDir,
  page,
  setPage,
  pageSize,
  setPageSize,
  expanded,
  setExpanded,
}) {
  const handleSort = (col) => {
    if (sortBy !== col) {
      setSortBy(col);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortBy(null);
      setSortDir("asc");
    }
    setPage(1);
  };

  const sorted = useMemo(() => {
    if (!sortBy) return [...groupedData];
    const copy = [...groupedData];
    const dir = sortDir === "asc" ? 1 : -1;

    copy.sort((a, b) => {
      switch (sortBy) {
        case "name": {
          const A = String(a.employee?.name ?? "").toLowerCase();
          const B = String(b.employee?.name ?? "").toLowerCase();
          return A === B ? 0 : (A > B ? dir : -dir);
        }
        case "id": {
          const A = a.employee?.id ?? "";
          const B = b.employee?.id ?? "";
          return String(A).localeCompare(String(B)) * dir;
        }
        case "gross":
          return ((a.totalGross || 0) - (b.totalGross || 0)) * dir;
        case "tax":
          return ((a.totalTax || 0) - (b.totalTax || 0)) * dir;
        case "net":
          return ((a.totalNet || 0) - (b.totalNet || 0)) * dir;
        case "count":
          return (a.rows.length - b.rows.length) * dir;
        case "payDate": {
          const d1 = latestPayDate(a.rows);
          const d2 = latestPayDate(b.rows);
          if (!d1 && !d2) return 0;
          if (!d1) return -1 * dir;
          if (!d2) return 1 * dir;
          return (d1 - d2) * dir;
        }
        default:
          return 0;
      }
    });

    return copy;
  }, [groupedData, sortBy, sortDir]);

  // pagination
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleExpand = (id) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 dark:text-gray-300">Rows</label>
          <select
            className="border rounded px-2 py-1 bg-white dark:bg-gray-800 dark:border-gray-700"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300">Page {page} / {totalPages}</div>
      </div>

      {/* table-fixed + explicit widths keeps layout stable */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] table-fixed">
          <colgroup>
            <col style={{ width: "22%" }} />
            <col style={{ width: "24%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "9%" }} />
          </colgroup>

          <thead className="bg-gray-100 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("name")}>Employee</th>
              <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("count")}>Payroll IDs</th>
              <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("payDate")}>Pay Dates</th>
              <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("gross")}>Gross</th>
              <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("tax")}>Tax</th>
              <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("net")}>Net</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((g) => {
              const id = g.employee.id;
              const isOpen = !!expanded[id];

              return (
                <React.Fragment key={id}>
                  <tr className="border-t dark:border-gray-700 bg-white dark:bg-gray-900/40 align-top">
                    {/* Employee: allow wrap for name but ID must be truncated */}
                    <td className="p-3 align-top">
                      <div className="font-semibold dark:text-white">{g.employee.name}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[18rem] truncate">{g.employee.id}</div>
                    </td>

                    {/* Payroll IDs: show first N and allow break-words, but limit width */}
                    <td className="p-3 align-top">
                      <div className="space-y-1 max-h-28 overflow-hidden">
                        {g.rows.slice(0, 3).map((r) => (
                          <div key={r.id} className="text-sm font-mono dark:text-gray-300 break-words">
                            <span className="inline-block max-w-full truncate">{r.id}</span>
                          </div>
                        ))}
                        {g.rows.length > 3 && <div className="text-xs text-gray-400">+{g.rows.length - 3} more</div>}
                      </div>
                    </td>

                    {/* Pay Dates */}
                    <td className="p-3 align-top">
                      <div className="space-y-1">
                        {g.rows.slice(0, 3).map((r) => <div key={r.id} className="text-sm dark:text-gray-300">{r.payDate}</div>)}
                      </div>
                    </td>

                    {/* Totals (single column values) */}
                    <td className="p-3 align-top dark:text-gray-300">{Number(g.totalGross || 0).toFixed(1)}</td>
                    <td className="p-3 align-top dark:text-gray-300">{Number(g.totalTax || 0).toFixed(1)}</td>
                    <td className="p-3 align-top dark:text-gray-300">{Number(g.totalNet || 0).toFixed(1)}</td>

                    <td className="p-3 align-top">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => toggleExpand(id)}>{isOpen ? "Collapse" : "Expand"}</Button>                      
                      </div>
                    </td>
                  </tr>

                  {/* Expansion row: colspan must equal number of header columns (7) */}
                  <tr className="bg-white dark:bg-gray-900/60 transition-all duration-200 ease-in-out">
                    <td colSpan={7} className="p-0 border-t border-gray-100 dark:border-gray-800">
                      <div className={`overflow-hidden ${isOpen ? "py-4 px-6" : "py-0 px-6"} transition-all duration-250`}>
                        {isOpen && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Payroll IDs column inside expansion */}
                            <div>
                              <h4 className="text-sm font-medium dark:text-white">Payroll IDs</h4>
                              <div className="mt-2 space-y-2 max-h-64 overflow-auto pr-2">
                                {g.rows.map((r) => (
                                  <div key={r.id} className="text-sm font-mono dark:text-gray-300 break-words">
                                    <span className="inline-block max-w-full truncate">{r.id}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Pay Dates */}
                            <div>
                              <h4 className="text-sm font-medium dark:text-white">Pay Dates</h4>
                              <div className="mt-2 space-y-2 max-h-64 overflow-auto">
                                {g.rows.map((r) => (
                                  <div key={r.id} className="text-sm dark:text-gray-300">{r.payDate}</div>
                                ))}
                              </div>
                            </div>

                            {/* Amounts grid: each item row uses flex with truncation */}
                            <div>
                              <h4 className="text-sm font-medium dark:text-white">Amounts (Gross / Tax / Net)</h4>
                              <div className="mt-2 space-y-2 max-h-64 overflow-auto">
                                {g.rows.map((r) => (
                                  <div key={r.id} className="flex gap-3 text-sm dark:text-gray-300">
                                    <div className="w-1/3 min-w-0 truncate">{Number(r.grossSalary || 0).toFixed(1)}</div>
                                    <div className="w-1/3 min-w-0 truncate">{Number(r.taxAmount || 0).toFixed(1)}</div>
                                    <div className="w-1/3 min-w-0 truncate">{Number(r.netSalary || 0).toFixed(1)}</div>
                                  </div>
                                ))}

                                {/* Totals */}
                                <div className="mt-3 border-t pt-3 flex justify-between font-semibold dark:text-white">
                                  <div className="w-1/3 min-w-0 truncate">{Number(g.totalGross || 0).toFixed(1)}</div>
                                  <div className="w-1/3 min-w-0 truncate">{Number(g.totalTax || 0).toFixed(1)}</div>
                                  <div className="w-1/3 min-w-0 truncate">{Number(g.totalNet || 0).toFixed(1)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* pagination controls */}
      <div className="flex items-center justify-between mt-3">
        <div className="text-sm text-gray-600 dark:text-gray-300">Showing {paginated.length} of {totalItems} employees</div>
        <div className="flex items-center gap-2">
          <Button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
          <div className="px-3 py-1 border rounded text-sm dark:border-gray-700 dark:text-gray-200">{page}</div>
          <Button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
        </div>
      </div>
    </div>
  );
}
