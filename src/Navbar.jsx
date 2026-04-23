import React, { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import ChangePassword from "./ChangePassword"; 
import { FaUserCircle, FaCog, FaKey, FaSignOutAlt } from "react-icons/fa";
import { clearAuthSession } from "./auth";

function Navbar({ height = "64px" }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false); 

  const handleLogout = () => {
    clearAuthSession();
    navigate("/");
  };

  return (
    <>
      <div
        style={{
          background: "linear-gradient(135deg, #3498db 0%, #2c3e50 100%)",
          color: "white",
          padding: "12px 20px",
          minHeight: height,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <h4 style={{ 
            margin: 0, 
            color: "white", 
            fontSize: "20px", 
            fontWeight: "600",
            letterSpacing: "0.5px"
          }}>
            Navbar
          </h4>
        </div>

        <Dropdown>
          <Dropdown.Toggle
            variant="none"
            id="dropdown-basic"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              fontWeight: "500",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.3s ease",
              cursor: "pointer"
            }}
            className="dropdown-toggle-custom"
          >
            <FaUserCircle style={{ fontSize: "16px" }} />
            Profile
          </Dropdown.Toggle>

          <Dropdown.Menu 
            align="end"
            style={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              padding: "8px",
              minWidth: "180px",
              marginTop: "8px"
            }}
          >
            <Dropdown.Item 
              onClick={() => setShowModal(true)}
              style={{
                padding: "10px 12px",
                fontSize: "14px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease"
              }}
              className="dropdown-item-custom"
            >
              <FaKey style={{ color: "#3498db", fontSize: "14px" }} />
              Change Password
            </Dropdown.Item>
            
            <Dropdown.Item 
              href="#/settings"
              style={{
                padding: "10px 12px",
                fontSize: "14px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease"
              }}
              className="dropdown-item-custom"
            >
              <FaCog style={{ color: "#3498db", fontSize: "14px" }} />
              Settings
            </Dropdown.Item>
            
            <Dropdown.Divider style={{ margin: "4px 0" }} />
            
            <Dropdown.Item 
              onClick={handleLogout}
              style={{
                padding: "10px 12px",
                fontSize: "14px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease",
                color: "#e74c3c"
              }}
              className="dropdown-item-custom"
            >
              <FaSignOutAlt style={{ color: "#e74c3c", fontSize: "14px" }} />
              Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* Change Password Modal */}
      <ChangePassword
        show={showModal}
        handleClose={() => setShowModal(false)}
      />

      <style>
        {`
          .dropdown-toggle-custom:hover {
            background: rgba(255, 255, 255, 0.25) !important;
            transform: translateY(-1px);
          }
          
          .dropdown-toggle-custom:focus {
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3) !important;
          }
          
          .dropdown-toggle-custom::after {
            margin-left: 8px;
          }
          
          .dropdown-item-custom:hover {
            background: rgba(52, 152, 219, 0.1) !important;
            color: #2c3e50 !important;
            transform: translateX(2px);
          }
          
          .dropdown-item-custom:active {
            background: rgba(52, 152, 219, 0.2) !important;
          }
        `}
      </style>
    </>
  );
}

export default Navbar;
