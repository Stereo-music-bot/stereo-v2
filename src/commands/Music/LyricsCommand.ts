import { Message, MessageEmbed } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { decode } from '@lavalink/encoding';
import { KSoftClient, Track } from '@ksoft/api';
import rest from '../../utils/functions/rest';

const ksoft = new KSoftClient(process.env.KSOFT_TOKEN);

export default class LyricsCommand extends BaseCommand {
  constructor() {
    super('lyrics', {
      category: 'Music',
      aliases: ['lyr'],
      description: 'Shows the lyrics of the current playing song',
      clientPermissions: ['EMBED_LINKS'],
      ownerOnly: false,
      timeout: 10e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const player = client.music.players.get(message.guild.id);

    let data: Track;
    let t: string = '';
    if (args[0]) {
      try {
        const d = (await rest.search(`ytsearch:${encodeURIComponent((args[0] ? args.join(' ') : ''))}`)).tracks[0].info.title;
        data = (await ksoft.lyrics.search(d, { limit: 1, textOnly: false }))[0];
      } catch (e) {
        if (e.message === 'No results') {
          if (!t.length) {
            return message.channel.send(
              `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | No lyrics for the current playing song found (maybe because you are listening to a radio instead of playing a song)`
            );
          } else {
            return message.channel.send(
              `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | No lyrics for the song: **${t}** found.`
            );
          }
        }
        await message.channel.send(`> 🧱 | There was an unknown error that blocked us from getting the lyrics :(`);
        return client.Webhook.send(`> ❌ | New error | **${message.guild.name}** | Lyrics Error | Error: \`${e}\``);
      }
    } else {
      const { title } = decode(player.queue.current.track);
      t = title;
      try {
        data = await ksoft.lyrics.get(title || '_____', { textOnly: false });
      } catch (e) {
        if (e.message === 'No results') {
          if (!title.length) {
            return message.channel.send(
              `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | No lyrics for the current playing song found (maybe because you are listening to a radio instead of playing a song)`
            );
          } else {
            return message.channel.send(
              `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | No lyrics for the song: **${title}** found.`
            );
          }
        }
        await message.channel.send(`> 🧱 | There was an unknown error that blocked us from getting the lyrics :(`);
        return client.Webhook.send(`> ❌ | New error | **${message.guild.name}** | Lyrics Error | Error: \`${e}\``);
      }
    }
    
    const lyrics: string = data.lyrics.length > 2048 
      ? data.lyrics.substr(0, 2045) + '...'
      : data.lyrics;
    const url: string = `https://lyrics.ksoft.si/song/${data.id}/${encodeURIComponent(data.name)}`;

    if (!t.toLowerCase().includes(data.name.toLowerCase()) && !args[0]) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | I couldn't find a lyrics for \`${t}\`.`
    );

    const embed: MessageEmbed = new MessageEmbed()
      .setTitle(`Lyrics: ${data.artist ? data.artist.name.replace(/-/g, ' ') + ' - ' : ''}${data.name.replace(/-/g, ' ')}`)
      .setDescription(lyrics)
      .setURL(url || null)
      .setThumbnail(data.artwork || null)
      .setColor(message.member.displayHexColor || 'BLUE')
      .setFooter(`Lyrics provided by ksoft.si`);

    return message.channel.send(embed);
  }
}