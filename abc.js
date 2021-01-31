// const generate = require('nanoid/generate');
// const nanoid = require('nanoid').

// const { random, customRandom } = require('nanoid');

// const nanoid = customRandom("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 7, random)
// console.log(nanoid())


// console.log(generate("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 7))


// new Promise((resolve, reject) => {
//     db.query('select id from shortlinks where id = ? and shortend = ?;', [checkID, short], (err, results, fields) => {
//         console.log(err);
//         console.log(results);
//         console.log(fields);
//         if (err) {
//             reject({
//                 error: err,
//                 results: results,
//                 fields: fields
//             });
//         } else {
//             if (results.length > 0) {
//                 resolve({doesExist: true, results: results});
//             } else if (results.length == 0) {
//                 resolve({doesExist: false});
//             }
//         }
//     });
// });

const db = require('mysql').createPool({
    host: "sql165.main-hosting.eu",
    database: "u800182220_miniurl",
    user: "u800182220_miniurl",
    password: "mini@url",
    multipleStatements: true
});
let result1, result2
db.query("SET @newShort = 1; SET @insertID = 1;call insert_ShortLink(?, ?, ?, @newShort, @insertID); select @newShort as abc; select @insertID as def;", ['trial6', 'https://www.mysqltutorial.org/mysql-nodejs/call-stored-procedures/', new Date().toISOString()],  (err, results, fields) => {
    console.log(err);
    console.log(results);
    console.log(fields);
});



