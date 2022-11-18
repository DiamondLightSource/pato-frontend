FROM node:18-alpine as build

WORKDIR /usr/src/app
COPY package.json yarn.lock .

RUN yarn install --immutable --immutable-cache --check-cache

COPY . ./
RUN yarn build

FROM nginxinc/nginx-unprivileged:latest
COPY --from=build /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]