import { Message } from 'discord.js';
import BaseCommand from '../src/utils/structures/BaseCommand';
import DiscordClient from '../src/client/client';

export default class NightcoreCommand extends BaseCommand {
  constructor() {
    super('nightcore', {
      category: 'Audio Settings',
      aliases: ['nc'],
      description: `Toggles the nightcore filter`,
      userRolePermissions: ['MANAGE_PLAYER'],
      ownerOnly: false,
      timeout: 10e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const player = client.music.players.get(message.guild.id);
    const { channel } = message.member.voice;

    if (!player || (!player.queue.current || !player.radio)) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | There is no active player in this server.`
    );

    if (!channel || channel.id !== player.channel)
      return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | We aren't in the same voice channel!`);
    
    if (player.filter == 'nightcore') {
      await player.send('filter', {});
  
      player.filter = 'default';
      return message.channel.send(`> 🎚 | Successfully turned off the nightcore filter!`);
    } else {
      const filter = {
        equalizer: [
          { band: 1, gain: 0.3 },
          { band: 0, gain: 0.3 },
        ],
        timescale: { pitch: 1.2 },
        tremolo: { depth: 0.3, frequency: 14 },
      };

      await player.socket.send({ op: 'filters', ...filter, guildId: message.guild.id });
  
      player.filter = 'nightcore';
      return message.channel.send(`> 🎚 | Successfully turned on the nightcore filter!`);
    }
  }
}