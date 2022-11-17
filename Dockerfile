FROM node:18-alpine as build

WORKDIR /usr/src/app
COPY package.json yarn.lock .

RUN yarn install --immutable --immutable-cache --check-cache

COPY . ./
RUN yarn build

FROM nginx:1.23.2-alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]