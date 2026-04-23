FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
# Avoid running repo-level postinstall (it installs ./server too).
RUN npm ci --ignore-scripts

COPY . .

ARG VITE_APP_WEB_URL=http://localhost:4000
ENV VITE_APP_WEB_URL=$VITE_APP_WEB_URL

RUN npm run build

FROM nginx:1.29-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

