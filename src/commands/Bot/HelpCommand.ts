import { Message, MessageEmbed } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import FuzzySearch from 'fuzzy-search';
import ms from 'ms';

const inviteLink = 'https://stereodiscord.glitch.me/invite';
const supportServer = 'https://discord.gg/bvn89qP';
const website = 'https://stereodiscord.glitch.me/';

export default class HelpCommand extends BaseCommand {
  constructor() {
    super('help', {
      category: 'Bot',
      aliases: ['commands'],
      description: 'Is this needed? I think you should know it by now.',
      usage: '[command name or alias]',
      clientPermissions: ['EMBED_LINKS'],
      ownerOnly: false,
      timeout: 3e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const prefix = client.prefix.get(message.guild.id) || process.env.DISCORD_BOT_PREFIX;

    let embed = new MessageEmbed()
      .setTitle(`${message.guild.name}'s help menu`)
      .setThumbnail(message.guild.iconURL({ dynamic: true, size: 4096 }) || client.user.displayAvatarURL({ dynamic: true, size: 4096 }))
      .setColor(message.member.displayHexColor || 'BLUE')
    
    client.owners.includes(message.author.id) 
    ? embed.addField(`Bot Commands - [${client.cs.size}]`, `> ❓ | \`<>\` means this part of the command is needed | \`[]\` means that this part of the command is optional and not needed, \n > 🔗 | Useful Links: [Invite me](${inviteLink}) | [Support Server](${supportServer}) | [Website](${website})`) 
    : embed.addField(`Bot Commands - [${client.cs.size - client.cs.filter(c => !c.getOptions().ownerOnly).size}]`, `> ❓ | \`<>\` means this part of the command is needed | \`[]\` means that this part of the command is optional and not needed. \n > 🔗 | Useful Links: [Invite me](${inviteLink}) | [Support Server](${supportServer}) | [Website](${website})`)
    
    if (args[0]) {
      const cmd = client.commands.get(args[0]); 
      if (!cmd) {
        const result = noResult(client.cs.array(), args[0]);
        return message.channel.send(
          `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | No command was found for you query. ${result.length ? 'Did you mean to search for: ' + result.map(c => `\`${c.getName()}\``).join(', ') + '?' : ''}`
        );
      };

      const options = cmd.getOptions();
      embed.setDescription([
        `> 🏷 | **Name**: \`${cmd.getName()}\``,
        `> 📂 | **Category**: \`${options.category || 'No description Provided'}\``,
        `> 📄 | **Alliases**: ${options.aliases.length ? options.aliases.map(alias => `\`${alias}\``).join(' ') : 'No aliases'} \n`,
        `> ⌚ | **Timeout**: \`${!options.timeout ? 'No timeout' : ms(options.timeout, { long: false })}\``,
        `> 📖 | **description**: ${options.description ? !options.description.endsWith('.') ? options.description + '.' : options.description : 'No description provided for this command.'}`,
        `> 📋 | **usage**: ${cmd.getName()} ${options.usage || ''} \n`,
        `> ${options.ownerOnly ? '🔒' : '🔓'} | **Owner Only**: \`${options.ownerOnly || 'false'}\``,
        `> 🔖 | **Role Permissions**: ${options.userRolePermissions ? client.utils.formatPerms(options.userRolePermissions) : '`None`'}`,
        `> 👮‍♂️ | **User Permissions**: ${options.userPermissions ? client.utils.formatPerms(options.userPermissions) : '`None`'}`,
        `> ❗ | **Client Permissions**: ${options.clientPermissions ? client.utils.formatPerms(options.clientPermissions) : '`None`'}`
      ]);

      return message.channel.send(embed);
    } else {
      let categories: string[];
      if (!client.owners.includes(message.author.id)) categories = removeDuplicates(client.cs.filter(cmd => !cmd.getOptions().ownerOnly).map(cmd => cmd.getOptions().category));
      else categories = removeDuplicates(client.cs.map(cmd => cmd.getOptions().category));

      for (const category of categories) {
        embed.addField(`**${category} - [${client.cs.filter(cmd => cmd.getOptions().category === category).size}]**`, client.cs.filter(cmd => cmd.getOptions().category === category).map(cmd => `\`${cmd.getName()}\``).join(' '));
      }
      embed.setDescription(`> 🤖 | The prefix for this server is \`${prefix}\`, \n \n > 💬 | Use \`${prefix}help <command name>\` to get more info about a specific command!`);

      return message.channel.send(embed);
    }
  }
}

function removeDuplicates(arr: Array<string>): Array<string> {
  return [...new Set(arr)];
}

function noResult(commands: Array<BaseCommand>, input: string) {
  const searcher = new FuzzySearch(commands, ['options.aliases', 'name'], {
    caseSensitive: true,
  });
  return searcher.search(input);
}