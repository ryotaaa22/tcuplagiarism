-- Active: 1729053791337@@127.0.0.1@3306@data_users

CREATE DATABASE data_users
    DEFAULT CHARACTER SET = 'utf8mb4';

    USE data_users;

    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') NOT NULL,
        reset_token VARCHAR(255),
        reset_token_expires DATETIME,
        email VARCHAR(255) UNIQUE NOT NULL,
        status ENUM('active', 'suspended') DEFAULT 'active'
    );

    CREATE TABLE posting (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        section ENUM('News/Announcement', 'Article', 'Journals') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE posting
    ADD COLUMN images TEXT,
    ADD COLUMN video VARCHAR(255);

    CREATE TABLE IF NOT EXISTS user_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image_url VARCHAR(255),
        video_url VARCHAR(255),
        tags VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
ALTER TABLE user_posts ADD COLUMN username VARCHAR(255);
ALTER TABLE user_posts ADD COLUMN status ENUM('pending', 'approved', 'declined') DEFAULT 'pending';
ALTER TABLE user_posts ADD COLUMN file_path VARCHAR(255);





    CREATE TABLE IF NOT EXISTS posts(
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_url VARCHAR(255),
        video_url VARCHAR(255),
        tags VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id)
    );
