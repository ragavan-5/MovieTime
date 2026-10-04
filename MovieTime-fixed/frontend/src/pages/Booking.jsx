// import React, { useState, useMemo, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { createBooking, getBookings } from "../api";

// const localMovies = [
//   { id: "m1", title: "Ambuli", poster: "/posters/ambuli.jpg" },
//   {
//     id: "m2",
//     title: "The Pursuit of Happyness",
//     poster: "/posters/happyness.jpg",
//   },
//   {
//     id: "m3",
//     title: "The Shawshank Redemption",
//     poster: "/posters/shawshank.png",
//   },
// ];

// export default function Booking() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const movie = useMemo(
//     () =>
//       localMovies.find((m) => String(m.id) === String(id)) || {
//         id,
//         title: "Unknown",
//         poster: "/posters/poster1.svg",
//       },
//     [id]
//   );

//   const [date, setDate] = useState("");
//   const [time, setTime] = useState("");
//   const [selected, setSelected] = useState([]);

//   const toggleSeat = (s) =>
//     setSelected((prev) =>
//       prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
//     );
//   const handleConfirm = async () => {
//     if (!date || !time || selected.length === 0) {
//       alert("Choose date, time and at least one seat.");
//       return;
//     }
//     try {
//       await createBooking({ movieId: movie.id, date, time, seats: selected });
//       alert("Booked");
//       navigate("/");
//     } catch (e) {
//       alert("Booking failed: " + (e.message || e));
//     }
//   };

//   const rows = ["A", "B", "C", "D", "E"],
//     cols = [1, 2, 3, 4];
//   const [taken, setTaken] = useState([]);
//   useEffect(() => {
//     getBookings()
//       .then((bs) =>
//         setTaken(
//           bs
//             .filter((b) => String(b.movie_id) === String(movie.id))
//             .flatMap((b) => b.seats)
//         )
//       )
//       .catch(() => {});
//   }, [movie.id]);

//   return (
//     <div className="booking-page">
//       <div className="booking-left card">
//         <img src={movie.poster} alt={movie.title} />
//         <h2>{movie.title}</h2>
//         <label>
//           Date:{" "}
//           <input
//             type="date"
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//           />
//         </label>
//         <label>
//           Time:{" "}
//           <input
//             type="time"
//             value={time}
//             onChange={(e) => setTime(e.target.value)}
//           />
//         </label>
//       </div>
//       <div className="booking-right card">
//         <h3>Select Seats</h3>
//         <div className="seats">
//           {rows.map((r) => (
//             <div key={r} className="seat-row">
//               {cols.map((c) => {
//                 const s = r + c;
//                 const isTaken = taken.includes(s);
//                 const active = selected.includes(s);
//                 return (
//                   <button
//                     key={s}
//                     disabled={isTaken}
//                     onClick={() => toggleSeat(s)}
//                     className={
//                       "seat " +
//                       (active ? "active" : "") +
//                       (isTaken ? " taken" : "")
//                     }
//                   >
//                     {s}
//                   </button>
//                 );
//               })}
//             </div>
//           ))}
//         </div>
//         <div className="actions">
//           <button onClick={handleConfirm} className="btn">
//             Confirm Booking
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }






















import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  useParams,
  useNavigate
} from "react-router-dom";

import {
  getShows,
  getShowSeats,
  lockSeats
} from "../api";


const localMovies = [
  {
    id: "m1",
    title: "Ambuli",
    poster: "/posters/ambuli.jpg"
  },
  {
    id: "m2",
    title: "The Pursuit of Happyness",
    poster: "/posters/happyness.jpg"
  },
  {
    id: "m3",
    title: "The Shawshank Redemption",
    poster: "/posters/shawshank.png"
  }
];


