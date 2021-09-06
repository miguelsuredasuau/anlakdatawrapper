#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const error = (code, msg, listTpls = true) => {
    const templates = fs.readdirSync(TPL_BASE_PATH);
    process.stderr.write(msg + '\n');
    if (listTpls) {
        process.stderr.write(`\nAvailable templates are: \n - ${templates.join('\n - ')}\n`);
    }
    process.exit(code);
};

const TPL_BASE_PATH = path.join(__dirname, 'templates');

const log = msg => process.stdout.write(msg + '\n');

main(process.argv[2]);

async function main(tpl) {
    if (!tpl) {
        error(-1, 'Usage: scaffold [template]', true);
    }

    const templates = tpl.split(',');
    for (var i = 0; i < templates.length; i++) {
        await runTemplate(templates[i]);
    }

    log('\ndone!');
}

async function runTemplate(tpl) {
    const tplPath = path.join(TPL_BASE_PATH, tpl);

    if (!fs.existsSync(tplPath)) {
        error(-2, `Error: Unkown template ${tpl}`);
    }

    if (process.argv[3] === '--help') {
        const readmeFile = path.join(tplPath, 'readme');
        if (fs.existsSync(readmeFile)) {
            process.stdout.write(`scaffold ${tpl}\n\n`);
            process.stdout.write(fs.readFileSync(readmeFile) + '\n');
        } else {
            error(-3, `Sorry, no help found for ${tpl}, yet.`, false);
        }
        process.exit(0);
    }

    log(`running template ${tpl}\n`);
    // copy missing files
    const srcFiles = path.join(tplPath, 'files');
    if (fs.existsSync(srcFiles)) {
        log('copying files...');
        const { stderr } = await exec(`rsync -a -v --ignore-existing ${srcFiles}/ .`);
        if (stderr) {
            error(-3, `Error while copying files:\n${stderr}`, false);
        }
    }

    const tplJS = path.join(tplPath, 'index.js');
    if (fs.existsSync(tplJS)) {
        // run setup script
        await require(tplJS)();
    }
}
