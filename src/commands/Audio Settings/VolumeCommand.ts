import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class VolumeCommand extends BaseCommand {
  constructor() {
    super('volume', {
        category: 'Audio Settings',
        aliases: ['vol', 'setvolume'],
        description: 'Changes the volume of the music player (0-200)',
        userRolePermissions: ['MANAGE_PLAYER'],
        usage: '<volume>',
        ownerOnly: false,
        timeout: 5e3
      });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const player = client.music.players.get(message.guild.id);
    const { channel } = message.member.voice;
    const volume = parseInt(args[0]);

    if (!volume || isNaN(volume) || volume > 200 || volume < 0) return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | invalid volume amount provided (1-200).`);
    if (!player || (!player.playing && !player.paused)) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | There is no active player in this server.`
    );

    if (!channel || channel.id !== player.channel)
      return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | We aren't in the same voice channel!`);
    
    await player.setVolume(volume);
    return message.channel.send(`> 🔊 | Changed the volume to \`${volume}\`%`);
  }
}