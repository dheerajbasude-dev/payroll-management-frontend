import React, { useMemo, useState } from "react";
import { usePayrolls } from "../hooks/usePayrolls";
import {
  getPayrollsByEmployeeApi,
  getPayrollsByEmployeeYearApi,
  getPayrollsByEmployeeYearMonthApi,
  getPayrollsByEmployeeRangeApi,
  getAllPayrollsApi,
} from "../api/payrolls";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";
import MiniLoader from "../components/MiniLoader";

// components (split)
import PayrollChart from "../components/payroll/PayrollChart";
import PayrollFilterDrawer from "../components/payroll/PayrollFilterDrawer";
import PayrollTable from "../components/payroll/PayrollTable";

// shadcn UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Main Payrolls page (composes chart, drawer, table)
 * - Left drawer (auto closes on click)
 * - Export (exports currently paginated groups)
 * - Uses existing APIs (no logic change)
 */

function exportToExcel(groups) {
  const flat = groups.flatMap((g) => g.rows || []);
  if (!flat.length) return;
  const ws = XLSX.utils.json_to_sheet(flat);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Payrolls");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], { type: "application/octet-stream" });
  saveAs(blob, `Payrolls_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export default function Payrolls() {
  const { data: allPayrolls, isLoading } = usePayrolls();

  // filters state (kept here to pass to drawer)
  const [employeeId, setEmployeeId] = useState("");
  const [year, setYear] = useState("");
  const [ymInput, setYmInput] = useState("");
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [error, setError] = useState("");

  // search results and loading state
  const [searchResult, setSearchResult] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null); // shows MiniLoader only for clicked button

  // table UI state (managed inside PayrollTable too; but export and grouping done here for chart & summary)
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expanded, setExpanded] = useState({});

  // choose displayed data (search results take precedence)
  const displayData = Array.isArray(searchResult) ? searchResult : (allPayrolls ?? []);

  // helper to run search, with filter name so drawer button shows loader only for active filter
  const runSearch = async (apiFn, filterName = null, autoCloseDrawer = () => {}) => {
    try {
      setLoadingSearch(true);
      setActiveFilter(filterName);
      setError("");
      const res = await apiFn();
      setSearchResult(Array.isArray(res.data) ? res.data : []);
      setPage(1);
      // auto close drawer after success if drawer passed a close function
      if (filterName) autoCloseDrawer();
    } catch (err) {
      setError(err?.response?.data?.message || "Search failed");
    } finally {
      setLoadingSearch(false);
      setActiveFilter(null);
    }
  };

  // filter wrappers (pass runSearch)
  const searchAll = (autoClose) => runSearch(getAllPayrollsApi, "all", autoClose);
  const searchByEmployee = (autoClose) => {
    if (!employeeId.trim()) return alert("Enter employee ID");
    return runSearch(() => getPayrollsByEmployeeApi(employeeId), "employee", autoClose);
  };
  const searchByYear = (autoClose) => {
    if (!employeeId.trim() || !year.trim()) return alert("Enter Employee ID & Year");
    return runSearch(() => getPayrollsByEmployeeYearApi(employeeId, year), "year", autoClose);
  };
  const searchByYearMonth = (autoClose) => {
    if (!employeeId.trim() || !ymInput) return alert("Select year-month");
    const [y, m] = ymInput.split("-");
    return runSearch(() => getPayrollsByEmployeeYearMonthApi(employeeId, y, m), "ym", autoClose);
  };
  const searchByRange = (autoClose) => {
    if (!employeeId.trim() || !rangeFrom || !rangeTo) return alert("Enter employee ID + both range months");
    return runSearch(() => getPayrollsByEmployeeRangeApi(employeeId, rangeFrom, rangeTo), "range", autoClose);
  };

  // GROUPING (same logic you had)
  const grouped = useMemo(() => {
    const map = {};
    (displayData ?? []).forEach((p) => {
      const emp = p.employee;
      if (!map[emp.id]) {
        map[emp.id] = { employee: emp, rows: [], totalGross: 0, totalTax: 0, totalNet: 0 };
      }
      map[emp.id].rows.push(p);
      map[emp.id].totalGross += p.grossSalary || 0;
      map[emp.id].totalTax += p.taxAmount || 0;
      map[emp.id].totalNet += p.netSalary || 0;
    });
    return Object.values(map);
  }, [displayData]);

  // SUMMARY
  const totalRecords = (displayData ?? []).length;
  const totalGross = (displayData ?? []).reduce((a, b) => a + (b.grossSalary || 0), 0);
  const totalTax = (displayData ?? []).reduce((a, b) => a + (b.taxAmount || 0), 0);
  const totalNet = (displayData ?? []).reduce((a, b) => a + (b.netSalary || 0), 0);

  // Pagination & sorting for PayrollTable (we pass down setters too)
  // NOTE: PayrollTable will accept these props and handle UI there
  if (isLoading) return <Spinner />;

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6">
      {/* header with Add Payroll */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold dark:text-white">Payrolls</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Analytics & payroll details</p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/payrolls/create">
            <Button className="bg-blue-600 hover:bg-blue-700">+ Add Payroll</Button>
          </Link>

          <Button
            variant="ghost"
            onClick={() => {
              // reset filters
              setEmployeeId(""); setYear(""); setYmInput(""); setRangeFrom(""); setRangeTo("");
              setSearchResult(null);
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* CHART (big full-width card) */}
      <Card className="dark:bg-gray-900/50">
        <CardHeader>
          <CardTitle className="text-lg dark:text-white">Payroll Distribution (Gross / Tax / Net)</CardTitle>
        </CardHeader>
        <CardContent>
          <PayrollChart totals={{ totalGross, totalTax, totalNet }} />
        </CardContent>
      </Card>

      {/* Filters Drawer (left) */}
      <PayrollFilterDrawer
        left
        // controlled inputs
        employeeId={employeeId}
        setEmployeeId={setEmployeeId}
        year={year}
        setYear={setYear}
        ymInput={ymInput}
        setYmInput={setYmInput}
        rangeFrom={rangeFrom}
        setRangeFrom={setRangeFrom}
        rangeTo={rangeTo}
        setRangeTo={setRangeTo}
        // actions (drawer will call these; pass a close callback so it auto-closes)
        onSearchAll={(close) => searchAll(close)}
        onSearchByEmployee={(close) => searchByEmployee(close)}
        onSearchByYear={(close) => searchByYear(close)}
        onSearchByYearMonth={(close) => searchByYearMonth(close)}
        onSearchByRange={(close) => searchByRange(close)}
        // loading state & active filter
        loadingSearch={loadingSearch}
        activeFilter={activeFilter}
        error={error}
      />

      {/* small summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Records", value: totalRecords },
          { label: "Total Gross", value: totalGross.toFixed(1) },
          { label: "Total Tax", value: totalTax.toFixed(1) },
          { label: "Total Net", value: totalNet.toFixed(1) },
        ].map((c) => (
          <Card key={c.label} className="p-4 dark:bg-gray-900/60">
            <div className="text-sm text-gray-500 dark:text-gray-400">{c.label}</div>
            <div className="text-2xl font-semibold dark:text-white">{c.value}</div>
          </Card>
        ))}
      </div>

      {/* Table component */}
      <PayrollTable
        groupedData={grouped}
        sortBy={sortBy}
        sortDir={sortDir}
        setSortBy={setSortBy}
        setSortDir={setSortDir}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        expanded={expanded}
        setExpanded={setExpanded}
        exportFn={() => exportToExcel(grouped)}
      />

      {/* global small overlay */}
      {loadingSearch && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20">
          <div className="bg-white dark:bg-gray-900 p-4 rounded shadow flex items-center gap-3">
            <MiniLoader />
            <span className="dark:text-white">Searching...</span>
          </div>
        </div>
      )}
    </div>
  );
}
