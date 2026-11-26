"""Publish only aggregate mint statistics for Nutcracker's dashboard."""
import json
import os
import sqlite3
import time
from contextlib import closing
from pathlib import Path

DATABASE = Path("/ledger/mint.sqlite3")
SNAPSHOT = Path("/stats/summary.json")
INTERVAL = 30


def quotes(rows):
    counts = dict(total=0, byState={}, last24h=0, last1h=0)
    for state, total, day, hour in rows:
        counts["byState"][state] = total
        counts["total"] += total
        counts["last24h"] += day
        counts["last1h"] += hour
    return counts


def collect(database, now):
    # mode=ro still allows SQLite to maintain its WAL sidecars. One read
    # transaction keeps balances, totals and time windows mutually consistent.
    with closing(sqlite3.connect(database.as_uri() + "?mode=ro", uri=True)) as db:
        db.execute("PRAGMA query_only=ON")
        db.execute("BEGIN")
        tables = {}
        for table, field in (("mint_quotes", "mintQuotes"), ("melt_quotes", "meltQuotes")):
            tables[field] = quotes(db.execute(f"""
                SELECT CASE WHEN state IN ('UNPAID', 'PAID', 'PENDING', 'ISSUED', 'EXPIRED')
                       THEN state ELSE 'OTHER' END AS label, COUNT(*),
                       COUNT(CASE WHEN created_time > ? THEN 1 END),
                       COUNT(CASE WHEN created_time > ? THEN 1 END)
                FROM {table} GROUP BY label
            """, (now - 86400, now - 3600)))
        tables["proofs"] = {"total": db.execute("SELECT COUNT(*) FROM proofs_used").fetchone()[0]}
        tables["outputs"] = {"total": db.execute("SELECT COUNT(*) FROM promises WHERE c_ IS NOT NULL").fetchone()[0]}
        total, active = db.execute("SELECT COUNT(*), COUNT(CASE WHEN active = 1 THEN 1 END) FROM keysets").fetchone()
        tables["keysets"] = {"total": total, "active": active}
        balances = {}
        for unit, issued, redeemed in db.execute("""
            SELECT k.unit, SUM(b.issued), SUM(b.redeemed) FROM (
                SELECT keyset, balance AS issued, 0 AS redeemed FROM balance_issued
                UNION ALL
                SELECT keyset, 0 AS issued, balance AS redeemed FROM balance_redeemed
            ) b JOIN keysets k ON k.id = b.keyset
            WHERE k.unit IN ('sat','msat','usd','eur','btc','auth') GROUP BY k.unit
        """):
            balances[unit] = dict(unit=unit, issued=issued, redeemed=redeemed, outstanding=issued-redeemed)
    return {
        "timestamp": now,
        "tables": tables,
        "requestsLast1h": tables["mintQuotes"]["last1h"] + tables["meltQuotes"]["last1h"],
        "requestsLast24h": tables["mintQuotes"]["last24h"] + tables["meltQuotes"]["last24h"],
        "balances": balances,
    }


def publish():
    temporary = SNAPSHOT.with_suffix(".tmp")
    while True:
        try:
            data = collect(DATABASE, int(time.time()))
            temporary.write_text(json.dumps(data, allow_nan=False))
            os.replace(temporary, SNAPSHOT)
        except (OSError, sqlite3.Error) as error:
            SNAPSHOT.unlink(missing_ok=True)
            print(f"Dashboard statistics unavailable ({type(error).__name__})", flush=True)
        time.sleep(INTERVAL)


if __name__ == "__main__":
    publish()
