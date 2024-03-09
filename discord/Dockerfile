FROM node:latest

RUN mkdir -p /usr/src/unfall-discord
WORKDIR /usr/src/unfall-discord

COPY package.json /usr/src/unfall-discord
RUN apt-get update
RUN apt-get install -y build-essential
RUN npm install --build-from-source

RUN npm install -g typescript

COPY . /usr/src/unfall-discord

# Build the bot
RUN tsc

# Start the bot.
CMD ["node", "build/index.js"]