import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Login from "./pages/Login";
import Employees from "./pages/Employees";
import EmployeeForm from "./pages/EmployeeForm";
import Payrolls from "./pages/Payrolls";
import PayrollCreate from "./pages/PayrollsCreate";
import SummaryPage from "./pages/Summary";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./AppLayout";

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><AppLayout><Navigate replace to="/employees" /></AppLayout></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute><AppLayout><Employees /></AppLayout></ProtectedRoute>} />
            <Route path="/employees/create" element={<ProtectedRoute><AppLayout><EmployeeForm /></AppLayout></ProtectedRoute>} />
            <Route path="/employees/:id" element={<ProtectedRoute><AppLayout><EmployeeForm /></AppLayout></ProtectedRoute>} />
            <Route path="/payrolls" element={<ProtectedRoute><AppLayout><Payrolls /></AppLayout></ProtectedRoute>} />
            <Route path="/payrolls/create" element={ <ProtectedRoute><AppLayout><PayrollCreate /> </AppLayout></ProtectedRoute> }/>
            <Route path="/summary" element={<ProtectedRoute><AppLayout><SummaryPage /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/employees" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
