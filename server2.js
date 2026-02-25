//opsætning
const express = require("express");
const app = express();
const port = 3000;
const IP = "127.0.0.1";
app.use(express.static("public")); //hvis præcis url findes i public, så tilgås disse
app.set("view engine", "ejs"); //bruger EJS default opsætning som tilgår .ejs filer i "./views" mappen

//til token (til log in link)
const crypto = require("crypto"); // Importerer Node's indbyggede "crypto"-modul. Det bruges til at lave kryptografisk sikre, tilfældige værdier. Det er vigtigt, fordi login-tokens ikke må kunne gættes.
function makeToken() {
  // Funktion der genererer et unikt login-token
  const randomBuffer = crypto.randomBytes(32); // crypto.randomBytes(32) --> genererer 32 tilfældige bytes (256 bits) --> jo flere bytes, jo sværere er det at gætte tokenet --> 32 bytes er mere end rigeligt (ifølge chatgpt) til et sikkert engangslink
  const token = randomBuffer.toString("hex"); // .toString("hex") --> konverterer de rå bytes til en hex-streng --> fx: "a3f9c8e2b4..." --> hex betyder at hver byte bliver repræsenteret som 2 tegn (0-9, a-f) --> 32 bytes bliver til 64 tegn i hex
  return token; // Returnerer tokenet så vi kan gemme det og sende det i mail-linket
}

//token lager (holder styr på tokens der er sendt ud)
const loginTokens = new Map(); // token -> { username, expiresAt, used } // set() i en Map sætter et key → value pair.

//til email - det her er ren chatGPT. Jeg aner ikke, hvad der er hvad.
require("dotenv").config();
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true fordi vi bruger port 465 (påstår chatgpt)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
app.use((req, res, next) => {
  // logger requests
  const tidspunkt = new Date().toLocaleString();
  console.log(`log 1: [${tidspunkt}] ${req.method} ${req.url}`);
  next();
});

//authenticator
function authenticateUser(usernameInput, passwordInput) {
  const users = readUsers();
  let user = null;
  for (let i = 0; i < users.length; i++) {
    if (users[i].username === usernameInput) {
      user = users[i];
      break; // stop når vi har fundet brugeren
    }
  }
  if (!user) {
    return { ok: false, error: "Bruger findes ikke" };
  }

  if (user.password !== passwordInput) {
    return { ok: false, error: "Forkert kodeord" };
  }

  return { ok: true, user };
}

async function issueTokenLink(savedUser) {
  const token = makeToken(); //laver token
  const expiresAt = Date.now() + 10 * 60 * 1000; // token udløber om 10 minutter
  // gem token server-side så vi kan verificere det senere
  loginTokens.set(token, {
    username: savedUser.username,
    expiresAt: expiresAt,
    used: false,
  });

  const verifyLink = `http://${IP}:${port}/verify?token=${token}`; //link til min lokale server med en query ?token=${token} i url'en
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: savedUser.email,
    subject: "Dit login-link",
    text: `Klik på linket for at logge ind: ${verifyLink}`,
    html: `<p>Klik på linket for at logge ind:</p><p><a href="${verifyLink}">${verifyLink}</a></p>`,
  });
}


//response/route
app.get("/login", (req, res) => {
  res.render("login", { error: null }); // Express finder views/login.ejs og siger første gang, at der selvfølgelig ingen fejl er
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const result = authenticateUser(username, password);
  if (!result.ok) {
    return res.render("login", { error: result.error });
  }
  const user = result.user;
  try {
    await issueTokenLink(user);
    return res.render("check-email", { email: user.email });
  } catch (err) {
    console.error("Fejl ved sendMail:", err);
    return res.render("login", { error: "Kunne ikke sende email." });
  }
});

app.get("/verify", (req, res) => {
  const token = req.query.token; // token fra URL'en
  // 1) mangler token?
  if (!token) return res.status(400).send("Mangler token");
  // 2) findes token i mit lager?
  const entry = loginTokens.get(token);
  if (!entry) return res.status(400).send("Ugyldigt link (token findes ikke)");
  // 3) er token allerede brugt?
  if (entry.used) return res.status(400).send("Linket er allerede brugt");
  // 4) er token udløbet?
  if (Date.now() > entry.expiresAt)
    return res.status(400).send("Linket er udløbet");
  // 5) markér token som brugt (one-time)
  entry.used = true;
  loginTokens.set(token, entry);
  // 6) OK
   console.log(`Token OK. Bruger: ${req.entry.username}`)
    return res.render('min-side');
});

//error handler

//opsætning
app.listen(port, IP, () => {
  console.log(`Serveren kører på http://${IP}:${port}`);
});
