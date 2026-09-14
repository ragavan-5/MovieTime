-- Create database and tables for MovieTime
CREATE DATABASE IF NOT EXISTS movietime;
USE movietime;
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS movies (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  poster VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(80) PRIMARY KEY,
  user_id INT NOT NULL,
  movie_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(20) NOT NULL,
  seats TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

INSERT IGNORE INTO movies (id, title, poster) VALUES
('m1', 'Movie A', '/posters/poster1.svg'),
('m2', 'Movie B', '/posters/poster2.svg'),
('m3', 'Movie C', '/posters/poster3.svg');
