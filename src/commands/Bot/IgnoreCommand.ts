import { guildConfig as guildConfigInterface } from '../../utils/database/Interfaces';
import { guildConfig } from '../../utils/database/guildConfigSchema';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { Message } from 'discord.js';
import { Error } from 'mongoose';

export default class IgnoreCommand extends BaseCommand {
  constructor() {
    super('ignore', {
      category: 'Bot',
      aliases: [],
      description: 'Adds or removes channels from the blacklist (if the bot needs to ignore message in a channel)',
      userPermissions: ['MANAGE_GUILD'],
      usage: '<channel mention (can be multiple at the time)>',
      ownerOnly: false,
      timeout: 10e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const channels = message.mentions.channels;
    if (!channels.size) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | Please specify the channel(s) you want me to ignore (mention them).`
    );
    
    const remove: string[] = [];
    const add: string[] = [];
    let array: string[];

    channels.each(c => {
      const check = client.ignoredChannels.get(c.id);
      if (check) {
        remove.push(c.id);
        client.ignoredChannels.delete(c.id);
      } else {
        add.push(c.id);
        client.ignoredChannels.set(c.id, true);
      };
    });

    try {
      guildConfig.findOne({ guildId: message.guild.id }, async (err, data: guildConfigInterface) => {
        if (err) throw new Error(err);
        if (data) {
          array = data.ignoredChannels;
          array = array.filter(id => !remove.includes(id));
          array.push(...add);
          guildConfig.findOneAndUpdate({ guildId: message.guild.id }, { ignoredChannels: array }, err => { if (err) throw new Error(err) });
        };
      });
    } catch (e) {
      await message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | It looks like the gate motor is broken so we couldn't save the data.`);
      return client.Webhook.send(`> ❌ | New error | **${message.guild.name}** | DB ignore Command Error | Error: \`${e.message || e}\``);
    }
    return message.channel.send(`> ${client.utils.EmojiFinder(client, 'greentick').toString()} | I added \`${add.length}\` and removed \`${remove.length}\` channel(s) from the blacklist.`);
  }
}