// Generate alphanumeric string 8 characters long
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

// Search the provided database for 
// an account with the provided email
// and return the user data or undefined
const findUserByEmail = (email, userDatabase) => {
  for (let userId in userDatabase) {
    if (userDatabase[userId].email === email) {
      return userDatabase[userId];
    }
  }
  return undefined;
};

// Search through the provided database 
// and return URLs owned by the userID provided
const findURLsByUserID = (userID, urlDatabase) => {
  const URLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      URLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return URLs;
};

module.exports = { generateRandomString, findUserByEmail, findURLsByUserID };