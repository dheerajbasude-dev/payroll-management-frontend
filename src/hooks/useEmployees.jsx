import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmployeesApi,
  getEmployeeApi,
  createEmployeeApi,
  updateEmployeeApi,
  deleteEmployeeApi,
} from "../api/employees";

export function useEmployees() {
  const qc = useQueryClient();

  // -------------------------------
  // LIST ALL EMPLOYEES
  // -------------------------------
  const list = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await getEmployeesApi();
      return res.data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  // -------------------------------
  // GET EMPLOYEE BY ID
  // -------------------------------
  const byId = (id) =>
    useQuery({
      queryKey: ["employees", id],
      queryFn: async () => {
        const res = await getEmployeeApi(id);
        return res.data;
      },
      enabled: !!id,
    });

  // -------------------------------
  // CREATE EMPLOYEE
  // -------------------------------
  const create = useMutation({
    mutationFn: (payload) => createEmployeeApi(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  // -------------------------------
  // UPDATE EMPLOYEE
  // -------------------------------
  const update = useMutation({
    mutationFn: ({ id, data }) => updateEmployeeApi(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["employees", id] });
    },
  });

  // -------------------------------
  // DELETE EMPLOYEE
  // -------------------------------
  const remove = useMutation({
    mutationFn: (id) => deleteEmployeeApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  return { ...list, byId, create, update, remove };
}
