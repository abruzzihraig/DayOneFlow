#!/usr/bin/env node --harmony

const path = require('path');
const yargs = require('yargs');
const DB = require('./db');
const DayOne = require('./dayone');
const Github = require('./github');

let argv = yargs
.usage('Usage: $0 [path]')
.command('[path]', 'specify the path of your DAYONE journals')
.help('h')
.alias('h', 'help')
.epilog('copyright 2016')
.argv;

let dayone = new DayOne(new DB, new Github);

dayone.updateAllJournals();
