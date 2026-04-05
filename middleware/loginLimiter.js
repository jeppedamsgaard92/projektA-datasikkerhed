import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 5,                   // max 5 forsøg

    // Identificérer bruger via brugernavn med IP som fallback
    keyGenerator: (req) => {
        return req.body.username || req.ip;
    },

    message: "For mange loginforsøg for denne bruger. Prøv igen senere.",

    standardHeaders: true,
    legacyHeaders: false
});

