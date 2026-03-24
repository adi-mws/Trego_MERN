// src/api/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // cookies are automatically sent
});

/**
 * Generic function to make API requests.
 * @param {string} method - HTTP method ('get', 'post', etc.)
 * @param {string} url - API endpoint
 * @param {object} data - Request body (for POST, PUT)
 * @param {object} params - Query params (for GET)
 * @param {boolean} isFormData - Form Data? (for Content-Type: multipart/form-data)
 * @returns {object} { success, data, error, status }
 */
export const callApi = async ({ method = 'get', url, data = null, params = null, isFormData = false }) => {
  try {
    const headers = {};

    // If sending FormData, let Axios handle the multipart boundary
    if (isFormData) headers['Content-Type'] = 'multipart/form-data';

    const response = await API({
      method,
      url,
      data,
      params,
      headers,
    });

    return {
      success: true,
      data: response.data,
      status: response.status,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      data: err.response?.data || null,
      status: err.response?.status || 500,
      error: err.response?.data || err.message,
    };
  }
};
