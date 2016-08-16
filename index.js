#!/usr/bin/env node --harmony

let path = require('path');
let yargs = require('yargs');
let DB = require('./db');
let DayOne = require('./dayone');

let argv = yargs
.usage('Usage: $0 [path]')
.command('[path]', 'specify the path of your DAYONE journals')
.help('h')
.alias('h', 'help')
.epilog('copyright 2016')
.argv;

let dayone = new DayOne(new DB);
// dayone.getJournals();
dayone.updateAllJournals();
// dayone.deployToRemoteHexo();
// dayone.deployToRemoteRepo(); // TODO need add msg
