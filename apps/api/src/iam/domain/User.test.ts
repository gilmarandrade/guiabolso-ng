import { describe, it } from 'node:test'
import assert from 'node:assert'
import { User } from './User'
import { UserId } from './UserId'
import { Email } from './Email'
import { HashedPassword } from './HashedPassword'
import { UserRegisteredEvent } from './domain-events'

describe('User (aggregate root) unit test', () => {
    it('should create a new user', () => {
        const userId = new UserId('valid-id')
        const email = new Email('valid@email.com')
        const name = 'user valid name'
        const hashedPassword = new HashedPassword('valid hashed password')
        const sut = User.create(userId, email, name, hashedPassword)

        assert.strictEqual(sut.id, userId)
        assert.strictEqual(sut.email, email)
        assert.strictEqual(sut.name, name)

        const userRegisteredEvent = sut.domainEvents[0] as UserRegisteredEvent
        assert.ok(userRegisteredEvent.eventId)
        assert.ok(userRegisteredEvent.occurredAt instanceof Date)
        assert.equal(userRegisteredEvent.aggregateId, userId.value)
        assert.equal(userRegisteredEvent.email, email.value)
        assert.equal(userRegisteredEvent.name, name)
        assert.equal(userRegisteredEvent.hashedPassword, hashedPassword.value)

    })

    it('should reconstitute a user from persistence', () => {
        const userId = new UserId('valid-id')
        const email = new Email('valid@email.com')
        const name = 'user valid name'
        const hashedPassword = new HashedPassword('valid hashed password')
        const createdAt = new Date()
        const updatedAt = new Date()
        const sut = User.reconstitute(userId, email, name, hashedPassword, createdAt, updatedAt)

        assert.strictEqual(sut.id, userId)
        assert.strictEqual(sut.email, email)
        assert.strictEqual(sut.name, name)
        assert.strictEqual(sut.createdAt, createdAt)
        assert.strictEqual(sut.updatedAt, updatedAt)
    })
})
