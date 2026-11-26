import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import test from 'node:test'
import sessionsModule from '../dashboard/sessions.cjs'

class Socket extends EventEmitter {
  authenticated = true
  closed = false
  close() { this.closed = true; this.emit('close') }
}

test('logout revokes only the selected session and its live connections', () => {
  const sessions = sessionsModule.createSessions()
  const token = sessions.issue()
  const other = sessions.issue()
  const socket = new Socket()
  assert.equal(sessions.attach('unknown', socket), false)
  assert.equal(sessions.attach(token, socket), true)
  sessions.revoke(token)
  assert.equal(socket.authenticated, false)
  assert.equal(socket.closed, true)
  assert.equal(sessions.valid(token), false)
  assert.equal(sessions.valid(other), true)
  sessions.revoke(other)
})

test('sessions expire even with a live connection', async () => {
  const sessions = sessionsModule.createSessions(20)
  const token = sessions.issue()
  const socket = new Socket()
  assert.equal(sessions.attach(token, socket), true)
  await new Promise(resolve => setTimeout(resolve, 50))
  assert.equal(sessions.valid(token), false)
  assert.equal(socket.closed, true)
})
