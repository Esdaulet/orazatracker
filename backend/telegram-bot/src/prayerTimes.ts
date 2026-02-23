// Maghrib (iftar) times for Ramadan 2026, Almaty
// date format: YYYY-MM-DD
export const MAGHRIB_TIMES: Record<string, string> = {
  "2026-02-19": "17:31",
  "2026-02-20": "17:32",
  "2026-02-21": "17:34",
  "2026-02-22": "17:35",
  "2026-02-23": "17:36",
  "2026-02-24": "17:38",
  "2026-02-25": "17:39",
  "2026-02-26": "17:40",
  "2026-02-27": "17:41",
  "2026-02-28": "17:43",
  "2026-03-01": "17:44",
  "2026-03-02": "17:45",
  "2026-03-03": "17:47",
  "2026-03-04": "17:48",
  "2026-03-05": "17:49",
  "2026-03-06": "17:50",
  "2026-03-07": "17:51",
  "2026-03-08": "17:53",
  "2026-03-09": "17:54",
  "2026-03-10": "17:55",
  "2026-03-11": "17:56",
  "2026-03-12": "17:58",
  "2026-03-13": "17:59",
  "2026-03-14": "18:00",
  "2026-03-15": "18:01",
  "2026-03-16": "18:02",
  "2026-03-17": "18:04",
  "2026-03-18": "18:05",
  "2026-03-19": "18:06",
};

// Returns today's maghrib time in "HH:MM" format (Almaty UTC+5), or null
export function getTodayMaghrib(): string | null {
  const now = new Date();
  // Convert to Almaty time (UTC+5)
  const almaty = new Date(now.getTime() + 5 * 60 * 60 * 1000);
  const date = almaty.toISOString().split("T")[0];
  return MAGHRIB_TIMES[date] || null;
}

// Returns current time in Almaty as "HH:MM"
export function getAlmatyTime(): string {
  const now = new Date();
  const almaty = new Date(now.getTime() + 5 * 60 * 60 * 1000);
  const h = almaty.getUTCHours().toString().padStart(2, "0");
  const m = almaty.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}
