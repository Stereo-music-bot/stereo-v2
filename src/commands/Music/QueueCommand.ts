import BaseCommand from '../../utils/structures/BaseCommand';
import { Message, MessageEmbed } from 'discord.js';
import DiscordClient from '../../client/client';
import rest from '../../utils/functions/rest';
import { decode } from "@lavalink/encoding";

interface TrackInfo {
  flags?: number;
  source: string;
  identifier: string;
  author: string;
  length: bigint;
  isStream: boolean;
  position: bigint;
  title: string;
  uri: string | null;
  version?: number;
  probeInfo?: { raw: string, name: string, parameters: string | null };
}

export default class QueueCommand extends BaseCommand {
  constructor() {
    super('queue', {
      category: 'Music', 
      aliases: ['q'],
      description: 'Shows you the current playing song and the upcoming songs',
      ownerOnly: false,
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const player = client.music.players.get(message.guild.id);
    if (!player || !player.queue.current) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | There is no active player in this server.`
    );
    const items = player.queue.next.map((data, index) => {
      const res: TrackInfo = decode(data.track);
      return {
        title:
          res.title.length > 20
            ? res.title.substring(0, 40)
            : res.title,
        uri: res.uri,
        length: res.length,
        index,
      };
    });

    const map = items.slice(0, 10).map((d) => `**${( d.index) + 1}**. [${d.title.replace(/\[/g, '').replace(/\]/g, '')}](${d.uri}) - \`${client.utils.formatTime(Number(d.length))}\``);
    let np = (await rest.decode(player.queue.current.track))
    np = np.title == undefined ? decode(player.queue.current.track) : np;
    let embed = new MessageEmbed()
      .setTitle(`Music queue for ${message.guild.name}`)
      .setColor(message.guild.members.cache.get(player.queue.current.requester).displayHexColor || 'BLUE')
      .setThumbnail(`https://i.ytimg.com/vi/${(decode(player.queue.current.track)).identifier}/hqdefault.jpg`)

    map.length ? 
      `${map}`.length < 1024
      ? embed.addField(`Queued Songs`, map) 
      : embed.setDescription(map) 
    : '';

    embed.setFooter(`${map.length} of ${items.length} song(s) shown`);

    player.radio && player.radio.playing
      ? embed.addField(`Now Playing | Requested by ${message.guild.members.cache.get(player.queue.current.requester).user.tag}`, [
        `> 🎵 | Radio Station: \`${player.radio.name}\``,
        `> 👤 | ${message.guild.members.cache.get(player.queue.current.requester).toString()}`
      ])
      : embed.addField(`Now Playing | Requested by ${message.guild.members.cache.get(player.queue.current.requester).user.tag}`, [
        `> 🎵 | [${np.title.replace(/\[/g, '').replace(/\]/g, '')}](${np.uri}) - \`${client.utils.formatTime(Number(np.length))}\``,
        `> 👤 | ${message.guild.members.cache.get(player.queue.current.requester).toString()}`
      ]);
      
    return message.channel.send(embed);
  }
}