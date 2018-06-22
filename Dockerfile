FROM node:10.5-slim
LABEL maintainer="HeRoMo"

RUN echo 'deb http://ftp.jp.debian.org/debian jessie-backports main' >> /etc/apt/sources.list
RUN set -ex; \
        apt-get update; \
        apt-get install -y --no-install-recommends \
                gconf-service \
                libasound2 \
                libatk1.0-0 \
                libc6 \
                libcairo2 \
                libcups2 \
                libdbus-1-3 \
                libexpat1 \
                libfontconfig1 \
                libgcc1 \
                libgconf-2-4 \
                libgdk-pixbuf2.0-0 \
                libglib2.0-0 \
                libgtk-3-0 \
                libnspr4 \
                libpango-1.0-0 \
                libpangocairo-1.0-0 \
                libstdc++6 \
                libx11-6 \
                libx11-xcb1 \
                libxcb1 \
                libxcomposite1 \
                libxcursor1 \
                libxdamage1 \
                libxext6 \
                libxfixes3 \
                libxi6 \
                libxrandr2 \
                libxrender1 \
                libxss1 \
                libxtst6 \
                ca-certificates \
                fonts-liberation \
                libappindicator1 \
                libnss3 \
                lsb-release \
                xdg-utils \
                wget \
                fonts-noto-cjk \
        && rm -rf /var/lib/apt/lists/*

RUN yarn global add site-checker

RUN mkdir -p /output
WORKDIR /output
ENV NO_SANDBOX=true
ENTRYPOINT [ "site-checker" ]
CMD [ "-h" ]
