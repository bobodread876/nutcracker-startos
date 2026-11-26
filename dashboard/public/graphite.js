// Snapshot validity comes from the server. A monotonic clock keeps the age
// display independent of the operator's clock or time zone.
const Graphite = (() => {
  const maxAgeMs = 65000;
  const number = new Intl.NumberFormat(undefined, { maximumFractionDigits: 8 });
  const currencies = Object.fromEntries(['usd', 'eur'].map(unit => [
    unit, new Intl.NumberFormat(undefined, { style: 'currency', currency: unit.toUpperCase() }),
  ]));
  let expiresAt = null;
  const el = id => document.getElementById(id);
  const set = (id, value) => { el(id).textContent = value; };

  function amount(value, unit) {
    if (currencies[unit]) return [currencies[unit].format(value / 100), ''];
    const labels = { sat: 'sats', msat: 'msats', btc: 'BTC', auth: 'auth' };
    return [number.format(value), labels[unit] || unit];
  }

  function showBalances(data) {
    const cards = el('mint-balance-cards');
    cards.replaceChildren();
    if (!data?.available) {
      cards.textContent = '—';
      set('issued-total', '—');
      set('redeemed-total', '—');
      return;
    }
    const entries = Object.values(data.balances);
    if (entries.length === 0) entries.push({ unit: '', issued: 0, redeemed: 0, outstanding: 0 });
    for (const entry of entries) {
      const line = document.createElement('div');
      const [value, label] = amount(entry.outstanding, entry.unit);
      line.append(value);
      if (label) {
        const unit = document.createElement('small');
        unit.textContent = label;
        line.append(' ', unit);
      }
      cards.append(line);
    }
    for (const field of ['issued', 'redeemed']) {
      set(field + '-total', entries.map(entry => amount(entry[field], entry.unit).filter(Boolean).join(' ')).join('\n'));
    }
  }

  function tick() {
    if (expiresAt === null) return;
    const age = Math.floor(Math.max(0, maxAgeMs - (expiresAt - performance.now())) / 1000);
    set('age-seconds', String(age));
    set('summary-status', 'Updated ' + age + 's ago');
    el('ruler-fill').style.width = Math.min(age / 30 * 100, 100) + '%';
  }

  function summary(db, balances, remaining) {
    showBalances(db.available ? balances : null);
    const t = db.available ? db.tables : {};
    for (const [id, value] of [
      ['mint-day', t.mintQuotes?.last24h], ['melt-day', t.meltQuotes?.last24h],
      ['summary-keys', t.keysets?.active], ['summary-proofs', t.proofs?.total],
    ]) set(id, value == null ? '—' : number.format(value));
    expiresAt = db.available ? performance.now() + remaining : null;
    set('collector-service', db.available ? 'Current' : 'Awaiting data');
    if (db.available) tick();
    else {
      set('summary-status', 'Statistics delayed. Retrying automatically.');
      set('age-seconds', '—');
      el('ruler-fill').style.width = '0';
    }
  }

  function health(reachable) {
    const state = reachable === true ? 'Online' : reachable === false ? 'Unreachable' : 'Unknown';
    set('mint-status', state.toLowerCase());
    set('pulse-state', state);
    set('mint-service', state);
    set('dashboard-service', reachable == null ? 'Unknown' : 'Responding');
    document.body.dataset.mint = state.toLowerCase();
  }

  return { tick, summary, health };
})();
