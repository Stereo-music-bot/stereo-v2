import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { decode } from '@lavalink/encoding';

export default class SeekCommand extends BaseCommand {
  constructor() {
    super('seek', {
      category: 'Music', 
      aliases: ['move'],
      description: 'Seeks to a position in the song.',
      usage: '<position>',
      ownerOnly: false,
      userRolePermissions: {
        ADD_SONGS: false,
        MANAGE_QUEUE: true,
        MANAGE_PLAYER: false,
      },
      timeout: 3e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const player = client.music.players.get(message.guild.id);
    const { channel } = message.member.voice;
    if (!args[0]) return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | No song number provided.`);
    if (!player || !player.queue.current) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | There is no active player in this server.`
    );

    if (!channel || channel.id !== player.channel)
      return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | We aren't in the same voice channel!`);
    const current = decode(player.queue.current.track);
    if (parseInt(args[0]) > Number(current.length) || parseInt(args[0]) < 0 || isNaN(parseInt(args[0])))
      return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | Invalid position (number).`);
    await player.seek(parseTimeString(args[0]) || parseInt(args[0]) * 1000);
    if (player.queue.current) return message.channel.send(`> ⏭ | Successfully seeked \`${args[0]}s\`!`);
  }
}

function parseTimeString(time: string) {
  let newNumber = 0,
    toMultiply = 60000;

  if (!/\d{1,2}:\d{2}/g.exec(time)) return null;

  for (const num of time.split(":")) {
    newNumber = Math.floor(Number(num) * toMultiply) + newNumber;
    toMultiply = 1000;
  }

  return newNumber;
}