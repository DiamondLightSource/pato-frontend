FROM docker.io/library/node:18-alpine as build

WORKDIR /usr/src/app
COPY package.json yarn.lock .

RUN yarn install --immutable --immutable-cache --check-cache

COPY . ./
RUN yarn build

FROM docker.io/nginxinc/nginx-unprivileged:latest
COPY --from=build /usr/src/app/build /usr/share/nginx/html
COPY nginx/conf.d /etc/nginx/nginx.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
