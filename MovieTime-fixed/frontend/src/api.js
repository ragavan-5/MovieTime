const API_BASE = "http://localhost:4000";
async function request(path, opts = {}) {
  const headers = opts.headers || {};
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = "Bearer " + token;
  const res = await fetch(API_BASE + path, { ...opts, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}
export async function getMovies() {
  return request("/api/movies");
}
export async function signup(data) {
  return request("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
export async function login(data) {
  return request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
export async function getBookings() {
  return request("/api/bookings");
}
export async function createBooking(data) {
  return request("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
export async function deleteBooking(id) {
  return request("/api/bookings/" + id, { method: "DELETE" });
}

