import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

const types = ['queue', 'song', 'none'];
interface RepeatObject {
  song: boolean;
  queue: boolean;
  always: boolean;
}

export default class RepeatCommand extends BaseCommand {
  constructor() {
    super('repeat', {
      category: 'Audio Settings',
      aliases: ['loop'],
      description: `Starts looping the queue/song or stops looping the queue/song.`,
      userRolePermissions: ['MANAGE_QUEUE'],
      usage: '<queue/song/none>',
      ownerOnly: false,
      timeout: 7e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const player = client.music.players.get(message.guild.id);
    const { channel } = message.member.voice;
    let type = args[0] ? args[0].toLowerCase() : '';

    if (!type || !types.includes(type)) return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | invalid repeat type provided (queue/song/none).`);
    if (!player || (!player.playing && !player.paused)) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | There is no active player in this server.`
    );

    if (!channel || channel.id !== player.channel)
      return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | We aren't in the same voice channel!`);
    
    const repeatObject: RepeatObject = type === 'queue'
    ? { song: false, queue: true, always: false }
    : type === 'song'
      ? { song: true, queue: false, always: false }
      : { song: false, queue: false, always: false };

    player.queue.setRepeat(type, repeatObject);
    return message.channel.send(`> 🔁 | Repeating is now set to \`${type}\`!`);
  }
}