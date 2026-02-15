# LEX LUTHOR MD

<p align="center">
  <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExazE4Y2swMjl0ZGR3d3hxbmp0cHFwMHF2dWtveWxkZ2c1MGd6cHYxOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PrVAwWYQl1JPG/giphy.gif" width="40%" />
</p>

**Make sure you fork and star please**

[![Fork](https://img.shields.io/github/forks/engineermarcus/lex-luthor?style=for-the-badge&color=black)](https://github.com/engineermarcus/lex-luthor/fork)

Your WhatsApp contacts have no idea what's about to hit them.

---

[![Session](https://img.shields.io/website?url=https%3A%2F%2Flexluthermd.onrender.com&style=for-the-badge&logo=render&label=GET+SESSION&color=black)](https://lexluthermd.onrender.com)

---

## WHAT IT DOES

Reads your statuses. Likes them too. Converts your terrible memes into stickers. Translates messages you were too proud to admit you didn't understand. Responds to commands while you sleep.

It doesn't need your supervision. That's the point.

---

## KEY FEATURES

| Feature | Details |
|---|---|
| Status automation | Views and reacts automatically |
| Sticker conversion | Images, videos, GIFs — all fair game |
| Translation | .swahili, .english, .french — reply or type |
| Text to speech | .tts — reply or type |
| Group management | Kick, mute, antilink, welcome/goodbye |
| Fun commands | memes, jokes, 8ball, insults and more |
| Anti-delete | Catches deleted messages and exposes them |
| **Auto-reconnect** | Survives crashes and server downtime |
| **Health monitoring** | Self-healing and stays alive 24/7 |

---

## 🚀 DEPLOY ON RENDER (RECOMMENDED - STABLE)

### Prerequisites
1. Get your session ID from [here](https://lexluthermd.onrender.com)
2. Fork this repository

### Deploy Steps

1. Go to [render.com](https://render.com) and create a new **Web Service**
2. Connect your forked GitHub repository
3. Render will auto-detect the `render.yaml` and `Dockerfile`
4. Set these environment variables:

| Key | Value |
|---|---|
| `SESSION_ID` | Your session ID from session manager |
| `OWNER_NUMBER` | Your WhatsApp number (without +) |

5. Click **Deploy**

### Keep it Alive (Important!)

Render's free tier sleeps after 15 minutes of inactivity. To keep your bot alive:

**Option 1: Use UptimeRobot (Recommended)**
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Create a free account
3. Add a new monitor:
   - Monitor Type: HTTP(s)
   - URL: `https://your-app-name.onrender.com/ping`
   - Monitoring Interval: 5 minutes
4. Save

**Option 2: Use Cron-Job.org**
1. Go to [cron-job.org](https://cron-job.org)
2. Create a free account
3. Create a new cron job:
   - URL: `https://your-app-name.onrender.com/ping`
   - Schedule: Every 10 minutes
4. Save

Your bot will now stay alive 24/7! 🔥

---

## DEPLOY ON TERMUX

```sh
# Give storage permissions
termux-setup-storage

# Update system packages 
apt update && apt upgrade -y

# Install essentials 
apt install git nodejs ffmpeg libwebp python3 micro vim -y

# Clone the repository 
git clone https://github.com/engineermarcus/lexluthor && cd lexluthor

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit settings (add your SESSION_ID and OWNER_NUMBER)
micro .env

# Run the bot 
npm run luthor
```

> `Ctrl+S` to save. `Ctrl+Q` to quit.

---

## DEPLOY VPS / CODESPACES / LOCAL MACHINE

```sh
# Clone the repo
git clone https://github.com/engineermarcus/lexluthor && cd lexluthor

# Install dependencies 
npm install

# Create .env file
cp .env.example .env

# Edit with your favorite editor
nano .env

# Run
npm run luthor
```

### Keep it alive with PM2:
```sh
npm install -g pm2
pm2 start main.js --name luthor
pm2 save
pm2 startup
```

---

## DEPLOY WITH DOCKER

```sh
# Clone
git clone https://github.com/engineermarcus/lexluthor && cd lexluthor

# Create .env file
cp .env.example .env

# Edit settings
nano .env

# Build the docker image 
docker build -t lexluthor .

# Run it
docker run -d --name luthor --restart unless-stopped lexluthor
```

---

## 🛠️ CONFIGURATION

Edit `.env` file or set environment variables:

```env
# Essential
SESSION_ID=your_session_id_here
OWNER_NUMBER=254700000000

# Features (true/false)
WELCOME=true
GOODBYE=true
ANTI_DELETE=true
ANTI_LINK=true
AUTO_VIEW_STATUS=true
AUTO_LIKE_STATUS=true

# Customize messages
WELCOME_MESSAGE=👋 Welcome @{name} to the group!
GOODBYE_MESSAGE=👋 Goodbye @{name}, we will miss you!
```

---

## 📡 API ENDPOINTS

Your bot exposes these endpoints:

- `GET /status` - Check bot status
- `GET /ping` - Keepalive endpoint (use for monitoring)
- `POST /send` - Send messages programmatically
- `POST /restart` - Restart the bot

---

## 🐛 TROUBLESHOOTING

### Bot not connecting?
1. Make sure your SESSION_ID is valid
2. Check if you're logged out on your phone
3. Get a fresh session from the session manager

### Welcome/Goodbye not working?
- Make sure you added `node-cache` dependency
- The bot must be admin in the group
- Check `WELCOME` and `GOODBYE` are set to `true`

### Bot keeps going offline on Render?
- Set up UptimeRobot or Cron-Job.org (see Keep it Alive section)
- Check your Render logs for errors

### Commands not responding?
- Check your PREFIX setting (default is `.`)
- Make sure you're using the right syntax: `.ping`, `.menu`, etc.

---

## 📝 COMMANDS

### Core
- `.ping` - Check if bot is alive
- `.alive` - Bot status with uptime
- `.menu` / `.help` - Show all commands

### Utility
- `.sticker` / `.s` - Convert image/video to sticker (reply to media)
- `.toimg` - Convert sticker to image
- `.tts <text>` - Text to speech
- `.english` / `.swahili` / `.french` etc. - Translate

### Fun
- `.meme` - Random meme
- `.joke` - Dad joke
- `.8ball <question>` - Magic 8 ball
- `.insult` - Roast someone
- `.yesno` - Yes or no with GIF

### Group (Owner Only)
- `.kick` - Kick user (reply)
- `.mute` - Mute user (reply)
- `.unmute` - Unmute user
- `.muteall` - Mute entire group
- `.unmuteall` - Unmute group
- `.stalk` - DM a user (reply)
- `.stalkall` - DM all members (dangerous!)

---

## 🔒 SECURITY NOTES

- Never share your SESSION_ID
- Keep your .env file private
- Don't commit .env to git (it's in .gitignore)
- The bot stores session data in `bot_session/` folder

---

## 🤝 CONTRIBUTING

Pull requests are welcome. For major changes, please open an issue first.

---

## ⚖️ LICENSE

MIT - Do whatever you want, just don't blame me.

---

## 💬 SUPPORT

Having issues? Open an issue on GitHub.

---

*Neiman Tech — 2025. Lex Luthor MD was not built for amateurs.*