import type { Email } from "./Email"
import type { HashedPassword } from "./HashedPassword"
import { UserRegisteredEvent, type DomainEvent } from "./domain-events"
import type { UserId } from "./UserId"

export class User {
    private _id: UserId
    private _email: Email
    private _name: string
    private _hashedPassword: HashedPassword
    private _createdAt: Date
    private _updatedAt: Date

    private _events: DomainEvent[] = []

    private constructor() {}

    get id(): UserId { return this._id }
    get email(): Email { return this._email }
    get name(): string { return this._name }
    get createdAt(): Date { return this._createdAt }
    get updatedAt(): Date { return this._updatedAt }

    get domainEvents(): DomainEvent[] { return this._events }
    clearEvents(): void { this._events = [] }

    static create(
        userId: UserId,
        email: Email,
        name: string,
        hashedPassword: HashedPassword,
    ) {
        const user = new User()
        user._id = userId
        user._email = email
        user._name = name
        user._hashedPassword = hashedPassword
        user._createdAt = new Date()
        user._updatedAt = new Date(user._createdAt)

        const userRegisteredEvent = new UserRegisteredEvent(user._id.value, user._email.value, user._name, user._hashedPassword.value)
        user._events.push(userRegisteredEvent)

        return user
    }

    static reconstitute(
        userId: UserId,
        email: Email,
        name: string,
        hashedPassword: HashedPassword,
        createdAt: Date,
        updatedAt: Date
    ) {
        const user = new User()
        user._id = userId
        user._email = email
        user._name = name
        user._hashedPassword = hashedPassword
        user._createdAt = createdAt
        user._updatedAt = updatedAt

        return user
    }
}