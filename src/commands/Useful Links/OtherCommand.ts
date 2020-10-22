import { Message, MessageEmbed } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class OtherCommand extends BaseCommand {
  constructor() {
    super('other', {
      category: 'Useful Links', 
      aliases: [],
      description: 'Any other useful links will be displayed here.',
      ownerOnly: false,
      timeout: 10e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const embed: MessageEmbed = new MessageEmbed()
    .setDescription([
      '> 🔗 | Stereo\'s "advanced" links:',
      '[Stereo Deafened](https://docs.google.com/document/d/18ss-7azAf_5Nr7EPAje0iWjgOLLoTGQImU2gi8bXjf0/edit?usp=sharing)',
      '[Basic Usage](https://docs.google.com/document/d/1fkgOpXVP4DIPRZsPvgbRO8tMLWaIbzKOcLCVeEXu2BM/edit?usp=sharing)',
      '[Getting Started](https://docs.google.com/document/d/1QYbLw5Us05GgqUABtw8-tNSUajXPTQCTkSbz5u-9aiU/edit?usp=sharing) \n',
      '> 🤖 | Bot server pages:',
      '[Botrix](https://botrix.cc/bots/745665203777306664/)',
      '[Disforge](https://disforge.com/bot/393-stereo)',
      '[Discord Bot List](https://discordbotlist.com/bots/stereo-3375)',
      '[Bots on discord](https://botsfordiscord.com/bot/745665203777306664)'
    ])
    .setColor('#206694')
    return message.channel.send(embed);
  }
}