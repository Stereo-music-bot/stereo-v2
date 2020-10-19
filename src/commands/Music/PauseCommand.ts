import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class PauseCommand extends BaseCommand {
  constructor() {
    super('pause', {
      category: 'Music', 
      aliases: ['stop'],
      description: 'Stops the playback of the song playing in the server.',
      ownerOnly: false,
      userRolePermissions: ['MANAGE_PLAYER'],
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const player = client.music.players.get(message.guild.id);
    const { channel } = message.member.voice;

    if (!player || (!player.playing && !player.paused)) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | There is no active player in this server.`
    );

    if (player.paused) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | The player is already paused.`
    );

    if (!channel || channel.id !== player.channel)
      return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | We aren't in the same voice channel!`);
    
    await player.pause();
    return message.channel.send(`> ⏸️ | Successfully paused the player.`);
  }
}