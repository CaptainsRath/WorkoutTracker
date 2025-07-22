-- Specify which database to use
USE `srsl-fit`;

-- With this query we should be able to build a Workout Page (the page they view as 
-- they are working out) from an already created template.
-- It's assumed that the front end will already have the name of the workout because 
-- the user would've selected that before entering this page.
-- We'll pass in ”uId” for WorkoutContents userId, “woId” for Workoutcontents workoutId instead of the 1's
SELECT exers.exerciseId, exers.name, eLog.`like`, s.setId, s.lbs, s.reps
FROM WorkoutContents conts
LEFT JOIN Exercises exers ON exers.exerciseId = conts.exerciseId
LEFT JOIN ExerciseLog eLog ON eLog.userId = conts.userId AND eLog.exerciseId = exers.exerciseId
LEFT JOIN Sets s ON s.userId = eLog.userId AND s.exerciseId = eLog.exerciseId
WHERE conts.userId = 1 AND conts.workoutId = 1
ORDER BY conts.`order`;

-- We're going to assume that a user just clicked the "Finish Workout" button.
-- With this query we're assuming the user created the workout from an empty template
-- and they have chosen to save it.
-- We'll need to increment the counters which track how many times the user has performed 
-- each of the exercises on the page.
-- We'll need to add/update/delete set information for each exercise
-- We'll need to store the workout template
-- We'll need to link all of the appropriate exercises to the workout template in 
-- the correct order


-- I suppose if we give the user the option to not save the workout template then we'll
-- still need to do the following:
-- We'll need to increment the counters which track how many times the user has performed 
-- each of the exercises on the page.
-- We'll need to add/update/delete set information for each exercise


-- If we assume the user clicked the "Finish Workout" button and they choose to update
-- the WorkoutTemplate that the workout was based off of (so it already existed)
-- We'd need to:
-- We'll need to increment the counters which track how many times the user has performed 
-- each of the exercises on the page.
-- We'll need to add/update/delete set information for each exercise
-- Delete all WorkoutContents entries that are connected to the WorkoutTemplate for exercises
-- that no longer are found in the WorkoutTemplate
-- Update the orders of existing WorkoutContents entries
-- Add new WorkoutContents entries for new exercises
