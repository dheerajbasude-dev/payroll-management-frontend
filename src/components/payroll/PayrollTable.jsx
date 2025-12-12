import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

/**
 * PayrollTable (updated)
 *
 * Props:
 * - groupedData: array [{ employee, rows, totalGross, totalTax, totalNet }, ...]
 * - sortBy (string|null) - one of: name, gross, tax, net, payDate, count, id
 * - sortDir ("asc"|"desc")
 * - setSortBy, setSortDir
 * - page, setPage, pageSize, setPageSize
 * - expanded, setExpanded
 * - exportFn()
 *
 * Sorting cycles: none -> asc -> desc -> none
 */

const headerMap = [
  { label: "Employee", key: "name" },
  { label: "Payroll IDs", key: "count" },
  { label: "Pay Dates", key: "payDate" },
  { label: "Gross", key: "gross" },
  { label: "Tax", key: "tax" },
  { label: "Net", key: "net" },
];

function getLatestPayDate(rows) {
  if (!rows || rows.length === 0) return null;
  // ensure we parse safely; some dates might be strings
  return rows.reduce((max, r) => {
    const d = r.payDate ? new Date(r.payDate) : null;
    if (!d || isNaN(d)) return max;
    return !max || d > max ? d : max;
  }, null);
}

export default function PayrollTable({
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
  exportFn,
}) {
  // handle header click -> cycle sort
  const handleSortClick = (col) => {
    // cycle: none -> asc -> desc -> none
    if (sortBy !== col) {
      setSortBy(col);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      // turn off sorting
      setSortBy(null);
      setSortDir("asc");
    }
    setPage(1);
  };

  // compute sorted data (memoized)
  const sortedData = useMemo(() => {
    if (!sortBy) return [...groupedData];
    const copy = [...groupedData];
    copy.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;

      switch (sortBy) {
        case "name": {
          const v1 = String(a.employee?.name || "").toLowerCase();
          const v2 = String(b.employee?.name || "").toLowerCase();
          return v1 === v2 ? 0 : (v1 > v2 ? dir : -dir);
        }
        case "id": {
          const v1 = a.employee?.id;
          const v2 = b.employee?.id;
          // numeric if possible
          const n1 = Number(v1);
          const n2 = Number(v2);
          if (!isNaN(n1) && !isNaN(n2)) return (n1 - n2) * dir;
          return String(v1).localeCompare(String(v2)) * dir;
        }
        case "gross": {
          return ((a.totalGross || 0) - (b.totalGross || 0)) * dir;
        }
        case "tax": {
          return ((a.totalTax || 0) - (b.totalTax || 0)) * dir;
        }
        case "net": {
          return ((a.totalNet || 0) - (b.totalNet || 0)) * dir;
        }
        case "count": {
          return (a.rows.length - b.rows.length) * dir;
        }
        case "payDate": {
          const d1 = getLatestPayDate(a.rows);
          const d2 = getLatestPayDate(b.rows);
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
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginated = sortedData.slice((page - 1) * pageSize, page * pageSize);

  const toggleExpand = (id) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  // render chevron if active sort column
  const SortIcon = ({ column }) => {
    if (sortBy !== column) return null;
    return sortDir === "asc" ? (
      <ChevronUp size={14} className="inline-block ml-1 text-gray-500" />
    ) : (
      <ChevronDown size={14} className="inline-block ml-1 text-gray-500" />
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 dark:text-gray-300">Rows</label>
          <select
            className="border rounded px-2 py-1 bg-white dark:bg-gray-800 dark:border-gray-700"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 20, 50].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => exportFn && exportFn()}>Export</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50 dark:bg-gray-800/60">
            <tr>
              <th
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSortClick("name")}
                title="Sort by Employee name"
              >
                Employee <SortIcon column="name" />
              </th>

              <th
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSortClick("count")}
                title="Sort by payroll count"
              >
                Payroll IDs <SortIcon column="count" />
              </th>

              <th
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSortClick("payDate")}
                title="Sort by latest pay date"
              >
                Pay Dates <SortIcon column="payDate" />
              </th>

              <th
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSortClick("gross")}
                title="Sort by total gross"
              >
                Gross <SortIcon column="gross" />
              </th>

              <th
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSortClick("tax")}
                title="Sort by total tax"
              >
                Tax <SortIcon column="tax" />
              </th>

              <th
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSortClick("net")}
                title="Sort by total net"
              >
                Net <SortIcon column="net" />
              </th>

              <th
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSortClick("id")}
                title="Sort by employee ID"
              >
                Actions <SortIcon column="id" />
              </th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((group) => {
              const id = group.employee.id;
              const isOpen = !!expanded[id];

              return (
                <React.Fragment key={id}>
                  <tr className="border-t dark:border-gray-700 bg-white dark:bg-gray-900/40">
                    <td className="p-3 align-top">
                      <div className="font-semibold dark:text-white">
                        {group.employee.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {group.employee.email ?? group.employee.id}
                      </div>
                    </td>

                    <td className="p-3 align-top">
                      {group.rows.slice(0, 3).map((r) => (
                        <div key={r.id} className="mb-1 font-mono text-sm dark:text-gray-300">
                          {r.id}
                        </div>
                      ))}
                      {group.rows.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{group.rows.length - 3} more
                        </div>
                      )}
                    </td>

                    <td className="p-3 align-top">
                      {group.rows.slice(0, 3).map((r) => (
                        <div key={r.id} className="mb-1 text-sm dark:text-gray-300">
                          {r.payDate}
                        </div>
                      ))}
                    </td>

                    <td className="p-3 align-top dark:text-gray-300">
                      {group.totalGross.toFixed(1)}
                    </td>

                    <td className="p-3 align-top dark:text-gray-300">
                      {group.totalTax.toFixed(1)}
                    </td>

                    <td className="p-3 align-top dark:text-gray-300">
                      {group.totalNet.toFixed(1)}
                    </td>

                    <td className="p-3 align-top">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => toggleExpand(id)}>
                          {isOpen ? "Collapse" : "Expand"}
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {/* Expandable */}
                  <tr className={`transition-all duration-300 ease-in-out ${isOpen ? "h-auto" : "h-0"}`}>
                    <td colSpan={7} className="p-0 bg-white dark:bg-gray-900/60 border-t border-gray-100 dark:border-gray-800">
                      <div className={`overflow-hidden ${isOpen ? "py-4 px-6" : "py-0 px-6"}`}>
                        {isOpen && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="text-sm font-medium dark:text-white">Payroll IDs</h4>
                              <div className="mt-2 space-y-2">
                                {group.rows.map((r) => (
                                  <div key={r.id} className="text-sm font-mono dark:text-gray-300">
                                    {r.id}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium dark:text-white">Pay Dates</h4>
                              <div className="mt-2 space-y-2">
                                {group.rows.map((r) => (
                                  <div key={r.id} className="text-sm dark:text-gray-300">{r.payDate}</div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium dark:text-white">Amounts</h4>
                              <div className="mt-2 space-y-2">
                                {group.rows.map((r) => (
                                  <div key={r.id} className="flex justify-between text-sm dark:text-gray-300">
                                    <div className="w-1/3 truncate">{Number(r.grossSalary || 0).toFixed(1)}</div>
                                    <div className="w-1/3 truncate">{Number(r.taxAmount || 0).toFixed(1)}</div>
                                    <div className="w-1/3 truncate">{Number(r.netSalary || 0).toFixed(1)}</div>
                                  </div>
                                ))}

                                <div className="mt-3 border-t pt-3 flex justify-between font-semibold dark:text-white">
                                  <div className="w-1/3">{group.totalGross.toFixed(1)}</div>
                                  <div className="w-1/3">{group.totalTax.toFixed(1)}</div>
                                  <div className="w-1/3">{group.totalNet.toFixed(1)}</div>
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

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Page {page} of {totalPages} — {totalItems} employees
        </div>

        <div className="flex items-center gap-2">
          <Button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
          <div className="px-3 py-1 border rounded text-sm dark:border-gray-700 dark:text-gray-200">{page}</div>
          <Button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
        </div>
      </div>
    </div>
  );
}
