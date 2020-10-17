import { Client, GuildEmoji } from 'discord.js';
/**
 * 
 * @param client the client that is passed in when the command got triggered
 * @param emojiName the name of the emoji
 */
export function EmojiFinder(client: Client, emojiName: string): GuildEmoji {
    return client.guilds.cache.get('746536046275198997')
    .emojis.cache.find(e => e.name.toLowerCase() === emojiName.toLowerCase())
    || undefined;
};