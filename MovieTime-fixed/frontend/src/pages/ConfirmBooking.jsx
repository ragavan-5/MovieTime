// export default function ConfirmBooking(){ return <div style={{padding:20}}>No pending booking - booking is finalized on confirm step.</div> }








import React, {
  useEffect,
  useState
} from "react";

import {
  useLocation,
  useNavigate
} from "react-router-dom";

import {
  confirmBooking
} from "../api";


export default function ConfirmBooking() {

  const location =
    useLocation();

  const navigate =
    useNavigate();


  const data =
    location.state;


  const [secondsLeft, setSecondsLeft] =
    useState(5 * 60);


  const [confirming, setConfirming] =
    useState(false);


  useEffect(() => {

    if (!data) {
      return;
    }


    const timer =
      setInterval(() => {

        setSecondsLeft(
          previous => {

            if (previous <= 1) {

              clearInterval(timer);

              alert(
                "Your seat lock has expired."
              );

              navigate(
                `/booking/${data.movie.id}`
              );

              return 0;
            }

            return previous - 1;
          }
        );

      }, 1000);


    return () =>
      clearInterval(timer);

  }, [data, navigate]);


  if (!data) {

    return (
      <div className="card">
        No pending booking.
      </div>
    );
  }


  const minutes =
    Math.floor(
      secondsLeft / 60
    );

  const seconds =
    secondsLeft % 60;


  async function handleConfirm() {

    try {

      setConfirming(true);

      const result =
        await confirmBooking(
          data.show.id,
          data.seats
        );


      alert(
        "Booking confirmed!\nBooking ID: " +
        result.bookingId
      );


      navigate("/");

    } catch (error) {

      alert(
        error.message ||
        "Booking failed."
      );

      navigate(
        `/booking/${data.movie.id}`
      );

    } finally {

      setConfirming(false);

    }
  }


  return (

    <div
      className="card"
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "30px"
      }}
    >

      <h2>
        Confirm Booking
      </h2>


      <h3>
        {data.movie.title}
      </h3>


      <p>
        Date: {data.date}
      </p>


      <p>
        Time: {data.show.show_time}
      </p>


      <p>
        Screen: {data.show.screen_name}
      </p>


      <p>
        Seats:
        {" "}
        <strong>
          {data.seats.join(", ")}
        </strong>
      </p>


      <h2>
        Time remaining:
        {" "}
        {String(minutes).padStart(2, "0")}
        :
        {String(seconds).padStart(2, "0")}
      </h2>


      <button
        className="btn"
        onClick={handleConfirm}
        disabled={confirming}
      >

        {confirming
          ? "Confirming..."
          : "Confirm Booking"}

      </button>

    </div>

  );
}