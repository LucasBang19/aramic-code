export const MAIN_MODULE_ID = "a-aramaic-code";
export const MIRACLE_GENERATOR_ID = "a-miracle-generator";
export const JEWISH_RITUAL_ID = "a-jewish-secret-ritual";
export const POLYGLOT_SLEEP_ID = "a-polyglot-sleep";
export const COVENANT_HOUR_ID = "a-covenant-hour";

export const SEED_AREAS = [
  {
    id: MAIN_MODULE_ID,
    title: "The Aramaic Code — The Prayer Stolen From Your Bible 1,700 Years Ago",
    description:
      "A guided sacred journey through the original Aramaic prayer, divine sound frequencies, the 7 daily lessons, and included bonuses.",
    cover: "assets/aramaic.jpg",
    productType: "main",
    checkoutUrl: "https://thearamaiccode.com",
    createdAt: "2026-08-12T10:00:00.000Z",
    isSeed: true
  },
  {
    id: MIRACLE_GENERATOR_ID,
    title: "The Miracle Generator",
    description:
      "Ancient acoustic resonance designed to trigger sudden positive shifts, divine synchronicities, and rapid material manifestations.",
    cover: "assets/aramaic.jpg",
    productType: "orderbump",
    checkoutUrl: "https://www.paggins.com/checkout/f9fd8789-9006-4e38-b655-da31ce8bf128",
    createdAt: "2026-08-12T09:30:00.000Z",
    isSeed: true
  },
  {
    id: JEWISH_RITUAL_ID,
    title: "The Jewish Secret Ritual",
    description:
      "Secret esoteric blessings, energetic shielding, and prosperity consecrations preserved through sacred rabbinical oral traditions.",
    cover: "assets/aramaic.jpg",
    productType: "orderbump",
    checkoutUrl: "https://www.paggins.com/checkout/3054f780-aeb9-4ee7-963f-417f0255653b",
    createdAt: "2026-08-12T09:20:00.000Z",
    isSeed: true
  },
  {
    id: POLYGLOT_SLEEP_ID,
    title: "The Polyglot Sleep",
    description:
      "Subconscious nocturnal reprogramming in deep theta-delta wave frequencies to rewire cognitive patterns and unlock effortless fluency & wealth mindset during sleep.",
    cover: "assets/aramaic.jpg",
    productType: "orderbump",
    checkoutUrl: "https://www.paggins.com/checkout/7e9aea7e-12af-467b-9c57-f239ad5b54f0",
    createdAt: "2026-08-12T09:10:00.000Z",
    isSeed: true
  },
  {
    id: COVENANT_HOUR_ID,
    title: "The Covenant Hour — The Life Changing Hour",
    description:
      "The ultimate deep immersion frequency: The Life Changing Hour. A high-potency sound transmission reserved for those ready for complete spiritual and financial ascension.",
    cover: "assets/aramaic.jpg",
    productType: "upsell",
    checkoutUrl: "https://www.paggins.com/checkout/62267a39-b804-4ac0-810a-c1af386549b9",
    createdAt: "2026-08-12T09:00:00.000Z",
    isSeed: true
  }
];

export const SEED_MEMBERS = [];

const ENROLLMENTS_BY_EMAIL = {};

export function defaultEnrollments(member) {
  const email = String((member && member.email) || "").toLowerCase();
  if (email in ENROLLMENTS_BY_EMAIL) return ENROLLMENTS_BY_EMAIL[email];
  return [MAIN_MODULE_ID];
}

function lesson(id, title, createdAt, options = {}) {
  return {
    id,
    title,
    description:
      options.description ||
      "Listen to this lesson from The Aramaic Code as part of your daily spiritual journey.",
    type: options.type || "audio",
    url: options.url || "",
    category: options.category || "teaching",
    tags: options.tags || ["aramaic", "the-aramaic-code"],
    thumbnail: options.thumbnail || "/assets/aramaic.jpg",
    duration: options.duration || 0,
    areaId: options.areaId || MAIN_MODULE_ID,
    createdAt,
    isSeed: true
  };
}

