import { useQuery } from "@tanstack/react-query";
import {
  createPayrollApi,   
  getAllSummaryApi,
  getSummaryByYearApi,
  getSummaryByYearMonthApi,
  getSummaryByDateRangeApi
} from "../api/summary";

// 🔥 Normalize backend response into a FIXED shape
function normalize(data) {
  return {
    payrolls: data?.payrolls ?? [],
    totalGrossSalary: data?.totalGrossSalary ?? 0,
    totalTaxAmount: data?.totalTaxAmount ?? 0,
    totalNetSalary: data?.totalNetSalary ?? 0,
  };
}

export function useSummary() {
  // MAIN SUMMARY LIST
  const list = useQuery({
    queryKey: ["summary"],
    queryFn: async () => {
      const res = await getAllSummaryApi();
      return normalize(res.data);
    },
    staleTime: 30000,
  });

   // Create Payroll mutation
  const create = useMutation({
    mutationFn: (payload) => createPayrollApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["payrolls"]); // refresh table
    }
  });

  // SUMMARY BY YEAR
  const byYear = (year) =>
    useQuery({
      queryKey: ["summary-year", year],
      queryFn: async () => {
        const res = await getSummaryByYearApi(year);
        return normalize(res.data);
      },
      enabled: !!year,
    });

  // SUMMARY BY YEAR + MONTH
  const byYearMonth = (year, month) =>
    useQuery({
      queryKey: ["summary-year-month", year, month],
      queryFn: async () => {
        const res = await getSummaryByYearMonthApi(year, month);
        return normalize(res.data);
      },
      enabled: !!year && !!month,
    });

  // SUMMARY BY YEAR-MONTH RANGE
  const byRange = (startYM, endYM) =>
    useQuery({
      queryKey: ["summary-range", startYM, endYM],
      queryFn: async () => {
        const res = await getSummaryByDateRangeApi(startYM, endYM);
        return normalize(res.data);
      },
      enabled: !!startYM && !!endYM,
    });

  return { ...list, byYear, byYearMonth, byRange, create };
}
