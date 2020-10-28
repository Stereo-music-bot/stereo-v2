import { Message, MessageEmbed, WebhookClient } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class PartnerwbCommand extends BaseCommand {
  constructor() {
    super('partnerwb', {
      category: 'Developer Commands',
      aliases: [],
      description: 'Stereo uses lavalink to play songs.',
      usage: '<title> <Representatives(can be more than 1)> <icon> <color (hex)> <link> <description> (split by | )',
      clientPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
      ownerOnly: true
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    if (!args.length) return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | No arguments provided.`);

    const msg: string[] = message.content.slice(client.prefix.get(message.guild.id).length + 9).trim().split(/\|/g);

    if (msg.length > 6) return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | No arguments provided.`);

    const title: string = msg[0];
    const Representatives: string = msg[1];
    const icon: string = msg[2];
    const color: string = msg[3];
    const links: string = msg[4];
    const description: string = msg[5];

    const webhook = new WebhookClient('770358553340149761', '3jZ4B4BGTfWTWxFyZ7W9jqTFv-zVgf2v6m81e3QdkWFwbD3VWd8CSqrIL9FaXk06Rwqc'); // real
    //const webhook = new WebhookClient('770361874079285308', 'vtbFlykDl_X57VsnsFwXCWDAGIKXAa9t8IC6D-hsO-Nplq6GZIdsjWyiN01u7zLly4nJ'); // testing

    try {
      const embed: MessageEmbed = new MessageEmbed()
      .setThumbnail(icon)
      .setTitle('Partnership - ' + title)
      .setDescription(`
        > 📋 | **Description**: ${description.endsWith('.') ? description : description + '.'} 
        \n > :busts_in_silhouette: | **Representatives**: ${Representatives} 
        > 🔗 | **Links**: ${links}`
      )
      .setColor(color || '#78a4fa')
      .setFooter('New Partnership', icon)
      .setTimestamp()

      await webhook.send(embed);
      webhook.destroy();
    } catch (e) {
      await client.Webhook.send(`> ❌ | New webhook error: \`${e}\``);
      return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | I wasn't able to send the message, please check the logs.`)
    }
    return message.channel.send(`> ${client.utils.EmojiFinder(client, 'greentick').toString()} | Message was sent!`);
  }
}