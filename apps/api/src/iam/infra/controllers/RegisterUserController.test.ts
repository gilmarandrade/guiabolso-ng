import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import type { HttpRequest, HttpResponse } from './ports'
import { RegisterUserController } from './RegisterUserController'
import { RegisterUserUseCase } from 'src/iam/application/RegisterUserUseCase'

describe('RegisterUser Controller unit test', () => {
    it('should return status code 201 created when request contains valid user data', async () => {
        const request: HttpRequest = {
            body: {
              name: 'Any name',
              email: 'any@email.com',
              password: 'valid'
            }
        }

        const usecase = {
            execute: vi.fn().mockResolvedValue({
                userId: "valid-id",
                // email: "any@email.com",
                // name: "Any name",
                // isVerified: false,
            })
        } as unknown as RegisterUserUseCase

        const sut = new RegisterUserController(usecase)

        const response = await sut.handle(request)
        expect(response.statusCode).toEqual(201)

        expect(response.body).toEqual({
            userId: "valid-id",
            // email: "any@email.com",
            // name: "Any name",
            // isVerified: false,
        })
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
            execute: vi.fn().mockRejectedValue(new Error('error message'))
        } as unknown as RegisterUserUseCase

        const sut = new RegisterUserController(usecase)

        const response = await sut.handle(invalidRequest)
        expect(response.statusCode).toEqual(400)
        expect(response.body.message).toBe('error message')
    })
})