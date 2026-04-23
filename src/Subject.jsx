import React, { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BsPlusCircle } from "react-icons/bs";
import { MdDelete, MdEdit } from "react-icons/md";
import { motion } from "framer-motion";
import { Modal, Button, Card, Form, Table } from "react-bootstrap";
import { api, getImageUrl } from "./api";

const emptyForm = {
  subject_id: "",
  course_id: "",
  subject_name: "",
  description: "",
};

const normalizeImagePath = (value) => {
  if (!value) return "";
  const normalizedValue = String(value).replace(/\\/g, "/");

  if (
    normalizedValue.startsWith("http://") ||
    normalizedValue.startsWith("https://") ||
    normalizedValue.startsWith("/uploads/")
  ) {
    return normalizedValue;
  }

  if (normalizedValue.startsWith("uploads/")) {
    return `/${normalizedValue}`;
  }

  return `/uploads/${normalizedValue.replace(/^\/+/, "")}`;
};

const normalizeIdValue = (value) => String(value || "").toUpperCase().replace(/\s+/g, "");

const getIdSortParts = (value) => {
  const normalizedValue = normalizeIdValue(value);
  const match = normalizedValue.match(/^([A-Z]+)(\d+)$/);

  if (match) {
    return {
      prefix: match[1],
      number: Number(match[2]),
      raw: normalizedValue,
    };
  }

  return {
    prefix: normalizedValue,
    number: Number.POSITIVE_INFINITY,
    raw: normalizedValue,
  };
};

