const EASE_LABELS = { 1: 'Again', 2: 'Hard', 3: 'Good', 4: 'Easy' };

function detectDeckType(records) {
  // Check flds structure: vocab has word string in flds[1], grammar has numeric card IDs
  let sample;
  if (Object.hasOwn(records[0], "flds")) {
    sample = records[0]?.flds || [];
  } else {
    sample = records[0]?.fields || [];
  }

  if (!sample.length) return 'unknown';
  // Vocab cards typically have longer text fields and a chapter in last position
  const hasChapter = sample.length >= 14;
  const firstId = sample[0] || '';
  if (hasChapter || firstId.startsWith('B')) return 'vocabulary';
  return 'grammar';
}

function getWeekWindow(records) {
  let dates;
  if (Object.hasOwn(records[0], "t")) {
    dates = records.map(r => new Date(r.t));
  } else {
    dates = records.map(r => new Date(r.ts_iso));
  }

  const now = new Date();
  // Most recent Monday
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);
  return { monday, friday, minDate: new Date(Math.min(...dates)), maxDate: new Date(Math.max(...dates)) };
}

function validate(records, weekWindow) {
  const flags = [];
  const { monday, friday } = weekWindow;

  const thisWeek = records.filter(r => {
    let d;
    if (Object.hasOwn(r, "t")) {
      d = new Date(r.t);
    } else {
      d = new Date(r.ts_iso);
    }
    return d >= monday && d <= friday;
  });

  if (thisWeek.length === 0) {
    flags.push({ level: 'error', message: 'No reviews found in the current week window.' });
  }

  let oldReviews;
  if (Object.hasOwn(records[0], "t")) {
    oldReviews = records.filter(r => new Date(r.t) < monday);
  } else {
    oldReviews = records.filter(r => new Date(r.ts_iso) < monday);
  }

  if (oldReviews.length > 0) {
    flags.push({ level: 'warning', message: `${oldReviews.length} reviews are from a previous week. Ask student to set a date filter on export.` });
  }

  let cappedAt60;
  if (Object.hasOwn(records[0], "ms")) {
    cappedAt60 = records.filter(r => r.ms >= 59900);
  } else {
    cappedAt60 = records.filter(r => r.review_time_ms >= 59900);
  }


  const cappedPct = (cappedAt60.length / records.length) * 100;
  if (cappedPct > 60) {
    flags.push({ level: 'warning', message: `${Math.round(cappedPct)}% of reviews hit the 60-second cap — student may have left cards sitting open.` });
  }

  let hasDeckField;
  if (Object.hasOwn(records[0], "flds")) {
    hasDeckField = records.some(r => r.flds && r.flds.length > 0);
  } else {
    hasDeckField = records.some(r => r.fields && r.fields.length > 0);
  }

  if (!hasDeckField) {
    flags.push({ level: 'error', message: 'Deck name field is missing. Ask student to re-export with deck name included.' });
  }

  // Cram check: all in one day, under 3 min total
  let days;
  if (Object.hasOwn(records[0], "t")) {
    days = new Set(records.map(r => r.t.slice(0, 10)));
  } else {
    days = new Set(records.map(r => r.ts_iso.slice(0, 10)));
  }

  let totalMs;
  if (Object.hasOwn(records[0], "ms")) {
    totalMs = records.reduce((s, r) => s + r.ms, 0);
  } else {
    totalMs = records.reduce((s, r) => s + r.review_time_ms, 0);
  }

  if (days.size === 1 && totalMs < 180000) {
    flags.push({ level: 'error', message: 'All reviews on one day with total time under 3 minutes — looks like a last-minute cram session.' });
  }

  return { flags, thisWeekCount: thisWeek.length, totalCount: records.length };
}

function buildEaseDistribution(records) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  records.forEach(r => { 
    if (Object.hasOwn(r, "e")) {
      counts[r.e] = (counts[r.e] || 0) + 1; 
    } else {
      counts[r.ease] = (counts[r.ease] || 0) + 1; 
    }
  });
  return {
    again: counts[1],
    hard: counts[2],
    good: counts[3],
    easy: counts[4],
  };
}

