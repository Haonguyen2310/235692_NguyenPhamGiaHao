FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# nginx tự thay ${PORT} trong template khi khởi động (Render đặt PORT=10000)
COPY nginx.conf /etc/nginx/templates/default.conf.template
# Sinh lại config.js từ biến môi trường API_URL mỗi lần container khởi động
COPY docker-config.sh /docker-entrypoint.d/40-config.sh
RUN chmod +x /docker-entrypoint.d/40-config.sh
ENV PORT=80 API_URL=http://localhost:5000
EXPOSE 80
