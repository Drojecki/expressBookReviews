const express = require('express');
const fs = require('fs');
const path = require('path');
let books = require("./booksdb.js");
let users = require("./usersdb.json"); // Import users from the JSON file
let isValid = require("./auth_users.js").isValid;
const public_users = express.Router();

// Path to the users database file
const usersFilePath = path.join(__dirname, 'usersdb.json');

// Helper function to check if a username is already taken
const isUsernameValid = (username) => {
  return !users[username];  // Return true if user doesn't exist
};

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Validate username and password
  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  }

  // Check if the username already exists in the users file
  if (!isUsernameValid(username)) {
    return res.status(409).json({ message: "User already exists." });
  }

  // Add the new user to the users object
  users[username] = { username, password };

  // Write the updated users object to usersdb.js (JSON file)
  fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
    if (err) {
      return res.status(500).json({ message: "Error saving user data." });
    }
    return res.status(200).json({ message: "Registration successful!" });
  });
});


// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Książka o podanym ISBN nie została znaleziona." });
  }
});

public_users.post("/auth/review/:isbn", (req, res) => {
  const { review } = req.body; // Get review from the body, not query parameters
  const { username } = req.body; // Get username directly from the body (no session verification)

  if (!review) {
    return res.status(400).json({ message: "Review content is required." });
  }

  const isbn = req.params.isbn; // Get ISBN from the URL

  // Find the book by ISBN
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Add the review directly without checking if the user already posted a review
  book.reviews.push({ username, review });

  return res.status(201).json({ message: "Review added successfully." });
});

public_users.delete("/auth/review/:isbn", (req, res) => {
  const { username } = req.body; // Get the username from the session
  const isbn = req.params.isbn; // Get ISBN from the URL
  const book = books[isbn]; // Find the book by ISBN

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Find the review for the logged-in user
  const reviewIndex = book.reviews.findIndex((review) => review.username === username);

  if (reviewIndex === -1) {
    return res.status(404).json({ message: "Review not found for this user." });
  }

  // Delete the review by filtering it out
  book.reviews.splice(reviewIndex, 1);

  return res.status(200).json({ message: "Review deleted successfully." });
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  const matchingBooks = Object.values(books).filter((book) => book.author === author);

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "Nie znaleziono książek tego autora." });
  }
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  const matchingBooks = Object.values(books).filter((book) => book.title === title);

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "Nie znaleziono książek o takim tytule." });
  }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Nie znaleziono książki o podanym ISBN." });
  }
});


module.exports.general = public_users;
