import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Modal, Button, Card, Row, Col, Form, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import { getImageUrl } from "./api";

const normalizeUploadPath = (value) => {
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

export default function UserProfile() {
  const { userid } = useParams();
  const [profiles, setProfiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    pid: "",
    userid: userid || "",
    qualification: "",
    aadhar: "",
    phone: "",
    pan_no: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
    email: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [aadharPhoto, setAadharPhoto] = useState(null);
  const [qualificationPhoto, setQualificationPhoto] = useState(null);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const url = userid
        ? `http://localhost:5500/userprofile/viewprofile/${userid}`
        : "http://localhost:5500/userprofile/viewprofile";
      const res = await axios.get(url);
      const data = Array.isArray(res.data) ? res.data : [];
      setProfiles(data);
    } catch (err) {
      console.error("Error fetching profiles:", err);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [userid]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.keys(form).forEach((key) => fd.append(key, form[key]));
      if (profilePhoto) fd.append("profile_photo", profilePhoto);
      if (aadharPhoto) fd.append("aadhar_profile_photo", aadharPhoto);
      if (qualificationPhoto)
        fd.append("qualification_photo", qualificationPhoto);

      await axios.post("http://localhost:5500/userprofile/addprofile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Profile added successfully!");
      setForm({
        pid: "",
        userid: userid || "",
        qualification: "",
        aadhar: "",
        phone: "",
        pan_no: "",
        address: "",
        state: "",
        city: "",
        pincode: "",
        email: "",
      });
      setProfilePhoto(null);
      setAadharPhoto(null);
      setQualificationPhoto(null);
      setShowModal(false);
      fetchProfiles();
    } catch (err) {
      console.error("Error adding profile:", err);
      alert("Error: " + (err.response?.data || err.message));
    }
  };

  const formatFieldName = (name) => {
    return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: "20px",
        margin: "0",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Main Content */}
      <div style={{ maxWidth: "100%", margin: "0" }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <div className="d-flex align-items-center justify-content-center mb-2">
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "10px",
              }}
            >
              <span style={{ fontSize: "18px", color: "white" }}>👤</span>
            </div>
            <div className="text-start">
              <h2 className="fw-bold text-dark mb-0">User Profiles</h2>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="d-flex justify-content-center mt-2"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setShowModal(true)}
                size="sm"
                style={{
                  background:
                    "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
                className="d-flex align-items-center gap-1"
              >
                <span>➕</span>
                Add Profile
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Add Profile Modal */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          size="lg"
          centered
          backdrop="static"
          scrollable
        >
          <Modal.Header
            closeButton
            style={{
              background: "linear-gradient(135deg, #007bff, #0056b3)",
              color: "#fff",
              border: "none",
            }}
          >
            <Modal.Title className="fw-bold">
              Create New User Profile
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <Form onSubmit={handleSubmit} className="row g-2">
              {[
                "pid",
                "userid",
                "qualification",
                "aadhar",
                "phone",
                "qualification",
                "pan_no",
                "address",
                "state",
                "city",
                "pincode",
                "email",
              ].map((name, idx) => (
                <div className="col-md-6" key={idx}>
                  <Form.Label className="fw-semibold text-dark mb-1 small">
                    {formatFieldName(name)}
                    {["userid", "email", "phone"].includes(name) && (
                      <span className="text-danger"> *</span>
                    )}
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type={name === "email" ? "email" : "text"}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={`Enter ${formatFieldName(name)}`}
                    required={["userid", "email", "phone"].includes(name)}
                    className="border-0 shadow-sm"
                    style={{
                      background: "#f8f9fa",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              ))}

              {/* File Upload Section */}
              <div className="col-12 mt-3">
                <div className="border-top pt-3">
                  <h6 className="fw-bold text-primary mb-2 small">
                    📁 Upload Documents
                  </h6>
                  <Row>
                    {[
                      {
                        label: "Profile Photo",
                        setter: setProfilePhoto,
                        accept: "image/*",
                      },
                      {
                        label: "Aadhar Card",
                        setter: setAadharPhoto,
                        accept: "image/*",
                      },
                      {
                        label: "Qualification",
                        setter: setQualificationPhoto,
                        accept: "image/*, .pdf",
                      },
                    ].map((file, idx) => (
                      <div className="col-md-4 mb-2" key={idx}>
                        <Form.Label className="fw-medium text-dark small">
                          {file.label}
                        </Form.Label>
                        <Form.Control
                          size="sm"
                          type="file"
                          onChange={(e) => file.setter(e.target.files[0])}
                          accept={file.accept}
                          className="border-0 shadow-sm"
                          style={{
                            background: "#f8f9fa",
                            borderRadius: "6px",
                            padding: "6px",
                            fontSize: "12px",
                          }}
                        />
                      </div>
                    ))}
                  </Row>
                </div>
              </div>

              <div className="text-center mt-3">
                <Button
                  type="submit"
                  size="sm"
                  style={{
                    background: "linear-gradient(135deg, #28a745, #218838)",
                    border: "none",
                    padding: "8px 24px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                  className="me-2"
                >
                  ✅ Submit
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-3">
            <div
              className="spinner-border text-primary"
              style={{ width: "1.5rem", height: "1.5rem" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted small">Loading profiles...</p>
          </div>
        )}

        {/* Profiles Grid - Compact Cards */}
        {!loading && (
          <div className="row g-3" style={{ margin: "0" }}>
            {profiles.length > 0 ? (
              profiles.map((p, i) => (
                <div className="col-xl-6 col-lg-12 mb-3" key={i}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  >
                    <Card
                      className="border-0 shadow-sm"
                      style={{
                        borderRadius: "12px",
                        background: "white",
                        transition: "all 0.3s ease",
                        height: "100%",
                      }}
                    >
                      <Card.Body className="p-3">
                        <Row>
                          {/* Profile Header */}
                          <div className="d-flex align-items-center mb-3">
                            {p.profile_photo ? (
                              <img
                                src={getImageUrl(
                                  normalizeUploadPath(p.profile_photo)
                                )}
                                alt="Profile"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                  borderRadius: "50%",
                                  border: "2px solid #007bff",
                                  marginRight: "12px",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  background:
                                    "linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)",
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginRight: "12px",
                                  border: "2px dashed #007bff",
                                }}
                              >
                                <span style={{ fontSize: "16px" }}>👤</span>
                              </div>
                            )}
                            <div className="flex-grow-1">
                              <h6 className="fw-bold text-dark mb-0 text-truncate">
                                {p.email}
                              </h6>
                              <div className="d-flex flex-wrap gap-1 mt-1">
                                <Badge bg="primary" className="fs-7">
                                  ID: {p.userid}
                                </Badge>
                                <Badge bg="success" className="fs-7">
                                  Active
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <Col md={6}>
                            <div className="mb-2">
                              <small className="text-muted d-block">
                                📱 Phone
                              </small>
                              <span className="fw-semibold">
                                {p.phone || "N/A"}
                              </span>
                            </div>
                            <div className="mb-2">
                              <small className="text-muted d-block">
                                📧 Email
                              </small>
                              <span className="fw-semibold text-truncate d-block">
                                {p.email}
                              </span>
                            </div>
                            <div className="mb-2">
                              <small className="text-muted d-block">
                                🎓 Qualification
                              </small>
                              <span className="fw-semibold">
                                {p.qualification || "N/A"}
                              </span>
                            </div>
                          </Col>

                          {/* Address Info */}
                          <Col md={6}>
                            <div className="mb-2">
                              <small className="text-muted d-block">
                                🏠 Address
                              </small>
                              <span className="fw-semibold small">
                                {p.address || "Not provided"}
                              </span>
                            </div>
                            <div className="mb-2">
                              <small className="text-muted d-block">
                                📍 City/State
                              </small>
                              <span className="fw-semibold">
                                {p.city || "N/A"}, {p.state || "N/A"}
                              </span>
                            </div>
                            <div className="mb-2">
                              <small className="text-muted d-block">
                                📮 Pincode
                              </small>
                              <span className="fw-semibold">
                                {p.pincode || "N/A"}
                              </span>
                            </div>
                          </Col>

                          {/* Documents Preview */}
                          <Col xs={12}>
                            <hr className="my-2" />
                            <small className="text-muted d-block mb-2">
                              📎 Documents
                            </small>
                            <div className="d-flex justify-content-around">
                              {[
                                { label: "Profile", src: p.profile_photo },
                                {
                                  label: "Aadhar",
                                  src: p.aadhar_profile_photo,
                                },
                                {
                                  label: "Qualification",
                                  src: p.qualification_photo,
                                },
                              ].map((img, j) => (
                                <div key={j} className="text-center">
                                  <small className="text-muted d-block mb-1">
                                    {img.label}
                                  </small>
                                  {img.src ? (
                                    <img
                                      src={getImageUrl(
                                        normalizeUploadPath(img.src)
                                      )}
                                      alt={img.label}
                                      style={{
                                        width: "45px",
                                        height: "45px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                        border: "2px solid #007bff",
                                        cursor: "pointer",
                                      }}
                                      onClick={() =>
                                        window.open(
                                          getImageUrl(
                                            normalizeUploadPath(img.src)
                                          ),
                                          "_blank"
                                        )
                                      }
                                    />
                                  ) : (
                                    <div
                                      className="border d-flex align-items-center justify-content-center rounded"
                                      style={{
                                        width: "45px",
                                        height: "45px",
                                        background: "#f8f9fa",
                                        borderStyle: "dashed",
                                        borderColor: "#dee2e6",
                                      }}
                                    >
                                      <small className="text-muted">-</small>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <motion.div
                  className="text-center py-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      background:
                        "linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 15px",
                    }}
                  >
                    <span style={{ fontSize: "35px" }}>📭</span>
                  </div>
                  <h5 className="text-secondary mb-2">No profiles found</h5>
                  <p className="text-muted mb-3 small">
                    Get started by creating your first user profile.
                  </p>
                  <Button
                    onClick={() => setShowModal(true)}
                    variant="primary"
                    size="sm"
                    style={{
                      padding: "8px 20px",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    Create First Profile
                  </Button>
                </motion.div>
              </div>
            )}
          </div>
        )}

        {/* Footer - Compact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="text-center mt-4 pt-3"
        >
          <div className="border-top pt-2">
            <small className="text-muted small">
              User Profiles • {new Date().getFullYear()} • Total:{" "}
              {profiles.length}
            </small>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
