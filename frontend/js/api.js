const API_BASE_URL = "http://localhost:5000/api";

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  let response;

  try {
    response = await fetch(url, config);
  } catch (error) {
    throw new Error("Unable to connect to the server. Please check if the backend is running.");
  }

  const data = await parseResponse(response);

  if (!response.ok || data.success === false) {
    throw createApiError(data, response.status);
  }

  return data;
}

function postData(endpoint, data, options = {}) {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
    ...options,
  });
}

function postDataWithAuth(endpoint, data, options = {}) {
  return postData(endpoint, data, {
    ...options,
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      ...options.headers,
    },
  });
}

function putDataWithAuth(endpoint, data, options = {}) {
  return apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
    ...options,
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      ...options.headers,
    },
  });
}

function deleteDataWithAuth(endpoint, options = {}) {
  return apiRequest(endpoint, {
    method: "DELETE",
    ...options,
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      ...options.headers,
    },
  });
}

function getData(endpoint, options = {}) {
  return apiRequest(endpoint, {
    method: "GET",
    ...options,
  });
}

function getDataWithAuth(endpoint, options = {}) {
  return getData(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      ...options.headers,
    },
  });
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return {
    success: response.ok,
    message: await response.text(),
  };
}

function createApiError(data, status) {
  const error = new Error(data.message || `API request failed with status ${status}`);
  error.status = status;
  error.errors = data.errors || [];
  error.data = data;
  return error;
}
