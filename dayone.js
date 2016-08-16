var cfg = require('./config');

/**
 * convert unix timestamp to milliseconds could handle by JS
 */
const function timestampConvert(timestamp) {
  return new Date(timestamp + 978307200) * 1000);
}

class DayOne {
  constructor(db) {
    this.db = db;
  }

  getJournals(query) {
    var journals = journals || null;

    if (journals) return Promise.resolve(journals);

    return this.db.getAll(query).then(data => {
      journals = data.map((val) => {
        return {
          createDate: timestampConvert(val.ZCREATIONDATE),
          text: val.ZTEXT
        };
      });
    }, (err) => {
      console.error(err);
    });
  }

  extractAllTitles(journals) {
    return journals.map(val => {
      // TODO extract title
      return val.text.match('###');
    });
  }

  writeToLocalRepo(journals) {
    var titles = extractAllTitles(journals);

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
    var query = 'select ZTEXT, ZCREATIONDATE from ZENTRY';

    this.getJournals(query).then((journals) => {
      this.writeToLocalRepo(journals);
      this.writeToLocalHexo(journals);
    }, console.error);
  }

  updateRecentJournals(lastModifiedTime) {
    // TODO filter with modified time
    var query = 'select ZTEXT, ZCREATIONDATE from ZENTRY';

    this.getJournals(query).then((journals) => {
      this.writeToLocalRepo(journals);
      this.writeToLocalHexo(journals);
    }, console.error);
  }
}

module.exports = DayOne;
