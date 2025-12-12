import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import MiniLoader from "../../components/MiniLoader";

/**
 * Props:
 *  left (bool)
 *  year,setYear, ymInput,setYmInput, rangeFrom,setRangeFrom, rangeTo,setRangeTo
 *  onSearchAll(close), onSearchByYear(close), onSearchByYearMonth(close), onSearchByRange(close)
 *  loadingSearch, activeFilter
 */
export default function SummaryFilterDrawer({
  left = true,
  year, setYear,
  ymInput, setYmInput,
  rangeFrom, setRangeFrom,
  rangeTo, setRangeTo,
  onSearchAll,
  onSearchByYear,
  onSearchByYearMonth,
  onSearchByRange,
  loadingSearch,
  activeFilter,
}) {
  const [open, setOpen] = useState(false);

  const callClose = (fn) => {
    // provide a close callback to the parent action so it can auto-close after success
    fn(() => setOpen(false));
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">Filters</Button>
      </SheetTrigger>

      <SheetContent side={left ? "left" : "right"} className="w-96 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold dark:text-white">Filters</h3>
          <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="text-sm text-gray-600 dark:text-gray-300">Year</label>
          <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2024" className="dark:bg-gray-800 dark:border-gray-700" />

          <label className="text-sm text-gray-600 dark:text-gray-300">Year-Month</label>
          <Input type="month" value={ymInput} onChange={(e) => setYmInput(e.target.value)} className="dark:bg-gray-800 dark:border-gray-700" />

          <label className="text-sm text-gray-600 dark:text-gray-300">Range</label>
          <div className="flex gap-2">
            <Input type="month" value={rangeFrom} onChange={(e) => setRangeFrom(e.target.value)} className="dark:bg-gray-800 dark:border-gray-700" />
            <Input type="month" value={rangeTo} onChange={(e) => setRangeTo(e.target.value)} className="dark:bg-gray-800 dark:border-gray-700" />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button onClick={() => callClose(onSearchByYear)} disabled={loadingSearch && activeFilter !== "year"} className="flex items-center justify-center gap-2">
              {loadingSearch && activeFilter === "year" && <MiniLoader />}
              Year
            </Button>

            <Button onClick={() => callClose(onSearchByYearMonth)} disabled={loadingSearch && activeFilter !== "ym"} className="flex items-center justify-center gap-2">
              {loadingSearch && activeFilter === "ym" && <MiniLoader />}
              Year-Month
            </Button>

            <Button onClick={() => callClose(onSearchByRange)} disabled={loadingSearch && activeFilter !== "range"} className="col-span-2 flex items-center justify-center gap-2">
              {loadingSearch && activeFilter === "range" && <MiniLoader />}
              Range
            </Button>

            <Button onClick={() => callClose(onSearchAll)} disabled={loadingSearch && activeFilter !== "all"} className="col-span-2">
              {loadingSearch && activeFilter === "all" && <MiniLoader />}
              Load Full Summary
            </Button>
          </div>

          <div className="mt-3">
            <Button variant="ghost" onClick={() => { setYear(""); setYmInput(""); setRangeFrom(""); setRangeTo(""); }}>
              Reset
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
