module.exports = {
  JOURNAL_PATH: '/Users/abruzzi/Library/Group Containers/5U8NS4GX82.dayoneapp2/Data/Documents/DayOne.sqlite',
  LOCAL_REPO_PATH: './post/' || '/Users/abruzzi/Public/road-for-revenge',
  LOCAL_HEXO_PATH: './post/' || '/Users/abruzzi/Public/road/source/_posts',
  LOCAL_HEXO_POST_PATH: '/Users/abruzzi/Public/road/source/_posts',
  TITLE_LEVEL: 3, // H1-H6
  GITHUB_USER: 'abruzzihraig',
  REVIEW_REPO: 'DayOneFlow',
  ISSUE_TITLE: 'Review',
  HEXO_POST_TEMPLATE:
`---
title: {{ title }}
date: {{ dateStr }}
categories: Journal
issueId: {{ issueId }}
tags:{{ tagsYaml }}
---

{{ content }}

*Pls comment on the relative Issue of this journal on my Github, any advice would be appreciated!*`
};
