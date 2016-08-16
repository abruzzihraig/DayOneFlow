#!/usr/bin/env node --harmony

var path = require('path');
var yargs = require('yargs');
var DB = require('./db');
var DayOne = require('./dayone');

var argv = yargs
.usage('Usage: $0 [path]')
.command('[path]', 'specify the path of your DAYONE journals')
.help('h')
.alias('h', 'help')
.epilog('copyright 2016')
.argv;

var dayone = new DayOne(new DB);
dayone.getJournals();
dayone.updateAllJournals();
dayone.deployToRemoteHexo();
