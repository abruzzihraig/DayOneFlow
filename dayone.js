const CFG = require('./config');
const fs = require('fs');
const path = require('path');
const colors = require('colors');
const _ = require('underscore');
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;

/**
 * convert unix timestamp to milliseconds could handle by JS
 */
const timestampConvert = (timestamp) => {
  return new Date((timestamp + 978307200) * 1000);
};

class DayOne {
  constructor(db) {
    this.db = db;
    this.journals = null;
  }

  getJournals(query = 'select Z_PK, ZTEXT, ZCREATIONDATE, ZMODIFIEDDATE from ZENTRY') {
    let journals = this.journals;

    if (journals) return Promise.resolve(journals);

    return this.db.getAll(query).then(data => {
      this.journals = data.map((val) => {
        return {
          id: val.Z_PK,
          createDate: timestampConvert(val.ZCREATIONDATE),
          modifiedDate: timestampConvert(val.ZMODIFIEDDATE),
          text: val.ZTEXT,
        };
      });
      return this.journals;
    }, (err) => {
      console.error(err.red);
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

  extractTags(journal) {
    let query = `select ZTAG.ZNAME from Z_2TAGS inner join ZTAG on Z_2TAGS.Z_21TAGS=ZTAG.Z_PK where Z_2TAGS.Z_2ENTRIES = ${journal.id}`;

    return this.db.getAll(query).then(data => {
      return _.pluck(data, 'ZNAME');
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
      let title = '#'.repeat(CFG.TITLE_LEVEL) + ' ' + firstLine.replace(/#/g, '').trim();

      val.text = val.text.replace(firstLine, title);
      return val;
    })
    .forEach(val => {
      fs.writeFile(path.join(CFG.LOCAL_REPO_PATH, val.filename), val.text, 'utf8', (err) => {
        if (err) console.error(err.red);
      });
    });
  }

  deployToRemoteRepo(msg = '') {
    exec(`git add --all && git commit -m ${msg} && git push`, { cwd: CFG.LOCAL_REPO_PATH }, (err, stdout, stderr) => {
      if (err) {
        console.error(err.red);
      } else {
        console.log(`Repo Deploying: ${stdout}`.green);
        console.error(`Repo Deploying Error: ${stdout}`.red);
      }
    });
  }

  writeToLocalHexo(journals) {
    let tasks = this.extractFilenamesForHexo(journals)
    .map(val => {
      let cd = val.createDate;
      let firstLine = val.text.split('\n')[0];

      val.title = firstLine.replace(/#/g, '').trim();
      val.content = val.text.replace(firstLine + '\n', '');
      val.dateStr = `${cd.getFullYear()}-${cd.getMonth()+1}-${cd.getDate()} ${cd.getHours()}:${cd.getMinutes()}:${cd.getSeconds()}`;
      val.issueId = 3; // TODO need extract from existed journals

      return val;
    })
    .map(val => {
      return this.extractTags(val).then(data => {
        val.tags = data;

        val.tagsYaml = val.tags.reduce((prev, cur) => {
          return prev + `\n- ${cur}`;
        }, '');

        val.text = _.template(CFG.HEXO_POST_TEMPLATE, { interpolate: /\{\{(.+?)\}\}/g })(val);
        return val;
      })

      console.log(val.text.cyan)
    })

    Promise.all(tasks).then(dataList => {
      console.info(dataList)
      dataList.forEach(val => {
        fs.writeFile(path.join(CFG.LOCAL_HEXO_PATH, val.filename), val.text, 'utf8', (err) => {
          if (err) console.error(err);
        });
      })
    });
  }

  deployToRemoteHexo() {
    const hexoDeployer = spawn('hexo', ['--cwd', CFG.LOCAL_HEXO_PATH, 'generate', '-d']);

    hexoDeployer.stdout.on('data', (data) => {
      console.log(`Hexo: ${data}`.green);
    });

    hexoDeployer.stderr.on('data', (data) => {
      console.error(`Hexo Error: ${data}`.red);
    });

    hexoDeployer.on('close', (code) => {
      console.info(`Hexo process exited with code: ${code}`.yellow);
    });
  }

  createIssue() {
    // TODO create an issue with Github API
  }

  updateAllJournals() {
    this.getJournals().then((journals) => {
      this.writeToLocalRepo(journals);
      this.writeToLocalHexo(journals);
    }, err => console.error(err.red));
  }

  updateRecentJournals(lastModifiedTime) {
    // TODO filter with modified time

    this.getJournals().then((journals) => {
      this.writeToLocalRepo(journals);
      this.writeToLocalHexo(journals);
    }, err => console.error(err.red));
  }
}

module.exports = DayOne;
