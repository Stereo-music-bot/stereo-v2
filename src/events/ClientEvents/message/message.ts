import { Message, NewsChannel, TextChannel } from 'discord.js';
import BaseEvent from '../../../utils/structures/BaseEvent';
import DiscordClient from '../../../client/client';
import ms from 'ms';

const timeouts: Map<string, number> = new Map();

export default class MessageEvent extends BaseEvent {
  constructor() {
    super('message');
  }

  async run(client: DiscordClient, message: Message) {
    if (message.author.bot || message.channel.type === 'dm' || !message.guild.available || !message.channel.permissionsFor(client.user).has('SEND_MESSAGES')) return;

    const prefix = client.prefix.get(message.guild.id) || process.env.DISCORD_BOT_PREFIX;
    const mentionPrefixes: string[] = [`<@${client.user.id}>`, `<@!${client.user.id}>`];

    if (message.content.startsWith(prefix)) {
      const [cmdName, ...cmdArgs] = message.content
        .slice(prefix.length)
        .trim()
        .split(/\s+/);
      
      return commandHandler(client, message, cmdName, cmdArgs);
    } else if (message.content.startsWith(mentionPrefixes[0])) {
      const [cmdName, ...cmdArgs] = message.content
      .slice(mentionPrefixes[0].length)
      .trim()
      .split(/\s+/);

      if (!cmdName) return message.channel.send(`> 🤖 | My prefix for this server is \`${prefix}\`, you can also the mention prefix (ex: ${client.user.toString()} help)`);
      return commandHandler(client, message, cmdName, cmdArgs);
    } else if (message.content.startsWith(mentionPrefixes[1])) {
      const [cmdName, ...cmdArgs] = message.content
      .slice(mentionPrefixes[1].length)
      .trim()
      .split(/\s+/);

      if (!cmdName) return message.channel.send(`> 🤖 | My prefix for this server is \`${prefix}\`, you can also the mention prefix (ex: ${client.user.toString()} help)`);
      return commandHandler(client, message, cmdName, cmdArgs);
    }
  }
}

function commandHandler(client: DiscordClient, message: Message, cmdName: string, cmdArgs: string[]): Promise<Message> {
  if (client.user.username === 'Stereo Dev' && !client.owners.includes(message.author.id)) return message.channel.send(
    `> 😢 | This is a developer only bot, we use this bot to test new features before the come to the main one, If you wish to help. Feel free to open a ticket with title: \n \`Becoming a beta tester\``
  );
  const command = client.commands.get(cmdName);
  const channel: TextChannel | NewsChannel = message.channel as TextChannel | NewsChannel;
  if (command) {
    const options = command.getOptions();
    if (options.ownerOnly && !client.owners.includes(message.author.id)) return message.channel.send(
      `> ❗ | Sorry this is a command intended for onwers and developers of \`${client.user.tag}\` only!`
    );
    if (!message.guild.me.hasPermission('USE_EXTERNAL_EMOJIS') || !channel.permissionsFor(client.user).has('USE_EXTERNAL_EMOJIS')) return message.channel.send(
      `> ‼ | I am missing the \`Use External Emojis\` Permission, without this permission I can not work in this server!`
    );

    if (client.owners.includes(message.author.id)) return command.run(client, message, cmdArgs);
    if (options.clientPermissions && (channel.permissionsFor(client.user).missing(options.clientPermissions).length || message.guild.me.permissions.missing(options.clientPermissions).length)) {
      const missing = client.utils.missingPerms(message.guild.me, channel, options.clientPermissions);
      return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | Oops, It looks like I am missing a few permissions to continue: ${missing}`);
    };
    if (options.userPermissions && (channel.permissionsFor(message.member).missing(options.userPermissions).length || message.member.permissions.missing(options.userPermissions).length)) {
      const missing = client.utils.missingPerms(message.member, channel, options.userPermissions);
      return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | Oops, It looks like you are missing a few permissions to continue: ${missing}`);
    };
    let missing: boolean = false;
    if (options.userRolePermissions) {
      message.member.roles.cache.forEach(r => {
        const info = client.rolePermissions.get(r.id);
        if (info) {
          if (info.permissions !== options.userRolePermissions[0] as 'MANAGE_PLAYER' | 'MANAGE_QUEUE' | 'ADD_SONGS' | 'ALL') {
            if (info.permissions !== 'ALL') {
              missing = true;
              return message.channel.send(
                `> 👮‍♂️ | You are missing the \`${options.userRolePermissions[0]}\` permission to use this command.`
              );
            }
          }
        }
      });
    };

    if (missing) return;

    if (options.timeout) {
      const timeout = timeouts.get(message.author.id + `-` + command.getName());
      if (timeout) {
        const l = (Date.now() - timeout);
        const left = options.timeout - l;
        return message.channel.send(`> ⏲️ | Take a break, you are going to fast! Try again after \`${ms(left, { long: true })}\`.`);
      } else {
        timeouts.set(message.author.id + `-` + command.getName(), Date.now());
        setTimeout(() => timeouts.delete(message.author.id + `-` + command.getName()), options.timeout);
      };
    };

    return command.run(client, message, cmdArgs);
  }
}