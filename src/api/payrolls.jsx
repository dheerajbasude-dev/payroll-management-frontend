import axios from "./axios";

// ✅ Fetch ALL payrolls
export const getAllPayrollsApi = () =>
  axios.get("/api/payrolls");

// 🔍 Fetch payrolls by employee ID
export const getPayrollsByEmployeeApi = (id) =>
  axios.get(`/api/payrolls/employee/${id}`);

// 🔍 Fetch payrolls by employee + year
export const getPayrollsByEmployeeYearApi = (id, year) =>
  axios.get(`/api/payrolls/employee/${id}/year/${year}`);

// 🔍 Fetch payrolls by employee + year-month
export const getPayrollsByEmployeeYearMonthApi = (id, year, month) =>
  axios.get(`/api/payrolls/employee/${id}/year-month/${year}-${month}`);

// 🔍 Fetch payrolls by employee + date range (YM)
export const getPayrollsByEmployeeRangeApi = (employeeId, startDate, endDate) =>
  axios.get(`/api/payrolls/employee/${employeeId}/dates-range`, {
    params: { startDate, endDate }
  });

// ✅ CREATE PAYROLL (needed for PayrollCreate.jsx)
export const createPayrollApi = (data) =>
  axios.post("/api/payrolls", data);
