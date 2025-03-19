FROM docker.io/library/node:22.14.0-alpine3.20 as build

WORKDIR /usr/src/app

ARG VERSION=0.1.0

ENV REACT_APP_VERSION=${VERSION}

# Cache this layer unless dependencies change
COPY package.json yarn.lock .yarnrc.yml .
COPY ./.yarn ./.yarn

RUN yarn install --immutable --check-cache

COPY . ./
RUN yarn build

FROM docker.io/nginxinc/nginx-unprivileged:alpine3.21-slim
COPY --from=build /usr/src/app/build /usr/share/nginx/html
COPY nginx/conf.d /etc/nginx/nginx.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
