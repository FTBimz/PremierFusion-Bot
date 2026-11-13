const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');
const filePath = path.join(dataDir, 'triggers.json');

function loadAllData() {
    try {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
            return {};
        }
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        return typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null ? parsed : {};
    } catch (err) {
        console.error('[TriggerStore] Failed to load triggers.json:', err.message);
        return {};
    }
}

function getTriggers(guildId) {
    if (!guildId) return [];
    const allData = loadAllData();
    return Array.isArray(allData[guildId]) ? allData[guildId] : [];
}

function setTriggers(guildId, triggersList) {
    if (!guildId) return;
    const allData = loadAllData();
    allData[guildId] = triggersList.slice(0, 10); // Kunci maksimal 10 per server
    fs.writeFileSync(filePath, JSON.stringify(allData, null, 2));
}

module.exports = { getTriggers, setTriggers };