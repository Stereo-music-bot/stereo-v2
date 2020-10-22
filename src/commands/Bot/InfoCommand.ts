import { Message, MessageEmbed, version as djsversion } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import { version as tsversion } from 'typescript';
import DiscordClient from '../../client/client';
import { version } from '../../../package.json';
import moment from 'moment';
import ms from 'ms';
import os from 'os';

export default class InfoCommand extends BaseCommand {
  constructor() {
    super('info', {
      category: 'Bot',
      aliases: ['bot', 'about'],
      description: 'Gives some intresting info/facts about the bot.',
      clientPermissions: ['EMBED_LINKS'],
      ownerOnly: false,
      timeout: 5e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const core = os.cpus()[0];
    const embed: MessageEmbed = new MessageEmbed()
      .setThumbnail(client.user.displayAvatarURL())
      .setTitle(`${client.user.tag} | Bot Information`)
      .setColor(message.guild.me.displayHexColor || 'BLUE')
      .addField(`**❯ General Information**:`, [
        `> **🤖 | Client**: ${client.user.toString()}`,
        `> ** 🖥 | Servers**: ${client.guilds.cache.size.toLocaleString()}`,
        `> **${client.utils.EmojiFinder(client, 'terminalicon').toString()} | Commands**: ${client.cs.size.toLocaleString()}`,
        `> **👥 | Users**: ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()}`,
        `> **${client.utils.EmojiFinder(client, 'jslogo').toString()} | Nodejs**: \`${process.version}\``,
        `> **${client.utils.EmojiFinder(client, 'tslogo').toString()} | Typescript version**: \`v${tsversion}\``,
        `> **${client.utils.EmojiFinder(client, 'djslogo').toString()} | Discordjs**: \`v${djsversion}\``,
        `> **:regional_indicator_v: | Version**: \`${version}\``,
        `> **📆 | Creation date**: \`${moment(client.user.createdTimestamp).format(`Do-MM-YYYY`)} ${moment(client.user.createdTimestamp).format(`HH:mm:ss`)}\``,
        `\u200b`
      ])
      .addField(`**❯ System Information**:`, [
        `> **🖥 | System Platform**: ${os.platform}`,
        `> **⌚ | System Uptime**: ${ms(os.uptime() * 1000, { long: true })}`,
        `> **⏰ | Client Uptime**: ${ms(client.uptime, { long: true })}`,
        `**❯ CPU Information**:`,
        `> \u3000 **🌌 | Cores**: ${os.cpus().length}`,
        `> \u3000 **🏷 | Model**: ${core.model}`,
        `> \u3000 **🚀 | Speed**: ${core.speed}Mhz`,
        `**❯ Memory Usage**:`,
        `> \u3000 **⛽ | Total**: ${client.utils.formatBytes(process.memoryUsage().heapTotal)}`,
        `> \u3000 **🎚 | Used**: ${client.utils.formatBytes(process.memoryUsage().heapUsed)}`,
        '\u200b'
      ])
      .addField(`**❯ Creators of ${client.user.tag}**:`, [
        `> **${client.utils.EmojiFinder(client, 'rolling').toString()} | Project Leader**: ${client.users.cache.get('715289819630141487').tag}`,
        `> **${client.utils.EmojiFinder(client, 'DaanGamesDG').toString()} | Bot Developer**: ${client.users.cache.get('304986851310043136').tag}`,
        `> **${client.utils.EmojiFinder(client, 'e_luzmog').toString()} | Website Developer**: ${client.users.cache.get('765295694583693372').tag}`,
        `> **${client.utils.EmojiFinder(client, 'DinoAtlasDragon').toString()} | Art Creator**: ${client.users.cache.get('552788119334813716').tag}`
      ])
      .setFooter('This bot is made with discord.js and typescript | Lyrics api: ksoft.si', 'https://discord.js.org/static/logo-square.png');
    return message.channel.send(embed);
  }
}