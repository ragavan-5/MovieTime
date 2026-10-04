// const express = require('express')
// const router = express.Router()
// const db = require('../db')
// router.get('/', async (req,res)=>{
//   try{ const [rows] = await db.query('SELECT id, title, poster FROM movies ORDER BY title'); res.json(rows) }catch(e){ console.error(e); res.status(500).json({message:'Server error'}) }
// })
// module.exports = router


const express = require("express");
const router = express.Router();
const db = require("../db");

const SHOW_TIMES = [
  "10:00:00",
  "13:00:00",
  "16:00:00",
  "19:00:00",
  "22:00:00",
  "23:30:00"
];

const SEATS = [];

for (const row of ["A", "B", "C", "D", "E"]) {
  for (const col of [1, 2, 3, 4]) {
    SEATS.push(row + col);
  }
}

function getIndiaDateTime() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).format(new Date());
}

function isFutureShow(date, time) {
  const current = getIndiaDateTime();

  const currentDate = current.substring(0, 10);
  const currentTime = current.substring(11, 19);

  if (date > currentDate) {
    return true;
  }

  if (date < currentDate) {
    return false;
  }

  return time > currentTime;
}

async function createShowsForDate(movieId, date) {
  const [screens] = await db.query(
    "SELECT id FROM screens ORDER BY id"
  );

  for (const screen of screens) {
    for (const time of SHOW_TIMES) {

      if (!isFutureShow(date, time)) {
        continue;
      }

      const [result] = await db.query(
        `
        INSERT IGNORE INTO shows
        (movie_id, screen_id, show_date, show_time)
        VALUES (?, ?, ?, ?)
        `,
        [
          movieId,
          screen.id,
          date,
          time
        ]
      );

      if (result.affectedRows === 1) {

        const [showRows] = await db.query(
          `
          SELECT id
          FROM shows
          WHERE movie_id = ?
          AND screen_id = ?
          AND show_date = ?
          AND show_time = ?
          `,
          [
            movieId,
            screen.id,
            date,
            time
          ]
        );

        const showId = showRows[0].id;

        for (const seat of SEATS) {
          await db.query(
            `
            INSERT IGNORE INTO show_seats
            (show_id, seat_number)
            VALUES (?, ?)
            `,
            [
              showId,
              seat
            ]
          );
        }
      }
    }
  }
}

router.get("/", async (req, res) => {
  try {

    const [rows] = await db.query(
      `
      SELECT id, title, poster
      FROM movies
      ORDER BY title
      `
    );

    res.json(rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});


router.get("/:movieId/shows", async (req, res) => {

  const { movieId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      message: "Date is required"
    });
  }

  try {

    const [movie] = await db.query(
      "SELECT id FROM movies WHERE id = ?",
      [movieId]
    );

    if (movie.length === 0) {
      return res.status(404).json({
        message: "Movie not found"
      });
    }

    await createShowsForDate(movieId, date);

    const [shows] = await db.query(
      `
      SELECT
        s.id,
        s.show_date,
        TIME_FORMAT(s.show_time, '%H:%i') AS show_time,
        sc.id AS screen_id,
        sc.name AS screen_name
      FROM shows s
      JOIN screens sc
        ON sc.id = s.screen_id
      WHERE s.movie_id = ?
      AND s.show_date = ?
      ORDER BY s.show_time, sc.id
      `,
      [
        movieId,
        date
      ]
    );

    const futureShows = shows.filter(show =>
      isFutureShow(
        show.show_date.toISOString
          ? show.show_date.toISOString().substring(0, 10)
          : String(show.show_date).substring(0, 10),
        show.show_time + ":00"
      )
    );

    res.json(futureShows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});


router.get("/show/:showId/seats", async (req, res) => {

  const { showId } = req.params;

  try {

    await db.query(
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

    const [rows] = await db.query(
      `
      SELECT
        seat_number,
        status
      FROM show_seats
      WHERE show_id = ?
      ORDER BY seat_number
      `,
      [showId]
    );

    res.json(rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;