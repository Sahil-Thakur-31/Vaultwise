const WORDLIST = [
  "ability", "absent", "absorb", "abstract", "academy", "access", "account", "active", "adapt", "address",
  "advance", "advice", "aerobic", "affair", "afford", "agency", "agent", "agree", "ahead", "airline",
  "airport", "alarm", "album", "alert", "alien", "allied", "almost", "alone", "alpha", "already",
  "always", "amazing", "amber", "ambient", "amend", "amount", "amuse", "anchor", "ancient", "angel",
  "animal", "antenna", "antique", "anxiety", "anyway", "apart", "apology", "appear", "apple", "approve",
  "arctic", "arena", "argue", "armor", "army", "around", "arrange", "arrest", "arrive", "arrow",
  "artist", "artwork", "aspect", "assault", "asset", "assist", "assume", "assure", "athlete", "atomic",
  "attack", "attempt", "attend", "attitude", "attract", "auction", "audit", "august", "author", "auto",
  "autumn", "average", "avocado", "avoid", "awake", "aware", "balance", "balcony", "ballot", "banner",
  "barrier", "battery", "beacon", "beauty", "become", "before", "begin", "behave", "behind", "believe",
  "benefit", "beyond", "bicycle", "biology", "blanket", "blessing", "breeze", "bridge", "bronze", "buffalo",
  "cactus", "calendar", "camera", "campus", "candle", "canvas", "canyon", "capital", "captain", "carbon",
  "castle", "catalyst", "catalog", "caution", "ceiling", "cellular", "century", "ceramic", "chamber", "champion",
  "channel", "chapter", "charger", "charity", "charter", "chuckle", "cinema", "circuit", "citizen", "classic",
  "climate", "cluster", "coastal", "coconut", "collect", "college", "column", "combine", "comfort", "command",
  "compact", "company", "compass", "complex", "compute", "concept", "confirm", "connect", "console", "constant",
  "contour", "control", "convert", "copper", "correct", "courage", "cradle", "creative", "credit", "cricket",
  "crystal", "culture", "curtain", "cushion", "cylinder", "damage", "dancer", "decade", "defense", "degree",
  "deliver", "density", "deposit", "deputy", "desert", "design", "desk", "device", "diamond", "digital",
  "dignity", "dilemma", "dinner", "direct", "disable", "disaster", "discover", "display", "distance", "district",
  "diverse", "divide", "divine", "dolphin", "domain", "donate", "dragon", "dynamic", "eagle", "earth",
  "echo", "ecology", "economy", "element", "elite", "embark", "emerald", "empire", "enable", "enforce",
  "engine", "enhance", "enjoy", "enrich", "ensure", "enter", "entire", "entry", "envelope", "episode",
  "equator", "escape", "essence", "estate", "eternal", "ethics", "evidence", "evolve", "exact", "example",
  "falcon", "family", "famous", "fantasy", "federal", "festival", "fiction", "figure", "filter", "finance",
  "fitness", "flavor", "flight", "flower", "focus", "forest", "fortune", "forward", "foster", "fraction",
  "galaxy", "garage", "garden", "garlic", "gateway", "gather", "general", "genius", "genuine", "gesture",
  "glacier", "glance", "glimpse", "global", "glorious", "golden", "gospel", "govern", "grace", "gradient",
  "harbor", "harmony", "harvest", "haven", "hazard", "header", "healthy", "height", "helmet", "heroic",
  "history", "horizon", "hospital", "hostile", "humble", "hybrid", "hyper", "iconic", "ideal", "identify",
  "ignite", "ignore", "illegal", "illuminate", "image", "immense", "impact", "impose", "improve", "impulse",
  "include", "income", "index", "indicate", "indoor", "industry", "infinite", "inform", "inherit", "initial",
  "inmate", "inner", "innocent", "input", "inquiry", "insight", "inspire", "install", "instant", "intact",
  "integral", "intense", "intent", "invest", "invite", "island", "isotope", "jacket", "jaguar", "javelin",
  "journey", "joyful", "jungle", "junior", "justice", "kernel", "kinetic", "kingdom", "knight", "ladder",
  "lantern", "laptop", "laser", "launch", "lavender", "layout", "legacy", "legend", "leisure", "leopard",
  "liberty", "library", "license", "lightning", "liquid", "listen", "little", "lizard", "logic", "lumber",
  "luxury", "machine", "magnet", "majestic", "mammal", "manager", "mandate", "mansion", "manual", "marble",
  "marine", "market", "marvel", "matrix", "maximum", "meadow", "measure", "medal", "media", "melody",
  "memory", "mentor", "mercury", "merge", "message", "meteor", "method", "metric", "micro", "midnight",
  "mineral", "minimal", "miracle", "mission", "mixture", "mobile", "model", "modern", "modify", "module",
  "molecule", "moment", "monarch", "monitor", "monster", "monument", "morning", "mortar", "mountain", "multiply",
  "museum", "music", "mystery", "native", "natural", "nature", "navigate", "nebula", "nectar", "network",
  "neutral", "nexus", "nickel", "noble", "nomad", "normal", "notice", "novel", "nuclear", "number",
  "oasis", "object", "observe", "obtain", "obvious", "ocean", "october", "office", "olive", "olympic",
  "onion", "online", "opaque", "operate", "opinion", "optimal", "option", "oracle", "orange", "orbit",
  "orchard", "order", "ordinary", "organ", "orient", "origin", "ornament", "orphan", "output", "oxygen",
  "pacific", "package", "packet", "palace", "palette", "panel", "panic", "parade", "parallel", "parent",
  "particle", "passage", "passport", "patent", "patient", "patrol", "pattern", "payment", "peace", "peacock",
  "pelican", "pencil", "penguin", "people", "pepper", "perfect", "period", "permit", "person", "phantom",
  "phoenix", "physical", "piano", "picture", "pioneer", "pipeline", "pirate", "pistol", "pitch", "pivot",
  "planet", "plasma", "plastic", "platform", "plenty", "plunge", "plural", "pocket", "poetry", "polar",
  "police", "policy", "polish", "pollen", "polygon", "polymer", "ponder", "popular", "portal", "portion",
  "portrait", "position", "positive", "possible", "posture", "potato", "potion", "pottery", "poultry", "poverty",
  "powder", "praise", "preach", "precious", "predict", "prefer", "prefix", "premier", "premium", "prepare",
  "presence", "present", "preserve", "prestige", "prevail", "prevent", "primary", "primate", "primitive", "prince",
  "prism", "pristine", "private", "prize", "process", "produce", "profile", "profit", "program", "project",
  "promise", "promote", "prompt", "proper", "prophet", "protect", "protocol", "proton", "proud", "provide",
  "proxy", "prudent", "public", "pulse", "pumpkin", "pupil", "puppet", "pure", "purple", "purpose",
  "pursue", "pyramid", "quantum", "quarry", "quartz", "quasar", "query", "quest", "quick", "quiet",
  "quiver", "quota", "quote", "rabbit", "radar", "radiant", "radical", "radio", "radius", "railway",
  "rainbow", "rally", "random", "rapid", "raptor", "rare", "raster", "rational", "reactor", "reading",
  "realm", "rebel", "rebound", "recipe", "reclaim", "record", "recover", "recruit", "redwood", "refine",
  "reflect", "reform", "refuge", "region", "regular", "reign", "reinforce", "reject", "relate", "relax",
  "release", "reliable", "relief", "rely", "remain", "remedy", "remind", "remote", "render", "renew",
  "repair", "repeat", "replace", "replica", "reply", "report", "rescue", "research", "reserve", "reside",
  "resist", "resolve", "resort", "resource", "respect", "respond", "restore", "result", "retain", "retire",
  "retreat", "return", "reveal", "reverse", "review", "revival", "reward", "rhythm", "ribbon", "rich",
  "ridge", "rigid", "ring", "ripple", "risk", "ritual", "rival", "river", "robot", "robust",
  "rocket", "romance", "roster", "rotate", "rotor", "rough", "round", "route", "routine", "royal",
  "ruby", "rugged", "ruin", "rule", "rumor", "runner", "rural", "rust", "sacred", "safari",
  "saffron", "sailor", "saint", "salad", "salmon", "salon", "salt", "sample", "sanction", "sand",
  "sapphire", "satellite", "satin", "sauce", "savage", "scale", "scanner", "scarce", "scenario", "scene",
  "scenic", "schedule", "scheme", "scholar", "school", "science", "scope", "scooter", "score", "scout",
  "screen", "script", "sculptor", "season", "second", "secret", "section", "sector", "secure", "segment",
  "seize", "select", "seminar", "senior", "sense", "sentence", "separate", "sequence", "serene", "series",
  "sermon", "serpent", "servant", "service", "session", "settle", "setup", "shadow", "shatter", "shelter",
  "shield", "shift", "shine", "ship", "shock", "shore", "short", "shoulder", "shrewd", "shrine",
  "sidewalk", "sight", "signal", "signet", "silent", "silicon", "silver", "similar", "simple", "simulate",
  "sincere", "single", "siren", "sister", "sketch", "skilful", "skyline", "slogan", "smoke", "smooth",
  "snack", "snake", "sober", "social", "society", "socket", "sodium", "solar", "soldier", "solid",
  "solitary", "solution", "solvent", "sonic", "source", "space", "spark", "spatial", "speaker", "special",
  "species", "spectrum", "speech", "speed", "sphere", "spice", "spider", "spiral", "spirit", "splash",
  "splendid", "sponsor", "spoon", "sport", "spring", "sprint", "sprout", "squad", "square", "stable",
  "stadium", "staff", "stage", "stainless", "standard", "stanza", "starlight", "startup", "station", "statue",
  "status", "steady", "stealth", "steel", "stellar", "step", "stewart", "stick", "stimulus", "stomach",
  "stone", "storage", "storm", "story", "strand", "strategy", "stream", "street", "strength", "strive",
  "structure", "struggle", "student", "studio", "stumble", "subject", "sublime", "subtle", "subway", "success",
  "sugar", "suggest", "suitable", "sulfur", "summary", "summit", "sunflower", "superb", "supply", "support",
  "surface", "surgeon", "surprise", "surround", "survey", "survival", "suspect", "sustain", "swallow", "swift",
  "symbol", "symphony", "synapse", "syndrome", "syntax", "system", "table", "tactic", "talent", "tangent",
  "tanker", "target", "tariff", "tavern", "teacher", "team", "technic", "telecom", "telescope", "temper",
  "temple", "tenant", "tender", "tennis", "tension", "terminal", "terrace", "terrain", "testify", "textile",
  "texture", "theater", "theme", "theory", "therapy", "thermal", "thesis", "thickness", "thought", "thread",
  "thrive", "thunder", "tide", "tiger", "timber", "timeline", "titan", "toast", "token", "tomato",
  "tonight", "topic", "topaz", "tornado", "torpedo", "torrent", "totem", "touch", "tourist", "tower",
  "tracker", "tractor", "traffic", "trailer", "trainer", "trajectory", "transfer", "transit", "translate", "transmit",
  "transport", "trap", "treasure", "treaty", "tremor", "trench", "trend", "triangle", "tribe", "tribute",
  "trigger", "trilogy", "triumph", "trophy", "tropical", "truck", "trumpet", "trust", "truth", "tunnel",
  "turbine", "turbulence", "tutorial", "twilight", "tycoon", "typical", "ultimate", "umbrella", "uncover", "undergo",
  "unicorn", "uniform", "unique", "unit", "universe", "unlock", "update", "upgrade", "uphold", "uplink",
  "upload", "upright", "upward", "urban", "urgent", "utility", "vacuum", "vague", "valiant", "valid",
  "valley", "valuable", "valve", "vanguard", "vanish", "vapor", "variable", "variant", "variety", "vector",
  "vehicle", "velocity", "velvet", "vendor", "venture", "venue", "verdict", "verify", "version", "vertex",
  "vertical", "vessel", "veteran", "viable", "vibrant", "vibrate", "victory", "video", "village", "vintage",
  "violet", "virtual", "virtue", "virus", "visible", "vision", "visitor", "visual", "vital", "vivid",
  "vocal", "volatile", "volcano", "voltage", "volume", "vortex", "voyage", "vulture", "wafer", "walnut",
  "wander", "warehouse", "warrior", "watchdog", "waterfall", "wavelength", "wealth", "weapon", "weather", "website",
  "welcome", "welfare", "western", "whale", "wheat", "whisper", "wildlife", "windfall", "window", "wisdom",
  "witness", "wizard", "wonder", "workbook", "workforce", "workshop", "world", "worship", "worthy", "wreck",
  "yacht", "yard", "yearly", "yellow", "yield", "youth", "zealot", "zebra", "zenith", "zephyr",
  "zero", "zigzag", "zinc", "zipper", "zodiac", "zombie", "zone"
];

