import { rolePermissions } from '../../utils/database/Interfaces';
import { rolePermission } from '../../utils/database/rolePermissionsSchema';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { Message } from 'discord.js';
import { error } from 'console';

export default class PermissionsCommand extends BaseCommand {
  constructor() {
    super('permissions', {
      category: 'Bot',
      aliases: ['perms'],
      description: 'Changes the permissions for a role (if the users with that role can play music etc.)',
      userPermissions: ['MANAGE_GUILD'],
      usage: '<role id/mention> <type: grant/remove> <permission: manage player/manage queue/add songs/all>',
      ownerOnly: true,
      timeout: 15e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const rolePermissions = ['MANAGE_PLAYER', 'MANAGE_QUEUE', 'ADD_SONGS', 'ALL'];
    const grantTypes = ['remove', 'grant'];

    const role = message.guild.roles.cache.get(args[0]) || message.mentions.roles.first();
    const type = (args[1] || '').toLowerCase();
    const p = args.slice(2).join(' ') || '';
    const permission = p.replace(/ +/g, '_').toUpperCase();

    if (!role) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | Please specify a role to edit.`
    );
    if (!type || !grantTypes.includes(type)) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | Please specify a type (grant or remove).`
    );
    if (!permission || !rolePermissions.includes(permission.toLocaleUpperCase())) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | Please specify a permission to change for the role.`
    );
    
    let Return: boolean = false;
    try {
      
    } catch (e) {
      await message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | For some reason the guard didn't want to open the gate when entering the database.`);
      return client.Webhook.send(`> ❌ | New error | **${message.guild.name}** | DB permission Command Error | Error: \`${e.message || e}\``);
    };
    
    if (Return) return;
    //return message.channel.send(`> ${client.utils.EmojiFinder(client, 'greentick').toString()} | sucessfully changed ${permission} permission(s) from \`${role.name}\`!`);
  }
}