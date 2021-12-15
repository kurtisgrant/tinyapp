const bcrypt = require('bcryptjs');
module.exports = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    hashedPass: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPass: bcrypt.hashSync("dishwasher-funk", 10)
  }
};