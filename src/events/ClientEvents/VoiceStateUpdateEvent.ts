// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-voiceStateUpdate
import { VoiceState, TextChannel } from 'discord.js';
import BaseEvent from '../../utils/structures/BaseEvent';
import DiscordClient from '../../client/client';

export default class WoiceStateUpdateEvent extends BaseEvent {
  constructor() {
    super('voiceStateUpdate');
  }
  
  async run(client: DiscordClient, oldState: VoiceState, newState: VoiceState) {
    if (client.user.id !== oldState.member.id) return;
    if (oldState.serverDeaf === newState.serverDeaf || newState.serverDeaf === true) return;
    const player = client.music.players.get(oldState.member.guild.id);
    if (!player) return;

    if (newState.member.permissions.has('DEAFEN_MEMBERS')) newState.member.voice.setDeaf(true);

    const queue = player.queue;
    if (!queue) return;
    //@ts-ignore
    const channel: TextChannel = client.channels.cache.get(queue.message.channel.id) as TextChannel;
    if (channel) channel.send(
      `> ${client.utils.EmojiFinder(client, 'redtick').toString()} | Please do not undeafen me, if you do this it could potentially break your privacy and will decrease the bandwith in this voice channel. \n > 🔗 | Read more about it here: https://stereodiscord.glitch.me/privacy-policy`
    );
  }
}