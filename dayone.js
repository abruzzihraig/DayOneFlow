const CFG = require('./config');
const fs = require('fs');
const path = require('path');
const colors = require('colors');
const _ = require('underscore');
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;

/*
 * Convert unix timestamp to milliseconds could handle by JS
 */
const timestampConvert = (timestamp) => {
  return new Date((timestamp + 978307200) * 1000);
};

class DayOne {
  constructor(db, github) {
    this.db = db;
    this.github = github;
    this.journals = null;
  }

  /*
   * Get journals from DayOne DB
   *
   * Params query: A query for fetch journals from DayOne DB
   *
   * Return Promise: A promise will return journals within the specific sql condition
   */
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

  /*
   * Extract filenames of reviewable repository from the DayOne journals
   *
   * Params journals: Filterd DayOne journals
   *
   * Return []: Mutated journals with reviewable filenames
   */
  extractFilenamesForRepo(journals) {
    return journals.map(val => {
      let cd = val.createDate;
      let title = val.text.replace(/#/g, '').trim().split('\n')[0].split(' ').join('-').toLowerCase();
      let date = `${cd.getMonth()+1}-${cd.getDate()}-${val.createDate.getFullYear()}`;
      val.filename = `${date}-${title}.journal.md`;
      return val;
    });
  }

  /*
   * Extract tags from a specific DayOne journal
   *
   * Params journal: A specific DayOne journal
   *
   * Return Promise: a promise will return tags of the journal from DayOne DB
   */
  extractTags(journal) {
    let query = `select ZTAG.ZNAME from Z_2TAGS inner join ZTAG on Z_2TAGS.Z_21TAGS=ZTAG.Z_PK where Z_2TAGS.Z_2ENTRIES = ${journal.id}`;

    return this.db.getAll(query).then(data => {
      return _.pluck(data, 'ZNAME');
    });
  }

  /*
   * Extract filemaes of Hexo posts from the DayOne journal
   *
   * Params journals: Filterd DayOne journals
   *
   * Return []: Mutated journals with hexo post filenames
   */
  extractFilenamesForHexo(journals) {
    return journals.map(val => {
      let cd = val.createDate;
      let title = val.text.replace(/#/g, '').trim().split('\n')[0].split(' ').join('-');
      val.filename = `${title}.md`;
      return val;
    });
  }

  /*
   * Extract issueId from a Hexo post
   *
   * Params journal: A specific DayOne journal
   *
   * Return Promise: a promise will return a mutated journal with an issueId
   *
   * Note: filenames will be match hexo posts
   */
  extractIssueIdFromHexo(journal) {
    return new Promise((res, rej) => {
      fs.readFile(path.join(CFG.LOCAL_HEXO_POST_PATH, journal.filename), 'utf8', (err, data) => {
        if (err) {
          err.code === 'ENOENT' ? rej(journal) : rej(err);
        } else {
          journal.issueId = data.match(/^issueId:\s*(\d+)$/m)[1] || '';
          res(journal);
        }
      });
    });
  }

  /*
   * Write DayOne journals to local reviewable repository
   *
   * Params journals: Filterd DayOne journals
   *
   * No retrun
   */
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

  /*
   * Deploy journals which are new or have been changed to the reviewable repository
   *
   * Params msg: Commit message
   *
   * No return
   */
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

  /*
   * Write DayOne journals to local Hexo post folder
   *
   * Params journals: Filterd DayOne journals
   *
   * No return
   */
  writeToLocalHexo(journals) {
    let tasks = this.extractFilenamesForHexo(journals)
    .map(val => {
      let cd = val.createDate;
      let firstLine = val.text.split('\n')[0];

      val.title = firstLine.replace(/#/g, '').trim();
      val.content = val.text.replace(firstLine + '\n', '');
      val.dateStr = `${cd.getFullYear()}-${cd.getMonth()+1}-${cd.getDate()} ${cd.getHours()}:${cd.getMinutes()}:${cd.getSeconds()}`;
      return val;
    })
    .map(val => {
      return this.extractTags(val).then(data => {
        val.tags = data;

        val.tagsYaml = val.tags.reduce((prev, cur) => {
          return prev + `\n- ${cur}`;
        }, '');

        return val;
      });
    })
    .map(asyncTask => {
      return asyncTask.then((val) => {
        return this.extractIssueIdFromHexo(val);
      });
    })
    .map(asyncTask => {
      return asyncTask.then(val => {
        return Promise.resolve(val);
      }, (val) => {
        if (val instanceof Error) return console.error(val);

        return this.github.createIssue(val.title).then(resp => {
          val.issueId = resp.number;
          return val;
        })
      })
    })
    .forEach(asyncTask => {
      asyncTask.then(val => {
        val.text = _.template(CFG.HEXO_POST_TEMPLATE, { interpolate: /\{\{(.+?)\}\}/g })(val);

        fs.writeFile(path.join(CFG.LOCAL_HEXO_PATH, val.filename), val.text, 'utf8', (err) => {
          if (err) console.error(err);
        });
      })
    })
  }

  /*
   * Deploy journals which are new or have been changed to the Hexo repository
   *
   * No return
   */
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

  /*
   * Process all of journals from DayOne
   *
   * No return
   */
  updateJournals(query = '') {
    this.getJournals(query).then((journals) => {
      this.writeToLocalRepo(journals);
      this.writeToLocalHexo(journals);
    }, err => console.error(err.red));
  }

  /*
   * Process recent journals from DayOne
   *
   * No return
   */
  updateRecentJournals() {
    query = 'select Z_PK, ZTEXT, ZCREATIONDATE, ZMODIFIEDDATE from ZENTRY where ZMODIFIEDDATE > '; // TODO filter with date
    this.updateJournals(query);
  }
}

module.exports = DayOne;
