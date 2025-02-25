FROM docker.io/library/node:22.11.0-alpine3.20 as build

WORKDIR /usr/src/app

ARG DEPLOY_TYPE="production"
ARG API_ENDPOINT="http://localhost:8000/"
ARG AUTH_ENDPOINT="http://localhost:8050/"
ARG STAGING_HOST="ebic-pato-staging.diamond.ac.uk"
ARG DEV_CONTACT="guilherme.de-freitas@diamond.ac.uk"
ARG VERSION=0.1.0
ARG SAMPLE_HANDLING_URL="http://localhost:8000/"
ARG FEEDBACK_URL="http://localhost:8080/"

ENV REACT_APP_DEPLOY_TYPE=${DEPLOY_TYPE}
ENV REACT_APP_API_ENDPOINT=${API_ENDPOINT}
ENV REACT_APP_AUTH_ENDPOINT=${AUTH_ENDPOINT}
ENV REACT_APP_VERSION=${VERSION}
ENV REACT_APP_STAGING_HOST=${STAGING_HOST}
ENV REACT_APP_DEV_CONTACT=${DEV_CONTACT}
ENV REACT_APP_AUTH_TYPE="oidc"
ENV REACT_APP_SAMPLE_HANDLING_URL=${SAMPLE_HANDLING_URL}
ENV REACT_APP_FEEDBACK_URL=${FEEDBACK_URL}

# Cache this layer unless dependencies change
COPY package.json yarn.lock .yarnrc.yml .
COPY ./.yarn ./.yarn

RUN yarn install --immutable --check-cache

COPY . ./
RUN yarn build

FROM docker.io/nginxinc/nginx-unprivileged:alpine3.20-slim
COPY --from=build /usr/src/app/build /usr/share/nginx/html
COPY nginx/conf.d /etc/nginx/nginx.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
