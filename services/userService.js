//til at finde min JSON fil med brugere
// bør opdateres til at køre asynkront og lede på en database
const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "..", "data", "users.json");


function readUsers() {
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}

function findUser(key, value) {
  const users = readUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i][key] === value) {
      return users[i];
    }
  }
  return null;
}
/*
function findUser(key, value) {
  const users = readUsers();
  return users.find((user) => user[key] === value) || null;
}
*/

function saveUser(newUser) {
  const users = readUsers();
  users.push(newUser);
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), "utf8"); //null og 2 er bare for at gøre json pæn
}

module.exports = {
  readUsers,
  findUser,
  saveUser,
};