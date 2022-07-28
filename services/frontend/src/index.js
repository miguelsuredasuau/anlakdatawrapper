#!/usr/bin/env node

const { create, start } = require('./server');

create().then(start);
