const { plugin } = require('puppeteer-with-fingerprints');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const proxyPorts = [2001, 2002, 2003, 2004, 2005];
let currentPortIndex = 0;

async function openBrowser(email) {
    const userDataDir = `fingerprint/${email}`;
    const currentPort = proxyPorts[currentPortIndex];
    currentPortIndex = (currentPortIndex + 1) % proxyPorts.length;

    if (!fs.existsSync(userDataDir)) {
        const fingerprint = await plugin.fetch('zsTqJL67czxoGe79tGjjH7VOGUODCFXr2sjzem4OLQcnNrAIb1AagIdBl92VTAb9', {
            tags: ['Microsoft Windows', 'Chrome'],
        });

        plugin.useFingerprint(fingerprint);

        plugin.useProxy(`92.161.197.10:${currentPort}:H2KHK:G6Cqa`, {
            changeTimezone: true,
            changeGeolocation: true,
        });

        const browser = await plugin.launch({
            userDataDir: path.resolve(userDataDir),
            headless: false,
            args: [
                `--user-data-dir=${path.resolve(userDataDir)}`,
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--disable-dev-shm-usage',
                '--disable-extensions-except=/Developpement/DaSweep/extensions/Solver.Browser.Extension',
                '--load-extension=/Developpement/DaSweep/extensions/Solver.Browser.Extension'
            ]
        });

        return { browser };
    } else {
        plugin.useProxy(`92.161.197.10:${currentPort}:H2KHK:G6Cqa`, {
            changeTimezone: true,
            changeGeolocation: true,
        });

        const browser = await plugin.launch({
            headless: false,
            args: [
                `--user-data-dir=${path.resolve(userDataDir)}`,
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--disable-dev-shm-usage',
                '--disable-extensions-except=/Developpement/DaSweep/extensions/Solver.Browser.Extension',
                '--load-extension=/Developpement/DaSweep/extensions/Solver.Browser.Extension'
            ]
        });

        return { browser };
    }
}

async function openPage(browser, url) {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'load' });
    return page;
}

module.exports = { openBrowser, openPage };
