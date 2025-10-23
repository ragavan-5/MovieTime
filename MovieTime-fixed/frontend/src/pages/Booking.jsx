import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createBooking, getBookings } from "../api";

const localMovies = [
  { id: "m1", title: "Ambuli", poster: "/posters/ambuli.jpg" },
  {
    id: "m2",
    title: "The Pursuit of Happyness",
    poster: "/posters/happyness.jpg",
  },
  {
    id: "m3",
    title: "The Shawshank Redemption",
    poster: "/posters/shawshank.png",
  },
];

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const movie = useMemo(
    () =>
      localMovies.find((m) => String(m.id) === String(id)) || {
        id,
        title: "Unknown",
        poster: "/posters/poster1.svg",
      },
    [id]
  );

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selected, setSelected] = useState([]);

  const toggleSeat = (s) =>
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  const handleConfirm = async () => {
    if (!date || !time || selected.length === 0) {
      alert("Choose date, time and at least one seat.");
      return;
    }
    try {
      await createBooking({ movieId: movie.id, date, time, seats: selected });
      alert("Booked");
      navigate("/");
    } catch (e) {
      alert("Booking failed: " + (e.message || e));
    }
  };

  const rows = ["A", "B", "C", "D", "E"],
    cols = [1, 2, 3, 4];
  const [taken, setTaken] = useState([]);
  useEffect(() => {
    getBookings()
      .then((bs) =>
        setTaken(
          bs
            .filter((b) => String(b.movie_id) === String(movie.id))
            .flatMap((b) => b.seats)
        )
      )
      .catch(() => {});
  }, [movie.id]);

  return (
    <div className="booking-page">
      <div className="booking-left card">
        <img src={movie.poster} alt={movie.title} />
        <h2>{movie.title}</h2>
        <label>
          Date:{" "}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label>
          Time:{" "}
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </label>
      </div>
      <div className="booking-right card">
        <h3>Select Seats</h3>
        <div className="seats">
          {rows.map((r) => (
            <div key={r} className="seat-row">
              {cols.map((c) => {
                const s = r + c;
                const isTaken = taken.includes(s);
                const active = selected.includes(s);
                return (
                  <button
                    key={s}
                    disabled={isTaken}
                    onClick={() => toggleSeat(s)}
                    className={
                      "seat " +
                      (active ? "active" : "") +
                      (isTaken ? " taken" : "")
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="actions">
          <button onClick={handleConfirm} className="btn">
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}
