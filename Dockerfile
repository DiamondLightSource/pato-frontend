FROM docker.io/library/node:18-alpine as build

WORKDIR /usr/src/app
COPY package.json yarn.lock .

ARG API_ENDPOINT="http://localhost:8000/"
ARG AUTH_ENDPOINT="http://localhost:8050/"
ARG VERSION=0.3.0

ENV REACT_APP_API_ENDPOINT=${API_ENDPOINT}
ENV REACT_APP_AUTH_ENDPOINT=${AUTH_ENDPOINT}
ENV REACT_APP_VERSION=${VERSION}
ENV REACT_APP_AUTH_TYPE="oidc"

RUN yarn install --immutable --immutable-cache --check-cache

COPY . ./
RUN yarn build

FROM docker.io/nginxinc/nginx-unprivileged:latest
COPY --from=build /usr/src/app/build /usr/share/nginx/html
COPY nginx/conf.d /etc/nginx/nginx.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
