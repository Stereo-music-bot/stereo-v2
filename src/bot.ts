import { config } from 'dotenv';
config();
import { registerCommands, registerEvents, registerWSEvents, registerMusicEvents } from './utils/registry';
import { rolePermissions } from './utils/database/Interfaces';
import { WebhookClient, Collection } from 'discord.js';
import Utils from './utils/functions/Util';
import Queue from './utils/functions/queue';
import { Manager } from 'lavaclient';
import DiscordClient from './client/client';
import mongoose, { Error } from 'mongoose';

const client = new DiscordClient({ messageCacheLifetime: 6048e5, disableMentions: 'everyone' });

(async () => {
  client.utils = new Utils();
  client.owners = ['304986851310043136', '715289819630141487', '765295694583693372', '552788119334813716'];

  client.rolePermissions = new Collection();
  client.ignoredChannels = new Collection();
  client.vote = new Collection();

  client.Webhook = new WebhookClient(
    '762318210959540234', 
    'qX0BfjL9GVopsV6zq1OXXEkeEvGC_3u9tHLUYTgCkWMZlsZE3azVJYNVsx1K5-8Vd12h',
  );

  client.music = new Manager([{
    id: "main",
    host: "localhost",
    port: 7621,
    password: process.env.PASSWORD,
  }], {
    shards: client.shard ? client.shard.count : 1,
    send(id, pk) {
      const guild = client.guilds.cache.get(id);
      if (guild) guild.shard.send(pk);
    },
  });
  
  await registerCommands(client, '../commands');
  await registerEvents(client, '../events/ClientEvents');
  await registerWSEvents(client, '../events/WebSocketEvents');
  await registerMusicEvents(client, client.music, '../events/musicEvents');

  mongoose.connect(process.env.DB_URL, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true });
  client.login(process.env.DISCORD_BOT_TOKEN);

  mongoose.connection.on("connected" , () => console.log('Mongoose Database successfully connected!'));
  mongoose.connection.on("err" , (err: Error) => {
    console.error(`Mongoose Error:\n ${err.stack ? err.stack : err.name} | ${err.message}`);
    return client.Webhook.send(
      `> ❌ | New error | **DB Error** | Global DB Error | Error: \`${err.stack ? err.stack : err.name} | ${err.message}\``
    );
  });
  mongoose.connection.on("disconnected" , () => {
    console.warn("Mongoose Connection Lost :(");
    return client.Webhook.send(
      `> ❌ | New error | **DB Warning** | Global DB Warning/Issue | Issue: \`DB Connection Lost\``
    );
  });
})();

declare module "lavaclient" {
  interface Player {
    queue: Queue;
    send(op: string, body?: any): Promise<void>;
    _connected: boolean;
    bass: 'hard' | 'medium' | 'low' | 'none';
    repeating: 'queue' | 'song' | 'always' | 'none';
    filter: 'nightcore' | 'default';
    radio?: { playing: boolean, name: string };
  }
}

declare module 'discord.js' {
  interface Client {
    utils: Utils;
    music: Manager;
    owners: Array<string>;
    Webhook: WebhookClient;
    rolePermissions: Collection<string, rolePermissions>;
    ignoredChannels: Collection<string, boolean>;
    vote: Collection<string, { votes: number, users: string[] }>;
  }
}