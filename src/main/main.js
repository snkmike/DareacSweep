const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { openBrowser, openPage } = require('./browser');
const { performActions } = require('./actions');  // Vérifiez que le chemin est correct
const { readCSV } = require('./csvHandler');
const { loadKatalonScenario, moulinette } = require('./scenarioHandler');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, '../preload.js'),
            contextIsolation: true,
            enableRemoteModule: false
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('load-csv', async (event, filePath) => {
    return await readCSV(filePath);
});

ipcMain.handle('save-config', async (event, config) => {
    let configs = [];
    const CONFIG_FILE = 'configurations.json';
    if (fs.existsSync(CONFIG_FILE)) {
        const data = await fs.readFile(CONFIG_FILE, 'utf8');
        configs = JSON.parse(data);
    }
    configs.push(config);
    await fs.writeFile(CONFIG_FILE, JSON.stringify(configs, null, 2), 'utf8');
    return 'Configuration saved successfully';
});

ipcMain.handle('load-config', async () => {
    const CONFIG_FILE = 'configurations.json';
    if (fs.existsSync(CONFIG_FILE)) {
        const data = await fs.readFile(CONFIG_FILE, 'utf8');
        return JSON.parse(data);
    }
    return [];
});

ipcMain.handle('start-sweep', async (event, data) => {
    const { url, scenarioFilePath } = data;
    const logFilePath = 'log.txt';

    try {
        const csvData = await readCSV('datas.csv');
        const headers = csvData.shift();
        const scenario = await loadKatalonScenario(scenarioFilePath);
        const pages = moulinette(scenario);

        for (const [index, row] of csvData.entries()) {
            const email = row['email'] || 'unknown';
            let browser;
            const maxRetries = 3;
            let attempt = 0;
            while (attempt < maxRetries) {
                try {
                    const { browser } = await openBrowser(email);
                    const page = await openPage(browser, url);

                    let actionLogs = [];
                    for (const pageCommands of pages) {
                        await delay(3000);
                        for (const action of pageCommands.actions) {
                            const results = await performActions(page, [action], row);
                            actionLogs = actionLogs.concat(results);
                        }
                        await delay(10000);
                    }

                    await fs.appendFile(logFilePath, `Success: URL: ${url}, Email: ${email}, Actions: ${actionLogs.join(', ')}\n`);
                    await browser.close().catch((err) => console.error('Error closing browser:', err));
                    await delay(120000);
                    break;
                } catch (error) {
                    await fs.appendFile(logFilePath, `Fail: URL: ${url}, Email: ${email}, Attempt: ${attempt + 1}, Error: ${error.message}\n`);
                    attempt++;
                } finally {
                    if (browser) {
                        browser.close().catch((err) => console.error('Error closing browser:', err));
                    }
                }
            }
            if (attempt === maxRetries) {
                await fs.appendFile(logFilePath, `Final Fail: URL: ${url}, Email: ${email}\n`);
            }
        }
    } catch (error) {
        console.error('Error in main script execution:', error);
        return `Error: ${error.message}`;
    }
    return 'Sweep completed';
});
