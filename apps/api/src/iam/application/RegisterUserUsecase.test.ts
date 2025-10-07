import { describe, it } from 'node:test'
import assert from 'node:assert'
import { InMemoryUserRepository } from '../infra/InMemoryUserRepository'
import type { PasswordHasher } from '../domain/types'
import { HashedPassword } from '../domain/HashedPassword'
import type { DomainEvent, DomainEventsPublisher } from '../domain/domain-events'
import { RegisterUserUseCase } from './RegisterUserUsecase'
import { User } from '../domain/User'
import { UserId } from '../domain/UserId'
import { Email } from '../domain/Email'

class MockPasswordHasher implements PasswordHasher {
    async hash(password: string): Promise<HashedPassword> {
        return new HashedPassword(`<HASHED>${password}</HASHED>`)
    }
}

// TODO duplicated
export class MockDomainEventsPublisher implements DomainEventsPublisher {
    public events: DomainEvent[] = []
    
    emit(event: DomainEvent) {
        this.events.push(event)
    }
}

describe('Register User Usecase unit test', () => {

    it('should throw if email is invalid', async () => {
        const userRepository = new InMemoryUserRepository()
        const passwordHasher = new MockPasswordHasher()
        const eventPublisher = new MockDomainEventsPublisher()

        const sut = new RegisterUserUseCase(
            userRepository, 
            passwordHasher,
            eventPublisher
        )

        const command = {
            email: 'invalid email',
            name: 'valid name',
            password: 'valid password'
        }

        await assert.rejects(
            async () => { await sut.execute(command) },
            {
                name: 'Error',
                message: 'Invalid email address',
            }
        )
    })

    it('should throw if user with email already exists', async () => {
        const userRepository = new InMemoryUserRepository()
        const passwordHasher = new MockPasswordHasher()
        const eventPublisher = new MockDomainEventsPublisher()

        const userWithEmail = User.register(
            new UserId('233'),
            new Email('same-email@email.com'),
            'any name',
            new HashedPassword('any password'),
            eventPublisher
        )
        await userRepository.save(userWithEmail)

        const sut = new RegisterUserUseCase(
            userRepository, 
            passwordHasher,
            eventPublisher
        )

        const command = {
            email: 'same-email@email.com',
            name: 'valid name',
            password: 'valid password'
        }
        await assert.rejects(
            async () => { await sut.execute(command) },
            {
                name: 'Error',
                message: 'User with this email already exists',
            }
        )
    })

    it('should register a new user', async () => {
        const userRepository = new InMemoryUserRepository()
        const passwordHasher = new MockPasswordHasher()
        const eventPublisher = new MockDomainEventsPublisher()

        const sut = new RegisterUserUseCase(
            userRepository, 
            passwordHasher,
            eventPublisher
        )

        const command = {
            email: 'valid@email.com',
            name: 'valid name',
            password: 'valid password'
        }

        const result = await sut.execute(command)
        assert.equal(result.userId, '1')
    })
})