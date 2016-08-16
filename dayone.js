var cfg = require('./config');

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

  extractFilenames(journals) {
    return journals.map(val => {
      let cd = val.createDate;
      let title = val.text.replace(/#/g, '').trim().split('\n')[0].split(' ').join('-').toLowerCase();
      let date = `${cd.getMonth()+1}-${cd.getDate()}-${val.createDate.getFullYear()}`;
      return `${date}-${title}.journal.md`;
    });
  }

  writeToLocalRepo(journals) {
    var filenames = this.extractFilenames(journals);

    console.info(filenames)


    // Find if a journal is existed
    // fs.read(cfg.LOCAL_REPO_PATH, ...)
    //
    //
    // if it is existed, then update it, else create new one
  }

  deployToRemoteRepo() {
    // Use command line to deploy the repo
  }

  writeToLocalHexo(journals) {
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
