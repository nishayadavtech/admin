import React, { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { MdDelete, MdEdit } from "react-icons/md";
import { BsPlusCircle } from "react-icons/bs";
import { Button, Modal, Form, Card, Table, Pagination, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { api } from "./api";

const emptyForm = {
  syllabus_id: "",
  course_id: "",
  subject_id: "",
  topic_name: "",
  description: "",
};

const syllabusPerPage = 6;

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

const Syllabus = () => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [syllabusData, setSyllabusData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState(emptyForm);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [syllabusResponse, courseResponse, subjectResponse] = await Promise.all([
        api.get("/syllabus/getAll"),
        api.get("/course/getallcourses"),
        api.get("/subjects/viewsubjects"),
      ]);

      setSyllabusData(Array.isArray(syllabusResponse.data) ? syllabusResponse.data : []);
      setCourses(Array.isArray(courseResponse.data) ? courseResponse.data : []);
      setSubjects(Array.isArray(subjectResponse.data) ? subjectResponse.data : []);
    } catch (error) {
      console.error("Error fetching syllabus data:", error);
      setSyllabusData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(syllabusData.length / syllabusPerPage));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [syllabusData, currentPage]);

  const paginatedSyllabus = useMemo(() => {
    const startIndex = (currentPage - 1) * syllabusPerPage;
    return [...syllabusData]
      .sort((a, b) => compareNaturalIds(a.syllabus_id, b.syllabus_id))
      .slice(startIndex, startIndex + syllabusPerPage);
  }, [syllabusData, currentPage]);

  const totalPages = Math.ceil(syllabusData.length / syllabusPerPage);

  const courseMap = useMemo(
    () =>
      courses.reduce((acc, course) => {
        acc[course.course_id] = course.course_name;
        return acc;
      }, {}),
    [courses]
  );

  const subjectMap = useMemo(
    () =>
      subjects.reduce((acc, subject) => {
        acc[subject.subject_id] = subject.subject_name;
        return acc;
      }, {}),
    [subjects]
  );

  const resetForm = () => {
    setFormData(emptyForm);
    setEditing(false);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "syllabus_id" || name === "course_id" || name === "subject_id"
          ? normalizeIdValue(value)
          : value,
    }));
  };

  const handleEdit = (syllabus) => {
    setEditing(true);
    setFormData({
      syllabus_id: syllabus.syllabus_id || "",
      course_id: syllabus.course_id || "",
      subject_id: syllabus.subject_id || "",
      topic_name: syllabus.topic_name || "",
      description: syllabus.description || "",
    });
    setShowModal(true);
  };

  const handleSaveSyllabus = async (e) => {
    e.preventDefault();

    if (
      !formData.syllabus_id ||
      !formData.course_id ||
      !formData.subject_id ||
      !formData.topic_name ||
      !formData.description
    ) {
      Swal.fire("Error", "Please fill all fields", "error");
      return;
    }

    try {
      setSaving(true);
      if (editing) {
        await api.put(`/syllabus/update/${formData.syllabus_id}`, formData);
      } else {
        await api.post("/syllabus/addSyllabus", formData);
      }

      await Swal.fire(
        "Success",
        editing ? "Syllabus updated successfully." : "Syllabus added successfully.",
        "success"
      );
      closeModal();
      fetchInitialData();
    } catch (error) {
      console.error("Error saving syllabus:", error);
      Swal.fire("Error", "Failed to save syllabus", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (syllabus_id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This syllabus will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/syllabus/delete/${syllabus_id}`);
      Swal.fire("Deleted!", "Syllabus deleted successfully.", "success");
      fetchInitialData();
    } catch (error) {
      console.error("Error deleting syllabus:", error);
      Swal.fire("Error", "Failed to delete syllabus", "error");
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
    fontSize: "13px",
    fontWeight: "600",
  };

  return (
    <div
      className="container-fluid py-3"
      style={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        minHeight: "100vh",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <h2 className="fw-bold text-dark mb-1 text-center" style={{ fontSize: "28px" }}>
          Syllabus Management
        </h2>
      </motion.div>

      <Card style={cardStyle}>
        <Card.Header style={headerStyle}>
          <div className="d-flex justify-content-between align-items-center">
            <span>All Syllabus</span>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="light"
                size="sm"
                onClick={openAddModal}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "white",
                  fontWeight: "500",
                }}
              >
                <BsPlusCircle className="me-1" />
                Add Syllabus
              </Button>
            </motion.div>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div style={{ minHeight: "360px" }}>
            <Table hover responsive className="mb-0" style={{ tableLayout: "fixed" }}>
              <thead style={tableHeaderStyle}>
                <tr>
                  <th style={{ padding: "10px 6px", fontSize: "12px" }}>Syllabus ID</th>
                  <th style={{ padding: "10px 6px", fontSize: "12px" }}>Course</th>
                  <th style={{ padding: "10px 6px", fontSize: "12px" }}>Subject</th>
                  <th style={{ padding: "10px 6px", fontSize: "12px" }}>Topic Name</th>
                  <th style={{ padding: "10px 6px", fontSize: "12px" }}>Description</th>
                  <th style={{ padding: "10px 6px", fontSize: "12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                    </td>
                  </tr>
                ) : paginatedSyllabus.length > 0 ? (
                  paginatedSyllabus.map((syllabus, index) => (
                    <motion.tr
                      key={syllabus.syllabus_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.08 }}
                      whileHover={{
                        backgroundColor: "rgba(52, 152, 219, 0.1)",
                        transition: { duration: 0.2 },
                      }}
                      style={{ borderBottom: "1px solid #f0f0f0" }}
                    >
                      <td style={{ padding: "10px 6px", fontWeight: "500", fontSize: "12px" }}>
                        {syllabus.syllabus_id}
                      </td>
                      <td style={{ padding: "10px 6px", fontWeight: "500", fontSize: "12px" }}>
                        {courseMap[syllabus.course_id] || syllabus.course_id}
                      </td>
                      <td style={{ padding: "10px 6px", fontWeight: "500", fontSize: "12px" }}>
                        {subjectMap[syllabus.subject_id] || syllabus.subject_id}
                      </td>
                      <td style={{ padding: "10px 6px", fontWeight: "500", fontSize: "12px" }}>
                        {syllabus.topic_name}
                      </td>
                      <td style={{ padding: "10px 6px", fontWeight: "500", fontSize: "12px" }}>
                        <div style={{ maxHeight: "40px", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {syllabus.description}
                        </div>
                      </td>
                      <td style={{ padding: "10px 6px" }}>
                        <div className="d-flex gap-2 justify-content-center">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEdit(syllabus)}
                              style={{
                                border: "1px solid #3498db",
                                color: "#3498db",
                                padding: "4px 8px",
                                fontSize: "11px",
                              }}
                            >
                              <MdEdit />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(syllabus.syllabus_id)}
                              style={{
                                border: "1px solid #e74c3c",
                                color: "#e74c3c",
                                padding: "4px 8px",
                                fontSize: "11px",
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
                    <td colSpan="6" className="text-center py-5">
                      <h5 className="text-muted">No syllabus found</h5>
                      <p className="text-muted">Add your first syllabus to get started</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {totalPages > 1 && (
        <div
          className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2 px-1"
          style={{ position: "sticky", bottom: "0", background: "transparent", zIndex: 2 }}
        >
          <small className="text-muted">
            Showing {(currentPage - 1) * syllabusPerPage + 1}-
            {Math.min(currentPage * syllabusPerPage, syllabusData.length)} of{" "}
            {syllabusData.length}
          </small>
          <Pagination className="mb-0">
            <Pagination.First
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }, (_, index) => (
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-3 text-center"
      >
        <p className="text-muted" style={{ fontSize: "12px" }}>
          Total Syllabus: {syllabusData.length} | Last updated: {new Date().toLocaleString()}
        </p>
      </motion.div>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header
          closeButton
          style={{
            background: "linear-gradient(135deg, #3498db 0%, #2c3e50 100%)",
            color: "white",
          }}
        >
          <Modal.Title>{editing ? "Update Syllabus" : "Add New Syllabus"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveSyllabus}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label className="fw-semibold" style={{ color: "#2c3e50", fontSize: "14px" }}>
                  Syllabus ID
                </Form.Label>
                <Form.Control
                  type="text"
                  name="syllabus_id"
                  placeholder="Enter Syllabus ID"
                  value={formData.syllabus_id}
                  onChange={handleChange}
                  disabled={editing}
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label className="fw-semibold" style={{ color: "#2c3e50", fontSize: "14px" }}>
                  Course
                </Form.Label>
                <Form.Select name="course_id" value={formData.course_id} onChange={handleChange}>
                  <option value="">Select course</option>
                  {[...courses]
                    .sort((a, b) => compareNaturalIds(a.course_id, b.course_id))
                    .map((course) => (
                    <option key={course.course_id} value={course.course_id}>
                      {course.course_name} ({course.course_id})
                    </option>
                    ))}
                </Form.Select>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label className="fw-semibold" style={{ color: "#2c3e50", fontSize: "14px" }}>
                  Subject
                </Form.Label>
                <Form.Select name="subject_id" value={formData.subject_id} onChange={handleChange}>
                  <option value="">Select subject</option>
                  {[...subjects]
                    .filter((subject) =>
                      formData.course_id ? subject.course_id === formData.course_id : true
                    )
                    .sort((a, b) => compareNaturalIds(a.subject_id, b.subject_id))
                    .map((subject) => (
                      <option key={subject.subject_id} value={subject.subject_id}>
                        {subject.subject_name} ({subject.subject_id})
                      </option>
                    ))}
                </Form.Select>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label className="fw-semibold" style={{ color: "#2c3e50", fontSize: "14px" }}>
                  Topic Name
                </Form.Label>
                <Form.Control
                  type="text"
                  name="topic_name"
                  placeholder="Enter Topic Name"
                  value={formData.topic_name}
                  onChange={handleChange}
                />
              </div>
              <div className="col-12 mb-3">
                <Form.Label className="fw-semibold" style={{ color: "#2c3e50", fontSize: "14px" }}>
                  Description
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  placeholder="Enter Description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="text-end">
              <Button variant="outline-secondary" className="me-2" onClick={closeModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : editing ? "Update Syllabus" : "Add Syllabus"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Syllabus;
