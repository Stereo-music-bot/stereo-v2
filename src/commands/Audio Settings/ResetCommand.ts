import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class ResetCommand extends BaseCommand {
  constructor() {
    super('reset', {
      category: 'Audio Settings',
      aliases: ['re'],
      description: 'Resets all the effects (bassboost, nigthcore, repeat, etc).',
      userRolePermissions: ['MANAGE_PLAYER'],
      ownerOnly: false,
      timeout: 15e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const player = client.music.players.get(message.guild.id);
    const { channel } = message.member.voice;

    if (!player || (!player.playing && !player.paused)) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | There is no active player in this server.`
    );

    if (!channel || channel.id !== player.channel)
      return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | We aren't in the same voice channel!`);
    
    await player.queue.reset();
    return message.channel.send(`> 🔄 | Successfully reset the player.`);
  }
}