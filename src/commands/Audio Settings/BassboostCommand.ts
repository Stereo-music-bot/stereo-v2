import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

const gains = {
  hard: 0.12,
  medium: 0.07,
  low: 0.04,
  none: 0,
};
const levels = ["hard", "medium", "low", "none"];

export default class BassboostCommand extends BaseCommand {
  constructor() {
    super('bassboost', {
      category: 'Audio Settings',
      aliases: ['bb', 'bass'],
      description: `Changes the bassboost of the music player (${levels.join(', ')})`,
      userRolePermissions: {
        ADD_SONGS: false,
        MANAGE_QUEUE: false,
        MANAGE_PLAYER: true
      },
      usage: '<bassboost level>',
      ownerOnly: false,
      timeout: 7e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const player = client.music.players.get(message.guild.id);
    const { channel } = message.member.voice;
    const level = (args[0] || '').toLowerCase();

    if (!level || !levels.includes(level)) return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | invalid bassboost level provided (${levels.join(', ')}).`);
    if (!player || (!player.playing && !player.paused)) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | There is no active player in this server.`
    );

    if (!channel || channel.id !== player.channel)
      return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | We aren't in the same voice channel!`);
    
    await player.setEqualizer(
      Array(6)
        .fill(null)
        .map((_, i) => ({ band: i++, gain: gains[level.toLowerCase()] }))
    );

    player.bass = level as "hard" | "medium" | "low" | "none";
    return message.channel.send(`> 🎚️ | Bassboost level successfully changed to \`${level}\`!`);
  }
}