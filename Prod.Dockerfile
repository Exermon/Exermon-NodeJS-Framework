FROM node:18.16

WORKDIR /home/server

COPY . .

ENV NODE_ENV=prod

# RUN npm install
RUN ./node_modules/typescript/bin/tsc -p ./tsconfig.json

EXPOSE 3098

#RUN npm run main
CMD ["node", "/home/server/dist/index.js"]
