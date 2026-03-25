FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install -g ts-node-dev

COPY . .

RUN npm run build


# solo build en producción
ARG NODE_ENV=development
RUN if [ "$NODE_ENV" = "production" ]; then npm run build; fi

EXPOSE 3000

CMD if [ "$NODE_ENV" = "development" ]; then npx ts-node-dev --respawn src/main.ts; else npm run start; fila