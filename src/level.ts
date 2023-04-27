import { assets } from "$app/paths";

export type Level = {
    name: string;
    src: string;
    bpm: number;
    audio?: HTMLAudioElement;
    playerSpeed: number
    obstacleDuration: number;
    targetDistance: number
}

export const LEVELS: Level[] = [
    {
        name: 'Easy (Rhinoceros) bpm: 126/2=63',
        src: `${assets}/Rhinoceros.mp3`,
        bpm: 126 / 2,
        playerSpeed: 12.5,
        obstacleDuration: 3000,
        targetDistance: 45
    },
    {
        name: 'Mid (Tyrant) bpm: 72',
        src: `${assets}/Tyrant.mp3`,
        bpm: 72,
        playerSpeed: 12.5,
        obstacleDuration: 4000,
        targetDistance: 50
    },
    {
        name: 'Hard (Cut and Run) bpm: 109',
        src: `${assets}/Cut and Run.mp3`,
        bpm: 109,
        playerSpeed: 20,
        obstacleDuration: 3500,
        targetDistance: 45
    },
    {
        name: 'Impossible (In a Heartbeat) bpm: 130',
        src: `${assets}/In a Heartbeat.mp3`,
        bpm: 130,
        playerSpeed: 20,
        obstacleDuration: 2500,
        targetDistance: 40
    },
]
