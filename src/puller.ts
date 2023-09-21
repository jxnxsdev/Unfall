import axios from 'axios';
import getPrisma from '.';

export default async function puller() {
    console.log('Puller started');
    setInterval(pull, 1000 * 60 * 10);
    pull();
}

let lastPull: Date;

export async function getLatestPull() {
    if (!lastPull) {
        lastPull = new Date();
    }

    return lastPull;
}



async function pull() {
    let api = "https://analyzer.questmodding.com/api/crashes";
    let res = await axios.get(api);
    
    console.log("Pulled " + res.data.length + " crashes");

    let crashes = res.data;

    for (let crash of crashes) {
        const user = crash.userId;
        const crashId = crash.crashId;
        const crashDate = crash.uploadDate;
        let gameVersion = "undefined";
        if (crash.gameVersion) {
            gameVersion = crash.gameVersion;
        }

        let prisma = await getPrisma();

        const existingCrash = await prisma.crashReports.findFirst({
            where: {
                username: user,
                id: crashId
            }
        });

        if (!existingCrash) {
            await prisma.crashReports.create({
                data: {
                    username: user,
                    id: crashId,
                    report_date: crashDate,
                    gameversion: gameVersion
                }
            });
        } else {
            continue;
        }


        const existingUser = await prisma.users.findFirst({
            where: {
                username: user
            }
        });

        if (!existingUser) {
            await prisma.users.create({
                data: {
                    username: user,
                    crash_count: 1
                }
            });
        }else {
            await prisma.users.update({
                where: {
                    username: user,
                    id: existingUser.id
                },
                data: {
                    crash_count: existingUser.crash_count + 1
                }
            });
        }

        console.log("Added crash " + crashId + " from user " + user + ". Index in array: " + crashes.indexOf(crash));
    }

    lastPull = new Date();

    console.log("Last pull: " + lastPull);
}