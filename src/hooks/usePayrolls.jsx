import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllPayrollsApi,
  getPayrollsByEmployeeApi,
  getPayrollsByEmployeeYearApi,
  getPayrollsByEmployeeYearMonthApi,
  getPayrollsByEmployeeRangeApi,
  createPayrollApi
} from "../api/payrolls";

import { getAllSummaryApi } from "../api/summary";

/* -------------------------------------------------------
   NORMALIZER (backend summary response shape)
--------------------------------------------------------- */
function normalizeSummary(data) {
  return {
    payrolls: data?.payrolls ?? [],
    totalGrossSalary: data?.totalGrossSalary ?? 0,
    totalTaxAmount: data?.totalTaxAmount ?? 0,
    totalNetSalary: data?.totalNetSalary ?? 0,
  };
}

/* -------------------------------------------------------
   1) FETCH ALL PAYROLLS  → usePayrolls()
--------------------------------------------------------- */
export function usePayrolls() {
  const queryClient = useQueryClient();

  const payrolls = useQuery({
    queryKey: ["payrolls"],
    queryFn: async () => {
      const res = await getAllPayrollsApi();
      return res.data;
    },
  });

  // 🔥 CREATE PAYROLL MUTATION
  const create = useMutation({
    mutationFn: async (payload) => {
      const res = await createPayrollApi(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["payrolls"]);
    }
  });

  return {
    ...payrolls,
    create,
  };
}

/* -------------------------------------------------------
   ADDITIONAL SUMMARY HOOK USED IN YOUR PROJECT
--------------------------------------------------------- */
export function useEmployeePayrollSummary() {
  const allPayrolls = useQuery({
    queryKey: ["all-payrolls"],
    queryFn: async () => {
      const res = await getAllPayrollsApi();
      return res.data;
    }
  });

  const allSummary = useQuery({
    queryKey: ["summary-all"],
    queryFn: async () => {
      const res = await getAllSummaryApi();
      return normalizeSummary(res.data);
    }
  });

  const byEmployee = (id) =>
    useQuery({
      queryKey: ["emp-payroll", id],
      queryFn: async () => {
        const res = await getPayrollsByEmployeeApi(id);
        return res.data;
      },
      enabled: !!id,
    });

  const byEmployeeYear = (id, year) =>
    useQuery({
      queryKey: ["emp-payroll-year", id, year],
      queryFn: async () => {
        const res = await getPayrollsByEmployeeYearApi(id, year);
        return res.data;
      },
      enabled: !!id && !!year,
    });

  const byEmployeeYearMonth = (id, year, month) =>
    useQuery({
      queryKey: ["emp-payroll-ym", id, year, month],
      queryFn: async () => {
        const res = await getPayrollsByEmployeeYearMonthApi(id, year, month);
        return res.data;
      },
      enabled: !!id && !!year && !!month,
    });

  const byEmployeeRange = (employeeId, startDate, endDate) =>
    useQuery({
      queryKey: ["emp-payrange", employeeId, startDate, endDate],
      queryFn: async () => {
        const res = await getPayrollsByEmployeeRangeApi(employeeId, startDate, endDate);
        return res.data;
      },
      enabled: !!employeeId && !!startDate && !!endDate,
    });

  return {
    allPayrolls,
    allSummary,
    byEmployee,
    byEmployeeYear,
    byEmployeeYearMonth,
    byEmployeeRange,
  };
}
