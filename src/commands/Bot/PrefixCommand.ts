import { guildConfig as guildConfigInterface } from '../../utils/database/Interfaces';
import { guildConfig } from '../../utils/database/guildConfigSchema';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { Message } from 'discord.js';
import { error } from 'console';

export default class PrefixCommand extends BaseCommand {
  constructor() {
    super('prefix', {
      category: 'Bot',
      aliases: ['setprefix'],
      description: 'Changes the prefix of the bot. (max. 5 characters)',
      userPermissions: ['MANAGE_GUILD'],
      usage: '<prefix>',
      ownerOnly: false,
      timeout: 10e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const prefix = args[0];
    if (!prefix || prefix.length > 5) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | Please specify a prefix not longer than 5 characters.`
    );
    
    try {
      client.prefix.set(message.guild.id, prefix);
      guildConfig.findOneAndUpdate({ guildId: message.guild.id }, { prefix }, (err: any) => { if (err) throw new error(err)});
    } catch (e) {
      await message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | For some reason the guard didn't want to open the gate when entering the database.`);
      return client.Webhook.send(`> ❌ | New error | **${message.guild.name}** | DB prefix Command Error | Error: \`${e.message || e}\``);
    };
    if (prefix === process.env.DISCORD_BOT_PREFIX) return message.channel.send(`> ${client.utils.EmojiFinder(client, 'greentick').toString()} | Successfully reset the prefix to \`=\``);
    return message.channel.send(`> ${client.utils.EmojiFinder(client, 'greentick').toString()} | Changed the prefix to \`${args[0]}\``);
  }
}