import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import { useState } from "react";
export default function AppLayout({ children }) {

  const [toast, setToast] = useState(null);

  return (
    <>
     {/* Navbar */}
      <Navbar />

       {/* Toast appears below Navbar */}
      {toast && (
        <Toast message={toast} onClose={() => setToast(null)} />
      )}

      {/* Main Content */}      
      <main className="max-w-6xl mx-auto p-6">
        {children}
      </main>
    </>
  );
}
