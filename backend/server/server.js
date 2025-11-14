
// ✅ RPS64 Backend — Local Dev (FAKE DB) + Stripe (optional) + Queue + Match Pass
import express from "express";
import cors from "cors";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

/* ============================================================
   CONFIG / FLAGS
============================================================ */
const USE_FAKE = String(process.env.USE_FAKE_BACKEND || "1").trim() === "1"; // default to FAKE for localhost
const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5173";       // adjust if your Vite port differs
const PORT = process.env.PORT || 8080;
const ADMIN_UID = process.env.ADMIN_UIDS?.split(",")[0]?.trim() || "admin-local";

/* ============================================================
   STRIPE (optional in local dev)
============================================================ */
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";
if (!STRIPE_KEY) {
  console.warn("⚠️ STRIPE_SECRET_KEY not set. Checkout routes will 400 until you set it.");
}
const stripe = new Stripe(STRIPE_KEY || "test_dummy_key", { apiVersion: "2023-10-16" });

/* ============================================================
   EXPRESS INIT
============================================================ */
const app = express();
console.log("✅ Server boot sequence starting");
console.log("USE_FAKE_BACKEND:", process.env.USE_FAKE_BACKEND);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("STRIPE_SECRET_KEY length:", process.env.STRIPE_SECRET_KEY?.length);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("=== RPS64 SERVER.JS START ===");
console.log("CWD:", process.cwd());
console.log("PORT:", process.env.PORT);

app.set("trust proxy", 1);

// ✅ Universal JSON parser (no conditional middleware)
app.use(express.json());

// ✅ Safe CORS — allows localhost + your production domain
app.use(cors({
  origin: [
    FRONTEND,                         // your deployed frontend
    "http://localhost:5173",          // local Vite dev
    /\.vercel\.app$/,                 // any vercel.app subdomain
  ],
  credentials: true,
}));

// ✅ Override Render's restrictive CSP
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;");
  next();
});

// ✅ Override restrictive CSP (Render sets "default-src 'none'")
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src *;"
  );
  next();
});


/* ============================================================
   DATA LAYER — FAKE (in-memory) for localhost
============================================================ */
if (!USE_FAKE) {
  console.warn("⚠️ USE_FAKE_BACKEND is not 1. For localhost, set USE_FAKE_BACKEND=1 in your env.");
}

// ONE definition only. Do not redeclare.
const mem = {
  matchPasses: new Map(),     // uid -> { userId, tier, matchesTotal, ... }
  queue: new Map(),           // uid -> { uid, paid, joinedAt, name? }
  stripeAccounts: new Map(),  // uid -> { uid, accountId, createdAt }
};

// Minimal Firestore-like shim
const db = {
  collection: (name) => {
    if (name === "queue") {
      return {
        doc: (id) => ({
          async set(data, _opts) {
            const prev = mem.queue.get(id) || {};
            mem.queue.set(id, { ...prev, ...data });
          },
          async get() {
            const v = mem.queue.get(id);
            return { exists: !!v, data: () => v };
          },
        }),
        async get() {
          const docs = Array.from(mem.queue.values()).map((v) => ({ data: () => v }));
          return { docs, size: docs.length };
        },
        orderBy() {
          return {
            limit(n) {
              return {
                async get() {
                  const docs = Array.from(mem.queue.values())
                    .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0))
                    .slice(0, n)
                    .map((v) => ({ data: () => v }));
                  return { docs, size: docs.length };
                },
              };
            },
          };
        },
      };
    }

    if (name === "stripeAccounts") {
      return {
        doc: (id) => ({
          async set(data, _opts) {
            const prev = mem.stripeAccounts.get(id) || {};
            mem.stripeAccounts.set(id, { ...prev, ...data });
          },
          async get() {
            const v = mem.stripeAccounts.get(id);
            return { exists: !!v, data: () => v };
          },
        }),
      };
    }

    if (name === "matchPasses") {
      return {
        doc: (id) => ({
          async set(data) {
            mem.matchPasses.set(id, data);
          },
          async get() {
            const v = mem.matchPasses.get(id);
            return { exists: !!v, data: () => v };
          },
        }),
        async get() {
          const docs = Array.from(mem.matchPasses.values()).map((v) => ({ data: () => v }));
          return { docs, size: docs.length };
        },
      };
    }

    // default empty
    return {
      doc: () => ({
        async set() {},
        async get() {
          return { exists: false, data: () => null };
        },
      }),
      async get() {
        return { docs: [], size: 0 };
      },
      orderBy() {
        return { limit() { return { async get() { return { docs: [], size: 0 }; } }; } };
      },
    };
  },
};

// Minimal auth shim (always “logged in” as test-user; admin for certain routes)
const auth = {
  async verifyIdToken() {
    return { uid: "test-user" };
  },
  async getUser(uid) {
    return { email: "test@example.com", uid };
  },
};

