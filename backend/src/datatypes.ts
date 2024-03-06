export type processed_crash = {
    crash_id: string;
    player_id: string;
    crash_time: string;
    version: string;
    data: string;
}

export type player = {
    id: number;
    name: string;
    crash_count: number;
}

export type crash_data = {
    id: number;
    type: string;
    data: string;
}

export type webhook = {
    id: number;
    creator_id: string;
    url: string;
}