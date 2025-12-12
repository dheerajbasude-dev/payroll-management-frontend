import axios from "./axios";

// GET all summaries
export const getAllSummaryApi = () =>
  axios.get("/api/summary");

// GET summary by specific year
export const getSummaryByYearApi = (year) =>
  axios.get(`/api/summary/year/${year}`);

// GET summary by specific year & month
export const getSummaryByYearMonthApi = (yearMonth) =>
  axios.get(`/api/summary/year-month/${yearMonth}`);


// GET summary by date range
// ✅ CORRECT — matches Swagger exactly
export const getSummaryByDateRangeApi = (startYM, endYM) =>
  axios.get(`/api/summary/date-ranges`, {
    params: {
      startYM,
      endYM
    }
  });

