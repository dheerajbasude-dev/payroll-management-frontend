import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate("/employees");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen w-full 
        flex items-center justify-center
        bg-gradient-to-br from-gray-900 via-gray-800 to-black
        dark:bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]
        dark:from-black dark:via-gray-900 dark:to-gray-800
        relative overflow-hidden
      "
    >
      {/* Animated gradient circles */}
      <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-blue-600/20 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-purple-600/20 blur-[120px] animate-pulse"></div>

      {/* LOGIN CARD */}
      <Card
        className="
          w-[90%] max-w-md
          backdrop-blur-xl bg-white/10 dark:bg-white/5 
          border border-white/20 dark:border-white/10
          shadow-2xl rounded-2xl
          animate-fadeIn
        "
      >
        <CardHeader>
          <CardTitle className="text-center text-3xl font-semibold text-white tracking-wide">
            Welcome Back
          </CardTitle>
          <p className="text-center text-gray-300 text-sm mt-1">
            Sign in to continue
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          {error && (
            <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg">
              {error}
            </p>
          )}

          {/* USERNAME */}
          <div>
            <label className="text-gray-200 text-sm mb-1 block">
              Username
            </label>
            <Input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="
                bg-white/10 dark:bg-white/10 
                text-white placeholder-gray-300
                border-white/20 focus-visible:ring-blue-500
              "
              placeholder="Enter your username"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-gray-200 text-sm mb-1 block">
              Password
            </label>
            <Input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="
                bg-white/10 dark:bg-white/10
                text-white placeholder-gray-300
                border-white/20 focus-visible:ring-blue-500
              "
              placeholder="Enter your password"
            />
          </div>

          {/* LOGIN BUTTON */}
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={loading}
            className="
              w-full py-3 text-lg font-medium
              bg-blue-600 hover:bg-blue-700
              dark:bg-blue-700 dark:hover:bg-blue-800
              transition rounded-xl
            "
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
