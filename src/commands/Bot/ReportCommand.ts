import { Message, MessageEmbed } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';

export default class ReportCommand extends BaseCommand {
  constructor() {
    super('report', {
      category: 'Bot',
      aliases: [],
      description: 'With this command you will be able to report issues/bugs with the bot. Misusing this system will lead to a blacklist.',
      usage: '<issue/bug(check the format by removing the <issue/bug> part (dont add any arguments to the command))>',
      clientPermissions: ['EMBED_LINKS'],
      ownerOnly: false,
      timeout: 10e3,
      userRolePermissions: {
        ADD_SONGS: false,
        MANAGE_PLAYER: false,
        MANAGE_QUEUE: false
      }
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const issue: string = (args.join(' ')).split('\n').join('\n');
    if (!issue) return message.channel.send(
      new MessageEmbed()
      .setTitle('Bug/issue Format')
      .setDescription([
        'This is how we want to receive bugs/issue reports so we can immediately start investigating the issue.',
        '**Bug/Issue**: <bug/issue here>',
        '**What is the problem**: <problem here>',
        '**How to reproduce**: <step for step explanation about how we can reproduce the problem>',
        '**Screenshots**: [screenshots that we can use to check the problem, not required, can be links but you can also attach screenshots]',
        '**Timestamp**: [The time the you detected the problem, this could be useful when we are trying to check the error backlogs, not required] \n',
        'Want to see how it should look like? Check the example below 🔽'
      ])
      .setImage('https://cdn.discordapp.com/attachments/745370558149165197/777910927470362704/unknown.png')
      .setColor('#78a4fa')
    );

    try {
      const embed = new MessageEmbed()
      .setTitle(`New report from ${message.guild.name} from ${message.author.tag}`)
      .setDescription(issue)
      .setColor('#78a4fa')
      .addField('**❯ Extra Information**:', [
        `> 👤 | **User ID**: ${message.author.id}`,
        `> 🔢 | **Guild ID**: ${message.guild.id}`,
        `> 📁 | **Attachment Links**: ${this.attachmentLinks(message)}`
      ])
      await client.Webhook.send(embed);
    } catch (e) {
      console.log(e);
      return message.channel.send(`> ${client.utils.EmojiFinder(client, 'redtick').toString()} | Oops, an unkown error occured. Please contact someone from the stereo staff team directly or try again later!`)
    }

    return message.channel.send(`> ${client.utils.EmojiFinder(client, 'greentick').toString()} | Bug/issue Reported. We will take a look at the problem soon! \n > ❗ | Note: Misusing this system means you will be added to the blacklist and you won't receive support from us anymore (unless no one needs help)`)
  }

  attachmentLinks(message: Message): string {
    return message.attachments.size !== 0 
    ? message.attachments.map(a => a.url).join(' ') 
    : 'No extra Attachments';
  }
}