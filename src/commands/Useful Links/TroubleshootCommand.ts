import { Message, MessageEmbed } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class TroubleshootCommand extends BaseCommand {
  constructor() {
    super('troubleshoot', {
      category: 'Useful Links', 
      aliases: ['howto'],
      description: 'Is there an issue with the bot? Please check this before reporting it to our dev team',
      ownerOnly: false,
      timeout: 10e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const embed: MessageEmbed = new MessageEmbed()
    .setDescription('Troubleshooting Stereo not responding? You\'ve come to the right place.Is Discord having issues? Check Discord\'s status page. If there is an  ongoing incident, it is likely that the issue is caused by the outage. Is Stereo online? Check the sidebar to see if Stereo  is online. If Stereo appears as offline, then something has probably gone horribly wrong. Please immediately contact a support member in Stereo Support. Are you using the correct prefix? If you type @Stereo  and the bot responds, then your server\'s admins have set a server prefix. You must use this prefix instead of the default one. Still having issues? If the above steps did not resolve your issue, then feel free to contact a support member in Stereo Support. ')
    .setColor('#206694')
    return message.channel.send(embed);
  }
}