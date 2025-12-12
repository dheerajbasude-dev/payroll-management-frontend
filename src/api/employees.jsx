import api from "./axios";
export const getEmployeesApi = () => api.get("/api/employees");
export const getEmployeeApi = (id) => api.get(`/api/employees/${id}`);
export const createEmployeeApi = (data) => api.post("/api/employees", data);
export const updateEmployeeApi = (id, data) => api.put(`/api/employees/${id}`, data);
export const deleteEmployeeApi = (id) => api.delete(`/api/employees/${id}`);
