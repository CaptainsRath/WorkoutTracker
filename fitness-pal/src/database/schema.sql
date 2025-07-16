DROP TABLE IF EXISTS Muscles 
CREATE TABLE Muscles (
    muscleId INT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

DROP TABLE IF EXISTS ExercisesMuscles 
CREATE TABLE ExercisesMuscles(
    exerciseId INT, 
    muscleId INT,
    PRIMARY KEY (exerciseId, muscleId),
    FOREIGN KEY (exerciseId) REFERENCES Exercises(exerciseId),
    FOREIGN KEY (muscleId) REFERENCES Muscles(muscleId)
);

DROP TABLE IF EXISTS Exercises
CREATE TABLE Exercises(
    exerciseId INT PRIMARY KEY, 
    ownerId INT,
    name VARCHAR(255) NOT NULL, 
    `desc` VARCHAR(500) NULL, 
    video VARCHAR(255) NULL, 
    FOREIGN KEY (ownerId) REFERENCES Users(userId)
);

DROP TABLE IF EXISTS WorkoutContents
CREATE TABLE WorkoutContents(
    workoutId INT, 
    exerciseId INT, 
    order INT NOT NULL,
    PRIMARY KEY (workoutId, exerciseId),
    FOREIGN KEY (workoutId) REFERENCES WorkoutTemplates(workoutId),
    FOREIGN KEY (exerciseId) REFERENCES Exercises(exerciseId)
);

DROP TABLE IF EXISTS WorkoutTemplates
CREATE TABLE WorkoutTemplates(
    workoutId INT, 
    userId INT, 
    lastDate DATETIME NULL, 
    name VARCHAR(255),
    PRIMARY KEY(workoutId, userId),
    FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE
);

DROP TABLE IF EXISTS ExerciseLog
CREATE TABLE ExerciseLog(
    userId INT, 
    exerciseId INT, 
    `like` BOOL NULL, 
    timesCompleted INT DEFAULT 0,
    PRIMARY KEY(userId, exerciseId),
    FOREIGN KEY (userId) REFERENCES Users(userId),
    FOREIGN KEY (exerciseId) REFERENCES Exercises(exerciseId)
);

DROP TABLE IF EXISTS Sets
CREATE TABLE Sets(
    setId INT, 
    userId INT, 
    exerciseId INT,
    order INT NOT NULL, 
    lbs REAL NOT NULL, 
    reps INT NOT NULL,
    PRIMARY KEY(setId, userId, exerciseId),
    FOREIGN KEY (userId, exerciseId) REFERENCES ExerciseLog(userId, exerciseId) ON DELETE CASCADE,
);

DROP TABLE IF EXISTS Users
CREATE TABLE Users(
    userId INT PRIMARY KEY, 
    username VARCHAR(30) UNIQUE NOT NULL, 
    password VARCHAR(30) NOT NULL, 
    firstName VARCHAR(30) NOT NULL, 
    lastName VARCHAR(30) NULL
);
