import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class LeaveCommand extends BaseCommand {
  constructor() {
    super('leave', {
      category: 'Music', 
      aliases: ['disconnect'],
      description: 'Leaves your channel and destroys the queue + player',
      ownerOnly: false,
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const { channel } = message.member.voice;
    const player = client.music.players.get(message.guild.id);

    if (!player) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | There is no active player in this server.`
    );
    if (!channel || player.channel !== channel.id) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | You are not the correct voice channel, I am in \`${message.guild.channels.cache.get(player.channel).name}\`!`
    );
    
    await player.manager.destroy(message.guild.id);
    return message.channel.send(`> 🔇 | Successfully disconnected from \`${channel.name}\`!`);
  }
}