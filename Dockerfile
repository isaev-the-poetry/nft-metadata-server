FROM node:20-alpine

WORKDIR /app

# Copy only the necessary files
COPY dist ./dist
COPY package*.json ./
COPY prisma ./prisma

RUN npm install --production

EXPOSE 80

CMD ["node", "dist/src/main"] 