const compareNaturalIds = (first, second) => {
  const firstParts = getIdSortParts(first);
  const secondParts = getIdSortParts(second);

  if (firstParts.prefix !== secondParts.prefix) {
    return firstParts.prefix.localeCompare(secondParts.prefix);
  }

  if (firstParts.number !== secondParts.number) {
    return firstParts.number - secondParts.number;
  }

  return firstParts.raw.localeCompare(secondParts.raw);
};

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/subjects/viewsubjects");
      setSubjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      alert("Error fetching subjects");
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const sortedSubjects = useMemo(
    () =>
      [...subjects].sort((a, b) => {
        const courseCompare = compareNaturalIds(a.course_id, b.course_id);
        if (courseCompare !== 0) return courseCompare;

        return compareNaturalIds(a.subject_id, b.subject_id);
      }),
    [subjects]
  );

  const currentEditingSubject = useMemo(
    () => subjects.find((item) => item.subject_id === formData.subject_id),
    [subjects, formData.subject_id]
  );

  const handleChange = (e) =>
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.name === "subject_id" || e.target.name === "course_id"
          ? normalizeIdValue(e.target.value)
          : e.target.value,
    });

  const handleFileChange = (e) => setImage(e.target.files[0] || null);

  const resetForm = () => {
    setFormData(emptyForm);
    setImage(null);
    setEditing(false);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  const handleAddOpen = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (subject) => {
    setFormData({
      subject_id: subject.subject_id || "",
      course_id: subject.course_id || "",
      subject_name: subject.subject_name || "",
      description: subject.description || "",
    });
    setImage(null);
    setEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("subject_id", formData.subject_id);
    data.append("course_id", formData.course_id);
    data.append("subject_name", formData.subject_name);
    data.append("description", formData.description);
    if (image) data.append("image", image);

    try {
      if (editing) {
        try {
          await api.put(`/subjects/updatesubject/${formData.subject_id}`, data, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (updateError) {
          await api.post(`/subjects/updatesubject/${formData.subject_id}`, data, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      } else {
        await api.post("/subjects/addsubjects", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      alert(editing ? "Subject updated successfully!" : "Subject added successfully!");
      handleModalClose();
      fetchSubjects();
    } catch (err) {
      console.error(err);
      alert(editing ? "Error updating subject" : "Error adding subject");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;

    try {
      await api.delete(`/subjects/${id}`);
      fetchSubjects();
    } catch (err) {
      console.error(err);
      alert("Error deleting subject");
    }
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
    fontSize: "12px",
    fontWeight: "600",
  };

  return (
    <div
      className="container-fluid py-3"
      style={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        minHeight: "100vh",
        marginLeft: "0",
        paddingLeft: "15px",
        paddingRight: "15px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <h2
          className="fw-bold text-dark mb-1 text-center"
          style={{ fontSize: "28px" }}
        >
          Subject Management
        </h2>
      </motion.div>

      <Card style={cardStyle}>
        <Card.Header style={headerStyle}>
          <div className="d-flex justify-content-between align-items-center">
            <span>All Subjects</span>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="light"
                size="sm"
                onClick={handleAddOpen}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "white",
                  fontWeight: "500",
                }}
              >
                <BsPlusCircle className="me-1" />
                Add Subject
              </Button>
            </motion.div>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            <Table
              hover
              responsive
              className="mb-0"
              style={{
                tableLayout: "fixed",
                width: "95%",
                margin: "0 auto",
              }}
            >
              <colgroup>
                <col style={{ width: "7%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "31%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "12%" }} />
              </colgroup>
              <thead style={tableHeaderStyle}>
                <tr>
                  <th style={{ padding: "8px 4px", fontSize: "11px" }}>S.No</th>
                  <th style={{ padding: "8px 4px", fontSize: "11px" }}>
                    Subject ID
                  </th>
                  <th style={{ padding: "8px 4px", fontSize: "11px" }}>
                    Course ID
                  </th>
                  <th style={{ padding: "8px 4px", fontSize: "11px" }}>
                    Subject Name
                  </th>
                  <th style={{ padding: "8px 4px", fontSize: "11px" }}>
                    Description
                  </th>
                  <th style={{ padding: "8px 4px", fontSize: "11px" }}>Image</th>
                  <th style={{ padding: "8px 4px", fontSize: "11px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedSubjects.length > 0 ? (
                  sortedSubjects.map((sub, index) => (
                    <motion.tr
                      key={sub.subject_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{
                        backgroundColor: "rgba(52, 152, 219, 0.1)",
                        transition: { duration: 0.2 },
                      }}
                      style={{
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <td
                        style={{
                          padding: "8px 4px",
                          fontWeight: "600",
                          fontSize: "11px",
                          color: "#2c3e50",
                        }}
                      >
                        {index + 1}
                      </td>
                      <td
                        style={{
                          padding: "8px 4px",
                          fontWeight: "500",
                          fontSize: "11px",
                          color: "#2c3e50",
                        }}
                      >
                        {sub.subject_id}
                      </td>
                      <td
                        style={{
                          padding: "8px 4px",
                          fontWeight: "500",
                          fontSize: "11px",
                          color: "#2c3e50",
                        }}
                      >
                        {sub.course_id}
                      </td>
                      <td
                        style={{
                          padding: "8px 4px",
                          fontWeight: "500",
                          fontSize: "11px",
                          color: "#2c3e50",
                        }}
                      >
                        {sub.subject_name}
                      </td>
                      <td
                        style={{
                          padding: "8px 4px",
                          fontWeight: "500",
                          fontSize: "11px",
                          color: "#2c3e50",
                        }}
                      >
                        <div
                          style={{
                            maxHeight: "35px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            lineHeight: "1.2",
                          }}
                        >
                          {sub.description}
                        </div>
                      </td>
                      <td style={{ padding: "8px 4px" }}>
                        {sub.image || sub.image_url ? (
                          <img
                            src={getImageUrl(
                              normalizeImagePath(sub.image_url || sub.image)
                            )}
                            alt={sub.subject_name}
                            className="rounded"
                            style={{
                              width: "50px",
                              height: "35px",
                              objectFit: "cover",
                              border: "1px solid #3498db",
                            }}
                          />
                        ) : (
                          <div
                            className="rounded d-flex align-items-center justify-content-center"
                            style={{
                              width: "50px",
                              height: "35px",
                              background: "#ecf0f1",
                              border: "1px dashed #bdc3c7",
                              fontSize: "9px",
                            }}
                          >
                            No Image
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "8px 4px" }}>
                        <div className="d-flex gap-1 justify-content-center">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEdit(sub)}
                              style={{
                                padding: "2px 6px",
                                fontSize: "10px",
                              }}
                            >
                              <MdEdit />
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(sub.subject_id)}
                              style={{
                                border: "1px solid #e74c3c",
                                color: "#e74c3c",
                                padding: "2px 6px",
                                fontSize: "10px",
                              }}
                            >
                              <MdDelete />
                            </Button>
                          </motion.div>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <div
                        style={{
                          fontSize: "32px",
                          color: "#bdc3c7",
                          marginBottom: "8px",
                        }}
                      >
                        <BsPlusCircle />
                      </div>
                      <h6 className="text-muted">No subjects found</h6>
                      <p className="text-muted small">
                        Add your first subject to get started
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-3 text-center"
      >
        <p className="text-muted" style={{ fontSize: "12px" }}>
          Total Subjects: {subjects.length} | Last updated:{" "}
          {new Date().toLocaleString()}
        </p>
      </motion.div>

      <Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header
          closeButton
          style={{
            background: "linear-gradient(135deg, #3498db 0%, #2c3e50 100%)",
            color: "white",
          }}
        >
          <Modal.Title>{editing ? "Edit Subject" : "Add New Subject"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {[
              {
                name: "subject_id",
                label: "Subject ID",
                type: "text",
                required: true,
              },
              {
                name: "course_id",
                label: "Course ID",
                type: "text",
                required: false,
              },
              {
                name: "subject_name",
                label: "Subject Name",
                type: "text",
                required: true,
              },
            ].map((field) => (
              <Form.Group className="mb-3" key={field.name}>
                <Form.Label
                  className="fw-semibold"
                  style={{ color: "#2c3e50", fontSize: "14px" }}
                >
                  {field.label}
                </Form.Label>
                <Form.Control
                  type={field.type}
                  name={field.name}
                  placeholder={`Enter ${field.label}`}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  disabled={editing && field.name === "subject_id"}
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    padding: "10px",
                    fontSize: "14px",
                  }}
                />
              </Form.Group>
            ))}

            <Form.Group className="mb-3">
              <Form.Label
                className="fw-semibold"
                style={{ color: "#2c3e50", fontSize: "14px" }}
              >
                Description
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                placeholder="Enter subject description"
                value={formData.description}
                onChange={handleChange}
                required
                style={{
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  padding: "10px",
                  fontSize: "14px",
                  resize: "vertical",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label
                className="fw-semibold"
                style={{ color: "#2c3e50", fontSize: "14px" }}
              >
                Subject Image
              </Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                style={{
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  padding: "10px",
                  fontSize: "14px",
                }}
              />
              {editing &&
              (currentEditingSubject?.image_url || currentEditingSubject?.image) ? (
                <img
                  src={getImageUrl(
                    normalizeImagePath(
                      currentEditingSubject?.image_url || currentEditingSubject?.image
                    )
                  )}
                  alt="Current subject"
                  className="mt-3 rounded"
                  style={{
                    width: "110px",
                    height: "75px",
                    objectFit: "cover",
                    border: "1px solid #3498db",
                  }}
                />
              ) : null}
            </Form.Group>

            <div className="text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="submit"
                  variant="primary"
                  style={{
                    background:
                      "linear-gradient(135deg, #3498db 0%, #2c3e50 100%)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px 40px",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  {editing ? "Update Subject" : "Add Subject"}
                </Button>
              </motion.div>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Subjects;
