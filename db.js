var sqlite3 = require('sqlite3').verbose();
var cfg = require('./config');

class DB {
  getDB() {
    var db = db || null;
    if (db) return Promise.resolve(db);

    return new Promise((res, rej) => {
      db = new sqlite3.Database(cfg.JOURNAL_PATH, sqlite3.OPEN_READONLY, (err) => {
        err ? rej(err) : res(db);
      });
    });
  }

  getAll(query, params=[]) {
    return new Promise((res, rej) => {
      this.getDB().then(db => {
        db.all(query, params, (err, rows) => {
          err ? rej(err) : res(rows);
        })
      })
    })
  }
}

module.exports = DB;
