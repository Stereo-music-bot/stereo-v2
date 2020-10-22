import { Message, MessageEmbed } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class InviteCommand extends BaseCommand {
  constructor() {
    super('invite', {
      category: 'Useful Links', 
      aliases: ['join'],
      description: 'Gives you the invite link with and without admin perms.',
      ownerOnly: false,
      clientPermissions: ['EMBED_LINKS'],
      timeout: 10e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const invAdmin: string = '';
    const inv: string = '';

    const embed: MessageEmbed = new MessageEmbed()
    .setTitle(`${client.user.tag} | Invite Links`)
    .setDescription(`[Invite Link with admin](${invAdmin}) | [Invite Link with admin](${inv}) \n The invite link with admin will ask you to give the bot admin permissions. This is just to make sure that the bot is able to join every channel. This permission is not needed thats why we included a non admin invite link version as well.`)
    .setColor(message.guild.me.displayHexColor || 'BLUE');
    
    return message.channel.send(embed)
  }
}