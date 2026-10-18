-- Enable foreign key enforcement in SQLite
PRAGMA foreign_keys = ON;

-- 1. CREATE TABLE statements
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  credits INTEGER NOT NULL
);

CREATE TABLE enrolments (
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  grade TEXT,
  PRIMARY KEY (student_id, course_id), -- Prevents the same student enrolling twice
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 2. INSERT sample data (3 students, 3 courses, 5 enrolments)
-- Note: Student 3 (Celine) has 0 enrolments so we can test Query 4
INSERT INTO students (id, name, email) VALUES 
  (1, 'Amina Otieno', 'amina@example.com'),
  (2, 'Brian Kamau', 'brian@example.com'),
  (3, 'Celine Wanjiku', 'celine@example.com');

INSERT INTO courses (id, title, credits) VALUES 
  (1, 'Math 101', 3),
  (2, 'History 201', 4),
  (3, 'Computer Science 101', 4);

INSERT INTO enrolments (student_id, course_id, grade) VALUES 
  (1, 1, 'A'),
  (1, 2, 'B+'),
  (1, 3, 'A-'),
  (2, 1, 'B'),
  (2, 3, 'C');

-- 3. FIVE REQUIRED QUERIES

-- Query 1: All courses for one student (by name)
SELECT c.title, e.grade 
FROM students s
JOIN enrolments e ON s.id = e.student_id
JOIN courses c ON e.course_id = c.id
WHERE s.name = 'Amina Otieno';

-- Query 2: All students on one course
SELECT s.name, e.grade 
FROM courses c
JOIN enrolments e ON c.id = e.course_id
JOIN students s ON e.student_id = s.id
WHERE c.title = 'Math 101';

-- Query 3: The number of students per course
SELECT c.title, COUNT(e.student_id) AS student_count 
FROM courses c
LEFT JOIN enrolments e ON c.id = e.course_id
GROUP BY c.id;

-- Query 4: Students who have no enrolments
SELECT s.name 
FROM students s
LEFT JOIN enrolments e ON s.id = e.student_id
WHERE e.student_id IS NULL;

-- Query 5: Update of one enrolment's grade
UPDATE enrolments 
SET grade = 'A+' 
WHERE student_id = 1 AND course_id = 1;