import React, { useState } from "react";
import { usePayrolls } from "../hooks/usePayrolls";
import { useNavigate } from "react-router-dom";
import MiniLoader from "../components/MiniLoader"; 

export default function PayrollCreate() {
  const navigate = useNavigate();
  const { create } = usePayrolls();

  const [error, setError] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [payDate, setPayDate] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const payload = { employeeId, payDate };

    create.mutate(payload, {
      onSuccess: () => navigate("/payrolls"),
      onError: (err) => setError(err?.response?.data?.message),
    });
  };

  return (
    <div className="flex justify-center items-start p-4">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 shadow-[0_4px_20px_rgba(0,0,0,0.07)] rounded-2xl p-6 border border-gray-200 dark:border-neutral-800">

        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
          Add Payroll
        </h2>

        <form onSubmit={submit} className="space-y-5">

          {/* ERROR */}
          {error && (
            <div className="rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/40 p-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Employee ID */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Employee ID
            </label>
            <input
              className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            />
          </div>

          {/* Pay Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Pay Date
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={create.isPending}
            className="
              w-full rounded-xl bg-blue-600 hover:bg-blue-700 
              disabled:opacity-70 disabled:cursor-not-allowed 
              text-white py-2.5 text-sm font-medium 
              flex items-center justify-center gap-2 
              transition shadow-sm
            "
          >
            {create.isPending ? (
              <>
                <MiniLoader />
                <span>Submitting...</span>
              </>
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
