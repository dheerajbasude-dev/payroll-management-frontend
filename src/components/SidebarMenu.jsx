import React from "react";
import { Link } from "react-router-dom";

export default function SidebarMenu({ mobile }) {
  return (
    <div className={`flex flex-col gap-4 ${mobile ? "" : "p-5"}`}>
      <Link className="nav-link text-lg" to="/employees">Employees</Link>
      <Link className="nav-link text-lg" to="/payrolls">Payrolls</Link>
      <Link className="nav-link text-lg" to="/summary">Summary</Link>
    </div>
  );
}
