import { guildConfig as guildConfigInterface } from '../../utils/database/Interfaces';
import { guildConfig } from '../../utils/database/guildConfigSchema';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { Message } from 'discord.js';
import { error } from 'console';

export default class AnnounceCommand extends BaseCommand {
  constructor() {
    super('announce', {
      category: 'Bot',
      aliases: ['setannounce'],
      description: 'toggles announcements of songs on or off',
      userPermissions: ['MANAGE_GUILD'],
      ownerOnly: false,
      timeout: 15e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const player = client.music.players.get(message.guild.id);

    try {
      if (player || (player.queue.current || player.radio)) player.queue.Announce();
      guildConfig.findOne({ guildId: message.guild.id }, async (err: any, data: guildConfigInterface) => {
        if (err) throw new error(err);
        if (!data) throw new error('No guild Config');
        data.announce = !data.announce;
      });
    } catch (e) {
      await message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | For some reason the guard didn't want to open the gate when entering the database.`);
      return client.Webhook.send(`> ❌ | New error | **${message.guild.name}** | DB Announce Command Error | Error: \`${e.message || e}\``);
    }
    
    return message.channel.send(`> 💬 | Successfully ${player.queue.announce ? 'enabled' : 'disabled'} the announcements of songs.`);
  }
}