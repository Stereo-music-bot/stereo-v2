import { Client, ClientOptions, Collection } from 'discord.js';
import BaseCommand from '../utils/structures/BaseCommand';
import BaseEvent from '../utils/structures/BaseEvent';

export default class DiscordClient extends Client {

  private _commands = new Collection<string, BaseCommand>();
  private _cs = new Collection<string, BaseCommand>();
  private _events = new Collection<string, BaseEvent>();
  private _prefix = new Collection<string, string>();
  private _perms = new Collection<string, string>();

  constructor(options?: ClientOptions) {
    super(options);
  }

  get commands(): Collection<string, BaseCommand> { return this._commands; }
  get cs(): Collection<string, BaseCommand> { return this._cs; }
  get events(): Collection<string, BaseEvent> { return this._events; }
  get prefix(): Collection<string, string> { return this._prefix; }
  get perms(): Collection<string, string> { return this._perms; }
}
