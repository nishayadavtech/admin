import React, { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Card, Table, Pagination, Form, Spinner } from "react-bootstrap";
import { FaTrashAlt, FaEdit, FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { api, getImageUrl } from "./api";

const emptyCourse = {
  course_id: "",
  course_name: "",
  description: "",
  duration: "",
  image: null,
  image_url: "",
};

const coursesPerPage = 5;

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

const Course = () => {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newCourse, setNewCourse] = useState(emptyCourse);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/course/getallcourses");
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(courses.length / coursesPerPage));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [courses, currentPage]);

  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * coursesPerPage;
    return [...courses]
      .sort((a, b) => compareNaturalIds(a.course_id, b.course_id))
      .slice(startIndex, startIndex + coursesPerPage);
  }, [courses, currentPage]);

  const totalPages = Math.ceil(courses.length / coursesPerPage);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setNewCourse((prev) => ({
      ...prev,
      [name]:
        name === "image"
          ? files?.[0] || null
          : name === "course_id"
          ? normalizeIdValue(value)
          : value,
    }));
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(false);
    setNewCourse(emptyCourse);
  };

  const openAddModal = () => {
    setEditing(false);
    setNewCourse(emptyCourse);
    setShowModal(true);
  };

  const editCourse = (course) => {
    setEditing(true);
    setNewCourse({
      course_id: course.course_id || "",
      course_name: course.course_name || "",
      description: course.description || "",
      duration: course.duration || "",
      image: null,
      image_url: course.image_url || "",
    });
    setShowModal(true);
  };

  const saveCourse = async () => {
    if (!newCourse.course_name || !newCourse.description || !newCourse.duration) {
      Swal.fire("Error", "Course ke sab required fields bharna zaroori hai.", "error");
      return;
    }

    if (!editing && !newCourse.course_id) {
      Swal.fire("Error", "Course ID required hai.", "error");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("course_id", newCourse.course_id);
      formData.append("course_name", newCourse.course_name);
      formData.append("description", newCourse.description);
      formData.append("duration", newCourse.duration);

      if (newCourse.image) {
        formData.append("image", newCourse.image);
      }

      if (editing) {
        try {
          await api.put(`/course/updatecourse/${newCourse.course_id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (updateError) {
          // Some backends accept file upload only on POST even for update routes.
          await api.post(`/course/updatecourse/${newCourse.course_id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      } else {
        await api.post("/course/addcourse", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await Swal.fire(
        "Success",
        editing ? "Course updated successfully." : "Course added successfully.",
        "success"
      );
      closeModal();
      fetchCourses();
    } catch (err) {
      console.error("Error saving course:", err);
      Swal.fire(
        "Error",
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Course save nahi ho paaya.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteCourse = async (id) => {
    const result = await Swal.fire({
      title: "Delete course?",
      text: "Ye course permanently remove ho jayega.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/course/deletecourse/${id}`);
      await Swal.fire("Deleted", "Course deleted successfully.", "success");
      fetchCourses();
    } catch (err) {
      console.error("Error deleting course:", err);
      Swal.fire("Error", "Course delete nahi ho paaya.", "error");
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
      >
        <h2 className="fw-bold text-dark mb-3 text-center">Course Management</h2>
      </motion.div>

      <Card style={cardStyle}>
        <Card.Header style={headerStyle}>
          <div className="d-flex justify-content-between align-items-center">
            <span>All Courses</span>
            <Button variant="light" size="sm" onClick={openAddModal}>
              <FaPlus className="me-1" /> Add Course
            </Button>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div style={{ minHeight: "390px" }}>
            <Table hover responsive className="mb-0" style={{ tableLayout: "fixed" }}>
              <thead style={tableHeaderStyle}>
                <tr>
                  <th>S.No</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Duration</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                    </td>
                  </tr>
                ) : paginatedCourses.length > 0 ? (
                  paginatedCourses.map((course, index) => (
                    <tr key={course.course_id}>
                      <td>{(currentPage - 1) * coursesPerPage + index + 1}</td>
                      <td>{course.course_id}</td>
                      <td>{course.course_name}</td>
                      <td style={{ maxWidth: "220px" }}>{course.description}</td>
                      <td>{course.duration}</td>
                      <td>
                        {course.image_url ? (
                          <img
                            src={getImageUrl(course.image_url)}
                            alt={course.course_name}
                            style={{
                              width: "70px",
                              height: "50px",
                              borderRadius: "6px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          "No Image"
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => editCourse(course)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => deleteCourse(course.course_id)}
                          >
                            <FaTrashAlt />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No courses found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
          <small className="text-muted">
            Showing {(currentPage - 1) * coursesPerPage + 1}-
            {Math.min(currentPage * coursesPerPage, courses.length)} of {courses.length}
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
                active={currentPage === index + 1}
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
          Total Courses: {courses.length} | Last updated: {new Date().toLocaleString()}
        </p>
      </motion.div>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Update Course" : "Add New Course"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            {!editing && (
              <Form.Control
                type="text"
                name="course_id"
                className="mb-3"
                placeholder="Course ID"
                value={newCourse.course_id}
                onChange={handleChange}
              />
            )}

            <Form.Control
              type="text"
              name="course_name"
              className="mb-3"
              placeholder="Course Name"
              value={newCourse.course_name}
              onChange={handleChange}
            />

            <Form.Control
              as="textarea"
              name="description"
              className="mb-3"
              placeholder="Description"
              value={newCourse.description}
              onChange={handleChange}
            />

            <Form.Control
              type="text"
              name="duration"
              className="mb-3"
              placeholder="Duration"
              value={newCourse.duration}
              onChange={handleChange}
            />

            <Form.Control type="file" name="image" className="mb-2" onChange={handleChange} />

            {editing && newCourse.image_url && (
              <img
                src={getImageUrl(newCourse.image_url)}
                alt="Current course"
                className="mt-2 rounded"
                style={{ width: "120px", border: "2px solid #3498db" }}
              />
            )}
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={saveCourse} disabled={saving}>
            {saving ? "Saving..." : editing ? "Update" : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Course;
