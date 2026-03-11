//opsætning
const express = require("express");
const app = express();
const port = 3000;
const IP = "127.0.0.1";
app.use(express.static("public")); //hvis præcis url findes i public, så tilgås disse
app.set("view engine", "ejs"); //bruger EJS default opsætning som tilgår .ejs filer i "./views" mappen

//moduler 
const { validatePassword } = require("./utils/passwordValidator");
const { makeToken, loginTokens } = require("./services/tokenService");
const { sendLoginMail } = require('./services/mailService');
const { readUsers, findUser } = require('./services/userService');


console.log(readUsers());

//parser
app.use(express.urlencoded({ extended: true }));

//logger
app.use((req, res, next) => {
  const tidspunkt = new Date().toLocaleString();
  console.log(`log 1: [${tidspunkt}] ${req.method} ${req.url}`);
  next();
});

//authenticator oprettelse af bruger
app.get("/opretBruger", (req, res) => {
  res.render("opretBruger", {
    error: null,
    globalErrorBg: null,
    emailError: null,
    usernameError: null,
    passwordError: null,
  }); // Express finder views/opretBruger.ejs og siger første gang, at der selvfølgelig ingen fejl er
});
app.post("/opretBruger", (req, res) => {
  const { email, username, password, passwordRepeat } = req.body;
  const findesEmail = findUser("email", email);
  const findesBrugernavn = findUser("username", username);
  const passwordStatus = validatePassword(password, passwordRepeat);

  if (findesEmail || findesBrugernavn || passwordStatus !== "") {
    return res.render("opretBruger", {
      error: "Ret det relevante felt.",
      globalErrorBg: "red",
      emailError: findesEmail ? "e-mail findes allerede" : "",
      usernameError: findesBrugernavn ? "brugernavn findes allerede" : "",
      passwordError: passwordStatus,
    });
  }

  //tilføj email check ved at sende en email, som skal bekræftes før brugeren oprettes og kan logge ind
  res.send("Bruger er valideret korrekt");
});

//authenticator login
app.get("/login", (req, res) => {
  res.render("login", { error: null }); // Express finder views/login.ejs og siger første gang, at der selvfølgelig ingen fejl er
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  let user = null;
  for (let i = 0; i < users.length; i++) {
    if (users[i].username === username) {
      user = users[i];
      break; // stop når vi har fundet brugeren
    }
  }
  if (!user) {
    return res.render("login", { error: "Bruger findes ikke" }); //giver brugernavn error til login.ejs
  }
  if (user.password !== password) {
    return res.render("login", { error: "Forkert kodeord" }); //giver kodeord error til login.ejs
  }
  const token = makeToken(); //laver token
  // token udløber om 10 minutter
  const expiresAt = Date.now() + 10 * 60 * 1000;
  // gem token server-side så vi kan verificere det senere
  loginTokens.set(token, {
    username: user.username,
    expiresAt: expiresAt,
    used: false,
  });
  console.log(loginTokens);
  const verifyLink = `http://${IP}:${port}/verify?token=${token}`; //link til min lokale server med en query ?token=${token} i url'en

  sendLoginMail(user.email, verifyLink);
  return res.render("check-email", { email: user.email });
  
});


app.get("/verify", (req, res) => {
  const token = req.query.token; // token fra URL'en
  if (!token) return res.status(400).send("Mangler token"); // 1) mangler token?
  const entry = loginTokens.get(token); // 2) findes token i mit lager?
  if (!entry) return res.status(400).send("Ugyldigt link (token findes ikke)"); // 2.2) findes token i mit lager?
  if (entry.used) return res.status(400).send("Linket er allerede brugt"); // 3) er token allerede brugt?
  if (Date.now() > entry.expiresAt)
    return res.status(400).send("Linket er udløbet"); // 4) er token udløbet?
  entry.used = true; // 5) markér token som brugt (one-time)
  console.log(`Token OK. Bruger: ${entry.username}`); // 6) OK
  loginTokens.delete(token); // sletter token
  return res.render("min-side");
});

//response/route

//error handler

//opsætning
app.listen(port, IP, () => {
  console.log(`Serveren kører på http://${IP}:${port}`);
});
