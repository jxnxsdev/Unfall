FROM node:latest

RUN mkdir -p /usr/src/unfall
WORKDIR /usr/src/unfall

COPY package.json /usr/src/unfall
RUN apt-get update
RUN apt-get install -y build-essential
RUN npm install --build-from-source

RUN npm install -g typescript

COPY . /usr/src/unfall

RUN npx prisma generate

# Build the bot
RUN tsc

# Start the bot.
CMD ["node", "build/index.js"]