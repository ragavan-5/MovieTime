-- -- Create database and tables for MovieTime
-- CREATE DATABASE IF NOT EXISTS movietime;
-- USE movietime;
-- CREATE TABLE IF NOT EXISTS users (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(120) NOT NULL,
--   email VARCHAR(200) NOT NULL UNIQUE,
--   password VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
-- CREATE TABLE IF NOT EXISTS movies (
--   id VARCHAR(50) PRIMARY KEY,
--   title VARCHAR(255) NOT NULL,
--   poster VARCHAR(512),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
-- CREATE TABLE IF NOT EXISTS bookings (
--   id VARCHAR(80) PRIMARY KEY,
--   user_id INT NOT NULL,
--   movie_id VARCHAR(50) NOT NULL,
--   date DATE NOT NULL,
--   time VARCHAR(20) NOT NULL,
--   seats TEXT NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--   FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
-- );

-- INSERT IGNORE INTO movies (id, title, poster) VALUES
-- ('m1', 'Movie A', '/posters/poster1.svg'),
-- ('m2', 'Movie B', '/posters/poster2.svg'),
-- ('m3', 'Movie C', '/posters/poster3.svg');







DROP DATABASE IF EXISTS movietime;

CREATE DATABASE movietime;

USE movietime;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movies (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    poster VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE screens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE shows (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    movie_id VARCHAR(50) NOT NULL,
    screen_id INT NOT NULL,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (movie_id)
        REFERENCES movies(id)
        ON DELETE CASCADE,

    FOREIGN KEY (screen_id)
        REFERENCES screens(id)
        ON DELETE CASCADE,

    UNIQUE KEY unique_movie_screen_show
        (movie_id, screen_id, show_date, show_time),

    INDEX idx_movie_date
        (movie_id, show_date)
);

CREATE TABLE show_seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    show_id BIGINT NOT NULL,

    seat_number VARCHAR(10) NOT NULL,

    status ENUM('AVAILABLE', 'LOCKED', 'BOOKED')
        NOT NULL DEFAULT 'AVAILABLE',

    locked_by INT NULL,

    locked_until DATETIME NULL,

    FOREIGN KEY (show_id)
        REFERENCES shows(id)
        ON DELETE CASCADE,

    FOREIGN KEY (locked_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    UNIQUE KEY unique_show_seat
        (show_id, seat_number),

    INDEX idx_show_status
        (show_id, status)
);

CREATE TABLE bookings (
    id VARCHAR(80) PRIMARY KEY,

    user_id INT NOT NULL,

    show_id BIGINT NOT NULL,

    total_seats INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (show_id)
        REFERENCES shows(id)
        ON DELETE CASCADE
);

CREATE TABLE booking_seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    booking_id VARCHAR(80) NOT NULL,

    show_id BIGINT NOT NULL,

    seat_number VARCHAR(10) NOT NULL,

    FOREIGN KEY (booking_id)
        REFERENCES bookings(id)
        ON DELETE CASCADE,

    FOREIGN KEY (show_id)
        REFERENCES shows(id)
        ON DELETE CASCADE,

    UNIQUE KEY unique_booking_seat
        (booking_id, seat_number)
);

INSERT INTO movies (id, title, poster)
VALUES
(
    'm1',
    'Ambuli',
    '/posters/ambuli.jpg'
),
(
    'm2',
    'The Pursuit of Happyness',
    '/posters/happyness.jpg'
),
(
    'm3',
    'The Shawshank Redemption',
    '/posters/shawshank.png'
);

INSERT INTO screens (name)
VALUES
('Screen 1'),
('Screen 2'),
('Screen 3');