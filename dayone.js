class DayOne {
  constructor(db) {
    this.db = db;
  }

  getJournals() {
    this.db.getAll('select ZTEXT, ZCREATIONDATE from ZENTRY').then(data => {
      var results = data.map((val) => {
        var time = (val.ZCREATIONDATE + 978307200) * 1000; // convert unix timestamp to milliseconds could handle by JS

        return {
          createDate: new Date(time),
          text: val.ZTEXT
        };
      });

      console.info(results);
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

module.exports = DayOne;
