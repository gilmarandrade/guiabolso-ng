import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { RegisterUserUseCase } from './RegisterUserUsecase'
import { Email } from '../domain/Email'
import { UserRegisteredEvent } from '../domain/domain-events'
import type { UserRepository } from '../domain/UserRepository'

describe('RegisterUserUseCase', () => {
    let passwordHasher: any
    let passwordPolicy: any
    let eventPublisher: any
    let useCase: RegisterUserUseCase

    let findByEmail: ReturnType<typeof vi.fn>
    let nextId: ReturnType<typeof vi.fn>
    let save: ReturnType<typeof vi.fn>
    let userRepository: UserRepository

    beforeEach(() => {
        findByEmail = vi.fn().mockResolvedValue(null)
        nextId = vi.fn().mockReturnValue({ value: 'user-123' })
        save = vi.fn()
        userRepository = {
            findByEmail,
            nextId,
            save
        } as unknown as UserRepository
        
        passwordHasher = {
        hash: vi.fn()
        }
        passwordPolicy = {
            satisfies: vi.fn().mockReturnValue(true),
            getDescription: vi.fn().mockReturnValue('Password is not valid')
        }
        eventPublisher = {
        publish: vi.fn()
        }
        useCase = new RegisterUserUseCase(userRepository, passwordHasher, passwordPolicy, eventPublisher)

        vi.clearAllMocks()
    })

    it('should throw if user with email already exists', async () => {
        findByEmail.mockResolvedValue({ id: 'existing' })
        await expect(
        useCase.execute({ email: 'test@example.com', name: 'Test', password: '123456' })
        ).rejects.toThrow('User with this email already exists')
        expect(userRepository.findByEmail).toHaveBeenCalledWith(new Email('test@example.com'))
    })

    it('should throw if password does not satisfy policies', async () => {
        passwordPolicy.satisfies.mockReturnValueOnce(false)
        
        await expect(
        useCase.execute({ email: 'test@example.com', name: 'Test', password: '123456' })
        ).rejects.toThrow('Password is not valid')
    })

    it('should save user and return userId', async () => {
        passwordHasher.hash.mockResolvedValue('hashed-password')
        eventPublisher.publish.mockResolvedValue(undefined)

        const result = await useCase.execute({
        email: 'new@example.com',
        name: 'New User',
        password: 'password'
        })

        expect(userRepository.findByEmail).toHaveBeenCalledWith(new Email('new@example.com'))
        expect(passwordHasher.hash).toHaveBeenCalledWith('password')
        expect(userRepository.save).toHaveBeenCalled()
        expect(eventPublisher.publish.mock.calls[0][0][0]).toBeInstanceOf(UserRegisteredEvent)
        expect(result).toEqual({ userId: 'user-123' })
    })
})