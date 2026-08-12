const MAIN_MODULE_ID = "a-aramaic-code";
const BONUS_MODULE_ID = "a-aramaic-code-bonus";

export const SEED_AREAS = [
  {
    id: MAIN_MODULE_ID,
    title: "The Aramaic Code - The Prayer Stolen From Your Bible 1,700 Years Ago",
    description:
      "A guided journey through the Aramaic prayer, its frequencies, and the seven daily lessons of The Aramaic Code.",
    cover: "assets/aramaic.jpg",
    createdAt: "2026-08-12T10:00:00.000Z",
    isSeed: true
  },
  {
    id: BONUS_MODULE_ID,
    title: "Bonus - Who You Are Changes Everything",
    description:
      "A bonus lesson to help you integrate the Aramaic Code into the person you are becoming.",
    cover: "assets/aramaic.jpg",
    createdAt: "2026-08-12T09:00:00.000Z",
    isSeed: true
  }
];

export const SEED_MEMBERS = [];

const ENROLLMENTS_BY_EMAIL = {};

export function defaultEnrollments(member) {
  const email = String((member && member.email) || "").toLowerCase();
  return email in ENROLLMENTS_BY_EMAIL ? ENROLLMENTS_BY_EMAIL[email] : [];
}

function lesson(id, title, createdAt, category = "teaching") {
  return {
    id,
    title,
    description:
      "Watch this lesson from The Aramaic Code and practice its teaching as part of your daily journey.",
    type: "video",
    url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    category,
    tags: ["aramaic", "the-aramaic-code"],
    thumbnail: "assets/aramaic.jpg",
    duration: 0,
    areaId: MAIN_MODULE_ID,
    createdAt,
    isSeed: true
  };
}

export const SEED_ITEMS = [
  lesson(
    "lesson-intro",
    "The Aramaic Code - The Prayer Stolen From Your Bible 1,700 Years Ago",
    "2026-08-12T10:00:00.000Z",
    "prayer"
  ),
  lesson("lesson-day-1", "Day 1 - The First Day Frequency", "2026-08-12T09:50:00.000Z"),
  lesson("lesson-day-2", "Day 2 - The Second Day Frequency", "2026-08-12T09:40:00.000Z"),
  lesson("lesson-day-3", "Day 3 - The Third Day Frequency", "2026-08-12T09:30:00.000Z"),
  lesson("lesson-day-4", "Day 4 - The Fourth Day Frequency", "2026-08-12T09:20:00.000Z"),
  lesson("lesson-day-5", "Day 5 - The Fifth Day Frequency", "2026-08-12T09:10:00.000Z"),
  lesson("lesson-day-6", "Day 6 - The Sixth Day Frequency", "2026-08-12T09:00:00.000Z"),
  lesson("lesson-day-7", "Day 7 - The Seventh Day Frequency", "2026-08-12T08:50:00.000Z"),
  lesson("lesson-bonus-1", "Bonus 1 - The Sacred Hours", "2026-08-12T08:40:00.000Z"),
  lesson("lesson-bonus-2", "Bonus 2 - The Atmosphere Shift", "2026-08-12T08:30:00.000Z"),
  lesson("lesson-bonus-3", "Bonus 3 - The 12 Words", "2026-08-12T08:20:00.000Z"),
  lesson("lesson-bonus-4", "Bonus 4 - Ephphatha - Be Opened", "2026-08-12T08:10:00.000Z"),
  lesson("lesson-bonus-5", "Bonus 5 - The Miracle Generator", "2026-08-12T08:00:00.000Z"),
  lesson("lesson-covenant", "The Covenant Hour - The Life Changing Hour", "2026-08-12T07:50:00.000Z"),
  {
    ...lesson(
      "lesson-bonus-who-you-are",
      "BONUS - Who You Are Changes Everything",
      "2026-08-12T07:40:00.000Z"
    ),
    areaId: BONUS_MODULE_ID,
    tags: ["bonus", "identity", "the-aramaic-code"]
  }
];

export function assignAreaToItem() {
  return MAIN_MODULE_ID;
}
