const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};


const findUserByEmail = (email, userDatabase) => {
  for (let userId in userDatabase) {
    if (userDatabase[userId].email === email) {
      return userDatabase[userId];
    }
  }
  return undefined;
};

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