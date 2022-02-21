FROM node:14-alpine
WORKDIR /helper
COPY . .
RUN if [ -d node_modules ]; then rm -rf node_modules; fi
RUN cp docker/docker-env .env
RUN npm install && npm run build

FROM nginx:alpine
LABEL maintainer="pjotr.savitski@tlu.ee"
LABEL title="sherpa-helper"
LABEL description="SHERPA Helper static build files served by NGINX."
COPY --from=0 /helper/dist /sherpa/helper/dist
# A custom script that will be run by nginx entrypoint script
COPY docker/00-make-runtime-replacements.sh /docker-entrypoint.d
