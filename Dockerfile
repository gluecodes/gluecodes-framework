FROM node:12

WORKDIR /src/gluecodes-framework
ADD ./gluecodes-framework /src/gluecodes-framework

RUN yarn install
