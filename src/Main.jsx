import React from "react";
import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Role from "./Role";
import Users from "./Users";
import UserProfile from "./UserProfile";
import ChangePassword from "./ChangePassword";
import ProtectedRoute from "./ProtectedRoute";
import Course from "./Course";
import Subjects from "./Subject";
import Syllabus from "./Syllabus";
import "bootstrap/dist/css/bootstrap.min.css";

const Main = () => {
  const navbarHeight = "64px";

  return (
    <>
      <Navbar height={navbarHeight} />

      <div
        style={{
          display: "flex",
          minHeight: `calc(100vh - ${navbarHeight})`,
          backgroundColor: "#f8f9fa",
          alignItems: "stretch",
        }}
      >
        <Sidebar />
        {/* ===== Main Content Area ===== */}
        <div
          style={{
            flexGrow: 1,
            padding: "20px",
            minHeight: `calc(100vh - ${navbarHeight})`,
            height: `calc(100vh - ${navbarHeight})`,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredModule="dashboard">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/role"
              element={
                <ProtectedRoute requiredModule="role">
                  <Role />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredModule="users">
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/userprofile/:userid"
              element={
                <ProtectedRoute requiredModule="userprofile">
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course"
              element={
                <ProtectedRoute requiredModule="course">
                  <Course />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subjects"
              element={
                <ProtectedRoute requiredModule="subjects">
                  <Subjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/syllabus"
              element={
                <ProtectedRoute requiredModule="syllabus">
                  <Syllabus />
                </ProtectedRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute requiredModule="change-password">
                  <ChangePassword />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default Main;
