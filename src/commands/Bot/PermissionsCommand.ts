import { rolePermissions } from '../../utils/database/Interfaces';
import { rolePermission } from '../../utils/database/rolePermissionsSchema';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { Message } from 'discord.js';

export default class PermissionsCommand extends BaseCommand {
  constructor() {
    super('permissions', {
      category: 'Bot',
      aliases: ['perms'],
      description: 'Changes the permissions for a role (if the users with that role can play music etc.)',
      userPermissions: ['MANAGE_GUILD'],
      usage: '<role id/mention> <permission: manage player/manage queue/add songs/all>',
      ownerOnly: true,
      timeout: 15e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    if (!client.partner.get(message.guild.id)) return message.channel.send(
      `> 🔒 | It looks like this server is not partnered with us, this command is for partners only right now but it will be public soon!`
    );

    const rolePermissions = ['MANAGE_PLAYER', 'MANAGE_QUEUE', 'ADD_SONGS', 'ALL'];

    const role = message.guild.roles.cache.get(args[0]) || message.mentions.roles.first();
    const p = args.slice(1).join(' ') || '';
    const permission = p.replace(/ +/g, '_').toUpperCase();

    if (!role) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | Please specify a role to edit.`
    );
    if (!permission || !rolePermissions.includes(permission)) return message.channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | Please specify a permission to change for the role.`
    );
    
    let Return: boolean = false;
    try {
      const object: rolePermissions = {
        roleId: role.id,
        permissions: {
          ADD_SONGS: (permission === 'ADD_SONGS' || 'ALL') ? true : false,
          MANAGE_QUEUE: (permission === 'MANAGE_QUEUE' || 'ALL') ? true : false,
          MANAGE_PLAYER: (permission === 'MANAGE_PLAYER' || 'ALL') ? true : false,
        },
      };

      const data = await rolePermission.findOne({ guildId: message.guild.id, roleId: role.id });
      if (!data) {
        new rolePermission({
          guildId: message.guild.id,
          roleId: role.id,
          addSongs: object.permissions.ADD_SONGS,
          manageQueue: object.permissions.MANAGE_QUEUE,
          managePlayer: object.permissions.MANAGE_PLAYER,
        }).save();
        client.rolePermissions.set(role.id, object);
      } else if (data) {
        client.rolePermissions.set(role.id, {
          roleId: role.id,
          permissions: {
          //@ts-ignore
          ADD_SONGS: (permission === 'ADD_SONGS' || permission === 'ALL') ? (data.addSongs ? false : true) : data.addSongs,
          //@ts-ignore
          MANAGE_QUEUE: (permission === 'MANAGE_QUEUE' || permission === 'ALL') ?(data.manageQueue ? false : true) : data.manageQueue,
          //@ts-ignore
          MANAGE_PLAYER: (permission === 'MANAGE_PLAYER' || permission === 'ALL') ? (data.managePlayer ? false : true) : data.managePlayer,
          },
        });
        rolePermission.findOneAndUpdate({ guildId: message.guild.id, roleId: role.id }, {
          guildId: message.guild.id,
          roleId: role.id,
          //@ts-ignore
          addSongs: (permission === 'ADD_SONGS' || permission === 'ALL') ? (data.addSongs ? false : true) : data.addSongs,
          //@ts-ignore
          manageQueue: (permission === 'MANAGE_QUEUE' || permission === 'ALL') ?(data.manageQueue ? false : true) : data.manageQueue,
          //@ts-ignore
          managePlayer: (permission === 'MANAGE_PLAYER' || permission === 'ALL') ? (data.managePlayer ? false : true) : data.managePlayer,
        }, (err, _) => { if (err) throw new Error(err) });
      }
    } catch (e) {
      await message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | For some reason the guard didn't want to open the gate when entering the database.`);
      return client.Webhook.send(`> ❌ | New error | **${message.guild.name}** | DB permission Command Error | Error: \`${e.message || e}\``);
    };
    
    if (Return) return;
    return message.channel.send(`> ${client.utils.EmojiFinder(client, 'greentick').toString()} | sucessfully changed ${permission.replace(/_/g, ' ').toLowerCase()} permission(s) from \`${role.name}\`!`);
  }
}