import { Message, VoiceChannel } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class SkipCommand extends BaseCommand {
  constructor() {
    super('skip', {
      category: 'Music', 
      aliases: [],
      description: 'Votes to skip the song if with more than 3 people or skips the song.',
      ownerOnly: false,
      userRolePermissions: ['MANAGE_QUEUE']
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const player = client.music.players.get(message.guild.id);
    const vote = client.vote.get(message.guild.id);
    const channel: VoiceChannel = message.guild.channels.cache.get(player.channel) as VoiceChannel;
    const voteCount: number = channel.members.size - 2;

    if (vote.users.includes(message.author.id)) return message.channel.send(`> ${client.emojis.cache.find(m => m.name === 'redtick').toString()} You already voted! (${vote.votes}/${voteCount})`);
    if (!player || !player.queue || !player.queue.current) return message.channel.send(`> ${client.emojis.cache.find(m => m.name === 'redtick').toString()} This server doesnt have a queue!`);
    if (vote.votes + 1 >= voteCount) {
      await player.queue.skip(player);
      if (player.queue.current) return message.channel.send(`> ⏭ Successfully skipped the current song!`);
    } else if (voteCount <= 0) {
      await player.queue.skip(player);
      if (player.queue.current) return message.channel.send(`> ⏭ Successfully skipped the current song!`);
    } else {
      vote.votes = vote.votes + 1;
      vote.users.push(message.author.id);
      return message.channel.send(`> 👍 **Skip the current song?** (${vote.votes}/${voteCount})`);
    }
  }
}