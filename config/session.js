const session = require("express-session");
// med express-session importerer du et bibliotek (en middleware), der giver din server evnen til at håndtere sessions.

function createSessionMiddleware() {
  return session({
    secret: process.env.SESSION_SECRET || 'hej', //process: Er et globalt objekt i Node.js, der giver adgang til informationer om den kørende proces (dit program). .env: Er en samling af miljøvariabler, som operativsystemet eller din app-konfiguration har indlæst. SESSION_SECRET: Er navnet på den specifikke variabel, du leder efter.
    resave: false, //Gem ikke session igen, hvis den ikke er ændret.
    saveUninitialized: false, //Lav ikke tomme sessioner til alle besøgende.
    cookie: {
      httpOnly: true, //Gør cookien utilgængelig for client-side JavaScript. 
      secure: false,      // På localhost er den typisk false. I produktion med HTTPS bør den være true.
      sameSite: "lax",    // godt standardvalg
      maxAge: 1000 * 60 * 30, // 30 minutter
    },
  });
}

module.exports = createSessionMiddleware;