import { Message, MessageEmbed } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class PrivacyCommand extends BaseCommand {
  constructor() {
    super('privacy', {
      category: 'Bot',
      aliases: ['privacy'],
      description: 'Privacy policy of Stereo',
      clientPermissions: ['EMBED_LINKS'],
      ownerOnly: false,
      timeout: 5e3
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const embed: MessageEmbed = new MessageEmbed()
    .setTitle('Stereo\'s privacy policy')
    .setDescription(`· Why does Stereo deafen itself?
      Stereo server deafens itself to prevent itself from receiving your audio. This doesn't have any effect on the functionality of the bot and it can play music even if it is server deafened. This significantly reduces Stereo's bandwidth usage (since we don't receive what you say in a voice channel), as well as Discord's bandwidth (as they don't need to send it). This also protects your privacy, as we don't receive any audio from your voice channel. If you are having trouble playing music, Stereo being deafened will not affect that. You may want to join our support server for assistance: Stereo Support Server
      
      · What do we collect?
      The only things we collect are the server, user and some role ids, this is because we need this in order to store and get the data in the database. We wont do anything with it exceptStoring it in our database for you to use it when using the bot. We also collect error data. Error data is when the bot rans into an issue. When that happens the error is backlogged to our backlog for later investegation. We wont save any data that may content private information.`
    )
    .setColor(message.guild.me.displayHexColor || 'BLUE');

    return message.channel.send(embed);
  }
}