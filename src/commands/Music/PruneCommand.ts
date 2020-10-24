import { Message, TextChannel, NewsChannel, Collection, Snowflake } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';


export default class PruneCommand extends BaseCommand {
  constructor() {
    super('prune', {
      category: 'Music', 
      aliases: [],
      description: 'Want to clean up the channel? Use this command to prune messages stereo sent in the channel.',
      usage: '<amount>',
      ownerOnly: false,
      userPermissions: ['MANAGE_MESSAGES'],
      timeout: 5e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const count = parseInt(args[0] || 'aaa');
    if (!count || isNaN(count)) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | Please provide an amount in numbers!`
    );

    const channel: TextChannel | NewsChannel = message.channel as TextChannel | NewsChannel;
    //@ts-ignore
    const messages = (await channel.messages.fetch({ limit: 100 }, false, true)).filter((m: Message) => m.author.id === client.user.id);
    if (!messages.size) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | No messages of ${client.user.toString()} found, maybe because the messages are older than 2 weeks.`
    );

    await channel.bulkDelete(messages, true);
    return message.channel.send(`>  ${client.utils.EmojiFinder(client, 'greentick').toString()} | Successfully deleted \`${messages.filter((m: Message) => m.author.id === client.user.id).size}\` message(s)!`).then(m => m.delete({ timeout: 5e3 }));
  }
}