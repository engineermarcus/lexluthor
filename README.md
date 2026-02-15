Look who has come to deploy
<p align="center">
  <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExazE4Y2swMjl0ZGR3d3hxbmp0cHFwMHF2dWtveWxkZ2c1MGd6cHYxOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PrVAwWYQl1JPG/giphy.gif" width="50%" />
</p>

Anyway, make sure you fork and star please


[![Fork](https://img.shields.io/github/forks/engineermarcus/lex-luthor?style=for-the-badge&color=black)](https://github.com/engineermarcus/lex-luthor/fork)

Your WhatsApp contacts have no idea what's about to hit them.


---

[![Session](https://img.shields.io/website?url=https%3A%2F%2Flexluthermd.onrender.com&style=for-the-badge&logo=render&label=GET+SESSION&color=black)](https://lexluthermd.onrender.com)

---

## WHAT IT DOES

Reads your statuses. Likes them too. Converts your terrible memes into stickers. Translates messages you were too proud to admit you didn't understand. Responds to commands while you sleep.

It doesn't need your supervision. That's the point.

---

## FEATURES

| Feature | Details |
|---|---|
| Status automation | Views and reacts automatically |
| Sticker conversion | Images, videos, GIFs — all fair game |
| Translation | `.swahili`, `.english`, `.french` — reply or type |
| Text to speech | `.tts` — reply or type |
| Group management | Kick, mute, antilink, welcome/goodbye |
| Fun commands | Memes, jokes, 8ball, insults and more |
| Anti-delete | Catches deleted messages and exposes them |
| Media downloads | Coming soon |
| AI integration | Coming soon |

---

## SETUP — TERMUX
```sh
termux-setup-storage
apt update && apt upgrade -y
apt install git nodejs ffmpeg libwebp
git clone https://github.com/engineermarcus/lex-luthor && cd lex-luthor
cp example.settings.js settings.js && micro settings.js
npm install && npm run luthor
```

> `Ctrl+S` to save. `Ctrl+Q` to quit. You're welcome.

---

## SETUP — VPS
```sh
git clone https://github.com/engineermarcus/lex-luthor && cd lex-luthor
cp example.settings.js settings.js && nano settings.js
npm install && npm run luthor
```

Keep it alive with PM2:
```sh
npm install -g pm2 && pm2 start main.js --name luthor && pm2 save
```

---

## SETUP — DOCKER
```sh
git clone https://github.com/engineermarcus/lex-luthor && cd lex-luthor
cp example.settings.js settings.js && nano settings.js
docker build -t lex-luthor .
docker run -d --name luthor lex-luthor
```

---

## DEPLOY — RENDER

1. Fork the repo
2. Go to [render.com](https://render.com) and create a new **Web Service**
3. Connect your forked repo
4. Set the following:

| Field | Value |
|---|---|
| Environment | `Node` |
| Build Command | `npm install` |
| Start Command | `npm run luthor` |

5. Add environment variables:

| Key | Value |
|---|---|
| `SESSION_ID` | Your session ID from the session manager |
| `OWNER_NUMBER` | Your WhatsApp number without `+` |

6. Click **Deploy** — done.

> Get your session ID first from the session manager above before deploying.

---

## FORK

Top right. You know what to do.

---

*Neiman Tech — 2026. Lex Luthor MD was not built for amateurs.*

# LEX LUTHOR MD