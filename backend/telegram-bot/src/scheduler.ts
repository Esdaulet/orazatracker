import cron from "node-cron";
import TelegramBot from "node-telegram-bot-api";
import { db } from "./firebase";
import {
  getAsmaNumbersForToday,
  ASMA_KAZAKH_TRANSLIT,
  ASMA_KAZAKH_MEANING,
} from "./asmaData";
import { getTodayMaghrib } from "./prayerTimes";

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

// Build iftar (maghrib) message
export function buildIftarMessage(maghribTime: string): string {
  const numbers = getAsmaNumbersForToday();
  const namesText = numbers
    .map((n) => `  • *${ASMA_KAZAKH_TRANSLIT[n]}* — ${ASMA_KAZAKH_MEANING[n]}`)
    .join("\n");

  return (
    `🌙 *Оразаңыз қабыл болсын, қадірлі жан! *\n\n` +
    `Алла Тағала оразаңызды қабыл етіп,\n` +
    `жасаған амалдарыңызға есепсіз сауаптан жазсын. 🤲\n\n` +
    `Бүгінгі ізгі амалдарыңызды белгілеуді ұмытпаңыз ✨\n`
  );
}

// Schedule iftar message using setTimeout for exact maghrib time
function scheduleIftarMessage(bot: TelegramBot): void {
  const maghrib = getTodayMaghrib();
  if (!maghrib) return;

  const [hours, minutes] = maghrib.split(":").map(Number);

  // Maghrib is in Almaty (UTC+5), convert to UTC
  const now = new Date();
  const todayUTC = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hours - 5, // UTC+5 → UTC
      minutes,
      0,
    ),
  );

  const msUntilMaghrib = todayUTC.getTime() - now.getTime();

  if (msUntilMaghrib <= 0) {
    console.log("   Iftar    → already passed today, skipping");
    return;
  }

  setTimeout(async () => {
    try {
      const message = buildIftarMessage(maghrib);
      await bot.sendMessage(GROUP_CHAT_ID, message, { parse_mode: "Markdown" });
      console.log("✅ Iftar message sent:", new Date().toISOString());
    } catch (error) {
      console.error("❌ Iftar message failed:", error);
    }
  }, msUntilMaghrib);

  console.log(
    `   Iftar    → ${maghrib} Almaty (in ${Math.round(msUntilMaghrib / 60000)} min)`,
  );
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

// Calculate days until Surah deadline (February 25, 2026)
function getDaysUntilSurahDeadline(): number {
  const now = new Date();
  const deadline = new Date(2026, 1, 25, 23, 59, 59, 999); // Feb 25, 2026
  const diff = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.max(diff, 0);
}

// Build Surah deadline reminder message
export function buildSurahDeadlineMessage(): string {
  const daysLeft = getDaysUntilSurahDeadline();
  let titleEmoji = "⏰";
  let urgencyText = "";

  if (daysLeft === 1) {
    titleEmoji = "🔴";
    urgencyText = `\n\n⚠️ *Ертең дедлайн!* Сүреңізді жаттауды аяқтауға көңіл бөліңіз.`;
  } else if (daysLeft <= 3) {
    urgencyText = `\n\n✨ Дедлайн жақындап қалды — сүреңізді жаттауды жалғастырыңыз.`;
  }

  return (
    `${titleEmoji} *Айтпақшы, апталық сүреге ${daysLeft} күн қалды.*\n\n` +
    `Сүреңізді жаттауды ұмытпаңыз және бүгінгі амалдарыңызды белгілеңіз ✨` +
    urgencyText
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

  // Surah deadline reminder: 07:01 Almaty (UTC+5) = 02:01 UTC
  cron.schedule("1 2 * * *", async () => {
    try {
      const message = buildSurahDeadlineMessage();
      await bot.sendMessage(GROUP_CHAT_ID, message, { parse_mode: "Markdown" });
      console.log("✅ Surah deadline reminder sent:", new Date().toISOString());
    } catch (error) {
      console.error("❌ Surah deadline reminder failed:", error);
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

  // Schedule today's iftar message
  scheduleIftarMessage(bot);

  // Every midnight Almaty (19:00 UTC) reschedule iftar for the new day
  cron.schedule("0 19 * * *", () => {
    scheduleIftarMessage(bot);
  });

  console.log("🕐 Scheduler started:");
  console.log("   Morning         → 07:00 Almaty (02:00 UTC)");
  console.log("   Surah Deadline  → 07:01 Almaty (02:01 UTC)");
  console.log("   Midday          → 13:00 Almaty (08:00 UTC)");
  console.log("   Night           → 21:00 Almaty (16:00 UTC)");
}
