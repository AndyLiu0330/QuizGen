const API_BASE = "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// Materials
export function listMaterials() {
  return request("/materials");
}

export function uploadMaterial(file) {
  const formData = new FormData();
  formData.append("file", file);
  return fetch(`${API_BASE}/materials/upload`, { method: "POST", body: formData }).then(
    async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(err.detail);
      }
      return res.json();
    }
  );
}

export function deleteMaterial(id) {
  return request(`/materials/${id}`, { method: "DELETE" });
}

// Sessions
export function listSessions() {
  return request("/sessions");
}

export function createSession(materialId) {
  return request("/sessions", {
    method: "POST",
    body: JSON.stringify({ material_id: materialId }),
  });
}

export function getSession(id) {
  return request(`/sessions/${id}`);
}

// Quizzes
export function generateQuiz(sessionId, numQuestions, difficulty) {
  return request("/quizzes", {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      num_questions: numQuestions,
      difficulty,
    }),
  });
}

export function getQuiz(id) {
  return request(`/quizzes/${id}`);
}

export function submitQuiz(id, answers) {
  return request(`/quizzes/${id}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export function deleteQuiz(id) {
  return fetch(`${API_BASE}/quizzes/${id}`, { method: "DELETE" }).then((res) => {
    if (!res.ok) {
      return res.json().catch(() => ({ detail: "Delete failed" })).then((err) => {
        throw new Error(err.detail);
      });
    }
  });
}

export function retakeQuiz(id) {
  return request(`/quizzes/${id}/retake`, { method: "POST" });
}
