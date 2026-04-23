import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import axios from "axios";
import { motion } from "framer-motion";

export default function Role() {
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ rid: "", rname: "" });

  const fetchRoles = async () => {
    try {
      const res = await axios.get("http://localhost:5500/role/viewrole");
      setRoles(res.data);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5500/role/addrole", form);
      setForm({ rid: "", rname: "" });
      alert("Role added successfully!");
      fetchRoles();
    } catch (err) {
      console.error("Error adding role:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cardStyle = {
    borderRadius: "14px",
    border: "none",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
    background: "white",
  };

  const headerStyle = {
    background: "linear-gradient(135deg, #3498db 0%, #2c3e50 100%)",
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    fontSize: "16px",
    padding: "12px",
    border: "none",
    borderRadius: "14px 14px 0 0",
  };

  const tableHeaderStyle = {
    background: "linear-gradient(135deg, #3498db 0%, #2c3e50 100%)",
    color: "white",
    fontSize: "13px",
    fontWeight: "600",
  };

  return (
    <div
      className="container py-3"
      style={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        minHeight: "100vh",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-3"
      >
        <h2 className="fw-bold text-dark mb-1" style={{ fontSize: "24px" }}>
          Role Management
        </h2>
      </motion.div>
      <div className="row g-3">
        
        {/* Add Role Form */}
        <div className="col-md-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card style={cardStyle}>
              <Card.Header style={headerStyle}>Add New Role</Card.Header>
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formrId">
                    <Form.Label
                      className="fw-semibold"
                      style={{ color: "#2c3e50", fontSize: "14px" }}
                    >
                      Role ID
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="rid"
                      placeholder="Enter Role ID"
                      value={form.rid}
                      onChange={handleChange}
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0",
                        padding: "10px",
                        fontSize: "14px",
                      }}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formrname">
                    <Form.Label
                      className="fw-semibold"
                      style={{ color: "#2c3e50", fontSize: "14px" }}
                    >
                      Role Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="rname"
                      placeholder="Enter Role Name"
                      value={form.rname}
                      onChange={handleChange}
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0",
                        padding: "10px",
                        fontSize: "14px",
                      }}
                      required
                    />
                  </Form.Group>

                  <div className="text-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="primary"
                        type="submit"
                        style={{
                          background:
                            "linear-gradient(135deg, #3498db 0%, #2c3e50 100%)",
                          border: "none",
                          borderRadius: "8px",
                          padding: "10px 30px",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        Add Role
                      </Button>
                    </motion.div>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </motion.div>
        </div>

        {/* Roles Table */}
        <div className="col-md-7">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card style={cardStyle}>
              <Card.Header style={headerStyle}>All Roles</Card.Header>
              <Card.Body className="p-0">
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <Table
                    hover
                    responsive
                    className="mb-0"
                    style={{ tableLayout: "fixed" }}
                  >
                    <colgroup>
                      <col style={{ width: "40%" }} />
                      <col style={{ width: "60%" }} />
                    </colgroup>
                    <thead style={tableHeaderStyle}>
                      <tr>
                        <th
                          style={{
                            padding: "12px 8px",
                            fontSize: "13px",
                            textAlign: "center",
                          }}
                        >
                          Role ID
                        </th>
                        <th
                          style={{
                            padding: "12px 8px",
                            fontSize: "13px",
                            textAlign: "center",
                          }}
                        >
                          Role Name
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map((values, index) => (
                        <motion.tr
                          key={values.rid}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{
                            backgroundColor: "rgba(52, 152, 219, 0.1)",
                            transition: { duration: 0.2 },
                          }}
                          style={{
                            cursor: "pointer",
                            borderBottom: "1px solid #f0f0f0",
                          }}
                        >
                          <td
                            style={{
                              padding: "12px 8px",
                              fontWeight: "500",
                              fontSize: "13px",
                              color: "#2c3e50",
                              textAlign: "center",
                              wordWrap: "break-word",
                            }}
                          >
                            {values.rid}
                          </td>
                          <td
                            style={{
                              padding: "12px 8px",
                              fontWeight: "500",
                              fontSize: "13px",
                              color: "#2c3e50",
                              textAlign: "center",
                              wordWrap: "break-word",
                            }}
                          >
                            {values.rname}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                {roles.length === 0 && (
                  <div className="text-center py-5">
                    <p className="text-muted" style={{ fontSize: "14px" }}>
                      No roles found
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-3 text-center"
      >
        <p className="text-muted" style={{ fontSize: "12px" }}>
          Total Roles: {roles.length} | Last updated:{" "}
          {new Date().toLocaleString()}
        </p>
      </motion.div>
    </div>
  );
}
