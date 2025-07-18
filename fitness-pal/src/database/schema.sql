-- Create database to be used
CREATE DATABASE `srsl-fit`;

-- Specify which database to use
USE `srsl-fit`;

-- DROP TABLE statements are now in reverse order of creation to avoid foreign key constraint errors
DROP TABLE IF EXISTS `Sets`;
DROP TABLE IF EXISTS `ExerciseLog`;
DROP TABLE IF EXISTS `WorkoutContents`;
DROP TABLE IF EXISTS `ExercisesMuscles`;
DROP TABLE IF EXISTS `Exercises`;
DROP TABLE IF EXISTS `WorkoutTemplates`;
DROP TABLE IF EXISTS `Muscles`;
DROP TABLE IF EXISTS `Users`;

-- Users table created first as many other tables depend on it.
CREATE TABLE `Users` (
    -- Added AUTO_INCREMENT to automatically generate unique user IDs.
    `userId` INT PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(30) UNIQUE NOT NULL,
    -- Increased password length to 255 to accommodate hashed passwords, which is a security best practice.
    `password` VARCHAR(255) NOT NULL,
    `firstName` VARCHAR(30) NOT NULL,
    `lastName` VARCHAR(30) NULL
);

-- Muscles table has no dependencies.
CREATE TABLE `Muscles` (
    -- Added AUTO_INCREMENT.
    `muscleId` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255) UNIQUE NOT NULL
);

-- WorkoutTemplates depends on Users.
CREATE TABLE `WorkoutTemplates` (
    -- Added AUTO_INCREMENT for the workoutId.
    `workoutId` INT PRIMARY KEY AUTO_INCREMENT,
    `userId` INT,
    `lastDate` DATETIME NULL,
    `name` VARCHAR(255),
    FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE CASCADE
);

-- Exercises depends on Users.
CREATE TABLE `Exercises` (
    -- Added AUTO_INCREMENT.
    `exerciseId` INT PRIMARY KEY AUTO_INCREMENT,
    `ownerId` INT,
    `name` VARCHAR(255) NOT NULL,
    -- Renamed `desc` to `description` because DESC is a reserved SQL keyword.
    `description` VARCHAR(500) NULL,
    `video` VARCHAR(255) NULL,
    -- Added ON DELETE SET NULL: If a user is deleted, their custom exercises are not deleted,
    -- but are now owned by no one (ownerId becomes NULL).
    FOREIGN KEY (`ownerId`) REFERENCES `Users`(`userId`) ON DELETE SET NULL
);

-- This is a "join table" or "linking table". It depends on Exercises and Muscles.
CREATE TABLE `ExercisesMuscles` (
    `exerciseId` INT,
    `muscleId` INT,
    PRIMARY KEY (`exerciseId`, `muscleId`),
    -- Added ON DELETE CASCADE: If an exercise or muscle is deleted, the corresponding link is also deleted.
    FOREIGN KEY (`exerciseId`) REFERENCES `Exercises`(`exerciseId`) ON DELETE CASCADE,
    FOREIGN KEY (`muscleId`) REFERENCES `Muscles`(`muscleId`) ON DELETE CASCADE
);

-- Depends on WorkoutTemplates and Exercises.
CREATE TABLE `WorkoutContents` (
    `workoutId` INT,
    `exerciseId` INT,
    -- `order` is a reserved keyword, so it's good practice to wrap it in backticks.
    `order` INT NOT NULL,
    PRIMARY KEY (`workoutId`, `exerciseId`),
    FOREIGN KEY (`workoutId`) REFERENCES `WorkoutTemplates`(`workoutId`) ON DELETE CASCADE,
    FOREIGN KEY (`exerciseId`) REFERENCES `Exercises`(`exerciseId`) ON DELETE CASCADE
);

-- Depends on Users and Exercises.
CREATE TABLE `ExerciseLog` (
    `userId` INT,
    `exerciseId` INT,
    -- `like` is a reserved keyword, so it's wrapped in backticks.
    `like` BOOL NULL,
    `timesCompleted` INT DEFAULT 0,
    PRIMARY KEY (`userId`, `exerciseId`),
    FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE CASCADE,
    FOREIGN KEY (`exerciseId`) REFERENCES `Exercises`(`exerciseId`) ON DELETE CASCADE
);

-- Depends on ExerciseLog.
CREATE TABLE `Sets` (
    -- Added AUTO_INCREMENT for a unique ID for each set.
    `setId` INT PRIMARY KEY AUTO_INCREMENT,
    `userId` INT,
    `exerciseId` INT,
    `order` INT NOT NULL,
    `lbs` REAL NOT NULL,
    `reps` INT NOT NULL,
    FOREIGN KEY (`userId`, `exerciseId`) REFERENCES `ExerciseLog`(`userId`, `exerciseId`) ON DELETE CASCADE
    -- Removed the trailing comma that was causing a syntax error.
);