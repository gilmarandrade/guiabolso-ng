import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { RegisterUserUseCase } from './RegisterUserUseCase'
import { Email } from '../domain/Email'
import { UserRegisteredEvent, type DomainEventsPublisher } from '../domain/domain-events'
import type { UserRepository } from '../domain/UserRepository'
import type { PasswordPolicy } from '../domain/PasswordPolicy'
import type { PasswordHasher } from '../domain/types'
import { DomainError } from '@utils/DomainError'

function asMock(mock: any): ReturnType<typeof vi.fn> {
    return mock as ReturnType<typeof vi.fn>
}

describe('RegisterUserUseCase', () => {
    let useCase: RegisterUserUseCase
    let passwordHasher: PasswordHasher
    let passwordPolicy: PasswordPolicy
    let eventPublisher: DomainEventsPublisher
    let userRepository: UserRepository

    beforeAll(() => {
        userRepository = {
            findByEmail: vi.fn().mockResolvedValue(null),
            nextId: vi.fn().mockReturnValue({ value: 'user-123' }),
            save: vi.fn()
        } as unknown as UserRepository

        passwordHasher = {
            hash: vi.fn().mockResolvedValue('hashed-password')
        } as unknown as PasswordHasher

        passwordPolicy = {
            satisfies: vi.fn().mockReturnValue(true),
            getDescription: vi.fn().mockReturnValue('Password is not valid')
        } as unknown as PasswordPolicy

        eventPublisher = {
            publish: vi.fn()
        } as unknown as DomainEventsPublisher

        useCase = new RegisterUserUseCase(userRepository, passwordHasher, passwordPolicy, eventPublisher)
    })

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should throw if user with email already exists', async () => {
        asMock(userRepository.findByEmail).mockResolvedValueOnce({ id: 'existing' })
        
        await expect(
            useCase.execute({ email: 'test@example.com', name: 'Test', password: '123456' })
        ).rejects.toThrow(new DomainError('User with this email already exists'))
    })

    it('should throw if password does not satisfy policies', async () => {
        asMock(passwordPolicy.satisfies).mockReturnValueOnce(false)
        
        await expect(
            useCase.execute({ email: 'test@example.com', name: 'Test', password: '123456' })
        ).rejects.toThrow(new DomainError('Password is not valid'))
    })

    it('should save user and return userId', async () => {
        // Arrange
        const email = 'new@example.com'
        const name = 'New User'
        const password = 'password'
        const fakeUserId = { value: 'user-123' }
        asMock(userRepository.nextId).mockReturnValueOnce(fakeUserId)
        asMock(passwordHasher.hash).mockResolvedValueOnce('hashed-password')
        asMock(userRepository.save).mockResolvedValueOnce(undefined)
        asMock(eventPublisher.publish).mockResolvedValueOnce(undefined)

        // Act
        const result = await useCase.execute({ email, name, password })

        // Assert
        expect(userRepository.findByEmail).toHaveBeenCalledWith(new Email(email))
        expect(passwordHasher.hash).toHaveBeenCalledWith(password)
        expect(userRepository.save).toHaveBeenCalled()
        // Check that the saved user has the correct properties
        const savedUser = asMock(userRepository.save).mock.calls[0][0]
        expect(savedUser.id).toEqual(fakeUserId)
        expect(savedUser.email.value).toBe(email)
        expect(savedUser.name).toBe(name)
        // expect(savedUser.hashedPassword).toBe('hashed-password')
        // Check event publishing
        expect(eventPublisher.publish).toHaveBeenCalled()
        const publishedEvent = asMock(eventPublisher.publish).mock.calls[0][0][0]
        expect(publishedEvent).toBeInstanceOf(UserRegisteredEvent)
        expect(result).toEqual({ userId: fakeUserId.value })
    })
})