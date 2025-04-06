const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
let users = require("./usersdb.json");
let books = require("./booksdb.js");
const regd_users = express.Router();

// Ścieżka do pliku JSON z użytkownikami
const usersFilePath = path.join(__dirname, 'usersdb.json');

// Funkcja pomocnicza do odczytu danych z pliku JSON
const getUsersFromFile = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data); // Zwróć danych użytkowników w formacie obiektu
  } catch (err) {
    console.error("Błąd podczas odczytu pliku usersdb.json:", err);
    return {}; // Zwróć pusty obiekt, jeśli nie uda się odczytać pliku
  }
};

// Funkcja weryfikująca, czy użytkownik istnieje
const isValid = (username) => {
  let users = getUsersFromFile();
  return !users[username]; // Jeśli użytkownik istnieje, zwróci false
};

// Funkcja sprawdzająca, czy użytkownik jest uwierzytelniony
const authenticatedUser = (username, password) => {
  let users = getUsersFromFile();
  let user = users[username];
  return user && user.password === password; // Sprawdź, czy hasło pasuje do zapisanego hasła
};

// Endpoint do logowania użytkownika
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Sprawdź, czy username i password zostały przekazane
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Sprawdź, czy użytkownik istnieje i czy hasło jest poprawne
  const users = getUsersFromFile();
  const user = users[username];

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  // Generowanie tokenu JWT
  const accessToken = jwt.sign({ username: user.username }, "access", { expiresIn: "1h" });

  // Zapisz token w sesji
  req.session.authorization = { accessToken };

  // Odpowiedz z tokenem JWT
  return res.status(200).json({ message: "Login successful!", accessToken });
});




module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