export const SEED_ITEMS = [
  /* =========================================================================
     MAIN COURSE: THE ARAMAIC CODE (Core + Included Bonuses)
     ========================================================================= */
  lesson(
    "lesson-intro",
    "The Aramaic Code — The Prayer Stolen From Your Bible 1,700 Years Ago",
    "2026-08-12T10:00:00.000Z",
    {
      type: "file",
      url: "/assets/course1/module-1/lesson-01-prayer.pdf",
      category: "prayer",
      description:
        "Read and download the foundational text and translation of the original Aramaic prayer."
    }
  ),
  lesson(
    "lesson-frequency",
    "5 Minutes Aramaic Frequency (Daily Tune-In)",
    "2026-08-12T09:55:00.000Z",
    {
      url: "/assets/course1/module-1/lesson-02-aramaic-frequency.mp3",
      duration: 304,
      category: "meditation",
      description:
        "Calibrate your pineal gland and heart coherence with this 5-minute sacred daily frequency."
    }
  ),
  lesson(
    "lesson-day-1",
    "Day 1 — The First Day Frequency (Foundation of Light)",
    "2026-08-12T09:50:00.000Z",
    {
      url: "/assets/course1/module-1/lesson-03-day-1.m4a",
      duration: 374,
      description: "Day 1 of your 7-day ascension: Opening the channel of Divine Light."
    }
  ),
  lesson(
    "lesson-day-2",
    "Day 2 — The Second Day Frequency (Clearing Resistance)",
    "2026-08-12T09:40:00.000Z",
    {
      url: "/assets/course1/module-1/lesson-04-day-2.m4a",
      duration: 373,
      description: "Dissolving ancestral vows of poverty and subconscious doubt."
    }
  ),
  lesson(
    "lesson-day-3",
    "Day 3 — The Third Day Frequency (Sacred Alignment)",
    "2026-08-12T09:30:00.000Z",
    {
      url: "/assets/course1/module-1/lesson-05-day-3.m4a",
      duration: 386,
      description: "Aligning your breath and spoken intention with ancient Hebrew-Aramaic resonance."
    }
  ),
  lesson(
    "lesson-day-4",
    "Day 4 — The Fourth Day Frequency (Divine Abundance)",
    "2026-08-12T09:20:00.000Z",
    {
      url: "/assets/course1/module-1/lesson-06-day-4.m4a",
      duration: 377,
      description: "Attracting continuous material and spiritual flow into your everyday life."
    }
  ),
  lesson(
    "lesson-day-5",
    "Day 5 — The Fifth Day Frequency (Protection & Elevation)",
    "2026-08-12T09:10:00.000Z",
    {
      url: "/assets/course1/module-1/lesson-07-day-5.m4a",
      duration: 333,
      description: "Creating an impenetrable energetic field around your home and family."
    }
  ),
  lesson(
    "lesson-day-6",
    "Day 6 — The Sixth Day Frequency (Sacred Covenant)",
    "2026-08-12T09:00:00.000Z",
    {
      url: "/assets/course1/module-1/lesson-08-day-6.m4a",
      duration: 465,
      description: "Sealing your intention in the cosmic covenant of prosperity."
    }
  ),

  /* Front-End Bonuses included with Main Course */
  lesson(
    "lesson-bonus-1",
    "Bonus 1 — The Sacred Hours (Optimal Manifestation Windows)",
    "2026-08-12T08:40:00.000Z",
    {
      url: "/assets/course1/module-1/lesson-09-sacred-hours.mp3",
      duration: 219,
      category: "teaching",
      description:
        "The secret solar & lunar cosmic windows where prayer potency multiplies by 10x."
    }
  ),
  lesson(
    "lesson-bonus-2",
    "Bonus 2 — The Atmosphere Shift (Space Clearing)",
    "2026-08-12T08:30:00.000Z",
    {
      url: "/assets/course1/module-1/lesson-10-atmosphere-shift.mp3",
      duration: 199,
      category: "meditation",
      description:
        "Play this audio to immediately clear heavy spiritual energy from any room."
    }
  ),
  lesson(
    "lesson-bonus-3",
    "Bonus 3 — The 12 Words of Power",
    "2026-08-12T08:20:00.000Z",
    {
      url: "/assets/course1/module-1/lesson-11-the-12-words.mp3",
      duration: 355,
      category: "teaching",
      description:
        "The 12 root Aramaic power words that command peace, healing, and supernatural favor."
    }
  ),
  lesson(
    "lesson-bonus-4",
    "Bonus 4 — Ephphatha (Be Opened)",
    "2026-08-12T08:10:00.000Z",
    {
      url: "/assets/course1/module-1/lesson-12-ephphatha.mp3",
      duration: 45,
      category: "prayer",
      description: "The instantaneous activation command used for sudden breakthroughs."
    }
  ),
  lesson(
    "lesson-bonus-who-you-are",
    "Bonus 5 — Who You Are Changes Everything",
    "2026-08-12T08:00:00.000Z",
    {
      url: "/assets/course1/module-2/lesson-01-who-you-are.mp3",
      duration: 385,
      category: "teaching",
      tags: ["bonus", "identity", "the-aramaic-code"],
      description:
        "Integrate the Aramaic Code into your sovereign identity and embody your true divine authority."
    }
  ),

  /* =========================================================================
     SACRED EXPANSIONS (SECRET CHAMBERS)
     ========================================================================= */
  lesson(
    "lesson-miracle-generator",
    "The Miracle Generator — High Voltage Manifestation Frequency",
    "2026-08-12T07:55:00.000Z",
    {
      url: "/assets/course1/module-1/lesson-13-miracle-generator.mp3",
      duration: 336,
      category: "meditation",
      areaId: MIRACLE_GENERATOR_ID,
      tags: ["expansion", "miracle", "generator"],
      description:
        "Tap into quantum sonic codes designed to accelerate miracle manifestation."
    }
  ),

  lesson(
    "lesson-jewish-ritual",
    "The Jewish Secret Ritual — Sacred Abundance & Protection Consecration",
    "2026-08-12T07:50:00.000Z",
    {
      url: "/assets/course1/module-1/lesson-02-aramaic-frequency.mp3",
      duration: 420,
      category: "prayer",
      areaId: JEWISH_RITUAL_ID,
      tags: ["expansion", "jewish-ritual", "prosperity"],
      description:
        "The guarded ancient ceremony for creating lifelong financial security and angelic defense."
    }
  ),

  lesson(
    "lesson-polyglot-sleep",
    "The Polyglot Sleep — Theta-Delta Subconscious Language Reprogramming",
    "2026-08-12T07:45:00.000Z",
    {
      url: "/assets/course1/module-1/lesson-02-aramaic-frequency.mp3",
      duration: 1800,
      category: "meditation",
      areaId: POLYGLOT_SLEEP_ID,
      tags: ["expansion", "sleep", "polyglot"],
      description:
        "Play during sleep to download subconscious fluency, mental sharpness, and wealth beliefs effortlessly."
    }
  ),

  lesson(
    "lesson-covenant",
    "The Covenant Hour — The Life Changing Hour (Master Frequency)",
    "2026-08-12T07:40:00.000Z",
    {
      url: "/assets/course1/module-1/lesson-14-covenant-hour.m4a",
      duration: 385,
      category: "teaching",
      areaId: COVENANT_HOUR_ID,
      tags: ["master", "covenant-hour", "transmission"],
      description:
        "The full Covenant Hour immersion to unlock total spiritual, physical, and financial transformation."
    }
  )
];

export function assignAreaToItem(item) {
  if (item && item.id === "lesson-miracle-generator") return MIRACLE_GENERATOR_ID;
  if (item && item.id === "lesson-jewish-ritual") return JEWISH_RITUAL_ID;
  if (item && item.id === "lesson-polyglot-sleep") return POLYGLOT_SLEEP_ID;
  if (item && item.id === "lesson-covenant") return COVENANT_HOUR_ID;
  return MAIN_MODULE_ID;
}
