import cron from "node-cron";
import TelegramBot from "node-telegram-bot-api";
import { db } from "./firebase";
import {
  getAsmaNumbersForToday,
  ASMA_KAZAKH_TRANSLIT,
  ASMA_KAZAKH_MEANING,
} from "./asmaData";

const GROUP_CHAT_ID = process.env.GROUP_CHAT_ID!;
const APP_URL = process.env.APP_URL || "https://orazaapp.web.app";

// Build morning message — motivational start of day
export function buildMorningMessage(): string {
  const numbers = getAsmaNumbersForToday();
  const namesText = numbers
    .map((n) => `  • *${ASMA_KAZAKH_TRANSLIT[n]}* — ${ASMA_KAZAKH_MEANING[n]}`)
    .join("\n");

  return (
    `🌅 *Ассалаумағалейкум!*\n\n` +
    `Жаңа күн басталды — ниетіңізді жаңартып, игі амалға қадам жасаңыз. 🤍\n\n` +
    `📿 ${namesText}\n\n` +
    `Алла баршаңызға береке нәсіп етсін 🤲\n\n` +
    `🔗 [Қолданбаны ашу](${APP_URL})`
  );
}

// Build evening message with community stats from Firebase
export async function buildEveningMessage(): Promise<string> {
  const today = new Date().toISOString().split("T")[0];

  try {
    // Get all categories and their targets
    const categoriesSnap = await db.ref("categories").once("value");
    const categories = categoriesSnap.val() || {};
    const categoryIds = Object.keys(categories);

    // Get all non-admin users
    const usersSnap = await db.ref("users").once("value");
    const users = usersSnap.val() || {};
    const nonAdminUsers = Object.entries(users).filter(
      ([_, userData]: any) => userData.role !== "admin",
    );

    const totalUsers = nonAdminUsers.length;
    let completedUsers = 0;

    for (const [userId] of nonAdminUsers) {
      const progressSnap = await db
        .ref(`progress/${userId}/${today}`)
        .once("value");
      const userProgress = progressSnap.val() || {};

      // User completed all tasks = every category has count >= target
      const allDone =
        categoryIds.length > 0 &&
        categoryIds.every((catId) => {
          const cat = categories[catId];
          const count = userProgress[catId];
          return cat && count !== undefined && Number(count) >= cat.target;
        });

      if (allDone) completedUsers++;
    }

    return (
      `🌙 *Кешкі тексеру*\n\n` +
      `📊 Бүгін *${completedUsers}/${totalUsers}* адам барлық тапсырмаларды орындады! 💪\n\n` +
      `Ертең де бірге жалғастырамыз! 🤲\n\n` +
      `🔗 [Прогресті көру](${APP_URL})`
    );
  } catch (error) {
    console.error("Error fetching evening stats:", error);
    return (
      `🌙 *Кешкі ескерту*\n\n` +
      `Бүгінгі мақсаттарыңызды орындадыңыз ба? 🤲\n` +
      `Ертең де бірге жалғастырамыз!\n\n` +
      `🔗 [Қолданбаны ашу](${APP_URL})`
    );
  }
}

// Build today's summary — who completed all tasks today (for admin check)
export async function buildTodaySummary(): Promise<string> {
  const today = new Date().toISOString().split("T")[0];

  try {
    const categoriesSnap = await db.ref("categories").once("value");
    const categories = categoriesSnap.val() || {};
    const categoryIds = Object.keys(categories);

    const usersSnap = await db.ref("users").once("value");
    const users = usersSnap.val() || {};
    const nonAdminUsers = Object.entries(users).filter(
      ([_, u]: any) => u.role !== "admin",
    );
    const totalUsers = nonAdminUsers.length;

    let completedUsers = 0;
    let partialUsers = 0;
    let zeroUsers = 0;

    for (const [userId] of nonAdminUsers) {
      const progressSnap = await db
        .ref(`progress/${userId}/${today}`)
        .once("value");
      const userProgress = progressSnap.val() || {};

      const completedCats = categoryIds.filter((catId) => {
        const cat = categories[catId];
        const count = userProgress[catId];
        return cat && count !== undefined && Number(count) >= cat.target;
      }).length;

      if (completedCats === categoryIds.length && categoryIds.length > 0) {
        completedUsers++;
      } else if (completedCats > 0) {
        partialUsers++;
      } else {
        zeroUsers++;
      }
    }

    return (
      `📊 *Бүгінгі нәтиже (${today})*\n\n` +
      `👥 Жалпы қатысушы: *${totalUsers}*\n\n` +
      `✨ Толық орындағандар: *${completedUsers}*\n` +
      `🌿 Орындап жатқандар: *${partialUsers}*\n` +
      `🕊 Белгіленбеген: *${zeroUsers}*\n\n` +
      `_Белгіленбеген — міндетті түрде орындамады деген сөз емес 🤲_\n` +
      `━━━━━━━━━━━━━━━\n` +
      `Күн әлі аяқталған жоқ — уақыт бар 🌙\n` +
      `Кішкентай амалдың өзі үлкен сауапқа себеп болуы мүмкін.\n` +
      `Алла ниеттеріңізді қабыл етсін 🤍`
    );
  } catch (error) {
    console.error("Error building today summary:", error);
    return "❌ Қате болды, кейінірек көріңіз.";
  }
}

// Build midday reminder — motivational only, no task list
export function buildReminderMessage(): string {
  return (
    `⏰ *Бүгінгі тапсырмаларыңызды орындадыңыз ба?*\n\n` +
    `Күн әлі аяқталған жоқ — әлі де мүмкіндік бар! 🌿\n` +
    `Бір кішкентай қадамның өзі үлкен нәтижеге бастайды.\n\n` +
    `📌 Қазір 5–10 минут бөліп, бір тапсырманы орындап көріңіз.\n\n` +
    `Алла ниетіңізге береке берсін 🤲`
  );
}

export function startScheduler(bot: TelegramBot): void {
  // Morning: 07:00 Almaty (UTC+5) = 02:00 UTC
  cron.schedule("0 2 * * *", async () => {
    try {
      const message = buildMorningMessage();
      await bot.sendMessage(GROUP_CHAT_ID, message, { parse_mode: "Markdown" });
      console.log("✅ Morning message sent:", new Date().toISOString());
    } catch (error) {
      console.error("❌ Morning message failed:", error);
    }
  });

  // Midday reminder: 13:00 Almaty (UTC+5) = 08:00 UTC
  cron.schedule("0 8 * * *", async () => {
    try {
      const message = buildReminderMessage();
      await bot.sendMessage(GROUP_CHAT_ID, message, { parse_mode: "Markdown" });
      console.log("✅ Midday reminder sent:", new Date().toISOString());
    } catch (error) {
      console.error("❌ Midday reminder failed:", error);
    }
  });

  // Night summary: 21:00 Almaty (UTC+5) = 16:00 UTC
  cron.schedule("0 16 * * *", async () => {
    try {
      const message = await buildTodaySummary();
      await bot.sendMessage(GROUP_CHAT_ID, message, { parse_mode: "Markdown" });
      console.log("✅ Night summary sent:", new Date().toISOString());
    } catch (error) {
      console.error("❌ Night summary failed:", error);
    }
  });

  console.log("🕐 Scheduler started:");
  console.log("   Morning  → 07:00 Almaty (02:00 UTC)");
  console.log("   Midday   → 13:00 Almaty (08:00 UTC)");
  console.log("   Night    → 21:00 Almaty (16:00 UTC)");
}
