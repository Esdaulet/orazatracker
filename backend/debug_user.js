const admin = require("firebase-admin");
const fs = require("fs");
const sa = JSON.parse(fs.readFileSync("./serviceAccount.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(sa),
  databaseURL: "https://orazaapp-default-rtdb.firebaseio.com",
});

const db = admin.database();
const USER_ID = "user_1771505319558_d0wb4";
const ASMA_CAT_ID = "cat_1771500550356";
const RAMADAN_START = "2026-02-19";
const RAMADAN_END = "2026-03-19";

async function main() {
  const snap = await db.ref(`progress/${USER_ID}`).get();
  const up = snap.val() || {};
  const dates = Object.keys(up).filter(
    (d) => d >= RAMADAN_START && d <= RAMADAN_END
  );

  console.log(`Ramadan dates: ${dates.length}`);

  const cats = {};
  for (const d of dates) {
    for (const [catId, count] of Object.entries(up[d] || {})) {
      if (!cats[catId]) cats[catId] = 0;
      if (Array.isArray(count)) cats[catId] += count.reduce((a, b) => a + b, 0);
      else cats[catId] += Number(count) || 0;
    }
  }
  console.log("Category totals:", JSON.stringify(cats, null, 2));

  const asmaMax = {};
  for (const d of dates) {
    const c = (up[d] || {})[ASMA_CAT_ID];
    if (Array.isArray(c))
      c.forEach((v, i) => {
        if (!asmaMax[i] || v > asmaMax[i]) asmaMax[i] = v;
      });
  }
  const learned = Object.values(asmaMax).filter((v) => v > 0).length;
  console.log("Asma positions > 0:", learned);

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});