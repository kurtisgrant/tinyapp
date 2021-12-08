const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// -----------------------------
// GET Request Handlers
// -----------------------------

// Add URL form page
app.get("/urls/new", (req, res) => {
  let user = req.cookies["user_id"];
  if (user) user = users[user];
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

// View/edit single URL page
app.get("/urls/:shortURL", (req, res) => {
  let user = req.cookies["user_id"];
  if (user) user = users[user];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: user
  };
  res.render("urls_show.ejs", templateVars);
});

// View all URLs page
app.get("/urls", (req, res) => {
  let user = req.cookies["user_id"];
  if (user) user = users[user];
  const templateVars = {
    urls: urlDatabase,
    user: user
  };
  res.render("urls_index", templateVars);
});

// Redirect endpoint
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.statusCode = 404;
    res.send('404 Invalid short URL');
  }
});

// Registration Form
app.get("/register", (req, res) => {
  let user = req.cookies["user_id"];
  if (user) user = users[user];
  const templateVars = {
    user: user,
    alert: null
  };
  res.render('register', templateVars);
});

// View all URL database JSON data
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Home directory (redirects to URLs page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// -----------------------------
// POST Request Handlers
// -----------------------------

// Delete url from database endpont (would be a DELETE req)
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURLToDelete = req.params.shortURL;
  const longURLToDelete = urlDatabase[shortURLToDelete];
  if (longURLToDelete) {
    delete urlDatabase[shortURLToDelete];
    res.redirect('/urls');
  } else {
    res.statusCode = 500;
    res.send('500 Server error');
  }
});

// Edit long URL for existing short URL endpoint (would be PUT req)
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Add new URL endpoint
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);
});

// Login endpoint
app.post("/login", (req, res) => {
  const username = req.body.username;
  if (username.length) {
    res.cookie('username', username)
      .redirect('/urls');
  } else {
    res.redirect('/urls');
  }
});

// Register endpoint
app.post("/register", (req, res) => {
  if (req.body.password !== req.body.password2) {
    const templateVars = {
      username: req.cookies["username"],
      alert: { type: 'danger', message: "Passwords didn't match." }
    };
    res.status(400).render('register', templateVars);
  } else {
    const newUser = {
      id: generateRandomString(),
      email: req.body.email,
      password: req.body.password
    };
    users[newUser.id] = newUser;
    res.cookie('user_id', newUser.id);
    res.redirect('/urls');
  }
});

// Logout endpoint
app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
    .redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
}