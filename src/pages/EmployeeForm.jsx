import React, { useEffect, useState } from "react";
import { createEmployeeApi, getEmployeeApi, updateEmployeeApi } from "../api/employees";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

// ⭐ shadcn UI components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    designation: "",
    rating: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingEmployee, setLoadingEmployee] = useState(false);
  const [error, setError] = useState("");

  // -------------------------------
  // Load employee on edit
  // -------------------------------
  useEffect(() => {
    if (!id) return;

    setLoadingEmployee(true);
    getEmployeeApi(id)
      .then((res) => {
        const emp = res.data;
        setForm({
          name: emp.name ?? "",
          age: emp.age ?? "",
          gender: emp.gender ?? "",
          designation: emp.designation ?? "",
          rating: emp.rating ?? "",
        });
      })
      .catch(() => {})
      .finally(() => setLoadingEmployee(false));
  }, [id]);

  // -------------------------------
  // Save handler (NO full reload)
  // -------------------------------
  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (id) {
        await updateEmployeeApi(id, form);
      } else {
        await createEmployeeApi(form);
      }

      // Refresh employee list without page reload
      queryClient.invalidateQueries(["employees"]);

      navigate("/employees");

    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      
      <h2 className="text-3xl font-semibold mb-6">
        {id ? "Edit Employee" : "Add Employee"}
      </h2>

      <Card className="shadow rounded-2xl">
        <CardContent className="p-6">

          {/* Loading skeleton for edit mode */}
          {loadingEmployee && (
            <p className="text-gray-500 text-sm mb-3">Loading employee details...</p>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <form onSubmit={save} className="space-y-5">

            {/* Name */}
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Age */}
            <div>
              <Label>Age</Label>
              <Input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                required
              />
            </div>

            {/* Gender */}
            <div>
              <Label>Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(value) => setForm({ ...form, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Designation */}
            <div>
              <Label>Designation</Label>
              <Select
                value={form.designation}
                onValueChange={(value) => setForm({ ...form, designation: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Software Developer">Software Developer</SelectItem>
                  <SelectItem value="Senior Developer">Senior Developer</SelectItem>
                  <SelectItem value="Tech Lead">Tech Lead</SelectItem>
                  <SelectItem value="Architect">Architect</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Senior Manager">Senior Manager</SelectItem>
                  <SelectItem value="Delivery Head">Delivery Head</SelectItem>
                </SelectContent>
              </Select>
              {/* <Input
                value={form.designation}
                onChange={(e) =>
                  setForm({ ...form, designation: e.target.value })
                }
                required
              /> */}
            </div>

            {/* Rating */}
            <div>
              <Label>Rating</Label>
              <Select
                value={form.rating}
                onValueChange={(value) => setForm({ ...form, rating: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
              {/* <Input
                type="number"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                required
              />*/
              }
            </div> 

            {/* Save button */}
            <Button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl font-medium"
            >
              {loading ? "Saving..." : "Save"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