export interface PassphraseOptions {
  wordsCount?: number;
  separator?: string;
  capitalize?: boolean;
  includeNumber?: boolean;
}

export function generatePassphrase(options: PassphraseOptions = {}): string {
  const {
    wordsCount = 4,
    separator = "-",
    capitalize = true,
    includeNumber = true,
  } = options;

  const count = Math.max(3, Math.min(8, wordsCount));
  const bytes = new Uint32Array(count);

  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < count; i++) {
      bytes[i] = Math.floor(Math.random() * 0xffffffff);
    }
  }

  const selectedWords = Array.from(bytes, (val) => {
    let word = WORDLIST[val % WORDLIST.length];
    if (capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    return word;
  });

  if (includeNumber) {
    const num = (bytes[0] % 90 + 10).toString();
    selectedWords[selectedWords.length - 1] += num;
  }

  return selectedWords.join(separator);
}

export interface UsernameOptions {
  type: "plus-addressed" | "catchall" | "random";
  baseEmail?: string;
  domain?: string;
  service?: string;
}

export function generateUsername(options: UsernameOptions): string {
  const { type, baseEmail = "sahil@northstar.io", domain = "northstar.io", service = "service" } = options;
  const cleanService = service.toLowerCase().replace(/[^a-z0-9]/g, "") || "login";
  const randomSuffix = Math.floor(Math.random() * 899 + 100);

  if (type === "plus-addressed") {
    const [user, host] = baseEmail.includes("@") ? baseEmail.split("@") : ["user", domain];
    return `${user}+${cleanService}${randomSuffix}@${host}`;
  }

  if (type === "catchall") {
    return `${cleanService}.${randomSuffix}@${domain}`;
  }

  // Random word-based username
  const word1 = WORDLIST[Math.floor(Math.random() * WORDLIST.length)];
  const word2 = WORDLIST[Math.floor(Math.random() * WORDLIST.length)];
  return `${word1}_${word2}${randomSuffix}`;
}