function getToday() {

  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(now.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(now.getDate())
      .padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function getFutureDates(days = 7) {

  const dates = [];

  const today = new Date();

  for (let i = 0; i < days; i++) {

    const date = new Date(today);

    date.setDate(
      today.getDate() + i
    );

    const year =
      date.getFullYear();

    const month =
      String(date.getMonth() + 1)
        .padStart(2, "0");

    const day =
      String(date.getDate())
        .padStart(2, "0");

    dates.push(
      `${year}-${month}-${day}`
    );
  }

  return dates;
}


function formatDate(dateString) {

  const date =
    new Date(dateString + "T00:00:00");

  return date.toLocaleDateString(
    "en-IN",
    {
      weekday: "short",
      day: "numeric",
      month: "short"
    }
  );
}


export default function Booking() {

  const { id } = useParams();

  const navigate =
    useNavigate();


  const movie = useMemo(
    () =>
      localMovies.find(
        m =>
          String(m.id) ===
          String(id)
      ) || {
        id,
        title: "Unknown",
        poster:
          "/posters/poster1.svg"
      },
    [id]
  );


  const dates =
    useMemo(
      () => getFutureDates(7),
      []
    );


  const [date, setDate] =
    useState(getToday());

  const [shows, setShows] =
    useState([]);

  const [selectedShow, setSelectedShow] =
    useState(null);

  const [seatData, setSeatData] =
    useState([]);

  const [selectedSeats, setSelectedSeats] =
    useState([]);

  const [loadingShows, setLoadingShows] =
    useState(false);

  const [loadingSeats, setLoadingSeats] =
    useState(false);

  const [locking, setLocking] =
    useState(false);


  /*
  Load shows whenever date changes
  */
  useEffect(() => {

    setSelectedShow(null);
    setSelectedSeats([]);
    setSeatData([]);

    setLoadingShows(true);

    getShows(
      movie.id,
      date
    )
      .then(setShows)
      .catch(error => {

        console.error(error);

        setShows([]);

      })
      .finally(() => {

        setLoadingShows(false);

      });

  }, [movie.id, date]);


  /*
  Load seats whenever show changes
  */
  useEffect(() => {

    if (!selectedShow) {

      setSeatData([]);

      return;
    }

    setSelectedSeats([]);

    setLoadingSeats(true);

    getShowSeats(
      selectedShow.id
    )
      .then(setSeatData)
      .catch(error => {

        console.error(error);

        setSeatData([]);

      })
      .finally(() => {

        setLoadingSeats(false);

      });

  }, [selectedShow]);


  function toggleSeat(seat) {

    if (seat.status !== "AVAILABLE") {
      return;
    }

    setSelectedSeats(prev => {

      if (prev.includes(
        seat.seat_number
      )) {

        return prev.filter(
          s =>
            s !== seat.seat_number
        );
      }

      return [
        ...prev,
        seat.seat_number
      ];
    });
  }


  async function handleLock() {

    if (!selectedShow) {

      alert(
        "Please select a show."
      );

      return;
    }

    if (
      selectedSeats.length === 0
    ) {

      alert(
        "Please select at least one seat."
      );

      return;
    }

    try {

      setLocking(true);

      await lockSeats(
        selectedShow.id,
        selectedSeats
      );


      navigate(
        "/confirm",
        {
          state: {
            movie,
            date,
            show: selectedShow,
            seats: selectedSeats
          }
        }
      );

    } catch (error) {

      alert(
        error.message ||
        "Could not lock seats."
      );

      /*
      Refresh seats because
      another user may have
      taken them.
      */
      if (selectedShow) {

        getShowSeats(
          selectedShow.id
        )
          .then(setSeatData)
          .catch(() => {});
      }

    } finally {

      setLocking(false);

    }
  }


  const groupedShows =
    shows.reduce(
      (groups, show) => {

        if (!groups[show.show_time]) {
          groups[show.show_time] = [];
        }

        groups[
          show.show_time
        ].push(show);

        return groups;

      },
      {}
    );


  return (
    <div className="booking-page">

      <div className="booking-left card">

        <img
          src={movie.poster}
          alt={movie.title}
        />

        <h2>
          {movie.title}
        </h2>


        <h3>
          Select Date
        </h3>

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "20px"
          }}
        >

          {dates.map(
            d => (

              <button
                key={d}
                onClick={() =>
                  setDate(d)
                }
                className={
                  date === d
                    ? "btn"
                    : "btn small"
                }
              >
                {formatDate(d)}
              </button>

            )
          )}

        </div>


        <h3>
          Select Show
        </h3>

        {loadingShows && (
          <p>
            Loading shows...
          </p>
        )}


        {!loadingShows &&
          shows.length === 0 && (

            <p>
              No future shows available
              for this date.
            </p>

          )}


        {!loadingShows &&
          Object.entries(
            groupedShows
          ).map(
            ([time, timeShows]) => (

              <div
                key={time}
                style={{
                  marginBottom: "18px"
                }}
              >

                <strong>
                  {time}
                </strong>


                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "8px",
                    flexWrap: "wrap"
                  }}
                >

                  {timeShows.map(
                    show => (

                      <button
                        key={show.id}
                        onClick={() =>
                          setSelectedShow(show)
                        }
                        className={
                          selectedShow?.id ===
                          show.id
                            ? "btn"
                            : "btn small"
                        }
                      >
                        {show.screen_name}
                      </button>

                    )
                  )}

                </div>

              </div>

            )
          )}

      </div>


      <div className="booking-right card">

        <h3>
          Select Seats
        </h3>


        {selectedShow && (

          <p>
            {formatDate(date)}
            {" • "}
            {selectedShow.show_time}
            {" • "}
            {selectedShow.screen_name}
          </p>

        )}


        {!selectedShow && (
          <p>
            Select a show first.
          </p>
        )}


        {loadingSeats && (
          <p>
            Loading seats...
          </p>
        )}


        {selectedShow &&
          !loadingSeats && (

            <div className="seats">

              {["A", "B", "C", "D", "E"]
                .map(row => (

                  <div
                    key={row}
                    className="seat-row"
                  >

                    {[1, 2, 3, 4]
                      .map(column => {

                        const seatNumber =
                          row + column;

                        const seat =
                          seatData.find(
                            s =>
                              s.seat_number ===
                              seatNumber
                          );

                        const isSelected =
                          selectedSeats.includes(
                            seatNumber
                          );

                        const isTaken =
                          !seat ||
                          seat.status !==
                            "AVAILABLE";


                        return (

                          <button
                            key={seatNumber}
                            disabled={isTaken}
                            onClick={() =>
                              toggleSeat(
                                seat
                              )
                            }
                            className={
                              "seat " +
                              (
                                isSelected
                                  ? "active "
                                  : ""
                              ) +
                              (
                                isTaken
                                  ? "taken"
                                  : ""
                              )
                            }
                          >
                            {seatNumber}
                          </button>

                        );

                      })}

                  </div>

                ))}

            </div>

          )}


        <div className="actions">

          <button
            onClick={handleLock}
            className="btn"
            disabled={
              locking ||
              !selectedShow ||
              selectedSeats.length === 0
            }
          >

            {locking
              ? "Locking seats..."
              : "Lock & Continue"}

          </button>

        </div>

      </div>

    </div>
  );
}
