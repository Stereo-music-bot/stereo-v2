import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class ResumeCommand extends BaseCommand {
  constructor() {
    super('resume', {
      category: 'Music', 
      aliases: ['constinue', 'start'],
      description: 'Resumes the playback of the song playing in the server.',
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
    
    if (player.playing) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | The player is already playing.`
    );

    if (!channel || channel.id !== player.channel)
      return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | We aren't in the same voice channel!`);
    
    await player.resume();
    return message.channel.send(`> ▶ | Successfully resumed the player.`);
  }
}