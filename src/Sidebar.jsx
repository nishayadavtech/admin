import React from "react";
import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { RiDashboardHorizontalLine, RiLogoutCircleRFill } from "react-icons/ri";
import { SlControlEnd } from "react-icons/sl";
import { FaUserCircle } from "react-icons/fa";
import { MdOutlineSubject } from "react-icons/md";
import { SiDiscourse, SiCoursera } from "react-icons/si";
import { clearAuthSession, hasModuleAccess, useAuthSession } from "./auth";

function Sidebar() {
  const navbarHeight = "64px";
  const location = useLocation();
  const { auth } = useAuthSession();

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: <RiDashboardHorizontalLine />, module: "dashboard" },
    { to: "/role", label: "Role", icon: <SlControlEnd />, module: "role" },
    { to: "/users", label: "Users", icon: <FaUserCircle />, module: "users" },
    { to: "/subjects", label: "Subject", icon: <MdOutlineSubject />, module: "subjects" },
    { to: "/course", label: "Courses", icon: <SiDiscourse />, module: "course" },
    { to: "/syllabus", label: "Syllabus", icon: <SiCoursera />, module: "syllabus" },
    // { to: "/change-password", label: "Change Password", icon: <ImProfile />, module: "change-password" },
    { to: "/", label: "Logout", icon: <RiLogoutCircleRFill />, action: () => clearAuthSession() },
  ];
  const visibleLinks = links.filter((link) =>
    link.module ? hasModuleAccess(auth, link.module) : true
  );

  return (
 <div
  className="d-flex flex-column"
   style={{
  //      width: "240px",
  //      background: "linear-gradient(135deg, #3498db 0%, #2c3e50 100%)",
  //      borderRight: "1px solid #ddd",
  //      boxShadow: "4px 0 15px rgba(0,0,0,0.1)"
          width: "240px",
    minWidth: "240px",
    maxWidth: "240px",
    flexShrink: 0,
    minHeight: `calc(100vh - ${navbarHeight})`,
    height: `calc(100vh - ${navbarHeight})`,
    background: "linear-gradient(135deg, #3498db 0%, #2c3e50 100%)",
    borderRight: "1px solid #ddd",
    boxShadow: "4px 0 15px rgba(0,0,0,0.1)",
    overflow: "hidden",

   }}
>
     <Nav
        className="flex-column p-2 gap-1 fs-6 flex-grow-1"
        style={{ paddingTop: "0px", overflowY: "auto" }}
      >
        {visibleLinks.map((link, index) => (
          <Nav.Item key={index}>
            <Nav.Link
              as={Link}
              to={link.to}
              onClick={link.action}
              className={`d-flex align-items-center gap-2 sidebar-link ${
                location.pathname === link.to ? "active-link" : ""
              }`}
              style={{
                padding: "10px 12px",
                borderRadius: "6px",
                marginBottom: "2px",
                transition: "all 0.3s ease"
              }}
            >
              <span 
                className="icon d-flex align-items-center justify-content-center"
                style={{
                  width: "24px",
                  height: "24px",
                  fontSize: "16px",
                  transition: "all 0.3s ease"
                }}
              >
                {link.icon}
              </span>
              <span style={{ fontSize: "13px", fontWeight: "500" }}>{link.label}</span>
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {/* Sidebar Footer */}
      <div className="p-2 border-top" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
        <div className="text-center">
          <small className="text-light opacity-75" style={{ fontSize: "10px" }}>
           
          </small>
        </div>
      </div>

      <style>
        {`
          .sidebar-link {
            color: rgba(255, 255, 255, 0.9) !important;
            text-decoration: none;
            transition: all 0.3s ease;
          }
          
          .sidebar-link:hover {
            background: rgba(255, 255, 255, 0.15) !important;
            transform: translateX(3px);
            color: white !important;
          }
          
          .active-link {
            background: rgba(255, 255, 255, 0.25) !important;
            font-weight: 600;
            color: white !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          }
          
          .active-link .icon {
            color: #3498db !important;
            transform: scale(1.1);
          }
          
          .sidebar-link:hover .icon {
            transform: scale(1.1);
            color: #3498db !important;
          }
          
          .icon {
            color: rgba(255, 255, 255, 0.8) !important;
            transition: all 0.3s ease;
          }
        `}
      </style>
    </div>
  );
}

export default Sidebar;


