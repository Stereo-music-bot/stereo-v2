import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class ForceskipCommand extends BaseCommand {
  constructor() {
    super('forceskip', {
      category: 'Music', 
      aliases: ['fs', 'fnext'],
      description: 'Force skips the song, you need a djrole or the manage channels permission for this',
      ownerOnly: false,
      userRolePermissions: ['MANAGE_QUEUE'],
      timeout: 5e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const player = client.music.players.get(message.guild.id);
    const { channel } = message.member.voice;
    if (!player) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | There is no active player in this server.`
    );

    if (!channel || channel.id !== player.channel)
      return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | We aren't in the same voice channel!`);

    await player.queue.skip(player);
    if (player.queue.current) return message.channel.send(`> ⏭ | Successfully skipped the song!`);
  }
}