# Library Books API Design

This document outlines the RESTful API endpoints for managing books in a library system.

## Endpoints

### 1. List all books
- **Method:** `GET`
- **Path:** `/books`
- **Description:** Retrieves a list of all books in the library.
- **Success Status Code:** `200 OK`

### 2. Get a single book
- **Method:** `GET`
- **Path:** `/books/{id}`
- **Description:** Retrieves the details of a specific book by its unique ID.
- **Success Status Code:** `200 OK`

### 3. Create a new book
- **Method:** `POST`
- **Path:** `/books`
- **Description:** Adds a new book to the library database.
- **Example Request Body:**
  ```json
  {
    "title": "The Hobbit",
    "author": "J.R.R. Tolkien",
    "isbn": "978-0547928227",
    "publishedYear": 1937
  }
  ```
- **Success Status Code:** `201 Created`

### 4. Update a book
- **Method:** `PUT`
- **Path:** `/books/{id}`
- **Description:** Replaces all details of an existing book with the provided data.
- **Example Request Body:**
  ```json
  {
    "title": "The Hobbit (Updated Edition)",
    "author": "J.R.R. Tolkien",
    "isbn": "978-0547928227",
    "publishedYear": 1937
  }
  ```
- **Success Status Code:** `200 OK`

### 5. Delete a book
- **Method:** `DELETE`
- **Path:** `/books/{id}`
- **Description:** Removes a specific book from the library database.
- **Success Status Code:** `204 No Content`

### 6. List books by author (Query Parameter)
- **Method:** `GET`
- **Path:** `/books?author={authorName}`
- **Description:** Retrieves a filtered list of books written by a specific author using a query parameter.
- **Example Request:** `GET /books?author=J.R.R. Tolkien`
- **Success Status Code:** `200 OK`

---

## Error Codes

### 400 Bad Request
- **Description:** The server cannot process the request due to a client error, such as malformed syntax or missing required fields in the request body.
- **Example:** Sending a `POST /books` request to create a new book, but omitting the required `"title"` field in the JSON body.

### 404 Not Found
- **Description:** The requested resource does not exist on the server.
- **Example:** Sending a `GET /books/999` or `DELETE /books/999` request when no book with the ID `999` exists in the database.