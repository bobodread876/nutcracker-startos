import importlib.util
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

module = Path(__file__).resolve().parents[1] / "dashboard" / "export_stats.py"
spec = importlib.util.spec_from_file_location("export_stats", module)
export_stats = importlib.util.module_from_spec(spec)
spec.loader.exec_module(export_stats)


class DashboardStatsTest(unittest.TestCase):
    def test_only_aggregates_leave_the_ledger(self):
        now = 200000
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "mint.sqlite3"
            db = sqlite3.connect(path)
            self.addCleanup(db.close)
            db.executescript("""
                PRAGMA journal_mode=WAL;
                CREATE TABLE mint_quotes (state TEXT, created_time INTEGER, request TEXT);
                CREATE TABLE melt_quotes (state TEXT, created_time INTEGER);
                CREATE TABLE proofs_used (secret TEXT);
                CREATE TABLE promises (c_ TEXT);
                CREATE TABLE keysets (id TEXT, unit TEXT, active INTEGER, seed TEXT);
                CREATE TABLE balance_issued (keyset TEXT, balance INTEGER);
                CREATE TABLE balance_redeemed (keyset TEXT, balance INTEGER);
                INSERT INTO mint_quotes VALUES ('ISSUED', 199999, 'private-request'),
                    ('private-state', 190000, ''), ('PAID', 1, '');
                INSERT INTO melt_quotes VALUES ('UNPAID', 113600);
                INSERT INTO proofs_used VALUES ('private-proof');
                INSERT INTO promises VALUES ('private-signature'), (NULL);
                INSERT INTO keysets VALUES ('private-old', 'sat', 0, 'private-seed'),
                    ('private-new', 'sat', 1, 'private-seed'),
                    ('private-usd', 'usd', 1, 'private-seed');
                INSERT INTO balance_issued VALUES ('private-old', 7), ('private-new', 11);
                INSERT INTO balance_redeemed VALUES ('private-old', 5), ('private-usd', 2);
            """)
            data = export_stats.collect(path, now)
            self.assertNotIn("private-", json.dumps(data))
            self.assertEqual(set(data), {"timestamp", "tables", "requestsLast1h", "requestsLast24h", "balances"})
            self.assertEqual(data["tables"], {
                "mintQuotes": {"total": 3, "last1h": 1, "last24h": 2, "byState": {"ISSUED": 1, "OTHER": 1, "PAID": 1}},
                "meltQuotes": {"total": 1, "last1h": 0, "last24h": 0, "byState": {"UNPAID": 1}},
                "proofs": {"total": 1}, "outputs": {"total": 1}, "keysets": {"total": 3, "active": 2},
            })
            self.assertEqual((data["requestsLast1h"], data["requestsLast24h"]), (1, 2))
            self.assertEqual(data["balances"], {
                "sat": {"unit": "sat", "issued": 18, "redeemed": 5, "outstanding": 13},
                "usd": {"unit": "usd", "issued": 0, "redeemed": 2, "outstanding": -2},
            })

    def test_missing_ledger_is_never_created(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "missing.sqlite3"
            with self.assertRaises(sqlite3.OperationalError):
                export_stats.collect(path, 0)
            self.assertFalse(path.exists())


if __name__ == "__main__":
    unittest.main()
