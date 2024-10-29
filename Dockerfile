FROM node:22

WORKDIR /myapp
COPY package.json .
RUN npm install

COPY . .
CMD npm start