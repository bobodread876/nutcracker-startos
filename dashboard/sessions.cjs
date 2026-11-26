const { randomBytes } = require('node:crypto')

// Browser sessions live only in this process. Restarting after a password change
// also revokes every session. Basic auth remains available to monitoring clients.
function createSessions(lifetimeMs = 8 * 60 * 60 * 1000) {
  const entries = new Map()

  function revoke(token) {
    const entry = entries.get(token)
    if (!entry) return
    entries.delete(token)
    clearTimeout(entry.timer)
    for (const socket of entry.sockets) {
      socket.authenticated = false
      socket.close(4401, 'Session ended')
    }
  }

  function valid(token) {
    const entry = entries.get(token)
    if (!entry) return false
    if (Date.now() < entry.expires) return true
    revoke(token)
    return false
  }

  return {
    issue() {
      if (entries.size >= 128) revoke(entries.keys().next().value)
      const token = randomBytes(32).toString('hex')
      const timer = setTimeout(() => revoke(token), lifetimeMs)
      timer.unref()
      entries.set(token, { expires: Date.now() + lifetimeMs, timer, sockets: new Set() })
      return token
    },
    valid,
    revoke,
    attach(token, socket) {
      if (!valid(token)) return false
      const sockets = entries.get(token).sockets
      sockets.add(socket)
      socket.once('close', () => sockets.delete(socket))
      return true
    },
  }
}

module.exports = { createSessions }
