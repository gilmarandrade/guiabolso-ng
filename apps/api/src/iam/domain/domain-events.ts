export interface DomainEventsPublisher {
    publish(events: DomainEvent[]): Promise<void>
}

export interface DomainEvent {
    eventId: string
    occurredAt: Date
    aggregateId: string
}

export class UserRegisteredEvent implements DomainEvent {
    public readonly eventId: string
    public readonly occurredAt: Date
    public readonly aggregateId: string
    public readonly email: string
    public readonly name: string
    public readonly hashedPassword: string

    constructor(
        aggregateId: string,
        email: string,
        name: string,
        hashedPassword: string
    ) {
        this.eventId = crypto.randomUUID()
        this.occurredAt = new Date()
        this.aggregateId = aggregateId
        this.email = email
        this.name = name
        this.hashedPassword = hashedPassword
    }
}