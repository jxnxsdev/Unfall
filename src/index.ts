import Fastify from 'fastify'
import path from 'path';
import fs from 'fs';
import puller from './puller';
import { PrismaClient} from '@prisma/client';
import { response } from 'express';

let prisma: PrismaClient;

const fastify = Fastify({
  logger: true
})

fastify.get('/', async (request, reply) => {
  reply.type('html').code(200)
  return fs.createReadStream(path.join(__dirname, '../html/index.html'))
})

fastify.get('/api/get', async (request, reply) => {
    // get the crashes from the last 30 days
    let prisma = await getPrisma();
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

fastify.get('/api/getusers', async (request, reply) => {
  // get the amount of crashes from the top 10 users
  let prisma = await getPrisma();
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
  let prisma = await getPrisma();
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

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err
  fastify.log.info(`server listening on ${address}`)
  
  prisma = new PrismaClient();
  puller();
})

export default async function getPrisma() {
    return prisma;
}