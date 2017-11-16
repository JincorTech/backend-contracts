FROM mhart/alpine-node:8.8

WORKDIR /usr/src/app

RUN mkdir -p /usr/src/app
ADD . /usr/src/app
ADD ./.env.template /usr/src/app/.env
RUN npm i

CMD npm start
