import { guildConfig as guildConfigInterface } from '../../utils/database/Interfaces';
import { Message, MessageEmbed, Guild, PermissionString } from 'discord.js';
import { guildConfig } from '../../utils/database/guildConfigSchema';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { Player } from 'lavaclient';
import { inspect } from 'util';

const mainPerms: Array<PermissionString> = ['EMBED_LINKS', 'USE_EXTERNAL_EMOJIS', 'DEAFEN_MEMBERS', 'SEND_MESSAGES', 'VIEW_CHANNEL', 'SPEAK', 'CONNECT'];

export default class SinfoCommand extends BaseCommand {
  constructor() {
    super('sinfo', {
      category: 'Developer Commands',
      aliases: [],
      description: 'Did you know that DaanGamesDG#7621 teached himself how to code?',
      usage: '<server name/id>',
      clientPermissions: ['EMBED_LINKS'],
      ownerOnly: true
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const input: string = args[0] || '';
    const guild: Guild = client.guilds.cache.get(input) || client.guilds.cache.find(g => g.name.toLowerCase() === input.toLocaleLowerCase());

    if (!guild) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | No guilds found, please check if you spelled the name correctly or if you copied the correct ID.`
    );
    let partner: boolean;
    await guildConfig.findOne({ guildId: guild.id }, async (err: any, data: guildConfigInterface) => {
      if (err) await client.Webhook.send(`> ❌ | New error | **${message.guild.name}** | DB fetch Error | Error: \`${err.message || err}\``);
      if (!data) partner = undefined;
      else partner = data.partner;
    });

    const player: Player | undefined = client.music.players.get(message.guild.id);
    const prefix: string | undefined = client.prefix.get(message.guild.id);
    const embed: MessageEmbed = new MessageEmbed()
    .setTitle(`${guild.name} | Server Information`)
    .setThumbnail(guild.iconURL({ dynamic: true, size: 4096 }) || null)
    .setDescription([
      `> **❗ | Prefix**: ${prefix ? `\`${prefix}\`` : 'No prefix in cache found for this guild!'}`,
      `> **🤝 | Partner**: \`${partner}\``,
      `> **👮‍♂️ | Missing Permissions**: ${guild.me.permissions.missing(mainPerms).length ? guild.me.permissions.missing(mainPerms).map(p => `\`${p}\``).join(', ') : 'No Missing Permissions'}`,
    ])
    .addField('❯ **🎧 | Player**:', `${player ? `\`\`\`ts\n` + `${inspect(player, { depth: 0 })}`.substr(0, 1010) + '\n\`\`\`' : 'No active player in that guild.'}`)
    return message.channel.send(embed);
  }
}