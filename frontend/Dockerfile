# stage 1: build
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# FIT-74: version and commit shown in the profile (deploy/release.sh passes them; Docker has no .git)
ARG BUILD_COMMIT=
ARG APP_VERSION=
ENV BUILD_COMMIT=$BUILD_COMMIT APP_VERSION=$APP_VERSION
RUN npm run build

# stage 2: nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
