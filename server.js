"use strict"
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mysql = require('mysql');
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

const db = mysql.createPool({
    host: "sql165.main-hosting.eu",
    database: "u800182220_miniurl",
    user: "u800182220_miniurl",
    password: "mini@url"
});

const app = express();
app.use(compression());
app.use(helmet());
// app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use((req, res, next) => {
    const checkShort = (short, checkID) => {
        return new Promise((resolve, reject) => {
            db.query('select id from shortlinks where id = ? and shortend = ?;', [checkID, short], (err, results, fields) => {
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


app.get('/', (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get('/index.js', (req, res) => res.sendFile(path.join(__dirname, "index.js")));
app.post('/createLink', (req, res) => {
    const createNewEntry = (shortend = nanoid(), ocLink = req.body.toShorten, responseObject = res) => {
        try {
            db.query('insert into shortlinks(shortend, actual_link, creation_date) values (?, ?, ?);', [shortend, ocLink, new Date().toISOString()], (err, results, fields) => {
                if (err) {
                    console.log("ERROR on line 73: ", err);
                    responseObject.send(err);
                } else {
                    // console.log(fields);
                    // console.log("Results: ", results);
                    responseObject.send({
                        "success": "SUCCESS",
                        "results": results,
                        "fields": fields,
                        "shortLink": shortend
                    });
                }
            });
        } catch (err) {
            console.log(err);
            responseObject.send(err);
        }
    };

    if (req.body.toShorten) {

        if (req.body.customShortner) {
            if (["", "index.js", "createLink", "changeShort", "allLinks"].includes(req.body.customShortner)) {
                res.send({alreadyExist: true})
            } else {
                db.query('select * from shortlinks where BINARY shortend = ?', [req.body.customShortner], (err, results, fields1) => {
                    if (err) {
                        res.send({
                            err: err
                        })
                    } else {
                        if (results.length < 1) {
                            createNewEntry(req.body.customShortner);
                        } else if (results.length > 0) {
                            res.send({
                                "alreadyExist": results
                            });
                        };
                    }
                });
            }
        } else {
            createNewEntry()
        }

    } else {
        res.status(400).send(`INVALID REQUEST`);
    }
});

app.post('/changeShort', (req, res) => {
    const {
        linkID,
        short,
        newLink
    } = req.body;

    if (!req.checkShort) {
        console.log('checkShort invalid')
        res.send("checkShort invalid");
    } else {
        // console.log(req.checkShort);
    }
    req.checkShort(short, linkID, res)
        .then(({
            doesExist,
            results
        }) => {

            // console.log("exists? ", doesExist);
            // console.log("results: ", results);
            // res.json({doesExist, results});
            if (!doesExist) {
                // console.log(doesExist);
                // console.log(results);
                res.status(400).send("Invalid parameters");
            } else {
                // if (results)
                db.query('UPDATE shortlinks SET actual_link = ?, creation_date = ?, total_clicks = 0 where id = ? and shortend = ?', [newLink, new Date().toISOString(), linkID, short], (err, updateResult, fields) => {
                    if (err) {
                        console.log("ERROR on 138: ", err);
                        res.send(err);
                    } else {
                        // console.log(fields);
                        // console.log(updateResult);
                        res.json({
                            success: true,
                            results: updateResult,
                            fields: fields
                        });
                    }
                });
            }
        }).catch((err) => {
            // console.log("ERROR on line 152: ", err);
            res.send({
                success: false,
                results: err
            });
        });
});

app.get("/allLinks", (req, res) => {
    db.query("select * from shortlinks", (...query) => {
        res.send(query[1]);
    })
});
app.all("/:shortened", ({
    params: {
        shortened
    }
}, res) => {
    // console.log(mysql.escape(shortened))
    // console.log(req.params.shortened);

    if (shortened) {
        db.query('select id, actual_link from shortlinks where shortend = ?', [shortened], (err, results, fieldInfo) => {
            // const toRedirectLink = results[0].actual_link
            // console.log(toRedirectLink);
            // console.log(results[0].id);
            if (err) {
                console.log(err)
                res.send(err);
            } else if (results.length > 0) {
                db.query('UPDATE shortlinks SET total_clicks = total_clicks + 1 where id = ?', [results[0].id], (err, result, field) => {
                    if (err) {
                        res.send(err)
                    } else {
                        res.redirect(results[0].actual_link)
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
    db.getConnection((err, ...abc) => {
        // console.log(abc);
        if (err) {
            console.log(err);
            return err;
        }
        console.log("DB Connected!!!")
    });
    console.log(`URL shortner app listening on ${port} port!`);
})