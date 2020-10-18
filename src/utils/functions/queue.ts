import { Message, MessageEmbed } from 'discord.js';
import { EventEmitter } from 'events';
import { Player } from 'lavaclient';
import { decode } from '@lavalink/encoding';
import { textChangeRangeIsUnchanged } from 'typescript';

interface QueueObject {
    track: string;
    requester: string;
}
  
interface RepeatObject {
    song: boolean;
    queue: boolean;
    always: boolean;
}

export default class Queue extends EventEmitter {
    public next: QueueObject[] = [];
    public previous: QueueObject[] = [];
    public current: QueueObject;
    public repeat: RepeatObject = { song: false, queue: false, always: false };
    public announce: boolean = true;
    private message: Message;

    public constructor(public player: Player) {
        super();

        player
            .on('end', async (tet) => {
                if (tet && ["REPLACED", "STOPPED"].includes(tet.reason)) return;
                if (this.repeat.song) this.next.unshift(this.current);

                if (this.message.guild.me.voice.channel.members.size === 1 && !this.repeat.always) return this.emit('finished', 'Alone');
                
                this._next();

                if (!this.current) return this.emit('finished', 'emptyQueue');
                await player.play(this.current.track);
            })
            .on('start', async (sevt) => {
                if (!sevt) return;

                this.player = this.message.client.music.players.get(this.message.guild.id);

                let { title, identifier, uri, length } = decode(sevt.track);
                
                if (title && title.length === 0 && this.player.radio && this.player.radio.name && !this.player.radio.playing) {
                    title = this.player.radio.name;
                    this.player.radio.playing = true;
                };
                
                if (!this.announce) return;

                const embed = new MessageEmbed()
                    .setTitle(`Now Playing ${title}`)
                    .setDescription([
                        `> 🎵 | **Song**: [${title}](${uri})`,
                        `> 👤 | **Requested By**: ${this.message.guild.members.cache.get(this.current.requester).toString()}`,
                        `> ⌚ | **Duration**: \`${this.message.client.utils.formatTime(Number(length))}\``
                    ])
                    .setThumbnail(`https://i.ytimg.com/vi/${identifier}/hqdefault.jpg`)
                    .setColor(this.message.guild.members.cache.get(this.current.requester).displayHexColor || 'BLUE')
                return this.message.channel.send(embed);
            })
            .on('stuck', async () => {
                await this.message.client.Webhook.send(`> ❌ | New error | **${this.message.guild.name}** | Play error | Error: \`Player stuck on song: ${decode(this.current.track).title} | ${this.current.track}\``);
                this.message.channel.send(
                    `> <:redtick:749587325901602867> | The player is stuck on the song: **${decode(this.current.track).title}**. I will skip this song now.`
                );
                return this._next();
            })
            .on('error', async (e) => {
                await this.message.client.Webhook.send(`> ❌ | New error | **${this.message.guild.name}** | Song error | Song: ${decode(this.current.track).title} | Error: \`${!e.exception ? e.error : e.exception.message}\``);
                this.message.channel.send(
                    `> <:redtick:749587325901602867> | An error occured while playing **${decode(this.current.track).title}**: ${!e.exception ? e.error : e.exception.message}`
                );
                return this._next();
            });
            this.on('finished', async (reason: string) => {
                if ((this.repeat.queue && reason !== 'Alone') || this.repeat.always) {
                    this.next = this.previous;
                    this.next.length ? '' : this.next.push(this.current);
                    if (!this.next.length) return this.emit('finished', 'empty');
                    this.current = this.next.shift();
                    this.previous = [];
                    return await this.start(this.message, this.announce);
                };

                if (this.repeat.song && reason !== 'Alone') {
                    return await this.start(this.message, this.announce);
                }

                switch (reason) {
                    case 'Alone':
                        if (this.repeat.always) return;

                        this.message.channel.send(
                            `> 👤 | It looks like I am the only one in the voice channel, I will leave it now...`
                        );
                        return await this.clear();
                
                    case 'empty':
                    default:
                        this.message.channel.send(
                            `> 🔇 | The queue is empty, I will leave the voice channel now...`
                        );
                        return await this.clear();
                    
                    case 'disconnect':
                        this.message.channel.send(
                            `> 👋 | Disconnected from the voice channel, I will clear the queue now...`
                        );
                        return await this.clear();
                };
            });
        
    };

    public _next() {
        this.previous.push(this.current);
        return (this.current = this.next.shift());
    };

    public async clear() {
        this.next = [];
        this.previous = [];
        this.repeat = { song: false, queue: false, always: false };
        this.message.client.music.players.get(this.message.guild.id).repeating = 'none';
    
        return await this.player.manager.destroy(
          this.message.guild.id ?? this.player.guild
        );
    };
    
    public async start(message: Message, announce: boolean) {
        this.announce = announce;
        this.message = message;
        this.message.client.vote.set(this.message.guild.id, { votes: 0, users: [] });
        if (!this.current) this._next();
        await this.player.play(this.current.track);
    };

    public add(track: string, requester: string) {
        return this.next.push({ track, requester });
    };

    public async skip(player: Player) {
        player.stop();
        this._next();
        player.radio = undefined;
        this.message.client.vote.set(this.message.guild.id, { votes: 0, users: [] });
        if (!this.current) return this.emit('finished', 'empty');
        return await player.play(this.current.track);
    };

    public shuffle() {
        for (let i = this.next.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.next[i], this.next[j]] = [this.next[j], this.next[i]];
          }
        return this.next;
    }

    public async remove(song: number) {
        const Number = song - 1;
        return this.next = this.next.filter((_, i) => i !== Number);
    }

    public async skipto(song: number) {
        this.next = this.next.slice(song);
        return await this.skip(this.player);
    }
    
    public setRepeat(type: string, repeat: RepeatObject) {
        this.player.repeating = type as 'queue' | 'song' | 'always' | 'none';
        return this.repeat = repeat;
    }

    public async reset() {
        const player = this.message.client.music.players.get(this.message.guild.id);
        this.repeat = { song: false, queue: false, always: false };
        player.repeating = 'none';
        player.filter = 'default';
        player.bass = 'none';
        await player.send('filters', {});
        await player.setVolume(100);
        await player.setEqualizer(
            Array(6)
              .fill(null)
              .map((_, i) => ({ band: i++, gain: 0 }))
          );

        return this.player = player;
    }

    public Announce() {
        return this.announce = !this.announce;
    }
};