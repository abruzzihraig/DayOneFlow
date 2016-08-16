#!/usr/bin/env node --harmony

var sqlite3 = require('sqlite3').verbose();
var path = require('path');
var yargs = require('yargs');
var journalPath = '/Users/abruzzi/Library/Group Containers/5U8NS4GX82.dayoneapp2/Data/Documents/DayOne.sqlite';

var argv = yargs
    .usage('Usage: $0 [path]')
    .command('[path]', 'specify the path of your DAYONE journals')
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2016')
    .argv;

yargs.showHelp();


class DB {
  getDB() {
    var db = db || null;
    if (db) return Promise.resolve(db);

    return new Promise((res, rej) => {
      db = new sqlite3.Database(journalPath, sqlite3.OPEN_READONLY, (err) => {
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


class DayOne {
  constructor() {
    this.db = new DB();
  }

  getJournals() {
    this.db.getAll('select ZTEXT, ZCREATIONDATE from ZENTRY').then(res => {
      var results = rows.map((val) => {
        var time = (val.ZCREATIONDATE + 978307200) * 1000; // convert unix timestamp to milliseconds could handle by JS

        return {
          createDate: new Date(time),
          text: val.ZTEXT
        };
      });
    }, (err) => {
      console.error(err);
    });
  }

  writeToGithub() {
  }

  writeToHexo() {
  }

  createIssue() {
  }
}

var dayone = new DayOne();
