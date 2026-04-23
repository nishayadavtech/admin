import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, Spinner, Badge } from "react-bootstrap";
import { Chart } from "react-google-charts";
import { motion } from "framer-motion";
import {
  RiUserFollowLine,
  RiUserUnfollowLine,
  RiGroupLine,
  RiTeamLine,
  RiBookOpenLine,
} from "react-icons/ri";
import "bootstrap/dist/css/bootstrap.min.css";
import { api, getAuthHeaders } from "./api";
import { hasModuleAccess, useAuthSession } from "./auth";

const shellStyle = {
  minHeight: "100vh",
  padding: "24px",
  background:
    "radial-gradient(circle at top left, rgba(14, 165, 233, 0.12), transparent 28%), linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%)",
};

const cardShell = {
  border: "1px solid rgba(148, 163, 184, 0.18)",
  borderRadius: "22px",
  background: "rgba(255,255,255,0.96)",
  boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
  overflow: "hidden",
};

const KPI_DEFINITIONS = [
  {
    key: "totalUsers",
    label: "Total Users",
    helper: "All registered users",
    icon: <RiGroupLine />,
    accent: "#0f172a",
    tint: "linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%)",
  },
  {
    key: "activeUsers",
    label: "Active Users",
    helper: "Currently active users",
    icon: <RiUserFollowLine />,
    accent: "#0f766e",
    tint: "linear-gradient(135deg, #ccfbf1 0%, #f0fdfa 100%)",
  },
  {
    key: "inactiveUsers",
    label: "Inactive Users",
    helper: "Users not active right now",
    icon: <RiUserUnfollowLine />,
    accent: "#b45309",
    tint: "linear-gradient(135deg, #fef3c7 0%, #fff7ed 100%)",
  },
  {
    key: "teacherCount",
    label: "Total Teachers",
    helper: "Assigned teacher role users",
    icon: <RiTeamLine />,
    accent: "#2563eb",
    tint: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)",
  },
  {
    key: "courseCount",
    label: "Total Courses",
    helper: "Courses available in module",
    icon: <RiBookOpenLine />,
    accent: "#7c3aed",
    tint: "linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)",
  },
];

const safeArray = (value) => (Array.isArray(value) ? value : []);

const toStatusMap = (data) => {
  if (Array.isArray(data)) {
    return data.reduce((acc, item) => {
      acc[String(item.status || "").toLowerCase()] = Number(item.total || 0);
      return acc;
    }, {});
  }

  return Object.entries(data || {}).reduce((acc, [key, value]) => {
    acc[String(key).toLowerCase()] = Number(value || 0);
    return acc;
  }, {});
};

const getRoleIdsByName = (roles, matcher) =>
  roles
    .filter((role) => matcher(String(role?.rname || "").toLowerCase()))
    .map((role) => String(role.rid));

const MetricCard = ({ item, loading, value }) => (
  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
    <Card style={{ ...cardShell, background: item.tint, minHeight: "126px" }}>
      <Card.Body className="p-3 d-flex flex-column justify-content-between">
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div>
            <div
              style={{
                color: "#0f172a",
                fontWeight: 800,
                fontSize: "13px",
                letterSpacing: "0.01em",
              }}
            >
              {item.label}
            </div>
            <div style={{ color: "#64748b", fontSize: "11px", marginTop: "6px" }}>
              {item.helper}
            </div>
          </div>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "13px",
              display: "grid",
              placeItems: "center",
              background: "rgba(255,255,255,0.85)",
              color: item.accent,
              fontSize: "18px",
              boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
            }}
          >
            {item.icon}
          </div>
        </div>
        <div style={{ marginTop: "10px" }}>
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>
              {value}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  </motion.div>
);

