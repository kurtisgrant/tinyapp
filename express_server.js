const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: 'user2RandomID' },
  "9sm5xK": { longURL: "http://www.google.com", userID: 'user2RandomID' },
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
  if (!user) {
    return res.status(401).end(`<h1>401 Unauthorised</h1>`);
  }
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

// View/edit single URL page
app.get("/urls/:shortURL", (req, res) => {
  let user = req.cookies["user_id"];
  if (user) user = users[user];
  if (user.id !== urlDatabase[req.params.shortURL].userID) {
    return res.status(401).end(`<h1>401 Unauthorised</h1>`);
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: user
  };
  res.render("urls_show.ejs", templateVars);
});

// View all URLs page
app.get("/urls", (req, res) => {
  let user = req.cookies["user_id"];
  if (user) user = users[user];
  if (!user) {
    return res.status(401).end(`<h1>401 Unauthorised</h1>`);
  }
  const userURLs = findURLsByUserID(user.id);
  const templateVars = {
    urls: userURLs,
    user: user
  };
  res.render("urls_index", templateVars);
});

// Redirect endpoint
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
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

// Login Form
app.get("/login", (req, res) => {
  let user = req.cookies["user_id"];
  if (user) user = users[user];
  const templateVars = {
    user: user,
    alert: null
  };
  res.render('login', templateVars);
});

// Forgot password
app.get("/forgot-password", (req, res) => {
  res.status(406).end(`<h1>406 Not Acceptable</h1>`);
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
  let user = req.cookies["user_id"];
  if (user) user = users[user];
  if (user.id !== urlDatabase[req.params.shortURL].userID) {
    return res.status(401).end(`<h1>401 Unauthorised</h1>`);
  }
  const shortURLToDelete = req.params.shortURL;
  const longURLToDelete = urlDatabase[shortURLToDelete].longURL;
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
  let user = req.cookies["user_id"];
  if (user) user = users[user];
  if (user.id !== urlDatabase[req.params.shortURL].userID) {
    return res.status(401).end(`<h1>401 Unauthorised</h1>`);
  }
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Add new URL endpoint
app.post("/urls", (req, res) => {
  let user = req.cookies["user_id"];
  if (user) user = users[user];
  if (!user) {
    res.status(401).end(`<h1>401 Unauthorised</h1>`);
  }
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = { longURL: req.body.longURL, userID: user.id };
  res.redirect(`/urls/${newShortURL}`);
});

// Login endpoint
app.post("/login", (req, res) => {
  let user = req.cookies["user_id"];
  if (user) user = users[user];
  const templateVars = { user: user, alert: null };
  const { email, password } = req.body;
  const foundUser = findUserByEmail(email);
  if (!email.length || !password.length) {
    templateVars.alert = { type: "danger", message: "Email and password are required" };
    res.status(403).render('login', templateVars);
  } else if (!foundUser || foundUser.password !== password) {
    templateVars.alert = { type: 'danger', message: 'Invalid credentials' };
    res.status(403).render('login', templateVars);
  } else {
    res.cookie('user_id', foundUser.id);
    res.redirect('/urls');
  }
});

// Register endpoint
app.post("/register", (req, res) => {
  let user = req.cookies["user_id"];
  if (user) user = users[user];
  const templateVars = { user: user, alert: null };
  if (req.body.password !== req.body.password2) {
    templateVars.alert = { type: 'danger', message: "Passwords didn't match" };
    res.status(400).render('register', templateVars);
  } else if (!req.body.email.length || !req.body.password.length) {
    templateVars.alert = { type: 'danger', message: "Email and password are required" };
    res.status(400).render('register', templateVars);
  } else if (findUserByEmail(req.body.email)) {
    templateVars.alert = { type: 'danger', message: "Email already registered" };
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
    .redirect('/login');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
}

function findUserByEmail(email) {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return undefined;
}

function findURLsByUserID(userID) {
  const URLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      URLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return URLs;
}