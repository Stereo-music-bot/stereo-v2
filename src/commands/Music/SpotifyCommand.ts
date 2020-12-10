import { guildConfig } from '../../utils/database/guildConfigSchema';
import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import Queue from '../../utils/functions/queue';
import DiscordClient from '../../client/client';
import rest from '../../utils/functions/rest';
import fetch from 'node-fetch';

export default class SpotifyCommand extends BaseCommand {
  constructor() {
    super('spotify', {
      category: 'Music', 
      aliases: [],
      description: 'Play a spotify song or playlist via the bot.',
      usage: '<spotify song/playlist link>',
      ownerOnly: false,
      clientPermissions: ['EMBED_LINKS'],
      userRolePermissions: {
        ADD_SONGS: true,
        MANAGE_QUEUE: false,
        MANAGE_PLAYER: false,
      },
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const link: string = args.join(' ');
    const redtick = client.utils.EmojiFinder(client, 'redtick').toString();
    if (!link) return message.channel.send(
      `> ${redtick} | I need a spotify playlist or song link in order to play a song from spotify!`
    );

    // if (!/(?:https?:\/\/|)?(?:www\.)?open\.spotify\.com\/playlist\/([a-z0-9\d-_]+)/gi.test(link) || !/(?:https?:\/\/|)?(?:www\.)?open\.spotify\.com\/track\/([a-z0-9\d-_]+)/gi.test(link)) return message.channel.send(
    //   `> ${redtick} | Invalid spotify link, please make sure you use a spotify link for this command, use \`${client.prefix.get(message.guild.id)}play\` for youtube songs!`
    // );
    
    if (/(?:https?:\/\/|)?(?:www\.)?open\.spotify\.com\/playlist\/([a-z0-9\d-_]+)/gi.test(link)) {
      const token = await rest.getSpotifyToken();
      const arr = link.split(/https?:\/\/(www\.)?open\.spotify\.com\/playlist\//gi);
      const result = arr[arr.length - 1].match(/([a-z0-9\d-_]+)/gi)[0];
      if (!result) return message.channel.send(
        `> ${redtick} | Invalid spotify link, please make sure you use a spotify link for this command, use \`${client.prefix.get(message.guild.id)}play\` for youtube songs!`
      );
      
      const songs = await (
        await fetch(`https://api.spotify.com/v1/playlists/${result}`, {
          headers: {
            authorization: `${token.tokenType} ${token.accessToken}`,
            "User-Agent": "StereoMusicBot",
            "Content-Type": "application/json",
          },
        })
      ).json();
      
      if (!songs || !songs.tracks.items) return message.channel.send(
        `> ${redtick} | Invalid spotify link, please make sure you use a spotify link for this command, use \`${client.prefix.get(message.guild.id)}play\` for youtube songs!`
      );

      let player = client.music.players.get(message.guild.id) || client.music.create(message.guild.id);
      if (!player.queue) player.queue = new Queue(player);
      if (!player.radio) player.radio = { playing: false, name: undefined };
      const Announce = await announce(message.guild.id);
      const { channel } = message.member.voice;
      if (!player && (!channel || !channel.joinable)) return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | I can not join your voice channel!`);
      
      const msg = await message.channel.send(`> ${client.utils.EmojiFinder(client, 'loading').toString()} | Loading the spotify songs (this may take a while).`);
      let array: Array<any> = [];
      for await (const song of songs.tracks.items) {
        const { tracks } = await rest.search(`ytsearch:${encodeURIComponent(`${song.track.artists[0].name} - ${song.track.name}`)}`);
        if (tracks.length) array.push(tracks[0]);
      };

      array.forEach(t => player.queue.add(t.track, message.author.id));
      if (!player.connected) player.connect(channel.id, { selfDeaf: true });
      if (!player.playing && !player.paused) await player.queue.start(message, Announce);
      if (message.guild.me.permissions.has('DEAFEN_MEMBERS')) message.guild.me.voice.setDeaf(true);
      return msg.edit(
        `> 🎵 | Enqueuing the playlist **${songs.name}** - \`${array.length}\` Song(s).`
      );
    } else if (/(?:https?:\/\/|)?(?:www\.)?open\.spotify\.com\/track\/([a-z0-9\d-_]+)/gi.test(link)) {

    } else return message.channel.send(
      `> ${redtick} | Invalid spotify link, please make sure you use a spotify link for this command, use \`${client.prefix.get(message.guild.id)}play\` for youtube songs!`
    );
    //  else if (/(?:https?:\/\/|)?(?:www\.)?open\.spotify\.com\/playlist\/([a-z0-9\d-_]+)/gi.test(track)) {
    //   const arr = track.split(/https?:\/\/(www\.)?open\.spotify\.com\/playlist\//gi);
    //   const result = arr[arr.length - 1].match(/([a-z0-9\d-_]+)/gi)[0];
    //   if (!result) return { loadType: "NO_MATCHES", message: 'Invalid spotify link' };
    //   const token = await getSpotifyToken();
    
    //   const songs = await (
    //     await fetch(`https://api.spotify.com/v1/playlists/${result}`, {
    //       headers: {
    //         authorization: `${token.tokenType} ${token.accessToken}`,
    //         "User-Agent": "StereoMusicBot",
    //         "Content-Type": "application/json",
    //       },
    //     })
    //   ).json();

    //   if (!songs || !songs.tracks.items) return { loadType: "NO_MATCHES", message: 'unkown playlist, most of the time because the playlist is private.' };
    //   let array: Array<any> = [];
    //   await songs.tracks.items.forEach(async (s: any) => {
    //     const { tracks } = await rest.search(`ytsearch:${encodeURIComponent(`${s.track.artists[0].name} - ${s.track.name}`)}`);
    //     array.push(tracks[0]);
    //   });

    //   setTimeout(() => console.log(array), 3e3)
    //   return { loadType: 'PLAYLIST_LOADED', tracks: array };
  }
}

async function announce(id: string): Promise<boolean> {
  const data = await guildConfig.findOne({ guildId: id });
  //@ts-ignore
  return data.announce ? true : false;
}