export let last24h: any[] = [];
export let last30d: any[] = [];
export let verions: any[] = [];
export let causes: any[] = [];
export let players: any[] = [];

import { PrismaClient } from '@prisma/client'

export async function calculateData() {
    last24h = await calculate24h();
    last30d = await calculate30d();
    verions = await calculateVersions();
    causes = await calculateCauses();
    players = await calculatePlayers();
}


async function calculate24h() {
    const prisma = new PrismaClient();

    let crashesPerHour = [];

    let crahes = await prisma.crashes.findMany({
        where: {
            crash_time: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
        }
    });

    for (let i = 0; i < 24; i++) {
        let json = {"hour": i, "crashes": 0};
        // hours go into the past, meaning 0 is the current hour, 23 is 24 hours ago
        let date = new Date(Date.now() - i * 60 * 60 * 1000);
        for (let crash of crahes) {
            if (crash.crash_time.getHours() === date.getHours()) {
                json.crashes++;
            }
        }
        crashesPerHour.push(json);
    }

    prisma.$disconnect();

    return crashesPerHour;
}

async function calculate30d() {
    const prisma = new PrismaClient();

    let crashesPerDay = [];

    let crahes = await prisma.crashes.findMany({
        where: {
            crash_time: {
                gte: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000)
            }
        }
    });

    for (let i = 0; i < 31; i++) {
        let json = {"day": i, "crashes": 0};
        // days go into the past, meaning 0 is the current day, 29 is 30 days ago
        let date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        for (let crash of crahes) {
            if (crash.crash_time.getDate() === date.getDate()) {
                json.crashes++;
            }
        }
        crashesPerDay.push(json);
    }

    prisma.$disconnect();

    return crashesPerDay;
}

async function calculateVersions() {
    const prisma = new PrismaClient();

    let db_versions = await prisma.version_crashes.findMany();

    let version_json = [];

    for (let version of db_versions) {
        let json = {"version": version.version, "crashes": version.crash_count};
        version_json.push(json);
    }

    prisma.$disconnect();

    return version_json;
}

async function calculateCauses() {
    const prisma = new PrismaClient();

    let db_causes = await prisma.crash_causes.findMany();

    let causes_json = [];

    for (let cause of db_causes) {
        let json = {"cause": cause.cause, "crashes": cause.crash_count};
        causes_json.push(json);
    }

    prisma.$disconnect();

    return causes_json;
}

async function calculatePlayers() {
    const prisma = new PrismaClient();

    let db_players = await prisma.players.findMany({
        orderBy: {
            crash_count: 'desc'
        }
    });

    let players_json = [];

    for (let player of db_players) {
        let json = {"name": player.name, "crashes": player.crash_count};
        players_json.push(json);
    }

    prisma.$disconnect();

    return players_json;
}