import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { RegisterUserUseCase } from './RegisterUserUsecase'
import { Email } from '../domain/Email'
import { UserRegisteredEvent, type DomainEventsPublisher } from '../domain/domain-events'
import type { UserRepository } from '../domain/UserRepository'
import { InMemoryUserRepository } from '../infra/InMemoryUserRepository'

vi.mock('../infra/InMemoryUserRepository', () => ({
  InMemoryUserRepository: vi.fn().mockImplementation(() => ({
    findByEmail: vi.fn().mockResolvedValue(null),
    nextId: vi.fn().mockReturnValue({ value: 'user-123' }),
    save: vi.fn()
  }))
}))

function asMock(mock: any): ReturnType<typeof vi.fn> {
    return mock as ReturnType<typeof vi.fn>
}

describe('RegisterUserUseCase', () => {
    let useCase: RegisterUserUseCase

    let passwordHasher: any
    let passwordPolicy: any

    let mockEventPublisher: DomainEventsPublisher

    let userRepository: UserRepository
    let mockFindByEmail: ReturnType<typeof vi.fn>

    beforeEach(() => {
        userRepository = new InMemoryUserRepository()
        mockFindByEmail = userRepository.findByEmail as ReturnType<typeof vi.fn>
        
        passwordHasher = {
            hash: vi.fn()
        }
        passwordPolicy = {
            satisfies: vi.fn().mockReturnValue(true),
            getDescription: vi.fn().mockReturnValue('Password is not valid')
        }

        mockEventPublisher = {
            publish: vi.fn()
        } as unknown as DomainEventsPublisher

        useCase = new RegisterUserUseCase(userRepository, passwordHasher, passwordPolicy, mockEventPublisher)

        vi.clearAllMocks()
    })

    it('should throw if user with email already exists', async () => {
        mockFindByEmail.mockResolvedValue({ id: 'existing' })
        await expect(
            useCase.execute({ email: 'test@example.com', name: 'Test', password: '123456' })
        ).rejects.toThrow('User with this email already exists')
        expect(mockFindByEmail).toHaveBeenCalledWith(new Email('test@example.com'))
    })

    it('should throw if password does not satisfy policies', async () => {
        passwordPolicy.satisfies.mockReturnValueOnce(false)
        
        await expect(
            useCase.execute({ email: 'test@example.com', name: 'Test', password: '123456' })
        ).rejects.toThrow('Password is not valid')
    })

    it('should save user and return userId', async () => {
        passwordHasher.hash.mockResolvedValue('hashed-password')
        asMock(mockEventPublisher.publish).mockResolvedValue(undefined)

        const result = await useCase.execute({
            email: 'new@example.com',
            name: 'New User',
            password: 'password'
        })

        expect(mockFindByEmail).toHaveBeenCalledWith(new Email('new@example.com'))
        expect(passwordHasher.hash).toHaveBeenCalledWith('password')
        expect(userRepository.save).toHaveBeenCalled()
        expect(asMock(mockEventPublisher.publish).mock.calls[0][0][0]).toBeInstanceOf(UserRegisteredEvent)
        expect(result).toEqual({ userId: 'user-123' })
    })
})