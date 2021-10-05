#!/bin/sh
# vim:sw=2:ts=2:sts=2:et

# Overwrite our own files with default versions, before the replacement happens
cp -R /sherpa/helper/dist/* /usr/share/nginx/html
cd /usr/share/nginx/html
sed -i "s#APP-RECAPTCHA-KEY#${APP_RECAPTCHA_KEY}#g" index.html js/*.js*
sed -i "s#APP-CHATBOT-URL#${APP_CHATBOT_URL}#g" index.html js/*.js*
sed -i "s#APP-KNOWLEDGE-BASE-URL#${APP_KNOWLEDGE_BASE_URL}#g" index.html js/*.js*

exit 0
