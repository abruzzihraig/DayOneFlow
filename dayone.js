var cfg = require('./config');
var fs = require('fs');
var path = require('path');

/**
 * convert unix timestamp to milliseconds could handle by JS
 */
const timestampConvert = (timestamp) => {
  return new Date((timestamp + 978307200) * 1000);
};

class DayOne {
  constructor(db) {
    this.db = db;
  }

  getJournals(query = 'select ZTEXT, ZCREATIONDATE, ZMODIFIEDDATE from ZENTRY') {
    var journals = journals || null;

    if (journals) return Promise.resolve(journals);

    return this.db.getAll(query).then(data => {
      journals = data.map((val) => {
        return {
          createDate: timestampConvert(val.ZCREATIONDATE),
          modifiedDate: timestampConvert(val.ZMODIFIEDDATE),
          text: val.ZTEXT,
        };
      });
      return journals;
    }, (err) => {
      console.error(err);
    });
  }

  extractTitles(journals) {
    return journals.map(val => {
      return val.text.split('\n')[0];
    });
  }

  extractFilenamesForRepo(journals) {
    return journals.map(val => {
      let cd = val.createDate;
      let title = val.text.replace(/#/g, '').trim().split('\n')[0].split(' ').join('-').toLowerCase();
      let date = `${cd.getMonth()+1}-${cd.getDate()}-${val.createDate.getFullYear()}`;
      val.filename = `${date}-${title}.journal.md`;
      return val;
    });
  }

  extractFilenamesForHexo(journals) {
    return journals.map(val => {
      let cd = val.createDate;
      let title = val.text.replace(/#/g, '').trim().split('\n')[0].split(' ').join('-');
      val.filename = `${title}.md`;
      return val;
    });
  }

  writeToLocalRepo(journals) {
    this.extractFilenamesForRepo(journals)
    .map(val => {
      let firstLine = val.text.split('\n')[0];
      let title = '#'.repeat(cfg.TITLE_LEVEL) + ' ' + firstLine.replace(/#/g, '').trim();

      val.text = val.text.replace(firstLine, title);
      return val;
    })
    .forEach(val => {
      fs.writeFile(path.join('./post/', val.filename), val.text, 'utf8', (err) => {
        if (err) console.error(err);
      });
    });
  }

  deployToRemoteRepo() {
    // Use command line to deploy the repo
  }

  writeToLocalHexo(journals) {
    this.extractFilenamesForHexo(journals)
    .map(val => {
      let firstLine = val.text.split('\n')[0];
      let title = firstLine.replace(/#/g, '').trim();

      val.text = val.text.replace(firstLine + '\n', '');
      return val;
    })
    .forEach(val => {
      fs.writeFile(path.join('./post/', val.filename), val.text, 'utf8', (err) => {
        if (err) console.error(err);
      });
    });
  }

  deployToRemoteHexo() {
  }

  createIssue() {
  }

  updateAllJournals() {
    var query = 'select ZTEXT, ZCREATIONDATE, ZMODIFIEDDATE from ZENTRY';

    this.getJournals(query).then((journals) => {
      this.writeToLocalRepo(journals);
      this.writeToLocalHexo(journals);
    }, console.error);
  }

  updateRecentJournals(lastModifiedTime) {
    // TODO filter with modified time
    var query = 'select ZTEXT, ZCREATIONDATE, ZMODIFIEDDATE from ZENTRY';

    this.getJournals(query).then((journals) => {
      this.writeToLocalRepo(journals);
      this.writeToLocalHexo(journals);
    }, console.error);
  }
}

module.exports = DayOne;
