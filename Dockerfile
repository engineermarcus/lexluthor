FROM node:20-slim

# Install Chromium + dependencies (Debian-based, glibc, fully supported by Playwright)
RUN apt-get update && apt-get install -y \
    chromium \
    ffmpeg \
    python3 \
    python3-pip \
    curl \
    wget \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libasound2 \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN pip3 install --break-system-packages -U yt-dlp

# Tell Playwright to skip downloading its own Chromium — use the system one
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package*.json ./

RUN npm install --production && \
    npm uninstall playwright-stealth 2>/dev/null || true && \
    npm install playwright-extra puppeteer-extra-plugin-stealth

COPY . .

# Install bgutil POT server dependencies
RUN cd bgutil-ytdlp-pot-provider/server && npm install --production

RUN mkdir -p bot_session temp downloads

RUN printf '#!/bin/sh\n\
echo "Starting PO Token server..."\n\
node /app/bgutil-ytdlp-pot-provider/server/build/main.js &\n\
echo "PO Token server started on port 4416"\n\
sleep 3\n\
echo "Starting bot..."\n\
npm run luthor\n' > /app/start.sh && \
    chmod +x /app/start.sh

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/status', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

EXPOSE 3001 4416

CMD ["/app/start.sh"]