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
    `🌅 *Қайырлы таң, қадірлі жандар!*\n\n` +
    `Тағы бір берекелі таң атты. Бүгін де Алланың рақымында оянып, жаңа күнге ниетпен қадам басайық. 🤍\n\n` +
    `📿 *Бүгінгі Алланың есімдері:*\n${namesText}\n\n` +
    `Осы есімдерді жүрегіңізде сақтап, күні бойы зікір мен ізгі амалдарға арнаңыз. 🌿\n\n` +
    `💫 Бәрімізге береке мен тыныштық тілеймін!\n\n`
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
      `🌙 *Кешкі жиынтық*\n\n` +
      `Бүгін *${completedUsers}/${totalUsers}* адам барлық амалдарын толық белгіледі — машалла! 💪\n\n` +
      `Бүгін аяқталмаса да — ертең жаңа мүмкіндік. Алла ниеттеріңізді қабыл етсін 🤍\n\n` +
      `🔗 [Прогресті көру](${APP_URL})`
    );
  } catch (error) {
    console.error("Error fetching evening stats:", error);
    return (
      `🌙 *Кешкі жиынтық*\n\n` +
      `Бүгінгі амалдарыңызды белгіледіңіз бе? 🤲\n` +
      `Аз да болса, нүкте қою — ертеңге деген дайындық.\n\n` +
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
      `📊 *Бүгінгі амалдар (${today})*\n\n` +
      `👥 Қауымдастықта: *${totalUsers}* адам\n\n` +
      `✅ Толық аяқтағандар: *${completedUsers}*\n` +
      `🌿 Жолда жүргендер: *${partialUsers}*\n` +
      `🕊 Белгіленбегендер: *${zeroUsers}*\n\n` +
      `━━━━━━━━━━━━━━━\n` +
      `_Белгіленбеген — орындамады деген емес, Алла ниетті де санайды_ 🤲\n\n` +
      `Рамазан өтіп жатыр — әр сәтті бағалайық.\n` +
      `Алла амалдарыңызды қабыл етсін 🤍`
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
    `🌙 *Оразаңыз қабыл болсын!*\n\n` +
    `Күн бойы шыдадыңыз — бұл да ізгі амал. 🤍\n` +
    `Алла Тағала ораза, намаз, зікіріңізді қабыл етсін.\n\n` +
    `Ауыз аша отырып, бүгінгі амалдарыңызды белгілеп қойыңыз ✨\n\n` +
    `🔗 [Белгілеу](${APP_URL})`
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
  const APP_URL = process.env.APP_URL || "https://orazaapp.web.app";
  return (
    `☀️ *Күн ортасы — бір сәт тоқталайық*\n\n` +
    `Қадірлі сәттерді бағалайық. Бүгінгі ізгі амалдарыңызды ұмытпаңыз 🌿\n\n` +
    `📌 Қолданбаны ашып,  амалдарды орындаңыз — аз дегенде 5 минут қана кетеді!\n\n` +
    `💛 Алла ниеттеріңізге береке берсін 🤲\n\n`
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

// Build new features announcement message
export function buildNewFeaturesMessage(): string {
  const APP_URL = process.env.APP_URL || "https://orazaapp.web.app";
  return (
    `🌙✨ *Қолданбада жаңа мүмкіндіктер!* 💛\n\n` +
    `Осы соңғы 10 күндікте сіздер үшін екі пайдалы жаңалық:\n\n` +
    `🧠 *Куиз ойыны*\n` +
    `Осы уақытқа дейін жаттаған Алланың есімдерін тексеріп, өз білімдеріңізді нығайтыңыз.\n\n` +
    `📊 *Рейтинг кестесі*\n` +
    `Қауымдастық бетінде тек бақылау үшін екі бөлім бар:\n` +
    `  • 🔥 Марафон — күнделікті амалдарыңыздың тұрақтылығы\n` +
    `  • 🧠 Куиз — білімді тексеру нәтижелері\n\n` +
    `💛 Мақсат — жарыс емес, өзіңізді дамыту мен ізгі амалдарды арттыру.\n\n`
  );
}

export function buildRamadanLast10Message(): string {
  const APP_URL = process.env.APP_URL || "https://orazaapp.web.app";
  return (
    `🌙✨ *Рамазанның соңғы 10 күніне қош келдіңіз!*\n\n` +
    `Бұл — ерекше, қасиетті күндер. Әрбір таң мен түн — Алланың рақымын сезіп, жүректі тазартатын уақыт.\n\n` +
    `🌟 *Қадір түні* — мың айдан да қайырлы бір түн. \n` +
    `Пайғамбарымыз (с.а.с.) соңғы 10 күнде ибадатты күшейтіп, үй-ішін де оятып, жақсылыққа шақыратын еді.\n\n` +
    `🤲 *Осы күндерді барынша пайдаланыңыз:*\n` +
    `  • Түнгі намаз — Тәһажжуд 🌌\n` +
    `  • Құран оқу және тыңдау 📖\n` +
    `  • Зікір, дұға және ниет 🤲\n` +
    `  • Садақа беру 💛\n` +
    `  • Ізгі амалдарды толық орындау ✅\n\n` +
    `💎 Әрбір таңды бағалаңыз — бұл тек ораза емес, жүректі жарыққа бөлейтін уақыт. \n` +
    `Алла Тағала ниеттеріңізді қабыл етсін! 🤍\n\n` +
    `🔗 [Қолданбаны ашу](${APP_URL})`
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

  // Night summary: 23:00 Almaty (UTC+5) = 18:00 UTC
  cron.schedule("0 18 * * *", async () => {
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
  console.log("   Night           → 23:00 Almaty (18:00 UTC)");
}
