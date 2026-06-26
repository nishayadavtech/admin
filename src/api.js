// import axios from "axios";

// import.meta.env.VITE_API_URL;

// export const api = axios.create({
//   baseURL: API_BASE_URL,
// });

// export const getAuthHeaders = () => {
//   const token = localStorage.getItem("token");
//   return token ? { Authorization: `Bearer ${token}` } : {};
// };

// export const getImageUrl = (path) => {
//   if (!path) return "";
//   if (path.startsWith("http://") || path.startsWith("https://")) {
//     return path;
//   }
//   return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
// };


import axios from "axios";

export const API_BASE_URL = process.env.REACT_APP_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};