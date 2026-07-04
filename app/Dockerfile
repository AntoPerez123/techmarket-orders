FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY src ./src

EXPOSE 3000

CMD ["npm", "start"]