const { assert } = require('chai');

const { findUserByEmail, findURLsByUserID } = require('../helpers.js');

const testUsers = {
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

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });
  it('should return undefined with an invalid email', function() {
    const user = findUserByEmail("invaliduser@null.com", testUsers);
    const expectedReturnVal = undefined;
    assert.strictEqual(user, expectedReturnVal);
  });
});

const testURLs = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: 'user2RandomID' },
  "9sm5xK": { longURL: "http://www.google.com", userID: 'user2RandomID' },

};

describe('findURLsByUserID', function() {
  it('should return object with 2 URLs with valid userid', function() {
    const urls = findURLsByUserID("user2RandomID", testURLs);
    const expectedKeys = ["b2xVn2", "9sm5xK"];
    assert.deepEqual(Object.keys(urls), expectedKeys);
  });
  it('should return empty object when userID has no corresponding URLs', function() {
    const urls = findURLsByUserID("unusedID", testURLs);
    assert.deepEqual(urls, {});
  });
});