// const express = require("express");
// const router = express.Router();
// const db = require("../db");
// const auth = require("../utils/authMiddleware");
// router.get("/", auth, async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       "SELECT * FROM bookings WHERE user_id=? ORDER BY created_at DESC",
//       [req.user.id],
//     );
//     const data = rows.map((r) => ({ ...r, seats: JSON.parse(r.seats) }));
//     res.json(data);
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: "Server error" });
//   }
// });
// router.post("/", auth, async (req, res) => {
//   const { movieId, date, time, seats } = req.body;
//   if (!movieId || !date || !time || !seats || !Array.isArray(seats))
//     return res.status(400).json({ message: "Missing fields" });
//   try {
//     const bookingId = "b_" + Date.now();
//     await db.query(
//       "INSERT INTO bookings (id, user_id, movie_id, date, time, seats) VALUES (?,?,?,?,?,?)",
//       [bookingId, req.user.id, movieId, date, time, JSON.stringify(seats)],
//     );
//     res.json({ bookingId });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: "Server error" });
//   }
// });
// router.delete("/:id", auth, async (req, res) => {
//   const id = req.params.id;
//   try {
//     const [result] = await db.query(
//       "DELETE FROM bookings WHERE id=? AND user_id=?",
//       [id, req.user.id],
//     );
//     if (result.affectedRows === 0)
//       return res.status(404).json({ message: "Not found" });
//     res.json({ ok: true });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: "Server error" });
//   }
// });
// module.exports = router;















const express = require("express");
const router = express.Router();

const db = require("../db");
const auth = require("../utils/authMiddleware");

const LOCK_MINUTES = 5;


