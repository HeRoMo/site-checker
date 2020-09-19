FROM node:14.10.1-buster-slim
LABEL maintainer="HeRoMo"

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
                google-chrome-stable \
                fonts-noto-cjk \
                fonts-wqy-zenhei \
                fonts-thai-tlwg \
                fonts-kacst \
                fonts-freefont-ttf \
                libxss1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
RUN yarn global add site-checker

RUN mkdir -p /output
WORKDIR /output
ENV NO_SANDBOX=true
ENTRYPOINT [ "site-checker" ]
CMD [ "-h" ]
