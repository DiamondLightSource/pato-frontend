FROM docker.io/library/node:18-alpine as build

WORKDIR /usr/src/app
COPY package.json yarn.lock .

ARG DEPLOY_TYPE="production"
ARG API_ENDPOINT="http://localhost:8000/"
ARG AUTH_ENDPOINT="http://localhost:8050/"
ARG REACT_APP_STAGING_HOST="ebic-pato-staging.diamond.ac.uk"
ARG VERSION=0.3.
ARG REACT_APP_DEV_CONTACT="guilherme.de-freitas@diamond.ac.uk"

ENV REACT_APP_DEPLOY_TYPE=${DEPLOY_TYPE}
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
