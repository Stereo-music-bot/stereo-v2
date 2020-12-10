import { guildConfig } from '../../../utils/database/guildConfigSchema';
import { rolePermission } from '../../../utils/database/rolePermissionsSchema'; 
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

    client.partner.set('720367989630828694', true);
    client.partner.set('701781652577321002', true);
    client.partner.set('742412962408562818', true);
    client.partner.set('743145077206941747', true);
    client.partner.set('769114951767031849', true);
    
    client.music.init(client.user.id);

    if (client.user.username === 'Stereo') {
      setInterval(async function() {
        let channelId = '751459649538228256';
        let guild = client.guilds.cache.get(`743145077206941747`);
        let channel = guild.channels.cache.get(channelId);
        let count = client.guilds.cache.size;
  
        if (!channel) return console.log('no channel found');
        await channel.edit({ name: `🎊 Server Count: ${count}`}, `10 minutes passed. Changing server count`);
  
      }, 300000);
    }

    console.log(`${client.user.tag} has logged in!`);
  }
}

async function devStatus(client: DiscordClient): Promise<void> {
  await client.user.setStatus('idle');
  let activities = ['with the beta testers!'], i =0;
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
        permissions: {
          ADD_SONGS: true,
          MANAGE_PLAYER: true,
          MANAGE_QUEUE: true,
        },
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
      data.ignoredChannels.forEach(id => client.ignoredChannels.set(id, true));
      rolePermission.find({ guildId }, (e, data) => {
        if (e) throw new Error(e);

        if (data.length) {
          data.forEach(d => {
            const rolePermissions: rolePermissions = {
              //@ts-ignore
              roleId: d.roleId,
              permissions: {
                //@ts-ignore
                ADD_SONGS: d.addSongs,
                //@ts-ignore
                MANAGE_PLAYER: d.managePlayer,
                //@ts-ignore
                MANAGE_QUEUE: d.manageQueue,
              },
            };
            //@ts-ignore
            client.rolePermissions.set(d.roleId, rolePermissions);
          });
        } else {
          const rolePermissions: rolePermissions = {
            roleId: guildId,
            permissions: {
              ADD_SONGS: true,
              MANAGE_PLAYER: true,
              MANAGE_QUEUE: true,
            },
          }
          client.rolePermissions.set(guildId, rolePermissions);
        };
      });
    };
  });
}

function errorLog(err: any, client: DiscordClient) {
  console.log(err);
  client.Webhook.send(
    `> ❌ | New error | **DB Error** | Global DB Load Error | Error: \`${err}\``
  );
}