import { guildConfig } from '../../utils/database/guildConfigSchema';
import { Message } from 'discord.js';
import fetch from 'node-fetch'
import rest from '../../utils/functions/rest'
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import Queue from '../../utils/functions/queue';

export default class RadioCommand extends BaseCommand {
  constructor() {
    super('radio', {
      category: 'Music',
      aliases: [],
      description: 'Plays a radio station via discord.',
      usage: '<radio station name>',
      clientPermissions: ['EMBED_LINKS'],
      userRolePermissions: ['ADD_SONGS'],
      ownerOnly: false,
      timeout: 7e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const prefix = client.prefix.get(message.guild.id) || process.env.DISCORD_BOT_PREFIX; 
    const station = args.map(a => a).join(' ');
    const { channel } = message.member.voice;
    let player = client.music.players.get(message.guild.id);

    if (!station || (!station && player && !player.radio)) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | There is no radio playing in this server right now, to start playing run \`${prefix}radio ${this.getOptions().usage}\`.`
    ); 
    else if (!station && player && player.radio) return message.channel.send(
      `> 🎧 | Currently playing radio station: \`${player.radio.name}\`.`
    );

    if (!channel || (player && player.channel && channel && player.channel !== channel.id)) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | We aren't in the same voice channel!`
    );
    
    let data: any;
    try {
      data = await (await fetch(`https://de1.api.radio-browser.info/json/stations/byname/${encodeURIComponent(station)}`)).json();
    } catch (e) {
      await message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | Oops It we were lost on the wrong radio station, we unfortunately can not fulfill your request.`);
      return client.Webhook.send(`> ❌ | New error | **${message.guild.name}** | Radio Error | Error: \`${e}\``);
    }
   
    if (!data.length) return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | No search results where found for your search query.`);

    const { tracks } = await rest.search(data[0].url);
    if (!tracks.length) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | No search results where found for your search query.`
    );
    
    if (!player) player = client.music.create(message.guild.id);

    if (!player.queue || !player.queue.current) player.radio = { playing: true, name: station };
    else if (player.queue) player.radio = { playing: false, name: station };

    if (!player.queue) player.queue = new Queue(player);
    player.queue.add(tracks[0].track, message.author.id);

    if (!player.connected) player.connect(channel.id, { selfDeaf: true });
    const Announce = await announce(message.guild.id);
    if (!player.playing && !player.paused) await player.queue.start(message, Announce);

    return message.channel.send(`> 🎵 | Enqueuing radio station: \`${player.radio.name}\`.`);
  }
}

async function announce(id: string): Promise<boolean> {
  const data = await guildConfig.findOne({ guildId: id });
    //@ts-ignore
  return data.announce;
};