function ensureAdmin(uid) {
  if (uid === ADMIN_UID) return true;
  const ADMINS = (process.env.ADMIN_UIDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return ADMINS.includes(uid);
}

/* ============================================================
   AUTH HELPERS
============================================================ */
async function requireAuth(req, res, next) {
  try {
    // FAKE: always authed
    req.user = { uid: "test-user", email: "test@example.com" };
    next();
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

function requireAdmin(req, res, next) {
  if (!ensureAdmin(req.user?.uid)) {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
}

/* ============================================================
   HEALTH
============================================================ */
app.get("/", (req, res) => {
  res.json({
    ok: true,
    mode: "FAKE",
    status: "Backend running ✅",
  });
});

/* ============================================================
   QUEUE / PLAYERS
============================================================ */
app.post("/join-queue", requireAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    await db.collection("queue").doc(uid).set(
      {
        uid,
        joinedAt: Date.now(),
        paid: true,
        name: "TestUser",
      },
      { merge: true }
    );
    res.json({ ok: true, uid });
  } catch (err) {
    console.error("join-queue error:", err);
    res.status(500).json({ error: "join-queue failed" });
  }
});

app.get("/get-players", async (_req, res) => {
  try {
    const snap = await db.collection("queue").orderBy("joinedAt").limit(64).get();
    const players = snap.docs.map((d) => d.data());
    res.json(players);
  } catch (err) {
    console.error("get-players error:", err);
    res.status(500).json({ error: "get-players failed" });
  }
});

app.get("/queue-count", async (_req, res) => {
  try {
    const snap = await db.collection("queue").get();
    res.json({ count: snap.size });
  } catch (err) {
    console.error("queue-count error:", err);
    res.status(500).json({ error: "Failed to get queue count" });
  }
});

/* ============================================================
   MATCH PASS (FAKE)
============================================================ */
app.post("/fake-create-match-pass", express.json(), async (req, res) => {
  try {
    console.log("📩 /fake-create-match-pass hit");
    console.log("   req.headers:", req.headers);
    console.log("   req.body raw:", req.body);
    console.log("🚀 Received /fake-create-match-pass", req.body);


    if (!req.body || typeof req.body !== "object") {
      console.error("❌ Bad request body:", req.body);
      return res.status(400).json({ error: "Invalid JSON body" });
    }

    const {
      userId = "test-user-123",
      tier = "bronze",
      matchesTotal = 6,
      payout = 2.75,
    } = req.body;

    if (!mem || !mem.matchPasses) {
      console.error("❌ mem or mem.matchPasses missing");
      return res.status(500).json({ error: "Memory store not ready" });
    }

    mem.matchPasses.set(userId, {
      userId,
      tier,
      matchesTotal,
      matchesPlayed: 0,
      wins: 0,
      payout,
      createdAt: Date.now(),
    });

    console.log("✅ Created fake match pass:", mem.matchPasses.get(userId));
    res.json({ ok: true, pass: mem.matchPasses.get(userId) });
  } catch (err) {
    console.error("🔥 fake-create-match-pass crash:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

/* ============================================================
   (Optional) WEBHOOK STUBS — keep raw body; safe to ignore locally
============================================================ */
app.post("/stripe-webhook", express.raw({ type: "application/json" }), async (_req, res) => {
  // For local dev you typically won't receive Stripe webhooks. Stub OK.
  res.sendStatus(200);
});

app.post("/connect-webhook", express.raw({ type: "application/json" }), async (_req, res) => {
  res.sendStatus(200);
});

/* ============================================================
   ADMIN HELPERS (FAKE)
============================================================ */
app.post("/admin/free-join", requireAuth, requireAdmin, async (req, res) => {
  try {
    const name = req.body?.name || "AdminTest";
    const uid = `admin-${Date.now()}`;
    await db.collection("queue").doc(uid).set(
      {
        uid,
        name,
        joinedAt: Date.now(),
        paid: true,
      },
      { merge: true }
    );
    res.json({ ok: true, uid });
  } catch (e) {
    console.error("admin/free-join:", e);
    return res.status(500).json({ error: "admin free join failed" });
  }
});

/* ============================================================
   START SERVER
============================================================ */

// ✅ Return user's match pass (auto-seed in fake mode)
app.get("/get-match-pass", (_req, res) => {
  let data = mem.matchPasses.get("test-user-123");

  if (!data) {
    data = {
      userId: "test-user-123",
      tier: "bronze",
      matchesTotal: 6,
      matchesPlayed: 0,
      wins: 0,
      payout: 2.75,
      createdAt: Date.now()
    };
    mem.matchPasses.set("test-user-123", data);
    console.log("✅ Auto-created fake match pass");
  }

  res.json(data);
});

// ✅ Update match pass (increments)
app.post("/update-match-pass", express.json(), (req, res) => {
  const { userId = "test-user-123", playedDelta = 0, winDelta = 0 } = req.body || {};
  const cur = mem.matchPasses.get(userId);
  if (!cur) return res.status(404).json({ error: "no pass" });

  const updated = {
    ...cur,
    matchesPlayed: Math.max(0, (cur.matchesPlayed || 0) + Number(playedDelta)),
    wins: Math.max(0, (cur.wins || 0) + Number(winDelta)),
  };
  mem.matchPasses.set(userId, updated);
  return res.json(updated);
});


app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`   Mode: FAKE (no Firebase)`);
});
