import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RegisterUserUseCase } from './RegisterUserUsecase'
import { Email } from '../domain/Email'
import { User } from '../domain/User'

describe('RegisterUserUseCase', () => {
  let userRepository: any
  let passwordHasher: any
  let eventPublisher: any
  let useCase: RegisterUserUseCase

  beforeEach(() => {
    userRepository = {
      findByEmail: vi.fn(),
      nextId: vi.fn(),
      save: vi.fn()
    }
    passwordHasher = {
      hash: vi.fn()
    }
    eventPublisher = {
      publish: vi.fn()
    }
    useCase = new RegisterUserUseCase(userRepository, passwordHasher, eventPublisher)
  })

  it('should throw if user with email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'existing' })
    await expect(
      useCase.execute({ email: 'test@example.com', name: 'Test', password: '123456' })
    ).rejects.toThrow('User with this email already exists')
    expect(userRepository.findByEmail).toHaveBeenCalledWith(new Email('test@example.com'))
  })

  it('should save user and return userId', async () => {
    userRepository.findByEmail.mockResolvedValue(null)
    const fakeUserId = { value: 'user-123' }
    userRepository.nextId.mockReturnValue(fakeUserId)
    passwordHasher.hash.mockResolvedValue('hashed-password')
    userRepository.save.mockResolvedValue(undefined)
    eventPublisher.publish.mockResolvedValue(undefined)

    // Spy on User.create and user.clearEvents
    const clearEvents = vi.fn()
    vi.spyOn(User, 'create').mockImplementation((id, email, name, hashedPassword) => {
      return {
        id,
        email,
        name,
        hashedPassword,
        domainEvents: ['event1'],
        clearEvents
      } as any
    })

    const result = await useCase.execute({
      email: 'new@example.com',
      name: 'New User',
      password: 'password'
    })

    expect(userRepository.findByEmail).toHaveBeenCalledWith(new Email('new@example.com'))
    expect(passwordHasher.hash).toHaveBeenCalledWith('password')
    expect(userRepository.save).toHaveBeenCalled()
    expect(eventPublisher.publish).toHaveBeenCalledWith(['event1'])
    expect(result).toEqual({ userId: 'user-123' })
  })
})