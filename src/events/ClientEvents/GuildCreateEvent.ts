import { rolePermissions, guildConfig as guildConfigInterface } from '../../utils/database/Interfaces';
import { guildConfig } from '../../utils/database/guildConfigSchema';
import { Guild } from 'discord.js';
import BaseEvent from '../../utils/structures/BaseEvent';
import DiscordClient from '../../client/client';

export default class GuildCreateEvent extends BaseEvent {
  constructor() {
    super('guildCreate');
  }
  
  async run(client: DiscordClient, guild: Guild) {
    try {
      return guildConfig.findOne({ guildId: guild.id }, async (err: any, data: guildConfigInterface) => {
        if (err) throw new Error(err);
        if (!data) {
          const rolePermissions: rolePermissions = {
            roleId: guild.id,
            permissions: 'ALL',
          };
          const guildConfigObject = {
            guildId: guild.id,
            prefix: process.env.DISCORD_BOT_PREFIX,
            announce: true,
            partner: false
          };
    
          new guildConfig(guildConfigObject).save();
          client.rolePermissions.set(guild.id, rolePermissions);
          client.prefix.set(guild.id, process.env.DISCORD_BOT_PREFIX);
        } else {
          client.prefix.set(guild.id, data.prefix);
          data.ignoredChannels.forEach(id => client.ignoredChannels.set(id, true));
          const rolePermissions: rolePermissions = {
            roleId: guild.id,
            permissions: 'ALL',
          };
          client.rolePermissions.set(guild.id, rolePermissions);
        };
      });
    } catch (e) {
      return client.Webhook.send(`> ❌ | New error | **${guild.name}** | guild create Error | Error: \`${e}\``);
    }
  }
}