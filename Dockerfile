FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache \
    ffmpeg \
    libwebp-tools \
    python3 \
    py3-pip \
    curl

# Install yt-dlp
RUN python3 -m pip install --break-system-packages -U yt-dlp

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install bot dependencies
RUN npm install --production

# Copy PO Token server first
COPY bgutil-ytdlp-pot-provider ./bgutil-ytdlp-pot-provider

# Install PO Token server dependencies and build
WORKDIR /app/bgutil-ytdlp-pot-provider/server
RUN npm install && npx tsc

# Back to app directory
WORKDIR /app

# Copy rest of application files
COPY . .

# Create necessary directories
RUN mkdir -p bot_session temp downloads

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Starting PO Token server..."' >> /app/start.sh && \
    echo 'cd /app/bgutil-ytdlp-pot-provider/server' >> /app/start.sh && \
    echo 'node build/main.js &' >> /app/start.sh && \
    echo 'echo "PO Token server started on port 4416"' >> /app/start.sh && \
    echo 'sleep 3' >> /app/start.sh && \
    echo 'echo "Starting bot..."' >> /app/start.sh && \
    echo 'cd /app' >> /app/start.sh && \
    echo 'npm run luthor' >> /app/start.sh && \
    chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/status', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

EXPOSE 3001 4416

CMD ["/app/start.sh"]