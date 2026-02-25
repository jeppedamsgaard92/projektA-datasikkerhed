//opsætning
const express = require("express");
const app = express();
const port = 3000;
const IP = "127.0.0.1";
app.use(express.static("public")); //hvis præcis url findes i public, så tilgås disse
app.set("view engine", "ejs"); //bruger EJS default opsætning som tilgår .ejs filer i "./views" mappen

//til token (til log in link)
const crypto = require("crypto"); // Importerer Node's indbyggede "crypto"-modul. Det bruges til at lave kryptografisk sikre, tilfældige værdier. Det er vigtigt, fordi login-tokens ikke må kunne gættes.
function makeToken() { // Funktion der genererer et unikt login-token
  const randomBuffer = crypto.randomBytes(32); // crypto.randomBytes(32) --> genererer 32 tilfældige bytes (256 bits) --> jo flere bytes, jo sværere er det at gætte tokenet --> 32 bytes er mere end rigeligt (ifølge chatgpt) til et sikkert engangslink
  const token = randomBuffer.toString("hex"); // .toString("hex") --> konverterer de rå bytes til en hex-streng --> fx: "a3f9c8e2b4..." --> hex betyder at hver byte bliver repræsenteret som 2 tegn (0-9, a-f) --> 32 bytes bliver til 64 tegn i hex
  return token; // Returnerer tokenet så vi kan gemme det og sende det i mail-linket
}

//token lager (holder styr på tokens der er sendt ud)
const loginTokens = new Map(); // token -> { username, expiresAt, used } // set() i en Map sætter et key → value pair.

//til email - det her er ren chatGPT. Jeg aner ikke, hvad der er hvad.
require("dotenv").config({ path: "mailstuff.env" });
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
function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}
app.use(logger);

//authenticator
function authenticateCredentials(req, res, next) {
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

  req.user = user;
  next();
}

function issueToken(req, res, next) {
  const user = req.user;

  const token = makeToken(); //laver token
  // token udløber om 10 minutter
  const expiresAt = Date.now() + 10 * 60 * 1000;

  // gem token server-side så vi kan verificere det senere
  loginTokens.set(token, {
    username: user.username,
    expiresAt: expiresAt,
    used: false,
  });

  req.verifyLink = `http://${IP}:${port}/verify?token=${token}`; //link til min lokale server med en query ?token=${token} i url'en
  next();
}

async function sendMagicLink(req, res, next) {
  const user = req.user;
  const verifyLink = req.verifyLink;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Dit login-link",
      text: `Klik på linket for at logge ind: ${verifyLink}`,
      html: `<p>Klik på linket for at logge ind:</p><p><a href="${verifyLink}">${verifyLink}</a></p>`,
    });

    next();
  } catch (err) {
    console.error(err);
    res.status(500).send("Fejl ved sending");
  }
}

//verify middleware (samlet i én)
function verifyToken(req, res, next) {
  const token = req.query.token; // token fra URL'en
  // 1) mangler token?
  if (!token) return res.status(400).send("Mangler token");
  // 2) findes token i mit lager?
  const entry = loginTokens.get(token);
  if (!entry) return res.status(400).send("Ugyldigt link (token findes ikke)");
  // 3) er token allerede brugt?
  if (entry.used) return res.status(400).send("Linket er allerede brugt");
  // 4) er token udløbet?
  if (Date.now() > entry.expiresAt) return res.status(400).send("Linket er udløbet");
  // 5) markér token som brugt (one-time)
  entry.used = true;
  loginTokens.set(token, entry);

  req.entry = entry;
  next();
}

//response/route
app.get("/login", (req, res) => {
  res.render("login", { error: null }); // Express finder views/login.ejs og siger første gang, at der selvfølgelig ingen fejl er
});

app.post("/login",
  authenticateCredentials,
  issueToken,
  sendMagicLink,
  (req, res) => {
    return res.render("check-email", { email: req.user.email });
  }
);

app.get("/verify",
  verifyToken,
  (req, res) => {
    // 6) OK
    console.log(`Token OK. Bruger: ${req.entry.username}`)
    return res.render('min-side');
  }
);

//error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Serverfejl");
});

//email test --> for at teste mail når server kører: http://127.0.0.1:3000/testmail
app.get("/testmail", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // sender til dig selv
      subject: "Test fra Node app",
      text: "Hvis du kan læse dette, virker det.",
    });

    res.send("Mail sendt!");
  } catch (err) {
    console.error(err);
    res.send("Fejl ved sending");
  }
});

//opsætning
app.listen(port, IP, () => {
  console.log(`Serveren kører på http://${IP}:${port}`);
});