import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class SupportCommand extends BaseCommand {
  constructor() {
    super('support', {
      category: 'Useful Links', 
      aliases: ['server', 'discord'],
      description: 'Gives you the the discord support server invite link.',
      ownerOnly: false,
      timeout: 10e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    return message.channel.send(`> ${client.utils.EmojiFinder(client, 'discordloadinggif').toString()} | Discord support server invite: https://discord.gg/bvn89qP`);
  }
}