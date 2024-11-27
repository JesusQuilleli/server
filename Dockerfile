FROM node:22

WORKDIR /myapp
COPY package.json .
RUN npm install && npm install -g pm2

COPY . .
CMD ["npx", "pm2-runtime", "app.js", "--name", "server"]