"use strict"
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const { Pool } = require('pg');
const path = require('path');
const bodyParser = require("body-parser");
const compression = require('compression');
// const { customAlphabet } = require('nanoid');
const {
    customRandom,
    random
} = require('nanoid');
const nanoid = customRandom("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 7, random);

// const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 7);

if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production") {
    let dotenv = require('dotenv').config();
    console.log("inside env");
};

const app = express();
app.use(compression());
app.use(helmet());
// app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use((req, res, next) => {
    const checkShort = (short, checkID) => {
        return new Promise((resolve, reject) => {
            db.query('select id from public.shortlinks where id = ? and shortend = ?;', [checkID, short], (err, results, fields) => {
                console.log(err);
                console.log(results);
                console.log(fields);
                if (err) {
                    reject({
                        error: err,
                        results: results,
                        fields: fields
                    });
                } else {
                    if (results.length > 0) {
                        resolve({
                            doesExist: true,
                            results: results
                        });
                    } else if (results.length == 0) {
                        resolve({
                            doesExist: false
                        });
                    }
                }
            });
        });
    }
    req.checkShort = checkShort;
    next();
})

// console.log(process.env.PORT);
// console.log(process.env);
const port = process.env.PORT || 8081;


app.get('/', (req, res) => res.redirect('https://omkaragrawal.dev'));
app.get('/index.html', (req, res) => res.redirect('https://omkaragrawal.dev'));

app.get("/:shortened", async ({
    params: {
        shortened
    }
}, res) => {
    // console.log(pg.escape(shortened))
    // console.log(req.params.shortened);

    if (shortened) {
        db.query('select id, actual_link from public.shortlinks where shortend = $1;', [shortened], (err, results) => {
            // const toRedirectLink = results[0].actual_link
            // console.log(toRedirectLink);
            // console.log(results[0].id);
            if (err) {
                console.log(err)
                res.send(err);
            } else if (results.rowCount === 1) {
                db.query('UPDATE public.shortlinks SET total_clicks = total_clicks + 1 where id = $1;', [results.rows[0].id], (err, result, field) => {
                    if (err) {
                        res.send(err)
                    } else {
                        res.redirect(results.rows[0].actual_link)
                    }
                });
                // res.send({"results": results, "fields": fieldInfo});
                // res.redirect(results[0].actual_link);
            } else {
                res.status(404).send("Invalid Request No Entry");
            }
        });
    } else {
        res.status(404).send("Invalid Request");
    }
});
app.listen(port, () => {
    global.db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    // db = pool.connect()
    console.log(`URL shortner app listening on ${port} port!`);
});

process.on('exit', () => {
    console.log("Process exiting and closing the db");
    db.end();
});