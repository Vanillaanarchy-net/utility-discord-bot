class DiscordGroupManager {
  constructor() {
    this.groups = new Map();
  }

  createGroup(guildId, groupName) {
    const key = `${guildId}-${groupName}`;
    this.groups.set(key, new Set());
  }

  addUserToGroup(guildId, groupName, userId) {
    const key = `${guildId}-${groupName}`;
    if (this.groups.has(key)) {
      this.groups.get(key).add(userId);
    }
  }

  isUserInGroup(guildId, groupName, userId) {
    const key = `${guildId}-${groupName}`;
    return this.groups.has(key) && this.groups.get(key).has(userId);
  }
}

module.exports = DiscordGroupManager;