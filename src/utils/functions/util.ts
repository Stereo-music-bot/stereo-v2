import { GuildMember, NewsChannel, TextChannel, GuildEmoji, PermissionString, Message } from 'discord.js';
import DiscordClient from '../../client/client';
export default class Util {
        /**
   * Format the track or playlist duration
   * @param {Number} ms - The duration in milliseconds
   * @return {String} time - The formatted timestamp
   */
  public formatTime(ms: number): string {
    const time = {
      d: 0,
      h: 0,
      m: 0,
      s: 0,
    };
    time.s = Math.floor(ms / 1000);
    time.m = Math.floor(time.s / 60);
    time.s = time.s % 60;
    time.h = Math.floor(time.m / 60);
    time.m = time.m % 60;
    time.d = Math.floor(time.h / 24);
    time.h = time.h % 24;

    const res = [];
    for (const [k, v] of Object.entries(time)) {
      let first = false;
      if (v < 1 && !first) continue;

      res.push(v < 10 ? `0${v}` : `${v}`);
      first = true;
    }
    return res.join(":");
  }

  /**
 * 
 * @param client the client that is passed in when the command got triggered
 * @param emojiName the name of the emoji
 */
  public EmojiFinder(client: DiscordClient, name: string): GuildEmoji {
    return client.guilds.cache.get('746536046275198997')
    .emojis.cache.find(e => e.name.toLowerCase() === name.toLowerCase())
    || undefined;
  };

  public missingPerms(member: GuildMember, channel: TextChannel | NewsChannel, perms: Array<PermissionString>): Array<string> | string {
    const missingPerms = member.permissions.missing(perms).length 
    ? member.permissions.missing(perms).map(str => `\`${str.replace(/_/g, ' ').toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase())}\``)
    : channel.permissionsFor(member).missing(perms).map(str => `\`${str.replace(/_/g, ' ').toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase())}\``);
  
    return missingPerms.length > 1 ?
      `${missingPerms.slice(0, -1).join(', ')} and ${missingPerms.slice(-1)[0]}` :
        missingPerms[0];
  };

  public formatPerms(perms: string[]): Array<string> | string {
      const formattedPerms = perms.map(str => `\`${str.replace(/_/g, ' ').toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase())}\``);
    
    return formattedPerms.length > 1 ?
      `${formattedPerms.slice(0, -1).join(', ')} and ${formattedPerms.slice(-1)[0]}` :
      formattedPerms[0];
  };

  public filterMember(message: Message, id: string): GuildMember {
    return message.mentions.members.size
    ? message.mentions.members.first()
    : id.length
      ? message.guild.members.cache.get(id)
        || message.guild.members.cache.find(m => m.user.username == id)
        || message.guild.members.cache.find(m => m.user.tag == id)
    : undefined;
  };

  public trimArray(arr: Array<string>, maxLen = 10) {
    if (arr.length > maxLen) {
      const len = arr.length - maxLen;
      arr = arr.slice(0, maxLen);
      arr.push(`${len} more...`);
    }
    return arr;
  };

  public formatBytes(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  }
}