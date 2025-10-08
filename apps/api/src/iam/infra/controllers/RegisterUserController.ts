import type { RegisterUserUseCase } from "src/iam/application/RegisterUserUseCase"
import type { HttpRequest, HttpResponse } from "./ports"
import { badRequest, created, serverError } from "./http-helper"
import { DomainError } from "@utils/DomainError"
import { MissingParamError } from "@utils/MissingParamError"

export class RegisterUserController {
    constructor(private readonly usecase: RegisterUserUseCase) {}

    public async handle(request: HttpRequest): Promise<HttpResponse> {
        try {
            const requiredParamNames = ['name', 'email', 'password']

            const missingParams = requiredParamNames.filter(paramName => {
                return (!request.body[paramName]) ? true : false
            })

            if(missingParams.length > 0) {
                return badRequest(new MissingParamError(`Missing parameters from request: ${missingParams.join(', ')}.`))
            }

            const command = {
                email: request.body.email,
                name: request.body.name,
                password: request.body.password
            }
        
            const response = await this.usecase.execute(command)
            return created(response)

        } catch(error: unknown) {
            if(error instanceof DomainError) {
                return badRequest(error)
            }

            return serverError(error)
        }
    }
}