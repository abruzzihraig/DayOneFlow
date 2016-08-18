const AUTH_CFG = require('./auth_config');
const GithubApi = require('github');
const CFG = require('./config');

class Github {
  constructor() {
    this.github = new GithubApi({
      debug: true,
      protocol: 'https',
      host: 'api.github.com',
      headers: {
        'user-agent': 'DayOneFlow'
      },
      followRedirects: false,
      timeout: 5000
    });

    this.github.authenticate({
        type: 'oauth',
        token: AUTH_CFG.GITHUB_TOKEN
    });
  }

  createIssue(journalName = 'test') {
    return this.github.issues.create({
      user: CFG.GITHUB_USER,
      repo: CFG.REVIEW_REPO,
      title: `Review for the journal ${journalName}`,
      labels: ['help wanted'],
      body: 'Any advice would be appreciated, thanks!'
    });
  }
}

module.exports = Github;
