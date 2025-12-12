import React, { useState } from "react";
import { useEmployees } from "../hooks/useEmployees";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import MiniLoader from "../components/MiniLoader";
import Toast from "@/components/Toast";

// Excel Export
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// shadcn UI
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Employees() {
  const navigate = useNavigate();
  const { data, isLoading, isError, remove } = useEmployees();

  const [deleteIds, setDeleteIds] = useState([]); // ⬅ NEW: multiple delete
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
    const [error, setError] = useState("");

  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
  setToast(msg);
};


  // Excel Export -----------------------
  const exportToExcel = () => {
    if (!data || data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      "Employees.xlsx"
    );
  };

  if (isLoading) return <Spinner />;
  if (isError) return <div>Error loading employees</div>;

  // Search + Sort ----------------------
  const filtered = data
    ?.filter(
      (emp) =>
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.designation.toLowerCase().includes(search.toLowerCase())
    )
    ?.sort((a, b) => {
      let v1 = a[sortBy];
      let v2 = b[sortBy];
      if (typeof v1 === "string") v1 = v1.toLowerCase();
      if (typeof v2 === "string") v2 = v2.toLowerCase();
      return sortDir === "asc" ? (v1 > v2 ? 1 : -1) : (v1 < v2 ? 1 : -1);
    });

  // Pagination -------------------------
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Checkbox toggles -------------------
  const toggleSelectOne = (id) => {
    setDeleteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (deleteIds.length === paginated.length) {
      setDeleteIds([]);
    } else {
      setDeleteIds(paginated.map((e) => e.id));
    }
  };

  // Bulk Delete ------------------------
  const confirmDelete = async () => {
    setDeleting(true);

    try {
      for (const id of deleteIds) {
        await remove.mutateAsync(id);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    }

    setDeleting(false);
    setShowConfirm(false);
    setDeleteIds([]);
  };

  return (
    
    <div className="p-4 sm:p-6 lg:p-10">
    {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h3 className="text-3xl font-semibold tracking-tight">Employees</h3>

        <div className="flex gap-3">
          <Button
            onClick={exportToExcel}
            className="bg-emerald-600 hover:bg-emerald-700 px-5 py-2 rounded-xl"
          >
            Export Excel
          </Button>

          <Link to="/employees/create">
            <Button className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl">
              + Add Employee
            </Button>
          </Link>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        
        <input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="name">Sort by Name</option>
            <option value="age">Sort by Age</option>
            <option value="salary">Sort by Salary</option>
            <option value="rating">Sort by Rating</option>
          </select>

          <Button
            variant="outline"
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
          >
            {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
          </Button>
        </div>
      </div>

      {/* Bulk Delete Button */}
      {deleteIds.length > 0 && (
        <div className="mb-3">
          <Button
            variant="destructive"
            className="px-5 py-2 rounded-lg"
            onClick={() => setShowConfirm(true)}
          >
            Delete Selected ({deleteIds.length})
          </Button>
        </div>
      )}

      {/* Table */}
      <Card className="shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900">
        <CardContent className="p-0 overflow-x-auto">
<table className="w-full text-sm hidden md:table">
  <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">

    <tr className="text-left text-gray-600">

      {/* Checkbox Column */}
      <th className="p-4 w-10">
        <input
          type="checkbox"
          checked={
            deleteIds.length === paginated.length &&
            paginated.length > 0
          }
          onChange={toggleSelectAll}
        />
      </th>

      {/* ID column */}
      <th className="p-4 w-24">ID</th>

      <th className="p-4">Employee</th>
      <th className="p-4 text-center">Age</th>
      <th className="p-4 text-center">Gender</th>
      <th className="p-4">Designation</th>
      <th className="p-4 text-center">Rating</th>
      <th className="p-4 text-right">Salary</th>

    </tr>
  </thead>

  <tbody>
    {paginated.map((emp, idx) => (
      <tr
        key={emp.id}
        className={`border-t dark:border-gray-700 transition hover:bg-gray-100 dark:hover:bg-gray-800 ${
  idx % 2 === 0
    ? "bg-white dark:bg-gray-900"
    : "bg-gray-50/50 dark:bg-gray-800/50"
}`}

      >

        {/* Row checkbox */}
        <td className="p-4 text-center">
          <input
            type="checkbox"
            checked={deleteIds.includes(emp.id)}
            onChange={() => toggleSelectOne(emp.id)}
          />
        </td>

        {/* ID cell (clickable) */}
        <td
  className="p-4 font-mono text-xs text-gray-500 cursor-pointer"
  onClick={(e) => {
    e.stopPropagation(); // stop row navigation
    navigator.clipboard.writeText(emp.id);
    showToast(`Copied ID: ${emp.id}`);
  }}
>
  {emp.id}
</td>


        <td
          className="p-4 flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(`/employees/${emp.id}`)}
        >
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${emp.name}`}
            className="w-8 h-8 rounded-full shadow"
            alt={`${emp.name} avatar`}
          />
          <span className="font-medium">{emp.name}</span>
        </td>

        <td className="p-4 text-center">{emp.age}</td>
        <td className="p-4 text-center">{emp.gender}</td>
        <td className="p-4">{emp.designation}</td>

        <td className="p-4 text-center">
          <span className="px-2 py-1 rounded-lg text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            {emp.rating}
          </span>
        </td>

        <td className="p-4 text-right font-semibold">
          {emp.salary}
        </td>

      </tr>
    ))}
  </tbody>
</table>


          {/* MOBILE VERSION */}
          <div className="md:hidden space-y-3 p-4">
            {paginated.map((emp) => (
              <div
  key={emp.id}
  className="border rounded-xl p-4 shadow bg-white dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition"

              >
                {/* Checkbox */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex gap-3 items-center">
                    <input
                      type="checkbox"
                      checked={deleteIds.includes(emp.id)}
                      onChange={() => toggleSelectOne(emp.id)}
                    />
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${emp.name}`}
                      className="w-10 h-10 rounded-full"
                    />
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => navigate(`/employees/${emp.id}`)}
                  >
                    View
                  </Button>
                </div>

                <p className="font-semibold">{emp.name}</p>
                <p className="text-xs text-gray-500 mb-3">{emp.designation}</p>

                <div className="grid grid-cols-2 text-sm gap-y-1">
                  <p className="text-gray-600">Age:</p> <p>{emp.age}</p>
                  <p className="text-gray-600">Gender:</p> <p>{emp.gender}</p>
                  <p className="text-gray-600">Rating:</p> <p>{emp.rating}</p>
                  <p className="text-gray-600">Salary:</p> <p>{emp.salary}</p>
                </div>
              </div>
            ))}
          </div>

        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border dark:border-gray-700 rounded-lg px-3 py-1 text-sm bg-white dark:bg-gray-900 dark:text-gray-200"

          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size}>{size}</option>
            ))}
          </select>
        </div>

        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>

        <div className="flex gap-3">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </Button>

          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* BULK DELETE MODAL */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Delete Selected Employees?
            </DialogTitle>
          </DialogHeader>

          <p className="text-gray-600 mt-2">
            You are deleting <b>{deleteIds.length}</b> employees.  
            This action cannot be undone.
          </p>

          <DialogFooter className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>

            <Button
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 min-w-[110px]"
            >
              {deleting ? <MiniLoader /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
