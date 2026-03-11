const crypto = require("crypto"); // Importerer Node's indbyggede "crypto"-modul. Det bruges til at lave kryptografisk sikre, tilfældige værdier. Det er vigtigt, fordi login-tokens ikke må kunne gættes.
function makeToken() {
  // Funktion der genererer et unikt login-token
  const randomBuffer = crypto.randomBytes(32); // crypto.randomBytes(32) --> genererer 32 tilfældige bytes (256 bits) --> jo flere bytes, jo sværere er det at gætte tokenet --> 32 bytes er mere end rigeligt (ifølge chatgpt) til et sikkert engangslink
  const token = randomBuffer.toString("hex"); // .toString("hex") --> konverterer de rå bytes til en hex-streng --> fx: "a3f9c8e2b4..." --> hex betyder at hver byte bliver repræsenteret som 2 tegn (0-9, a-f) --> 32 bytes bliver til 64 tegn i hex
  return token; // Returnerer tokenet så vi kan gemme det og sende det i mail-linket
}

//token lager (holder styr på tokens der er sendt ud)
const loginTokens = new Map(); // token -> { username, expiresAt, used } // set() i en Map sætter et key → value pair.

module.exports = {
  makeToken,
  loginTokens,
};