/*
GET USER BOOKINGS
*/
router.get("/", auth, async (req, res) => {

  try {

    const [rows] = await db.query(
      `
      SELECT
        b.id,
        b.created_at,

        m.id AS movie_id,
        m.title AS movie_title,

        s.show_date,
        TIME_FORMAT(s.show_time, '%H:%i') AS show_time,

        sc.name AS screen_name,

        GROUP_CONCAT(bs.seat_number ORDER BY bs.seat_number)
          AS seats

      FROM bookings b

      JOIN shows s
        ON s.id = b.show_id

      JOIN movies m
        ON m.id = s.movie_id

      JOIN screens sc
        ON sc.id = s.screen_id

      JOIN booking_seats bs
        ON bs.booking_id = b.id

      WHERE b.user_id = ?

      GROUP BY
        b.id,
        b.created_at,
        m.id,
        m.title,
        s.show_date,
        s.show_time,
        sc.name

      ORDER BY b.created_at DESC
      `,
      [req.user.id]
    );

    const data = rows.map(row => ({
      ...row,
      seats: row.seats ? row.seats.split(",") : []
    }));

    res.json(data);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});


/*
LOCK SEATS
*/
router.post("/lock", auth, async (req, res) => {

  const {
    showId,
    seats
  } = req.body;

  if (
    !showId ||
    !Array.isArray(seats) ||
    seats.length === 0
  ) {
    return res.status(400).json({
      message: "Show and seats are required"
    });
  }

  const connection = await db.getConnection();

  try {

    await connection.beginTransaction();


    /*
    Remove expired locks first
    */
    await connection.query(
      `
      UPDATE show_seats

      SET status = 'AVAILABLE',
          locked_by = NULL,
          locked_until = NULL

      WHERE show_id = ?

      AND status = 'LOCKED'

      AND locked_until < NOW()
      `,
      [showId]
    );


    /*
    Lock requested rows at database level
    */
    const placeholders = seats
      .map(() => "?")
      .join(",");

    const [rows] = await connection.query(
      `
      SELECT
        id,
        seat_number,
        status,
        locked_by,
        locked_until

      FROM show_seats

      WHERE show_id = ?

      AND seat_number IN (${placeholders})

      FOR UPDATE
      `,
      [
        showId,
        ...seats
      ]
    );


    /*
    Check every requested seat exists
    */
    if (rows.length !== seats.length) {

      await connection.rollback();

      return res.status(400).json({
        message: "Invalid seat selected"
      });
    }


    /*
    Check if somebody already booked/locked it
    */
    const unavailable = rows.filter(
      seat => seat.status !== "AVAILABLE"
    );

    if (unavailable.length > 0) {

      await connection.rollback();

      return res.status(409).json({
        message: "One or more seats are already booked or locked",
        seats: unavailable.map(
          seat => seat.seat_number
        )
      });
    }


    /*
    Lock seats for current user
    */
    await connection.query(
      `
      UPDATE show_seats

      SET status = 'LOCKED',
          locked_by = ?,
          locked_until = DATE_ADD(
            NOW(),
            INTERVAL ? MINUTE
          )

      WHERE show_id = ?

      AND seat_number IN (${placeholders})

      AND status = 'AVAILABLE'
      `,
      [
        req.user.id,
        LOCK_MINUTES,
        showId,
        ...seats
      ]
    );


    await connection.commit();


    res.json({
      success: true,
      showId,
      seats,
      lockMinutes: LOCK_MINUTES
    });

} catch (error) {

    await connection.rollback();

    console.error("LOCK SEATS ERROR:");
    console.error(error);

    res.status(500).json({
        message: "Could not lock seats",
        error: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage
    });

} finally {

    connection.release();
  }
});


/*
CONFIRM BOOKING
*/
router.post("/confirm", auth, async (req, res) => {

  const {
    showId,
    seats
  } = req.body;

  if (
    !showId ||
    !Array.isArray(seats) ||
    seats.length === 0
  ) {
    return res.status(400).json({
      message: "Show and seats are required"
    });
  }

  const connection = await db.getConnection();

  try {

    await connection.beginTransaction();


    const placeholders = seats
      .map(() => "?")
      .join(",");


    /*
    Lock the rows again before confirming
    */
    const [rows] = await connection.query(
      `
      SELECT
        id,
        seat_number,
        status,
        locked_by,
        locked_until

      FROM show_seats

      WHERE show_id = ?

      AND seat_number IN (${placeholders})

      FOR UPDATE
      `,
      [
        showId,
        ...seats
      ]
    );


    if (rows.length !== seats.length) {

      await connection.rollback();

      return res.status(400).json({
        message: "Invalid seat selection"
      });
    }


    /*
    Make sure all seats are locked by this user
    */
    const invalid = rows.filter(
      seat =>
        seat.status !== "LOCKED" ||
        Number(seat.locked_by) !== Number(req.user.id) ||
        !seat.locked_until ||
        new Date(seat.locked_until) <= new Date()
    );


    if (invalid.length > 0) {

      await connection.rollback();

      return res.status(409).json({
        message: "Seat lock expired. Please select the seats again."
      });
    }


    const bookingId =
      "b_" +
      Date.now() +
      "_" +
      Math.random()
        .toString(36)
        .substring(2, 8);


    /*
    Create booking
    */
    await connection.query(
      `
      INSERT INTO bookings
      (
        id,
        user_id,
        show_id,
        total_seats
      )

      VALUES (?, ?, ?, ?)
      `,
      [
        bookingId,
        req.user.id,
        showId,
        seats.length
      ]
    );


    /*
    Move LOCKED -> BOOKED
    */
    await connection.query(
      `
      UPDATE show_seats

      SET status = 'BOOKED',
          locked_by = NULL,
          locked_until = NULL

      WHERE show_id = ?

      AND seat_number IN (${placeholders})

      AND status = 'LOCKED'

      AND locked_by = ?
      `,
      [
        showId,
        ...seats,
        req.user.id
      ]
    );


    /*
    Save each seat against booking
    */
    for (const seat of seats) {

      await connection.query(
        `
        INSERT INTO booking_seats
        (
          booking_id,
          show_id,
          seat_number
        )

        VALUES (?, ?, ?)
        `,
        [
          bookingId,
          showId,
          seat
        ]
      );
    }


    await connection.commit();


    res.json({
      success: true,
      bookingId
    });

  } catch (error) {

    await connection.rollback();

    console.error(error);

    res.status(500).json({
      message: "Booking failed"
    });

  } finally {

    connection.release();
  }
});


/*
CANCEL BOOKING
*/
router.delete("/:id", auth, async (req, res) => {

  const connection = await db.getConnection();

  try {

    await connection.beginTransaction();


    const [bookings] = await connection.query(
      `
      SELECT id, show_id

      FROM bookings

      WHERE id = ?

      AND user_id = ?

      FOR UPDATE
      `,
      [
        req.params.id,
        req.user.id
      ]
    );


    if (bookings.length === 0) {

      await connection.rollback();

      return res.status(404).json({
        message: "Booking not found"
      });
    }


    const booking = bookings[0];


    /*
    Release seats
    */
    await connection.query(
      `
      UPDATE show_seats ss

      JOIN booking_seats bs
        ON bs.show_id = ss.show_id
        AND bs.seat_number = ss.seat_number

      SET
        ss.status = 'AVAILABLE',
        ss.locked_by = NULL,
        ss.locked_until = NULL

      WHERE bs.booking_id = ?
      `,
      [booking.id]
    );


    await connection.query(
      `
      DELETE FROM bookings
      WHERE id = ?
      `,
      [booking.id]
    );


    await connection.commit();


    res.json({
      success: true
    });

  } catch (error) {

    await connection.rollback();

    console.error(error);

    res.status(500).json({
      message: "Cancellation failed"
    });

  } finally {

    connection.release();
  }
});


module.exports = router;