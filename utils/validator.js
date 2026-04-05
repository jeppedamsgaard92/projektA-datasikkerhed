/*
Zod er et TypeScript-first valideringsbibliotek. Det betyder, at du beskriver formen på dine data i et schema, og derefter kan Zod både validere data ved runtime og udlede TypeScript-typer automatisk fra det samme schema. Zod 4 er den aktuelle stabile hovedversion, og installationen er typisk npm install zod.
Den store idé er denne: TypeScript beskytter dig mest under udvikling, men når data kommer udefra — fx fra formularer, API-kald, localStorage eller URL-parametre — kan de stadig være forkerte ved runtime. Zod lægger et sikkerhedsnet ind dér, hvor TypeScript alene ikke er nok. Ifølge dokumentationen kan et schema beskrive alt fra simple værdier som string og number til komplekse objekter og arrays.
*/

// Importerer Zod biblioteket.
// Vi bruger destructuring for kun at hente "z" objektet fra pakken.
const { z } = require("zod");


// Opretter et schema til at validere data for oprettelse af en bruger
// z.object(...) betyder at vi forventer et objekt med bestemte felter
const createUserSchema = z.object({

  // Email felt
  email: z
    .string() // værdien skal være en string
    .email({message: "Ugyldig email"}), // skal være en gyldig email (ellers returneres denne fejlbesked)


  // Brugernavn felt
  username: z
    .string() // skal være tekst
    .min(3, "Brugernavn for kort"), 
    // minimum 3 tegn. Hvis kortere → fejlbesked


  // Password felt
  password: z
    .string() // password skal være en string
    .min(8, "Kodeord mindst 8 tegn") 
    // mindst 8 tegn

    .regex(/[A-ZÆØÅ]/, "Mindst ét stort bogstav") 
    // regex validering: password skal indeholde mindst ét stort bogstav
    // inkluderer også danske bogstaver Æ Ø Å

    .regex(/[!@#$%^&*_+\-=?\.]/, "Mindst ét specialtegn"),
    // regex validering: password skal indeholde mindst ét specialtegn
    // listen i [] bestemmer hvilke tegn der accepteres


  // Gentag password
  passwordRepeat: z.string()
  // skal også være en string
  // der er endnu ingen regler her — vi sammenligner den senere

})


// refine bruges til at validere flere felter samtidig
// her tjekker vi at password og passwordRepeat er ens
.refine(
  data => data.password === data.passwordRepeat, 
  // "data" er hele objektet der bliver valideret

  {
    message: "Kodeord matcher ikke", 
    // fejlbesked hvis valideringen fejler

    path: ["passwordRepeat"]
    // fortæller Zod at fejlen skal tilknyttes passwordRepeat feltet
    // (så en form kan vise fejlen på det rigtige inputfelt)
  }
);


// Eksporter schemaet så det kan bruges i andre filer
module.exports = createUserSchema;