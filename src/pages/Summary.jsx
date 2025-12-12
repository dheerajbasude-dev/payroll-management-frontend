// ------------------------------------------------------
// GLOBAL CACHE (survives navigation + re-renders)
// ------------------------------------------------------
let summaryCache = null;

import React, { useState, useEffect, useMemo } from "react";
import Spinner from "../components/Spinner";
import MiniLoader from "../components/MiniLoader";

import {
  getAllSummaryApi,
  getSummaryByYearApi,
  getSummaryByYearMonthApi,
  getSummaryByDateRangeApi,
} from "../api/summary";

// shadcn UI
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";

// components (new)
import SummaryTable from "../components/summary/SummaryTable";
import SummaryFilterDrawer from "../components/summary/SummaryFilterDrawer";
import SummaryPieChart from "../components/summary/SummaryPieChart";
import { exportPayrollsToExcel } from "../utils/exportExcel";

export default function Summary() {
  const [summary, setSummary] = useState(summaryCache);
  const [loading, setLoading] = useState(!summaryCache);

  // UI & filter states (kept separate so drawer can control them)
  const [year, setYear] = useState("");
  const [ymInput, setYmInput] = useState("");
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [error, setError] = useState("");

  // search & loading control
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);

  // table controls (sorting / paging / expand)
  const [sortBy, setSortBy] = useState(null); // name|gross|tax|net|payDate|count|id
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expanded, setExpanded] = useState({});

  const navigate = useNavigate();

  // universal search runner (auto-set active filter for MiniLoader)
  const runSearch = async (apiCall, filterName = null, skipCache = false) => {
    try {
      setLoading(true);
      setLoadingSearch(true);
      setActiveFilter(filterName);
      setError("");
      const res = await apiCall();
      setSummary(res.data);
      if (!skipCache) summaryCache = res.data;
      setPage(1);
    } catch (err) {
      setError(err?.response?.data?.message || "Fetch failed");
    } finally {
      setLoading(false);
      setLoadingSearch(false);
      setActiveFilter(null);
    }
  };

  useEffect(() => {
    if (!summaryCache) {
      runSearch(() => getAllSummaryApi(), "all", false);
    }
  }, []);

  // presentational grouping (unchanged logic)
  const groupedData = useMemo(() => {
    const groups = {};
    (summary?.payrolls ?? []).forEach((p) => {
      const empId = p.employee?.id;
      if (!groups[empId]) {
        groups[empId] = {
          employee: p.employee,
          rows: [],
          totalGross: 0,
          totalTax: 0,
          totalNet: 0,
        };
      }
      groups[empId].rows.push(p);
      groups[empId].totalGross += p.grossSalary || 0;
      groups[empId].totalTax += p.taxAmount || 0;
      groups[empId].totalNet += p.netSalary || 0;
    });
    return Object.values(groups);
  }, [summary]);

  // summary totals for pie chart
  const totals = {
    totalGross: summary?.totalGrossSalary ?? 0,
    totalTax: summary?.totalTaxAmount ?? 0,
    totalNet: summary?.totalNetSalary ?? 0,
  };

  // handlers to pass into drawer (drawer auto-closes via its API)
  const searchAll = (close) => runSearch(() => getAllSummaryApi(), "all", false).then(() => close && close());
  const searchYear = (close) => {
    if (!year) return alert("Enter year");
    return runSearch(() => getSummaryByYearApi(year), "year", true).then(() => close && close());
  };
  const searchYearMonth = (close) => {
    if (!ymInput) return alert("Select month");
    return runSearch(() => getSummaryByYearMonthApi(ymInput), "ym", true).then(() => close && close());
  };
  const searchRange = (close) => {
    if (!rangeFrom || !rangeTo) return alert("Select both range months");
    return runSearch(() => getSummaryByDateRangeApi(rangeFrom, rangeTo), "range", true).then(() => close && close());
  };

  // Excel export (exports currently grouped rows flattened)
  const handleExport = () => {
    // flatten grouped rows into array of payroll rows (same as earlier pattern)
    const rows = (summary?.payrolls ?? []).map((r) => ({
      id: r.id,
      employeeId: r.employee?.id,
      employeeName: r.employee?.name,
      payDate: r.payDate,
      grossSalary: r.grossSalary,
      taxAmount: r.taxAmount,
      netSalary: r.netSalary,
    }));
    exportPayrollsToExcel(rows, "Summary");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold dark:text-white">Summary</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Aggregated payroll overview</p>
        </div>

        <div className="flex items-center gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleExport}>
            Export Excel
          </Button>

          {/* Drawer trigger is inside component; kept here for consistency */}
          <SummaryFilterDrawer
            left
            // pass controlled fields so drawer can edit them before search
            year={year}
            setYear={setYear}
            ymInput={ymInput}
            setYmInput={setYmInput}
            rangeFrom={rangeFrom}
            setRangeFrom={setRangeFrom}
            rangeTo={rangeTo}
            setRangeTo={setRangeTo}
            // actions
            onSearchAll={searchAll}
            onSearchByYear={searchYear}
            onSearchByYearMonth={searchYearMonth}
            onSearchByRange={searchRange}
            // loading state
            loadingSearch={loadingSearch}
            activeFilter={activeFilter}
          />
        </div>
      </div>

      {/* big pie chart */}
      <Card className="dark:bg-gray-900/50">
        <CardHeader>
          <CardTitle className="text-lg dark:text-white">Distribution (Gross / Tax / Net)</CardTitle>
        </CardHeader>
        <CardContent>
          <SummaryPieChart totals={totals} />
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && <Spinner />}

      {/* Cards */}
      {!loading && summary && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="p-4 dark:bg-gray-900/60">
              <div className="text-sm text-gray-500 dark:text-gray-400">Payroll Records</div>
              <div className="text-2xl font-semibold dark:text-white">{summary.payrolls.length}</div>
            </Card>

            <Card className="p-4 dark:bg-gray-900/60">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Gross Salary</div>
              <div className="text-2xl font-semibold dark:text-white">{summary.totalGrossSalary}</div>
            </Card>

            <Card className="p-4 dark:bg-gray-900/60">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Tax</div>
              <div className="text-2xl font-semibold dark:text-white">{summary.totalTaxAmount}</div>
            </Card>

            <Card className="p-4 dark:bg-gray-900/60">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Net Salary</div>
              <div className="text-2xl font-semibold dark:text-white">{summary.totalNetSalary}</div>
            </Card>
          </div>

          {/* Table */}
          <SummaryTable
            groupedData={groupedData}
            sortBy={sortBy}
            sortDir={sortDir}
            setSortBy={(k) => { setSortBy(k); setPage(1); }}
            setSortDir={setSortDir}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={(s) => { setPageSize(s); setPage(1); }}
            expanded={expanded}
            setExpanded={setExpanded}
          />
        </>
      )}

      {/* small overlay loader while searching */}
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
