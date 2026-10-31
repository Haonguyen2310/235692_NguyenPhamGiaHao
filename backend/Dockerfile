FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
# Biến MONGODB_URI, DB_NAME, CORS_ORIGIN được truyền lúc chạy (docker run -e / Render), không nhúng vào image.
ENV PORT=5000
EXPOSE 5000
USER node
CMD ["node", "src/server.js"]