function buildDailyActivity(records) {
  const days = {};
  records.forEach(r => {
    let day;
    if (Object.hasOwn(r, "t")) {
      day = r.t.slice(0, 10);
    } else {
      day = r.ts_iso.slice(0, 10);
    }
    if (!days[day]) days[day] = { date: day, count: 0, totalMs: 0 };
    days[day].count++;
    days[day].totalMs += r.ms;
  });
  return Object.values(days).sort((a, b) => a.date.localeCompare(b.date));
}

function buildWeaknesses(records, deckType) {
  const cardMap = {};
  records.forEach(r => {
    let key;
    if (Object.hasOwn(r, "flds")) {
      key = r.flds?.[0] || 'unknown';
      console.log("flds: ", key);
    } else {
      console.log("fields: ", key);
      key = r.fields?.[0] || 'unknown';
    }
    const label = deckType === 'vocabulary' ? (r.flds?.[1] || key) : (r.flds?.[2] || key);
    if (!cardMap[key]) cardMap[key] = { id: key, label, easeHistory: [], lapses: r.li || 0, lastEase: r.e };
    cardMap[key].easeHistory.push(r.e);
    cardMap[key].lastEase = r.e;
    cardMap[key].lapses = Math.max(cardMap[key].lapses, r.li || 0);
  });

  return Object.values(cardMap)
    .filter(c => c.easeHistory.some(e => e <= 2))
    .map(c => ({
      ...c,
      avgEase: c.easeHistory.reduce((s, e) => s + e, 0) / c.easeHistory.length,
      reviewCount: c.easeHistory.length,
    }))
    .sort((a, b) => a.avgEase - b.avgEase)
    .slice(0, 8);
}

function buildTimeDistribution(records) {
  const buckets = [
    { label: 'Under 5s', min: 0, max: 5000, count: 0 },
    { label: '5–15s', min: 5000, max: 15000, count: 0 },
    { label: '15–30s', min: 15000, max: 30000, count: 0 },
    { label: '30–60s', min: 30000, max: 60000, count: 0 },
    { label: '60s (capped)', min: 59900, max: Infinity, count: 0 },
  ];
  records.forEach(r => {
    for (const b of buckets) {
      if (r.ms >= b.min && r.ms < b.max) { b.count++; break; }
    }
  });
  return buckets;
}

export function analyzeSession(studentName, records) {
  const deckType = detectDeckType(records);
  const weekWindow = getWeekWindow(records);
  const validation = validate(records, weekWindow);
  const ease = buildEaseDistribution(records);
  const dailyActivity = buildDailyActivity(records);
  const weaknesses = buildWeaknesses(records, deckType);
  const timeDistribution = buildTimeDistribution(records);

  const total = records.length;
  const retention = total > 0 ? Math.round(((ease.good + ease.easy) / total) * 100) : 0;
  const avgMs = total > 0 ? Math.round(records.reduce((s, r) => s + r.ms, 0) / total) : 0;
  const dominantEase = Object.entries(ease).sort((a, b) => b[1] - a[1])[0];

  const easeLabels = { again: 'Again', hard: 'Hard', good: 'Good', easy: 'Easy' };

  return {
    studentName,
    deckType,
    weekWindow: {
      start: weekWindow.monday.toISOString().slice(0, 10),
      end: weekWindow.friday.toISOString().slice(0, 10),
      dataStart: weekWindow.minDate.toISOString().slice(0, 10),
      dataEnd: weekWindow.maxDate.toISOString().slice(0, 10),
    },
    validation,
    summary: {
      totalReviews: total,
      retention,
      avgTimePerCard: avgMs,
      activeDays: dailyActivity.length,
      dominantButton: easeLabels[dominantEase[0]] || 'Easy',
      easeDistribution: ease,
    },
    charts: {
      dailyActivity,
      easeDistribution: ease,
      timeDistribution,
      weaknesses,
    },
  };
}
