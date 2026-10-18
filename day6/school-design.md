# School Database Design

## Table Explanations
- **students**: Stores core information about each student, including a unique identifier, their name, and a unique email address.
- **courses**: Stores information about available courses, including a unique identifier, the course title, and the number of credits.
- **enrolments**: A join table that records which student is taking which course, along with the grade they received. 

## Relationships
- **One-to-Many**: A single student can have many enrolment records, and a single course can have many enrolment records. 
- **Many-to-Many**: A student can take many courses, and a course can have many students. 
- **Why a join table is needed**: Relational databases cannot directly represent many-to-many relationships in two tables. The `enrolments` table acts as a bridge (join table) that links `student_id` and `course_id` together. It also allows us to store attributes specific to the relationship itself, such as the `grade`.

## Indexing Strategy
I would add an index on the `student_id` column in the `enrolments` table:
```sql
CREATE INDEX idx_enrolments_student_id ON enrolments(student_id);

**Reason:** We frequently need to look up all courses for a specific student (Query 1). Indexing `student_id` allows the database to instantly find all matching enrolment records without scanning the entire table, significantly speeding up read operations.

## SQL vs NoSQL Choice
I would choose a **SQL (relational) database** for this system. The data is highly structured with clear, strict relationships between students, courses, and grades. SQL databases enforce data integrity through features like `UNIQUE` constraints (preventing duplicate emails), foreign keys (ensuring an enrolment always points to a valid student and course), and composite primary keys (preventing a student from enrolling in the same course twice). A NoSQL document database would require duplicating data or handling these relationship rules manually in the application code, which is prone to errors and inconsistencies.