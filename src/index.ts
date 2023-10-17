import Fastify from 'fastify'
import path from 'path';
import fs from 'fs';
import puller from './puller';
import { PrismaClient} from '@prisma/client';
import { getLatestPull } from './puller';

let prisma: PrismaClient;

const fastify = Fastify({
  logger: true
})

fastify.get('/', async (request, reply) => {
  reply.type('html').code(200)
  return fs.createReadStream(path.join(__dirname, '../html/index.html'))
})

fastify.get('/leaderboard', async (request, reply) => {
  reply.type('html').code(200)
  return fs.createReadStream(path.join(__dirname, '../html/leaderboard.html'))
})

fastify.get('/contact', async (request, reply) => {
  reply.type('html').code(200)
  return fs.createReadStream(path.join(__dirname, '../html/contact.html'))
})

fastify.get('/api/get', async (request, reply) => {
    // get the crashes from the last 30 days
    let crashes = await prisma.crashReports.findMany({
        where: {
            report_date: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
        }
    });

    let crashData = [];

    for (let crash of crashes) {
        let crashDataEntry = {
            username: crash.username,
            id: crash.id,
            report_date: crash.report_date,
            gameversion: crash.gameversion
        };

        crashData.push(crashDataEntry);
    }

    reply.type('application/json').code(200);

    return crashData;
})

fastify.get('/api/getmostcrashedverions', async (request, reply) => {
  // return an array with all versions and their crash count, for example: [{version: "1.13.2", crash_count: 10}]
  let crashes = await prisma.crashReports.findMany();

  // create a map with the version as key and the crash count as value
  let versionMap = new Map<string, number>();

  for (let crash of crashes) {
      if (versionMap.has(crash.gameversion)) {
          versionMap.set(crash.gameversion, versionMap.get(crash.gameversion) + 1);
      } else {
          versionMap.set(crash.gameversion, 1);
      }
  }

  // create an array with all the versions and their crash count
  let versionData = [];

  for (let [key, value] of versionMap) {
      let versionDataEntry = {
          version: key,
          crash_count: value
      };

      versionData.push(versionDataEntry);
  }

  reply.type('application/json').code(200);

  return versionData;

});

fastify.get('/api/getusers', async (request, reply) => {
  // get the amount of crashes from the top 10 users
  let users = await prisma.users.findMany({
      orderBy: {
          crash_count: 'desc'
      },
      take: 10
    });

  let userData = [];

  for (let user of users) {
      let userDataEntry = {
          username: user.username,
          crash_count: user.crash_count
      };

      userData.push(userDataEntry);
  }

  reply.type('application/json').code(200);

  return userData;

});

fastify.get('/api/getallusers', async (request, reply) => {
  // get the users crash counts ordered by crash count
  let users = await prisma.users.findMany({
      orderBy: {
          crash_count: 'desc'
      }
    });

  let userData = [];

  for (let user of users) {
      let userDataEntry = {
          username: user.username,
          crash_count: user.crash_count
      };

      userData.push(userDataEntry);
  }

  reply.type('application/json').code(200);

  return userData;
});

fastify.get('/api/getlastpull', async (request, reply) => {
  let lastPull = await getLatestPull();

  reply.type('application/json').code(200);

  return lastPull;
});

fastify.get('/sitemap.xml', async (request, reply) => {
  reply.type('xml').code(200)
  return fs.createReadStream(path.join(__dirname, '../google/sitemap.xml'))

});

// robots.txt
fastify.get('/robots.txt', async (request, reply) => {
  reply.type('text').code(200)
  return fs.createReadStream(path.join(__dirname, '../google/robots.txt'))
});

fastify.listen({ port: 3005, host: '0.0.0.0' }, (err, address) => {
  if (err) throw err
  fastify.log.info(`server listening on ${address}`)
  
  prisma = new PrismaClient();
  puller();
})

export default async function getPrisma() {
    return prisma;
}