# stage 1: build
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# FIT-74: commit shown as the site's build (deploy/release.sh passes it; Docker has no .git)
ARG BUILD_COMMIT=
ENV BUILD_COMMIT=$BUILD_COMMIT
RUN npm run build

# stage 2: nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
