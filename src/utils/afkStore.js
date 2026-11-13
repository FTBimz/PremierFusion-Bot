const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');
const filePath = path.join(dataDir, 'afk.json');

function loadAll() {
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
        console.error('[AFKStore] Failed to load afk.json:', err.message);
        return {};
    }
}

function saveAll(data) {
    try {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('[AFKStore] Failed to save afk.json:', err.message);
    }
}

function getGuildAfk(guildId) {
    if (!guildId) return {};
    const all = loadAll();
    return all[guildId] || {};
}

function setUserAfk(guildId, userId, info) {
    if (!guildId || !userId) return;
    const all = loadAll();
    if (!all[guildId]) all[guildId] = {};
    all[guildId][userId] = info;
    saveAll(all);
}

function removeUserAfk(guildId, userId) {
    if (!guildId || !userId) return null;
    const all = loadAll();
    if (!all[guildId] || !all[guildId][userId]) return null;
    const removed = all[guildId][userId];
    delete all[guildId][userId];
    saveAll(all);
    return removed;
}

function clearGuildAfk(guildId) {
    if (!guildId) return {};
    const all = loadAll();
    const oldData = all[guildId] || {};
    all[guildId] = {};
    saveAll(all);
    return oldData;
}

module.exports = {
    getGuildAfk,
    setUserAfk,
    removeUserAfk,
    clearGuildAfk
};