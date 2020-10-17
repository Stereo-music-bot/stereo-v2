import fetch from 'node-fetch';

interface TrackInfo {
    flags?: number;
    source: string;
    identifier: string;
    author: string;
    length: bigint;
    isStream: boolean;
    position: bigint;
    title: string;
    uri: string | null;
    version?: number;
    probeInfo?: { raw: string, name: string, parameters: string | null };
}

export default class rest {
    public static async search(track: string) {
        if (/(?:https?:\/\/|)?(?:www\.)?open\.spotify\.com\/track\/([a-z0-9\d-_]+)/gi.test(track)) {
            const arr = track.split(/https?:\/\/(www\.)?open\.spotify\.com\/track\//gi);
            const result = arr[arr.length - 1].match(/([a-z0-9\d-_]+)/gi)[0];
            if (!result) return { loadType: "NO_MATCHES" };
      
            const token = await getSpotifyToken();
      
            const song = await (
              await fetch(`https://api.spotify.com/v1/tracks/${result}`, {
                headers: {
                  authorization: `${token.tokenType} ${token.accessToken}`,
                  "User-Agent": "StereoMusicBot",
                  "Content-Type": "application/json",
                },
              })
            ).json();
      
            if (!song) return { loadType: "NO_MATCHES" };
      
            const { tracks, loadType } = await rest.search(
              encodeURIComponent(`ytsearch:${song.artists[0].name} - ${song.name}`)
            );
      
            if (["NO_MATCHES", "LOAD_FAILED"].includes(loadType)) return { loadType: "NO_MATCHES" };
            else return { loadType: "TRACK_LOADED", tracks };
        } else if (/(?:https?:\/\/|)?(?:www\.)?open\.spotify\.com\/playlist\/([a-z0-9\d-_]+)/gi.test(track)) {
            const arr = track.split(/https?:\/\/(www\.)?open\.spotify\.com\/playlist\//gi);
            const result = arr[arr.length - 1].match(/([a-z0-9\d-_]+)/gi)[0];
            if (!result) return { loadType: "NO_MATCHES" };

            const token = await getSpotifyToken();
      
            const songs = await (
              await fetch(`https://api.spotify.com/v1/playlists/${result}`, {
                headers: {
                  authorization: `${token.tokenType} ${token.accessToken}`,
                  "User-Agent": "StereoMusicBot",
                  "Content-Type": "application/json",
                },
              })
            ).json();

            if (!songs || !songs.tracks.items) return { loadType: "NO_MATCHES" };
            songs.tracks.items.forEach(async (s: any) => {
                await rest.search(
                    encodeURIComponent(`ytsearch:${s.track.artists[0].name} - ${s.track.name}`)
                );
            });
        }
      
        try {
            return await (
                await fetch(`http://${process.env.HOST}:${process.env.PORT}/loadtracks?identifier=${track}`, {
                    headers: {
                        Authorization: process.env.PASSWORD,
                    },
                })
            ).json();
        } catch (e) {
            return { loadType: 'LOAD_FAILED' };
        }
    };

    public static async decode(track: string): Promise<TrackInfo> {
        return await (
            await fetch(`http://${process.env.HOST}:${process.env.PORT}/decodetrack?track=${track}`, {
                headers: {
                    Authorization: process.env.PASSWORD,
                },
            })
        ).json();
    }
};

interface spotifyToken {
    accessToken: string,
    expiresIn: number,
    tokenType: string,
    expiresAt: Date
}
async function getSpotifyToken(): Promise<spotifyToken> {
    return fetch(`https://accounts.spotify.com/api/token?grant_type=client_credentials`, {
        method: "POST",
        headers: {
          authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_ID}:${process.env.SPOTIFY_SECRET}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then((r) => r.json())
    .then((data) => {
        const { access_token, expires_in, token_type } = data;
  
        return {
          accessToken: access_token,
          expiresIn: expires_in,
          tokenType: token_type,
          expiresAt: new Date(new Date().getTime() + (expires_in - 2000) * 1000),
        };
      });
  };