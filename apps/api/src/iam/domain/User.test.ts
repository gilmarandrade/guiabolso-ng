import { describe, it } from 'node:test'
import assert from 'node:assert'
import { User } from './User'
import { UserId } from './UserId'
import { Email } from './Email'
import { HashedPassword } from './HashedPassword'

describe('User (agreggate root) unit test', () => {
    it('should register a new user', () => {
        const userId = new UserId('valid-id')
        const email = new Email('valid@email.com')
        const name = 'user valid name'
        const hashedPassword = new HashedPassword('valid hashed password')
        const sut = User.register(userId, email, name, hashedPassword)

        assert.strictEqual(sut.id, userId)
        assert.strictEqual(sut.email, email)
        assert.strictEqual(sut.name, name)
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
