import { Message, PermissionString } from 'discord.js';
import DiscordClient from '../../client/client';

interface Options {
  category: string,
  aliases: Array<string>,
  description?: string,
  usage?: string,
  ownerOnly: boolean,
  clientPermissions?: Array<PermissionString>,
  userPermissions?: Array<PermissionString>,
  userRolePermissions?: string[],
  timeout?: number
}

export default abstract class BaseCommand {
  constructor(private name: string, private options: Options) {}

  getName(): string { return this.name; }
  getOptions(): Options { return this.options; }

  abstract async run(client: DiscordClient, message: Message, args: Array<string> | null): Promise<Message>;
}