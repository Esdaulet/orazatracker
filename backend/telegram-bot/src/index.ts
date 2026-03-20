import dotenv from "dotenv";
dotenv.config();

import TelegramBot from "node-telegram-bot-api";
import { startScheduler, buildMorningMessage, buildEveningMessage, buildReminderMessage, buildTodaySummary, buildIftarMessage, buildRamadanLast10Message, buildNewFeaturesMessage, buildNewDesignMessage, buildKadirMessage, buildRamadanResultsMessage } from "./scheduler";
import {
  getAsmaNumbersForToday,
  ASMA_KAZAKH_TRANSLIT,
  ASMA_KAZAKH_MEANING,
} from "./asmaData";

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN is not set in environment variables");
  process.exit(1);
}
if (!process.env.GROUP_CHAT_ID) {
  console.error("❌ GROUP_CHAT_ID is not set in environment variables");
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("🤖 Oraza Telegram Bot started!");

// /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `Ассаламу алейкум! 🌙\n\nМен *Ораза* қолданбасының ботымын.\n\nКүн сайын:\n• 🌅 07:00 — Бүгінгі 3 Алла есімі\n• 🌙 20:00 — Қоғамдастық нәтижесі\n\nҚолданба: https://orazaapp.web.app`,
    { parse_mode: "Markdown" }
  );
});

// /esimder command — manually get today's names
bot.onText(/\/esimder/, (msg) => {
  const numbers = getAsmaNumbersForToday();
  const namesText = numbers
    .map((n) => `  • *${ASMA_KAZAKH_TRANSLIT[n]}* — ${ASMA_KAZAKH_MEANING[n]}`)
    .join("\n");

  bot.sendMessage(
    msg.chat.id,
    `📿 *Бүгінгі Алланың 3 есімі:*\n\n${namesText}\n\nБүгін осы есімдерді 33 рет қайталаңыз.`,
    { parse_mode: "Markdown" }
  );
});

// /help command
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `📋 *Командалар:*\n\n/start — Бот туралы\n/esimder — Бүгінгі 3 есім\n/itogi — Жалпы қорытынды\n/testtan — Таңғы хабарды топқа жіберу\n/testkunduzi — Күндізгі еске салуды топқа жіберу\n/testkesh — Кешкі хабарды топқа жіберу\n/help — Командалар тізімі`,
    { parse_mode: "Markdown" }
  );
});

// /itogi — send today's stats to the group
bot.onText(/\/itogi/, async (msg) => {
  const groupId = process.env.GROUP_CHAT_ID!;
  const message = await buildTodaySummary();
  await bot.sendMessage(groupId, message, { parse_mode: "Markdown" });
  bot.sendMessage(msg.chat.id, "✅ Бүгінгі нәтиже топқа жіберілді!");
});

// /testtan — send morning message to group right now
bot.onText(/\/testtan/, async (msg) => {
  const groupId = process.env.GROUP_CHAT_ID!;
  const message = buildMorningMessage();
  await bot.sendMessage(groupId, message, { parse_mode: "Markdown" });
  bot.sendMessage(msg.chat.id, "✅ Таңғы хабар топқа жіберілді!");
});

// /testkunduzi — send midday reminder to group right now
bot.onText(/\/testkunduzi/, async (msg) => {
  const groupId = process.env.GROUP_CHAT_ID!;
  const message = buildReminderMessage();
  await bot.sendMessage(groupId, message, { parse_mode: "Markdown" });
  bot.sendMessage(msg.chat.id, "✅ Күндізгі еске салу топқа жіберілді!");
});

// /testiftar — send iftar message to group right now
bot.onText(/\/testiftar/, async (msg) => {
  const groupId = process.env.GROUP_CHAT_ID!;
  const message = buildIftarMessage("17:36");
  await bot.sendMessage(groupId, message, { parse_mode: "Markdown" });
  bot.sendMessage(msg.chat.id, "✅ Ауыз ашар хабары топқа жіберілді!");
});

// /testkesh — send evening message to group right now
bot.onText(/\/testkesh/, async (msg) => {
  const groupId = process.env.GROUP_CHAT_ID!;
  const message = await buildEveningMessage();
  await bot.sendMessage(groupId, message, { parse_mode: "Markdown" });
  bot.sendMessage(msg.chat.id, "✅ Кешкі хабар топқа жіберілді!");
});

// /newfeat — announce new features to the group
bot.onText(/\/newfeat/, async (msg) => {
  const groupId = process.env.GROUP_CHAT_ID!;
  const message = buildNewFeaturesMessage();
  await bot.sendMessage(groupId, message, { parse_mode: "Markdown" });
  bot.sendMessage(msg.chat.id, "✅ Жаңалықтар анонсы топқа жіберілді!");
});

// /newdesign — announce new design to the group
bot.onText(/\/newdesign/, async (msg) => {
  const groupId = process.env.GROUP_CHAT_ID!;
  const message = buildNewDesignMessage();
  await bot.sendMessage(groupId, message, { parse_mode: "Markdown" });
  bot.sendMessage(msg.chat.id, "✅ Жаңа дизайн анонсы топқа жіберілді!");
});

// /ramadan10 — send last 10 days of Ramadan special message to group
bot.onText(/\/ramadan10/, async (msg) => {
  const groupId = process.env.GROUP_CHAT_ID!;
  const message = buildRamadanLast10Message();
  await bot.sendMessage(groupId, message, { parse_mode: "Markdown" });
  bot.sendMessage(msg.chat.id, "✅ Рамазанның соңғы 10 күн хабары топқа жіберілді!");
});

// /ramadanresults — announce Ramadan 2026 results to the group
bot.onText(/\/ramadanresults/, async (msg) => {
  const groupId = process.env.GROUP_CHAT_ID!;
  const message = buildRamadanResultsMessage();
  await bot.sendMessage(groupId, message, { parse_mode: "Markdown" });
  bot.sendMessage(msg.chat.id, "✅ Рамазан нәтижелері анонсы топқа жіберілді!");
});

// /kadir — send Kadir night special message to group
bot.onText(/\/kadir/, async (msg) => {
  const groupId = process.env.GROUP_CHAT_ID!;
  const message = buildKadirMessage();
  await bot.sendMessage(groupId, message, { parse_mode: "Markdown" });
  bot.sendMessage(msg.chat.id, "✅ Қадр Түнесі анонсы топқа жіберілді!");
});

// /testchannel — test sending to the channel
bot.onText(/\/testchannel/, async (msg) => {
  const channelId = process.env.CHANNEL_CHAT_ID;
  if (!channelId) {
    bot.sendMessage(msg.chat.id, "❌ CHANNEL_CHAT_ID env айнымалысы орнатылмаған!");
    return;
  }
  await bot.sendMessage(channelId, "✅ Бот каналға жазуды тексеруде — бәрі жұмыс істейді!", { parse_mode: "Markdown" });
  bot.sendMessage(msg.chat.id, "✅ Тест хабар каналға жіберілді!");
});

// Start cron scheduler
startScheduler(bot);