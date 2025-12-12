import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import MiniLoader from "../../components/MiniLoader";

/**
 * Left-side filter drawer (auto closes when button's async action finishes)
 *
 * Props:
 * - left: boolean (open from left when true)
 * - employeeId, setEmployeeId, year, setYear, ymInput, setYmInput, rangeFrom, setRangeFrom, rangeTo, setRangeTo
 * - onSearchAll(close), onSearchByEmployee(close), onSearchByYear(close), onSearchByYearMonth(close), onSearchByRange(close)
 * - loadingSearch, activeFilter
 * - error
 */

export default function PayrollFilterDrawer({
  left = true,
  employeeId,
  setEmployeeId,
  year,
  setYear,
  ymInput,
  setYmInput,
  rangeFrom,
  setRangeFrom,
  rangeTo,
  setRangeTo,
  onSearchAll,
  onSearchByEmployee,
  onSearchByYear,
  onSearchByYearMonth,
  onSearchByRange,
  loadingSearch,
  activeFilter,
  error,
}) {
  // internal open state so we can call close() from functions
  const [open, setOpen] = useState(false);

  // wrapper to call an action and close when done (action receives close)
  const callAndClose = (fn) => {
    // pass a close callback that sets open false after fn resolves
    fn(() => setOpen(false));
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="mr-2">Filters</Button>
      </SheetTrigger>

      <SheetContent side={left ? "left" : "right"} className="w-96 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold dark:text-white">Filters</h3>
          <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
        </div>

        <div className="mt-4 space-y-3">
          {error && <div className="text-sm text-red-500">{error}</div>}

          <label className="text-sm text-gray-600 dark:text-gray-300">Employee ID</label>
          <Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="dark:bg-gray-800 dark:border-gray-700" />

          <label className="text-sm text-gray-600 dark:text-gray-300 mt-3">Year</label>
          <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 2024" className="dark:bg-gray-800 dark:border-gray-700" />

          <label className="text-sm text-gray-600 dark:text-gray-300 mt-3">Year-Month</label>
          <Input type="month" value={ymInput} onChange={(e) => setYmInput(e.target.value)} className="dark:bg-gray-800 dark:border-gray-700" />

          <label className="text-sm text-gray-600 dark:text-gray-300 mt-3">Range from / to</label>
          <div className="flex gap-2">
            <Input type="month" value={rangeFrom} onChange={(e) => setRangeFrom(e.target.value)} className="dark:bg-gray-800 dark:border-gray-700" />
            <Input type="month" value={rangeTo} onChange={(e) => setRangeTo(e.target.value)} className="dark:bg-gray-800 dark:border-gray-700" />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button
              onClick={() => callAndClose(onSearchByEmployee)}
              disabled={loadingSearch && activeFilter !== "employee"}
              className="flex items-center justify-center gap-2"
            >
              {loadingSearch && activeFilter === "employee" && <MiniLoader />}
              By Employee
            </Button>

            <Button
              onClick={() => callAndClose(onSearchByYear)}
              disabled={loadingSearch && activeFilter !== "year"}
              className="flex items-center justify-center gap-2"
            >
              {loadingSearch && activeFilter === "year" && <MiniLoader />}
              Year
            </Button>

            <Button
              onClick={() => callAndClose(onSearchByYearMonth)}
              disabled={loadingSearch && activeFilter !== "ym"}
              className="col-span-2 flex items-center justify-center gap-2"
            >
              {loadingSearch && activeFilter === "ym" && <MiniLoader />}
              Year-Month
            </Button>

            <Button
              onClick={() => callAndClose(onSearchByRange)}
              disabled={loadingSearch && activeFilter !== "range"}
              className="col-span-2 flex items-center justify-center gap-2"
            >
              {loadingSearch && activeFilter === "range" && <MiniLoader />}
              Range
            </Button>

            <Button
              onClick={() => callAndClose(onSearchAll)}
              disabled={loadingSearch && activeFilter !== "all"}
              className="col-span-2"
            >
              {loadingSearch && activeFilter === "all" && <MiniLoader />}
              Search All
            </Button>
          </div>

          <div className="mt-4">
            <Button variant="ghost" onClick={() => {
              setEmployeeId(""); setYear(""); setYmInput(""); setRangeFrom(""); setRangeTo("");
            }}>
              Reset inputs
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
