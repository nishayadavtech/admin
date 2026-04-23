import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "./api";

const AUTH_STORAGE_KEY = "auth_user";
const AUTH_EVENT = "auth-updated";

export const MODULE_DEFINITIONS = {
  dashboard: { key: "dashboard", label: "Dashboard", route: "/dashboard" },
  role: { key: "role", label: "Role", route: "/role" },
  users: { key: "users", label: "Users", route: "/users" },
  userprofile: { key: "userprofile", label: "User Profile", route: "/userprofile" },
  course: { key: "course", label: "Courses", route: "/course" },
  subjects: { key: "subjects", label: "Subjects", route: "/subjects" },
  syllabus: { key: "syllabus", label: "Syllabus", route: "/syllabus" },
  "change-password": {
    key: "change-password",
    label: "Change Password",
    route: "/change-password",
  },
};

const DEFAULT_MODULES = ["dashboard", "userprofile", "change-password"];

const ROLE_PERMISSIONS = {
  admin: Object.keys(MODULE_DEFINITIONS),
  hr: ["dashboard", "users", "userprofile", "change-password"],
  accountant: ["dashboard", "course", "change-password"],
  ceo: ["dashboard", "users", "course", "subjects", "syllabus", "change-password"],
  it: ["dashboard", "course", "subjects", "syllabus", "change-password"],
  manager: ["dashboard", "course", "subjects", "syllabus", "change-password"],
  teacher: ["dashboard", "syllabus", "userprofile", "change-password"],
};

const broadcastAuthChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
};

const normalizeRoleName = (roleName) =>
  String(roleName || "")
    .trim()
    .toLowerCase();

export const decodeToken = (token) => {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
};

export const extractUserId = (payload = {}, loginResponse = {}) => {
  const possibleValues = [
    loginResponse.userid,
    loginResponse.userId,
    loginResponse.id,
    loginResponse.user?.userid,
    loginResponse.user?.userId,
    loginResponse.user?.id,
    payload.userid,
    payload.userId,
    payload.id,
    payload.sub,
  ];

  const matchedValue = possibleValues.find(
    (value) => value !== undefined && value !== null && value !== ""
  );

  return matchedValue ? String(matchedValue) : "";
};

export const buildAllowedModules = (roles = []) => {
  const collectedModules = new Set(DEFAULT_MODULES);

  roles.forEach((roleName) => {
    const normalized = normalizeRoleName(roleName);
    const permissions = ROLE_PERMISSIONS[normalized] || [];
    permissions.forEach((permission) => collectedModules.add(permission));
  });

  return Array.from(collectedModules);
};

export const isAdminUser = (roles = []) =>
  roles.some((roleName) => normalizeRoleName(roleName) === "admin");

export const hasModuleAccess = (auth, moduleKey) => {
  if (!moduleKey) return true;
  if (!auth?.token) return false;
  if (isAdminUser(auth.roles)) return true;
  return (auth.allowedModules || []).includes(moduleKey);
};

export const getDefaultRoute = (auth) => {
  const allowedModules = auth?.allowedModules || DEFAULT_MODULES;
  const firstVisibleModule = allowedModules.find(
    (moduleKey) => MODULE_DEFINITIONS[moduleKey]?.route
  );
  return MODULE_DEFINITIONS[firstVisibleModule || "dashboard"].route;
};

export const getStoredAuth = () => {
  const token = localStorage.getItem("token") || "";
  const rawAuth = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!token && !rawAuth) {
    return { token: "", userid: "", roles: [], allowedModules: [], user: null };
  }

  try {
    const parsedAuth = rawAuth ? JSON.parse(rawAuth) : {};
    const resolvedToken = parsedAuth.token || token;
    const decoded = decodeToken(resolvedToken);
    const userid = parsedAuth.userid || extractUserId(decoded, parsedAuth);
    const roles = Array.isArray(parsedAuth.roles) ? parsedAuth.roles : [];

    return {
      token: resolvedToken,
      user: parsedAuth.user || null,
      userid,
      roles,
      allowedModules:
        Array.isArray(parsedAuth.allowedModules) && parsedAuth.allowedModules.length > 0
          ? parsedAuth.allowedModules
          : buildAllowedModules(roles),
    };
  } catch (error) {
    return {
      token,
      user: null,
      userid: extractUserId(decodeToken(token), {}),
      roles: [],
      allowedModules: buildAllowedModules([]),
    };
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem(AUTH_STORAGE_KEY);
  broadcastAuthChange();
};

export const storeAuthSession = ({ token, user = null, userid = "", roles = [] }) => {
  const safeRoles = Array.isArray(roles) ? roles : [];
  const authData = {
    token,
    user,
    userid,
    roles: safeRoles,
    allowedModules: buildAllowedModules(safeRoles),
  };

  localStorage.setItem("token", token || "");
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  broadcastAuthChange();

  return authData;
};

const fetchRoleNames = async (userid, token) => {
  if (!userid || !token) return [];

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  try {
    const [assignedRolesResponse, rolesResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/roleassign/userroles/${userid}`, authHeaders),
      axios.get(`${API_BASE_URL}/role/viewrole`, authHeaders),
    ]);

    const assignedRoleIds = Array.isArray(assignedRolesResponse.data)
      ? assignedRolesResponse.data.map((roleId) => String(roleId))
      : [];
    const roles = Array.isArray(rolesResponse.data) ? rolesResponse.data : [];

    return roles
      .filter((role) => assignedRoleIds.includes(String(role.rid)))
      .map((role) => role.rname)
      .filter(Boolean);
  } catch (error) {
    return [];
  }
};

export const hydrateAuthSession = async (loginResponse = {}) => {
  const token = loginResponse.token || localStorage.getItem("token") || "";
  if (!token) {
    clearAuthSession();
    return null;
  }

  const decoded = decodeToken(token);
  const userid = extractUserId(decoded, loginResponse);
  const roles = await fetchRoleNames(userid, token);

  return storeAuthSession({
    token,
    user: loginResponse.user || null,
    userid,
    roles,
  });
};

export const useAuthSession = () => {
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [loading, setLoading] = useState(() => Boolean(getStoredAuth().token));

  useEffect(() => {
    let active = true;

    const syncAuth = async () => {
      const storedAuth = getStoredAuth();

      if (!active) return;

      if (!storedAuth.token) {
        setAuth(storedAuth);
        setLoading(false);
        return;
      }

      if (storedAuth.roles.length > 0) {
        setAuth(storedAuth);
        setLoading(false);
        return;
      }

      setLoading(true);
      const hydratedAuth = await hydrateAuthSession(storedAuth);

      if (!active) return;

      setAuth(hydratedAuth || getStoredAuth());
      setLoading(false);
    };

    syncAuth();

    const handleAuthChange = () => {
      setAuth(getStoredAuth());
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener(AUTH_EVENT, handleAuthChange);

    return () => {
      active = false;
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener(AUTH_EVENT, handleAuthChange);
    };
  }, []);

  return { auth, loading };
};
