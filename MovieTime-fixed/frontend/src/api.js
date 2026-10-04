// const API_BASE = "http://localhost:4000";
// async function request(path, opts = {}) {
//   const headers = opts.headers || {};
//   const token = localStorage.getItem("token");
//   if (token) headers["Authorization"] = "Bearer " + token;
//   const res = await fetch(API_BASE + path, { ...opts, headers });
//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(text || res.statusText);
//   }
//   return res.json();
// }
// export async function getMovies() {
//   return request("/api/movies");
// }
// export async function signup(data) {
//   return request("/api/auth/signup", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   });
// }
// export async function login(data) {
//   return request("/api/auth/login", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   });
// }
// export async function getBookings() {
//   return request("/api/bookings");
// }
// export async function createBooking(data) {
//   return request("/api/bookings", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   });
// }
// export async function deleteBooking(id) {
//   return request("/api/bookings/" + id, { method: "DELETE" });
// }

















const API_BASE = "http://localhost:4000";

async function request(path, opts = {}) {

  const headers = {
    ...(opts.headers || {})
  };

  const token = localStorage.getItem("token");

  if (token) {
    headers.Authorization =
      "Bearer " + token;
  }

  const res = await fetch(
    API_BASE + path,
    {
      ...opts,
      headers
    }
  );

  if (!res.ok) {

    let message = "Request failed";

    try {

      const data = await res.json();

      message =
        data.message ||
        message;

    } catch {}

    throw new Error(message);
  }

  return res.json();
}


export function getMovies() {
  return request("/api/movies");
}


export function getShows(movieId, date) {

  return request(
    `/api/movies/${movieId}/shows?date=${date}`
  );
}


export function getShowSeats(showId) {

  return request(
    `/api/movies/show/${showId}/seats`
  );
}


export function lockSeats(showId, seats) {

  return request(
    "/api/bookings/lock",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        showId,
        seats
      })
    }
  );
}


export function confirmBooking(showId, seats) {

  return request(
    "/api/bookings/confirm",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        showId,
        seats
      })
    }
  );
}


export function getBookings() {

  return request(
    "/api/bookings"
  );
}


export function deleteBooking(id) {

  return request(
    "/api/bookings/" + id,
    {
      method: "DELETE"
    }
  );
}


export function signup(data) {

  return request(
    "/api/auth/signup",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(data)
    }
  );
}


export function login(data) {

  return request(
    "/api/auth/login",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(data)
    }
  );
}