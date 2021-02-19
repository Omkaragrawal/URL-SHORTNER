const { Pool } = require('pg');
if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production") {
    let dotenv = require('dotenv').config();
    console.log("inside env");
};
global.db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
(
    async () => {
        try {
            let results = await db.query('insert into public.shortlinks(shortend, actual_link) values ($1, $2) returning *;', ["google", "https://google.com"]);
            console.log(await results);
            await db.end();
        } catch (err) {
            console.log(err);
        }
    }
)();