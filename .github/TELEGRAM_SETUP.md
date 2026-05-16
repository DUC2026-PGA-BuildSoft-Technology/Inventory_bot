# Telegram Bot Token Setup Guide

## How to Create a Telegram Bot

### Step 1: Find BotFather on Telegram
1. Open Telegram app
2. Search for: `@BotFather`
3. Click "Start"

### Step 2: Create New Bot
Send message:
```
/newbot
```

### Step 3: Choose Bot Name
BotFather will ask for:
- **Bot name**: `Smart-Stock Inventory Bot` (user-friendly name)
- **Bot username**: `smart_stock_bot` (must end with `_bot`, globally unique)

### Step 4: Get Your Token
BotFather responds with:
```
Done! Congratulations on your new bot. You will find it at
t.me/your_bot_username. You can now add a description, about section and profile picture for your bot, see /help for a list of commands. By the way, when you've finished with your bot, remember that you can always create a new bot by sending /newbot to me.

Use this token to access the HTTP API:
123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11

Keep your token secure and store it safely!
```

### Step 5: Save Token to .env
```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
```

## Important Security Notes

⚠️ **NEVER:**
- Share your bot token
- Commit `.env` to Git
- Publish token in code

✅ **DO:**
- Store token in `.env` file
- Add `.env` to `.gitignore`
- Use `.env.example` for template
- Rotate token if compromised

## Testing Bot

### Start Bot Locally
```bash
npm run dev
```

### Find Your Bot on Telegram
1. Go to: `https://t.me/your_bot_username`
2. Click "Start"
3. Send commands:
   - `/start` - Register user
   - `/help` - Show commands

## Bot Administration

### Delete Bot
Send to @BotFather:
```
/deletebot
```

### Regenerate Token (If Compromised)
1. Go to @BotFather
2. Send: `/mybots`
3. Select your bot
4. "Edit Bot"
5. "Token"
6. "Regenerate token"

## Telegram Bot API Docs

- Official Docs: https://core.telegram.org/bots/api
- Bot Father: @BotFather
- Telegraf (Node.js library): https://telegraf.js.org

## Common Issues

### Bot doesn't respond to commands
- Check token is correct in `.env`
- Verify bot is running: `npm run dev`
- Check console for errors
- Ensure @BotFather setup was completed

### Bot responds slowly
- Check internet connection
- Verify DATABASE_URL connection
- Check server performance

### Bot token leaked
- Go to @BotFather immediately
- Regenerate token
- Update `.env` with new token
- Restart bot
