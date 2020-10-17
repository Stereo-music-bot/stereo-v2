import { guildConfig } from '../../../utils/database/guildConfigSchema';
import { rolePermissions, guildConfig as guildConfigInterface } from '../../../utils/database/Interfaces';
import BaseEvent from '../../../utils/structures/BaseEvent';
import DiscordClient from '../../../client/client';

const prefix = process.env.DISCORD_BOT_PREFIX;

export default class ReadyEvent extends BaseEvent {
  constructor() {
    super('ready');
  }
  async run (client: DiscordClient) {
    if (client.user.username === 'Stereo Dev') await devStatus(client);
    else if (client.user.username === 'Stereo') await status(client);
    
    client.guilds.cache.forEach(g => loadGuildConfig(g.id, client));
    
    client.music.init(client.user.id);

    console.log(`${client.user.tag} has logged in!`);
  }
}

async function devStatus(client: DiscordClient): Promise<void> {
  await client.user.setStatus('idle');
  let activities = ['with the re-written code', 'the new Beta 5 soon™', 'Listening to Daan about the new update', 'Waiting for beta 5 launch', 'with the new music system 👀'], i =0;
  setInterval(() => client.user.setActivity(activities[i++ % activities.length], { type: 'PLAYING' }), 15000);
};

async function status(client: DiscordClient): Promise<void> {
  await client.user.setStatus('online');
  let activities = ['+help', 'with my dj set', 'Mention me to see the prefix', 'mention is also a prefix'], i =0;
  setInterval(() => client.user.setActivity(activities[i++ % activities.length] + ' | Stereo Music', { type: 'PLAYING' }), 15000);
}

function loadGuildConfig(guildId: string, client: DiscordClient) {
  return guildConfig.findOne({ guildId }, async (err: any, data: guildConfigInterface) => {
    if (err) errorLog(err, client);
    if (!data) {
      const rolePermissions: rolePermissions = {
        roleId: guildId,
        permissions: 'ALL',
      };
      const guildConfigObject = {
        guildId,
        prefix,
        announce: true,
        partner: false
      };

      new guildConfig(guildConfigObject).save();
      client.rolePermissions.set(guildId, rolePermissions);
      client.prefix.set(guildId, prefix);
    } else {
      client.prefix.set(guildId, data.prefix);
      const rolePermissions: rolePermissions = {
        roleId: guildId,
        permissions: 'ALL',
      };
      client.rolePermissions.set(guildId, rolePermissions);
    };
  });
}

function errorLog(err: any, client: DiscordClient) {
  console.log(err);
  client.Webhook.send(
    `> ❌ | New error | **DB Error** | Global DB Load Error | Error: \`${err}\``
  );
}