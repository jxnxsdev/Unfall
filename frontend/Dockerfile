FROM node:latest

RUN mkdir -p /usr/src/unfall-frontend
WORKDIR /usr/src/unfall-frontend

COPY package.json /usr/src/unfall-frontend
RUN apt-get update
RUN apt-get install -y build-essential
RUN npm install --build-from-source

RUN npm install -g typescript

COPY . /usr/src/unfall-frontend

RUN npx prisma generate

# Build the bot
RUN tsc

# Start the bot.
CMD ["node", "build/index.js"]