const fs = require('node:fs')

function readSummary() {
  try {
    const result = JSON.parse(fs.readFileSync('/stats/summary.json', 'utf8'))
    const age = Date.now() / 1000 - result.timestamp
    // After two missed refreshes, hide old numbers until the collector recovers.
    if (age >= 0 && age <= 65) return result
  } catch {
    // Startup and a temporarily unavailable ledger leave no current summary.
  }
  return null
}

module.exports = { readSummary }
