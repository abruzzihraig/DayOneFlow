## Purpose

Journals flow based on DayOne2 for automatically compile&deploy.

## Process
// TODO: need a graph here to indicate the journal flow

## TODO
- [x] Read journal data from the sqlite3 DB that DayOne2 used
- [x] Transfer and decorate the original journal data to the local repository of [road-for-revenge](https://github.com/abruzzihraig/road-for-revenge)
- [x] Transfer and compile the original journal data with yaml template to the local [Hexo](https://hexo.io/) posts folder
- [x] Deploy the local resitory road-for-revenge to remote
- [x] Generate and deploy the hexo posts to the branch gh-pages of road-for-revente
- [x] Create a new issue for each new post on Github
- [ ] Transfer location data among 3 platforms
- [ ] Transfer weather data among 3 platforms
- [ ] Transfer music data between DayOne and Hexo posts
- [ ] Recompile journals with date filter
- [ ] Support avaiable args for the cli tools
- [ ] Transfer static resources between 3 platforms (hard)
