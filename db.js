let sqlite3 = require('sqlite3').verbose();
let cfg = require('./config');

class DB {
  constructor() {
    this.db = null;
  }

  getDB() {
    let db = this.db;
    if (db) return Promise.resolve(db);

    return new Promise((res, rej) => {
      this.db = new sqlite3.Database(cfg.JOURNAL_PATH, sqlite3.OPEN_READONLY, (err) => {
        err ? rej(err) : res(this.db);
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
