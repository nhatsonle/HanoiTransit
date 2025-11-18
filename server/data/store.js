const users = [];
const favorites = new Map(); // key: userId, value: array of favorite routes

function getUserByEmail(email) {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function addUser(user) {
  users.push(user);
  return user;
}

function getFavorites(userId) {
  if (!favorites.has(userId)) favorites.set(userId, []);
  return favorites.get(userId);
}

module.exports = {
  users,
  favorites,
  getUserByEmail,
  addUser,
  getFavorites,
};

