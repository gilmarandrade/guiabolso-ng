import { describe, it, expect, vi } from 'vitest'
import type { HttpRequest } from './ports'
import { RegisterUserController } from './RegisterUserController'
import { RegisterUserUseCase } from 'src/iam/application/RegisterUserUseCase'
import { DomainError } from '@utils/DomainError'

describe('RegisterUser Controller unit test', () => {
    it('should return status code 400 when request is missing required params', async () => {
        const invalidRequest: HttpRequest = {
            body: {}
        }

        const usecase = {
            execute: vi.fn()
        } as unknown as RegisterUserUseCase

        const sut = new RegisterUserController(usecase)

        const response = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body.message).toBe('Missing parameters from request: name, email, password.')
    })

    it('should return status code 400 when request contains invalid data', async () => {
        const invalidRequest: HttpRequest = {
            body: {
              name: 'valid name',
              email: 'invalid_email.com',
              password: 'valid'
            }
        }

        const usecase = {
            execute: vi.fn().mockRejectedValue(new DomainError('domain error message'))
        } as unknown as RegisterUserUseCase

        const sut = new RegisterUserController(usecase)

        const response = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body.message).toBe('domain error message')
    })

    it('should return status code 201 created when request contains valid data', async () => {
        const request: HttpRequest = {
            body: {
              name: 'Any name',
              email: 'any@email.com',
              password: 'valid'
            }
        }

        const usecase = {
            execute: vi.fn().mockResolvedValue({
                userId: "valid-id"
            })
        } as unknown as RegisterUserUseCase

        const sut = new RegisterUserController(usecase)

        const response = await sut.handle(request)
        expect(response.statusCode).toEqual(201)

        expect(response.body).toEqual({
            userId: "valid-id"
        })
    })

    it('should return status code 500 when server raises', async () => {
        const request: HttpRequest = {
            body: {
              name: 'Any name',
              email: 'any@email.com',
              password: 'valid'
            }
        }

        const usecase = {
            execute: vi.fn().mockRejectedValue(new Error('unexpected system error message'))
        } as unknown as RegisterUserUseCase

        const sut = new RegisterUserController(usecase)

        const response = await sut.handle(request)
        expect(response.statusCode).toEqual(500)
        // expect(response.body.name).toBe('ServerError')
        expect(response.body.message).toBe('Error: unexpected system error message')
    })
})