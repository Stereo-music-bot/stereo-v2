import { Guild } from 'discord.js';
import BaseEvent from '../../utils/structures/BaseEvent';
import DiscordClient from '../../client/client';

export default class GuildDeleteEvent extends BaseEvent {
  constructor() {
    super('guildDelete');
  }
  
  async run(client: DiscordClient, guild: Guild) {
    try {
      client.prefix.delete(guild.id);
      guild.channels.cache.forEach(channel => {
        if (client.ignoredChannels.get(channel.id)) client.ignoredChannels.delete(channel.id);
      });
      if (client.vote.get(guild.id)) client.vote.delete(guild.id);
      if (client.music.players.get(guild.id)) client.music.destroy(guild.id);
    } catch (e) {
      return client.Webhook.send(`> ❌ | New error | **${guild.name}** | guild Delete Error | Error: \`${e}\``);
    }
  }
}