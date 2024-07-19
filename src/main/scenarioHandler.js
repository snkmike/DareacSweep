const fs = require('fs').promises;
const path = require('path');

async function loadKatalonScenario(filePath) {
    const fullPath = path.join('scenarioKatalon', filePath);
    const data = await fs.readFile(fullPath, 'utf8');
    return JSON.parse(data);
}

function moulinette(scenario) {
    const pages = [];
    let currentCommands = [];

    scenario.forEach(item => {
        if (item.command === 'open') {
            return;
        }

        let target = item.target;
        if (target.startsWith('id=')) {
            target = `#${target.substring(3)}`;
        } else if (target.startsWith('class=')) {
            target = `.${target.substring(6)}`;
        } else if (target.startsWith('xpath=')) {
            target = target.substring(6);
        }

        const newItem = { ...item, target };

        if (!newItem.command || !newItem.target) {
            return;
        }

        currentCommands.push(newItem);

        if (item.command === 'click' && item.value === 'submit') {
            pages.push({ actions: currentCommands });
            currentCommands = [];
        }
    });

    if (currentCommands.length > 0) {
        pages.push({ actions: currentCommands });
    }

    return pages;
}

module.exports = { loadKatalonScenario, moulinette };
