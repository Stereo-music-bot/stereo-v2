import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class RemoveCommand extends BaseCommand {
  constructor() {
    super('remove', {
      category: 'Music', 
      aliases: [],
      description: 'Removes a song from the queue',
      usage: '<song number>',
      ownerOnly: false,
      userRolePermissions: ['MANAGE_QUEUE'],
      timeout: 5e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const player = client.music.players.get(message.guild.id);
    const { channel } = message.member.voice;
    if (!args[0]) return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | No song number provided.`);
    if (!player) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | There is no active player in this server.`
    );

    if (!channel || channel.id !== player.channel)
      return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | We aren't in the same voice channel!`);
    
    if (parseInt(args[0]) > player.queue.next.length || isNaN(parseInt(args[0])))
      return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | Invalid song number.`);
    await player.queue.remove(parseInt(args[0]));
    if (player.queue.current) return message.channel.send(`> ⏏ | Successfully removed song number: \`${args[0]}\`!`);
  }
}