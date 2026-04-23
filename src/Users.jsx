import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal, Table, Pagination, Form, Card } from "react-bootstrap";
import { MdEdit, MdDelete, MdAssignment } from "react-icons/md";
import { HiUserAdd } from "react-icons/hi";
import axios from "axios";
import Swal from "sweetalert2";
import { Formik, Form as FormikForm, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Users() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUserRoles, setSelectedUserRoles] = useState([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // ----- Fetch Users -----
  const getUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5500/users/viewitem", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error("Error fetching users:", err.response?.data || err.message);
    }
  };

  // ----- Fetch Roles -----
  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5500/role/viewrole", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(res.data);
    } catch (err) {
      console.error("Error fetching roles:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    getUsers();
    fetchRoles();
  }, []);

  // ====== ROLE ASSIGN HANDLERS ======
  const handleRoleModalShow = async (user) => {
    if (!user || !user.userid) return;
    setSelectedUser(user);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5500/roleassign/userroles/${user.userid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const rolesData = Array.isArray(res.data)
        ? res.data.map((r) => r.toString())
        : [];
      setSelectedUserRoles(rolesData);
    } catch (err) {
      console.error("Error fetching user roles:", err.response?.data || err.message);
      Swal.fire("Error", "Failed to fetch user roles", "error");
    }
    setShowRoleModal(true);
  };

  const handleRoleModalClose = () => {
    setShowRoleModal(false);
    setSelectedUser(null);
    setSelectedUserRoles([]);
  };

  const handleRoleToggle = (rid) => {
    if (!roles || roles.length === 0) return;

    const roleName = roles.find((r) => r.rid.toString() === rid.toString())?.rname;

    if (roleName === "Admin") {
      setSelectedUserRoles([rid.toString()]);
    } else {
      const isAdminAssigned = selectedUserRoles.some(
        (r) =>
          roles.find((roleObj) => roleObj.rid.toString() === r)?.rname === "Admin"
      );

      if (isAdminAssigned) {
        Swal.fire("Error", "Admin role cannot have other roles.", "error");
        return;
      }

      setSelectedUserRoles((prev) =>
        prev.includes(rid.toString())
          ? prev.filter((id) => id !== rid.toString())
          : [...prev, rid.toString()]
      );
    }
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5500/roleassign/assign",
        { userid: selectedUser.userid, rid: selectedUserRoles },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Success", "Roles assigned successfully", "success");
      handleRoleModalClose();
      getUsers();
    } catch (err) {
      console.error("Assign Role Error:", err.response?.data || err);
      Swal.fire(
        "Error",
        err.response?.data?.error || "Failed to assign roles",
        "error"
      );
    }
  };

  // ====== ADD / EDIT USER ======
  const handleClose = () => {
    setShow(false);
    setEditId(null);
  };

  const handleShow = (user = null) => {
    setEditId(user ? user.userid : null);
    setShow(true);
  };

  const handleDelete = async (userid) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this action!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`http://localhost:5500/users/deleteitem/${userid}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire("Deleted!", "User has been deleted.", "success");
          getUsers();
        } catch (err) {
          Swal.fire(
            "Error!",
            err.response?.data?.message || "Failed to delete user.",
            "error"
          );
        }
      }
    });
  };

  // ====== VALIDATION ======
  const validationSchema = Yup.object({
    userid: Yup.string().required("Userid is required"),
    username: Yup.string().required("Username is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
    phone: Yup.string(),
  });

  // ====== PAGINATION ======
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = data.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(data.length / usersPerPage);

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
    fontSize: "14px",
    fontWeight: "600",
  };

  // ====== RENDER ======
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
          User Management
        </h2>
      </motion.div>

      <Card style={cardStyle}>
        <Card.Header style={headerStyle}>
          <div className="d-flex justify-content-between align-items-center">
            <span>User Data</span>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="light"
                size="sm"
                onClick={() => handleShow()}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "white",
                  fontWeight: "500",
                }}
              >
                <HiUserAdd className="me-1" />
                Add User
              </Button>
            </motion.div>
          </div>
        </Card.Header>

        {/* ====== USER TABLE ====== */}
        <Card.Body className="p-0">
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            <Table hover responsive className="mb-0" style={{ tableLayout: "fixed" }}>
              <thead style={tableHeaderStyle}>
                <tr>
                  <th>User ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((item, index) => (
                  <motion.tr
                    key={item.userid}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <td>
                      <Button
                        variant="link"
                        onClick={() => navigate(`/userprofile/${item.userid}`)}
                        style={{
                          padding: "0",
                          color: "#3498db",
                          fontWeight: "500",
                          textDecoration: "none",
                        }}
                      >
                        {item.userid}
                      </Button>
                    </td>
                    <td>{item.username}</td>
                    <td>{item.email}</td>
                    <td>
                      <div className="d-flex align-items-center justify-content-center">
                        <label
                          className="custom-switch-wrapper users-status-switch"
                          title={item.status || "Unknown"}
                        >
                          <input
                            type="checkbox"
                            checked={String(item.status || "").toLowerCase() === "active"}
                            readOnly
                          />
                          <span className="custom-switch-slider" />
                        </label>
                      </div>
                    </td>
                    <td>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => handleRoleModalShow(item)}
                      >
                        <MdAssignment className="me-1" />
                        Assign Role
                      </Button>
                    </td>
                    <td>
                      <div className="d-flex gap-1 justify-content-center">
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => handleShow(item)}
                        >
                          <MdEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(item.userid)}
                        >
                          <MdDelete />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </Table>
          </div>

          {currentUsers.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted">No users found</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* ===== PAGINATION ===== */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.First
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            />
            {[...Array(totalPages)].map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === currentPage}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}

      {/* ===== ROLE MODAL ===== */}
      <Modal show={showRoleModal} onHide={handleRoleModalClose} centered>
        <Modal.Header closeButton style={{ background: "#3498db", color: "white" }}>
          <Modal.Title>
            Assign Roles {selectedUser ? `to ${selectedUser.username}` : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Role ID</th>
                <th>Role Name</th>
                <th>Assign</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.rid}>
                  <td>{role.rid}</td>
                  <td>{role.rname}</td>
                  <td className="text-center">
                    <Form.Check
                      type="checkbox"
                      checked={selectedUserRoles.includes(role.rid.toString())}
                      onChange={() => handleRoleToggle(role.rid)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleRoleModalClose}>
            Close
          </Button>
          <Button variant="success" onClick={handleSaveRoles}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== ADD/EDIT MODAL ===== */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton style={{ background: "#3498db", color: "white" }}>
          <Modal.Title>{editId ? "Edit User" : "Add User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{
              userid: editId
                ? data.find((u) => u.userid === editId)?.userid || ""
                : "",
              username: editId
                ? data.find((u) => u.userid === editId)?.username || ""
                : "",
              email: editId
                ? data.find((u) => u.userid === editId)?.email || ""
                : "",
              password: "",
              phone: editId
                ? data.find((u) => u.userid === editId)?.phone || ""
                : "",
            }}
            validationSchema={validationSchema}
            enableReinitialize
            onSubmit={async (values, { resetForm }) => {
              try {
                const token = localStorage.getItem("token");
                if (editId) {
                  await axios.put(
                    `http://localhost:5500/users/user/${editId}`,
                    values,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  Swal.fire("Updated!", "User updated successfully.", "success");
                } else {
                  await axios.post(
                    "http://localhost:5500/users/additem",
                    values,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  Swal.fire("Added!", "New user added successfully.", "success");
                }
                handleClose();
                getUsers();
                resetForm();
              } catch (err) {
                console.error("User add/edit error:", err);
                Swal.fire("Error!", "Something went wrong.", "error");
              }
            }}
          >
            {() => (
              <FormikForm>
                <div className="mb-3">
                  <label>User ID</label>
                  <Field type="text" name="userid" className="form-control" />
                  <ErrorMessage name="userid" component="div" className="text-danger small" />
                </div>
                <div className="mb-3">
                  <label>Username</label>
                  <Field type="text" name="username" className="form-control" />
                  <ErrorMessage name="username" component="div" className="text-danger small" />
                </div>
                <div className="mb-3">
                  <label>Email</label>
                  <Field type="email" name="email" className="form-control" />
                  <ErrorMessage name="email" component="div" className="text-danger small" />
                </div>
                <div className="mb-3">
                  <label>Password</label>
                  <Field type="password" name="password" className="form-control" />
                  <ErrorMessage name="password" component="div" className="text-danger small" />
                </div>
                <div className="mb-3">
                  <label>Phone</label>
                  <Field type="text" name="phone" className="form-control" />
                </div>
                <div className="text-center">
                  <Button variant="primary" type="submit">
                    {editId ? "Update User" : "Add User"}
                  </Button>
                </div>
              </FormikForm>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Users;