export default function Dashboard() {
  const { auth } = useAuthSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    teacherCount: 0,
    courseCount: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!auth?.token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const authHeaders = { headers: getAuthHeaders() };
        const canViewUsers = hasModuleAccess(auth, "users");
        const canViewCourses = hasModuleAccess(auth, "course");
        const canViewRoles = hasModuleAccess(auth, "role");

        const [usersResponse, rolesResponse, userStatusResponse, coursesResponse] =
          await Promise.all([
            canViewUsers ? api.get("/users/viewitem", authHeaders) : Promise.resolve({ data: [] }),
            canViewUsers || canViewRoles
              ? api.get("/role/viewrole", authHeaders)
              : Promise.resolve({ data: [] }),
            canViewUsers
              ? api.get("/users/getusercount", authHeaders)
              : Promise.resolve({ data: [] }),
            canViewCourses
              ? api.get("/course/getallcourses")
              : Promise.resolve({ data: [] }),
          ]);

        const users = safeArray(usersResponse.data);
        const roles = safeArray(rolesResponse.data);
        const courses = safeArray(coursesResponse.data);
        const statusMap = toStatusMap(userStatusResponse.data);
        const teacherRoleIds = getRoleIdsByName(
          roles,
          (roleName) => roleName.includes("teacher")
        );

        let teacherCount = 0;

        if (canViewUsers && teacherRoleIds.length > 0 && users.length > 0) {
          const userRoleResponses = await Promise.all(
            users.map((user) =>
              api
                .get(`/roleassign/userroles/${user.userid}`, authHeaders)
                .then((response) => safeArray(response.data).map((item) => String(item)))
                .catch(() => [])
            )
          );

          teacherCount = userRoleResponses.filter((assignedIds) =>
            assignedIds.some((roleId) => teacherRoleIds.includes(roleId))
          ).length;
        }

        setMetrics({
          totalUsers: users.length,
          activeUsers: statusMap.active || 0,
          inactiveUsers: statusMap.inactive || 0,
          teacherCount,
          courseCount: courses.length,
        });
      } catch (fetchError) {
        console.error("Error fetching dashboard data:", fetchError);
        setError("Dashboard data load nahi ho paaya.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [auth]);

  const cards = KPI_DEFINITIONS.map((item) => ({
    ...item,
    value: metrics[item.key] || 0,
  }));

  const chartData = useMemo(
    () => [
      ["Metric", "Count"],
      ["Active", metrics.activeUsers],
      ["Inactive", metrics.inactiveUsers],
      ["Teachers", metrics.teacherCount],
      ["Courses", metrics.courseCount],
    ],
    [metrics]
  );

  return (
    <Container fluid style={shellStyle}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="mb-4"
      >
        <div
          style={{
            ...cardShell,
            padding: "22px 24px",
            background:
              "linear-gradient(135deg, rgba(14,165,233,0.95) 0%, rgba(15,23,42,0.98) 100%)",
            color: "#fff",
          }}
        >
          <Row className="align-items-center g-4">
            <Col lg={8}>
              <div
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  opacity: 0.78,
                  marginBottom: "8px",
                }}
              >
                Dashboard
              </div>
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800 }}>
                Overview
              </h2>
              {/* <p style={{ margin: "10px 0 0", color: "rgba(255,255,255,0.82)" }}>
                {isAdminUser(auth.roles)
                  // ? "Admin ke liye sirf important summary metrics dikh rahe hain."
                  : "Aapke dashboard par sirf useful summary metrics dikh rahe hain."}
              </p> */}
            </Col>
            <Col lg={4}>
              <div
                style={{
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.12)",
                  padding: "14px 16px",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "11px", opacity: 0.72 }}>System Total</div>
                <div style={{ fontSize: "28px", fontWeight: 800, lineHeight: 1.1 }}>
                  {loading ? "..." : metrics.totalUsers}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.76)" }}>
                  Registered users
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </motion.div>

      <Row className="g-3 mb-4">
        {cards.map((item) => (
          <Col xs={12} md={6} xl={4} key={item.key}>
            <MetricCard item={item} value={item.value} loading={loading} />
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card style={cardShell}>
            <Card.Header
              style={{
                padding: "16px 20px",
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                color: "#0f172a",
                borderBottom: "1px solid #e2e8f0",
                fontWeight: 800,
              }}
            >
              Metrics Summary
            </Card.Header>
            <Card.Body style={{ padding: "20px 18px 10px" }}>
              {loading ? (
                <div className="py-5 text-center">
                  <Spinner animation="border" />
                </div>
              ) : (
                <Chart
                  chartType="BarChart"
                  width="100%"
                  height="260px"
                  data={chartData}
                  options={{
                    backgroundColor: "transparent",
                    legend: { position: "none" },
                    chartArea: {
                      left: 85,
                      right: 20,
                      top: 18,
                      bottom: 24,
                      width: "80%",
                      height: "78%",
                    },
                    colors: ["#14b8a6"],
                    bars: "horizontal",
                    hAxis: {
                      minValue: 0,
                      textStyle: { color: "#475569", fontSize: 12 },
                    },
                    vAxis: {
                      textStyle: { color: "#475569", fontSize: 12 },
                    },
                  }}
                />
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card style={cardShell}>
            <Card.Header
              style={{
                padding: "16px 20px",
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                color: "#0f172a",
                borderBottom: "1px solid #e2e8f0",
                fontWeight: 800,
              }}
            >
              Status Snapshot
            </Card.Header>
            <Card.Body style={{ padding: "22px" }}>
              {loading ? (
                <div className="py-5 text-center">
                  <Spinner animation="border" />
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  <div
                    style={{
                      borderRadius: "18px",
                      padding: "14px 16px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    <div style={{ fontSize: "11px", color: "#166534", marginBottom: "6px" }}>
                      Active Users
                    </div>
                    <div style={{ fontSize: "22px", fontWeight: 800, color: "#14532d" }}>
                      {metrics.activeUsers}
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: "18px",
                      padding: "14px 16px",
                      background: "#fff7ed",
                      border: "1px solid #fed7aa",
                    }}
                  >
                    <div style={{ fontSize: "11px", color: "#9a3412", marginBottom: "6px" }}>
                      Inactive Users
                    </div>
                    <div style={{ fontSize: "22px", fontWeight: 800, color: "#7c2d12" }}>
                      {metrics.inactiveUsers}
                    </div>
                  </div>

                  <div className="pt-2 d-flex flex-wrap gap-2">
                    <Badge bg="success" pill>
                      Active {metrics.activeUsers}
                    </Badge>
                    <Badge bg="warning" text="dark" pill>
                      Inactive {metrics.inactiveUsers}
                    </Badge>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error ? (
        <div className="mt-4 text-center" style={{ color: "#dc2626", fontSize: "12px" }}>
          {error}
        </div>
      ) : null}
    </Container>
  );
}
