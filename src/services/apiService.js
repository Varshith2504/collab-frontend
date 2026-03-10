const BASE_URL = "http://localhost:8080";

// ─── STUDENT ───────────────────────────────────────────────
export const registerStudent = async (student) => {
  const res = await fetch(`${BASE_URL}/students/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });
  return res.json();
};

export const loginStudent = async (email, password) => {
  try {
    const res = await fetch(`${BASE_URL}/students/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

// ─── PROJECTS ──────────────────────────────────────────────
export const getAllProjects = async () => {
  const res = await fetch(`${BASE_URL}/projects`);
  return res.json();
};

export const createProject = async (project) => {
  const res = await fetch(`${BASE_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });
  return res.json();
};

export const deleteProject = async (id) => {
  await fetch(`${BASE_URL}/projects/${id}`, { method: "DELETE" });
};

// ─── JOIN REQUESTS ─────────────────────────────────────────
export const sendJoinRequest = async (projectId, request) => {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return res.json();
};

export const getJoinRequests = async (projectId) => {
  const res = await fetch(`${BASE_URL}/projects/${projectId}/requests`);
  return res.json();
};

export const acceptRequest = async (projectId, request) => {
  await fetch(`${BASE_URL}/projects/${projectId}/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
};

export const rejectRequest = async (projectId, request) => {
  await fetch(`${BASE_URL}/projects/${projectId}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
};

// ─── TEAM ──────────────────────────────────────────────────
export const joinTeam = async (studentId, projectId) => {
  const res = await fetch(`${BASE_URL}/team/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, projectId }),
  });
  return res.json();
};