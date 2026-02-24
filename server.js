//opsætning
const express = require("express");
const app = express();
const port = 3000;
const IP = "127.0.0.1";
app.use(express.static("public")); //hvis præcis url findes i public, så tilgås disse
app.set("view engine", "ejs"); //bruger EJS default opsætning som tilgår .ejs filer i "./views" mappen

//til at finde min JSON fil med brugere
const fs = require("fs");
const path = require("path");

function readUsers() {
  const filePath = path.join(__dirname, "data", "users.json");
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}
console.log(readUsers());

//parser
app.use(express.urlencoded({ extended: true }));

//logger

//authenticator

//response/route
app.get("/login", (req, res) => {
  res.render("login", { error: null }); // Express finder views/login.ejs og siger første gang, at der selvfølgelig ingen fejl er
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();

  let user = null;
  for (let i = 0; i < users.length; i++) {
    if (users[i].username === username) {
      user = users[i];
      break;  // stop når vi har fundet brugeren
    }
  }

  if (!user) {
    return res.render("login", { error: "Bruger findes ikke" }); //giver brugernavn error til login.ejs
  }

  if (user.password !== password) {
    return res.render("login", { error: "Forkert kodeord" }); //giver kodeord error til login.ejs
  }

  res.send("Login OK");
});

//error handler

//opsætning
app.listen(port, IP, () => {
  console.log(`Serveren kører på http://${IP}:${port}`);
});
