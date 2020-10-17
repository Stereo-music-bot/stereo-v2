import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { MessageEmbed } from 'discord.js';
import rest from '../../utils/functions/rest';
import { decode } from '@lavalink/encoding';

const repeats = {
  queue: `**🔁 | Repeat**: \`Queue\``,
  song: `**🔂 | Repeat**: \`Song\``,
  none: `**▶ | Repeat**: \`None\``
}

export default class NowplayingCommand extends BaseCommand {
  constructor() {
    super('nowplaying', {
      category: 'Music', 
      aliases: ['np'],
      description: 'Shows you the info about the current playing song',
      ownerOnly: false,
      clientPermissions: ['EMBED_LINKS']
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const player = client.music.players.get(message.guild.id);
    if (!player || !player.queue.current) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | There is no active player in this server.`
    );
    
    if (!player.radio || !player.radio.playing) {
      let current;
      try {
        current = decode(player.queue.current.track);
      } catch (e) {
        try {
          current = await rest.decode(player.queue.current.track);
        } catch (e) {
          await message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | An unexpected error occured, I can unfortunatley not show you the playing information.`);
          return client.Webhook.send(`> ❌ | New error | **${message.guild.name}** | NowPlaying Command Error | Error: \`${e}\``);
        }
      }
  
      const requester = message.guild.members.cache.get(player.queue.current.requester);
  
      const embed = new MessageEmbed()
      .setAuthor(`Now playing: ${current.title}`, player.playing ? 'https://emoji.gg/assets/emoji/6935_Plak_Emoji.gif' : 'https://imgur.com/Y9XRC6N.png')
      .setDescription([
        `> **🎵 | Song**: [${current.title}](${current.uri})`,
        `> **👤 | Requested by**: ${requester.toString()}`,
        `> ${(player.queue.repeat.always || player.queue.repeat.queue) ? repeats['queue'] : player.queue.repeat.song ? repeats['song'] : repeats['none']}`,
        `> **🔊 | Volume**: \`${player.volume}\`%`,
        `> **🎼 | Filter**: \`${player.filter || 'default'}\``,
        `> **🎚️ | Bassboost Level**: \`${player.bass || 'none'}\` \n`,
        `> **↔️ | Play Progress**: \`${(client.utils.formatTime(player.position).length === 2 ? `00:` + client.utils.formatTime(player.position) : client.utils.formatTime(player.position)) || '00:00'}\` / \`${client.utils.formatTime(Number(current.length))}\``,
        `> ⌚ **|** [${"▬".repeat(Math.floor((player.position / Number(current.length)) * 20)) + "⚪" + "▬".repeat(20 - Math.floor((player.position / Number(current.length)) * 20))}]`
      ])
      .setThumbnail(`https://i.ytimg.com/vi/${current.identifier}/hqdefault.jpg`)
      .setColor(requester.displayHexColor || 'BLUE')
      return message.channel.send(embed);
    } else {
      const requester = message.guild.members.cache.get(player.queue.current.requester);
  
      const embed = new MessageEmbed()
      .setAuthor(`Now playing: ${player.radio.name}`, player.playing ? 'https://emoji.gg/assets/emoji/6935_Plak_Emoji.gif' : 'https://imgur.com/Y9XRC6N.png')
      .setDescription([
        `> **🎵 | Radio Station**: \`${player.radio.name}\``,
        `> **👤 | Requested by**: ${requester.toString()}`,
        `> ${(player.queue.repeat.always || player.queue.repeat.queue) ? repeats['queue'] : player.queue.repeat.song ? repeats['song'] : repeats['none']}`,
        `> **🔊 | Volume**: \`${player.volume}\`%`,
        `> **🎚️ | Bassboost Level**: \`${player.bass || 'none'}\` \n`,
      ])
      .setColor(requester.displayHexColor || 'BLUE')
      return message.channel.send(embed);
    }
  }
}