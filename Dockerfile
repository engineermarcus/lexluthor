FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache \
    ffmpeg \
    libwebp-tools \
    python3 \
    py3-pip \
    curl \
    wget

# Install yt-dlp
RUN python3 -m pip install --break-system-packages -U yt-dlp

# Download pre-built PO Token server (Rust binary - no canvas needed)
RUN wget https://github.com/jim60105/bgutil-ytdlp-pot-provider-rs/releases/latest/download/bgutil-pot-linux-x86_64 -O /usr/local/bin/bgutil-pot && \
    chmod +x /usr/local/bin/bgutil-pot

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install bot dependencies
RUN npm install --production

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p bot_session temp downloads

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Starting PO Token server..."' >> /app/start.sh && \
    echo 'bgutil-pot server &' >> /app/start.sh && \
    echo 'echo "PO Token server started on port 4416"' >> /app/start.sh && \
    echo 'sleep 3' >> /app/start.sh && \
    echo 'echo "Starting bot..."' >> /app/start.sh && \
    echo 'npm run luthor' >> /app/start.sh && \
    chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/status', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

EXPOSE 3001 4416

CMD ["/app/start.sh"]


