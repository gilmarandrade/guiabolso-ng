import { describe, expect, it } from 'vitest'
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

        expect(sut.id.value).toBe(userId.value)
        expect(sut.email.value).toBe(email.value)
        expect(sut.name).toBe(name)

        const userRegisteredEvent = sut.domainEvents[0] as UserRegisteredEvent
        expect(userRegisteredEvent.eventId).toBeDefined()
        expect(userRegisteredEvent.occurredAt).instanceOf(Date)
        expect(userRegisteredEvent.aggregateId).equal(userId.value)
        expect(userRegisteredEvent.email).equal(email.value)
        expect(userRegisteredEvent.name).equal(name)
        expect(userRegisteredEvent.hashedPassword).equal(hashedPassword.value)
    })

    it('should reconstitute a user from persistence', () => {
        const userId = new UserId('valid-id')
        const email = new Email('valid@email.com')
        const name = 'user valid name'
        const hashedPassword = new HashedPassword('valid hashed password')
        const createdAt = new Date()
        const updatedAt = new Date()
        const sut = User.reconstitute(userId, email, name, hashedPassword, createdAt, updatedAt)

        expect(sut.id).toEqual(userId)
        expect(sut.email).toEqual(email)
        expect(sut.name).toEqual(name)
        expect(sut.createdAt).toEqual(createdAt)
        expect(sut.updatedAt).toEqual(updatedAt)
    })
})
