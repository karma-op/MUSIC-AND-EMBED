const handler = require('../../handlers/message');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'forceplay',
    description: 'Play specific song directly',
    usage: 'forceplay [ url | query ]',
    aliases: ['fp'],
    async execute(message, args, client) {
        let player = client.player.players.get(message.guild.id);
        if (!player) return message.channel.send(new handler().normalEmbed('There\'s no player. Use play command first'))
        const { channel } = message.member.voice;
        if (!channel) return message.channel.send(new handler().normalEmbed('You\'re not in a voice channel'))
        if (player && (channel.id != player.voiceChannel)) return message.channel.send(new handler().normalEmbed('You\'re not in my voice channel'))
        if (!args[0]) return message.channel.send(new handler().noArgument(client, this.name, ['forceplay < youtube url | query | youtube playlist | spotify track | spotify playlist | spotify album | twitch >']))

        player = client.player.players.get(message.guild.id);
        const currentSong = player.queue.current;
        let search = args.join(' ');
        let res = await player.search(search, message.author)
        if (res.loadType == 'LOAD_FAILED') {
            if (!player.queue.current) player.destroy();
            return message.channel.send(new handler().normalEmbed(`Error getting music. Please try again in a few minutes \n` + `\`\`\`${res.exception.message}\`\`\``))
        }
        switch (res.loadType) {
            case 'NO_MATCHES':
                if (!player.queue.current) player.destroy()
                message.channel.send(new handler().normalEmbed(`No music was found`))
                break;

            case 'TRACK_LOADED':
                player.play(res.tracks[0])
                message.channel.send(new handler().normalEmbed(`Force played ${res.tracks[0].title} [${!res.tracks[0].isStream ? `${new Date(res.tracks[0].duration).toISOString().slice(11, 19)}` : '◉ LIVE'}]`))
                if (currentSong) player.queue.unshift(currentSong)
                break;

            case 'PLAYLIST_LOADED':
                await player.queue.add(res.tracks);
                if (!player.playing && !player.paused) {
                    player.play(res.tracks[0])
                }
                message.channel.send(new handler().normalEmbed(`Force played & queued ${res.tracks.length} songs from \`${res.playlist.name}\` [${new Date(res.playlist.duration).toISOString().slice(11, 19)}]`))
                if (currentSong) player.queue.unshift(currentSong)
                break;

            case 'SEARCH_RESULT':
                let max = 5, collected, filter = (m) => m.author.id === message.author.id && /^(\d+|cancel)$/i.test(m.content);
                if (res.tracks.length < max) max = res.tracks.length;

                const results = res.tracks
                    .slice(0, max)
                    .map((track, index) => `${++index} - \`${track.title}\``)
                    .join('\n');

                let embed3 = new MessageEmbed()
                    .setColor(message.guild.me.roles.highest.color)
                    .setTimestamp()
                    .addField(`!!`, 'Select within 15s')
                    .setDescription(results)
                const re = await message.channel.send(embed3);

                try {
                    collected = await message.channel.awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] });
                } catch (e) {
                    if (!player.queue.current) player.destroy();
                    if (!re.deleted) re.delete().catch((_) => { })
                    return message.channel.send(new handler().normalEmbed(`Time out`))
                }
                const first = collected.first().content;
                if (first.toLowerCase() === 'cancel') {
                    if (!player.queue.current) player.destroy();
                    if (!re.deleted) re.delete().catch((_) => { })
                    return message.channel.send(new handler().normalEmbed(`Cancelled`))
                }

                const index = Number(first) - 1;
                if (index < 0 || index > max - 1) return message.channel.send(new handler().normalEmbed(`Your choice isn't in the option`))

                const track = res.tracks[index];
                if (!re.deleted) re.delete().catch((_) => { })
                player.play(track)
                if (!player.playing && !player.paused) {
                    if (!re.deleted) re.delete().catch((_) => { })
                    player.play(track)
                    console.log
                }
                message.channel.send(new handler().normalEmbed(`Force played ${res.tracks[0].title} [${!res.tracks[0].isStream ? `${new Date(res.tracks[0].duration).toISOString().slice(11, 19)}` : '◉ LIVE'}]`))
                if (currentSong) player.queue.unshift(currentSong)

                break;

        }
    }
}