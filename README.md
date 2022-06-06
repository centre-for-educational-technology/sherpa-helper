# SHERPA Chatbot Interface

## Installation and development

Checkout suitable branch. Though `master` branch is used for development, it should still be stable enough to use in
production. Change the `.env` file and provide configurations for [reCAPTCHA](https://developers.google.com/recaptcha/),
CBR Inference Engine and KnowledgeBase (KB) services.

Once all the configurations are provided local development can commence or a production package could be built. Built
static assets are the ones that should be used on the server.


### Install all the required dependencies

Current stable [Node.js](https://nodejs.org/en/) version should work. Currently, used version is 14. Please use an older
version if you run into issues while installing the dependencies.

```shell
npm install
```

### Compiles and hot-reloads for development
```shell
npm run serve
```

### Compiles and minifies for production
```shell
npm run build
```

### Run your unit tests
```shell
npm run test:unit
```

### Run your end-to-end tests
```shell
npm run test:e2e
```

### Lints and fixes files
```shell
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Docker and containers

Use any stable branch for building a docker container as it will have all the necessary `.env` file configurations set
during build time. Docker image requires some configuration logic to be available at runtime, which would make changes
to the package configuration.

Container uses `node` image to build the package, then bases itself on the latest `nginx` container to serve the static
assets.

Required environment variables:
* APP_RECAPTCHA_KEY - recaptcha V3 key that will be used when submitting suggestions to the Knowledge Base service
* APP_CHATBOT_URL - base ULR of the chatterbot powered service that will be used to ask questions
* APP_KNOWLEDGE_BASE_URL - Knowledge Base service URL, used to submit suggestions and ratings

### Build container image
```shell
docker build -t sherpa/helper .
```

### Run container

Please make sure that you provide correct values for all the environment variables. The ones used in the command are
merely placeholders.

```shell
docker run -d --name=sherpa-helper \
-e APP_RECAPTCHA_KEY=12345 \
-e APP_CHATBOT_URL=http://chatbot \
-e APP_KNOWLEDGE_BASE_URL=http://knowledgebase \
-p80:80 sherpa/helper
```

### Docker Compose

Please see a sample `docker-compose.yml` file located in `docker/` subdirectory. It requires you to build the Docker
image before you run it. You would also need to provide correct environment values and replace the placeholders.

```shell
docker-compose -p sherpa-helper up -d
```

Stop and remove containers:
```shell
docker-compose -p sherpa-helper down
```

## LICENSE

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.
