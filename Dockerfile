FROM node:22.14.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4003
CMD ["node", "dist/main.js"]
