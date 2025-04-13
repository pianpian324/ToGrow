FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --registry=https://registry.npmmirror.com

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
