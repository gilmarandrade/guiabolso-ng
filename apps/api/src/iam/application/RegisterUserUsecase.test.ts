import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { RegisterUserUseCase } from './RegisterUserUsecase'
import { Email } from '../domain/Email'
import { UserRegisteredEvent, type DomainEventsPublisher } from '../domain/domain-events'
import type { UserRepository } from '../domain/UserRepository'
import type { PasswordPolicy } from '../domain/PasswordPolicy'
import type { PasswordHasher } from '../domain/types'

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
            publish: vi.fn().mockResolvedValue(undefined)
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
        ).rejects.toThrow('User with this email already exists')
    })

    it('should throw if password does not satisfy policies', async () => {
        asMock(passwordPolicy.satisfies).mockReturnValueOnce(false)
        
        await expect(
            useCase.execute({ email: 'test@example.com', name: 'Test', password: '123456' })
        ).rejects.toThrow('Password is not valid')
    })

    it('should save user and return userId', async () => {
        const result = await useCase.execute({
            email: 'new@example.com',
            name: 'New User',
            password: 'password'
        })

        expect(userRepository.findByEmail).toHaveBeenCalledWith(new Email('new@example.com'))
        expect(passwordHasher.hash).toHaveBeenCalledWith('password')
        expect(userRepository.save).toHaveBeenCalled()
        expect(asMock(eventPublisher.publish).mock.calls[0][0][0]).toBeInstanceOf(UserRegisteredEvent)
        expect(result).toEqual({ userId: 'user-123' })
    })
})