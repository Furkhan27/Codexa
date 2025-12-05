import React, { useState } from "react";
import {  useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
interface AuthFormData {
  name?: string;
  email: string;
  password: string;
  confirm_password?: string;
}

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
    const navigate = useNavigate();
    const {setToken} = useAuth();
  const [formData, setFormData] = useState<AuthFormData>({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {

     if (formData.password !== formData.confirm_password) {
        alert("Passwords do not match");
        return;
      }
      console.log("Signing up with data:", formData);
      const response = await fetch("http://localhost:8000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirm_password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(data.detail || "Signup failed");
        return;
      }

      setToken(data.token);
      navigate("/")
    } catch (error) {
      console.error("Signup Error:", error);
      alert("Something went wrong during signup.");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Login failed");
        return;
      }

      setToken(data.token);
      alert("Login successful!");
      console.log("Logged in user:", data);
      navigate("/")
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong during login.");
    }
  };

  return (
    <div className="w-full h-screen bg-[#0d0f16] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl shadow-blue-500/5">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white text-2xl font-bold">N</span>
          </div>
        </div>

        <h2 className="text-center text-3xl font-bold text-white mb-2">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>

        <p className="text-center text-gray-400 mb-8">
          {mode === "login"
            ? "Sign in to continue building amazing apps."
            : "Create your NexusAI account to get started."}
        </p>

        {/* FORM START */}
        <form
          className="space-y-5"
          onSubmit={mode === "login" ? handleLoginSubmit : handleSignUpSubmit}
        >
          {mode === "signup" && (
            <div>
              <label className="text-gray-300 text-sm">Full Name</label>
              <input
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="w-full mt-1 bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-blue-500 transition"
              />
            </div>
          )}

          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input
              name="email"
              type="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full mt-1 bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-blue-500 transition"
            />
          </div>
          {mode === "signup" && (
            <div>
            <label className="text-gray-300 text-sm">Confirm Password</label>
            <input
              name="confirm_password"
              type="password"
              placeholder="••••••••"
              value={formData.confirm_password}
              onChange={handleChange}
              className="w-full mt-1 bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-blue-500 transition"
            />
          </div>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/20 hover:opacity-90 transition"
          >
            {mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>
        {/* FORM END */}

        <div className="text-center mt-6 text-gray-400">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-blue-400 hover:text-blue-300"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-blue-400 hover:text-blue-300"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
