import type { RegisterUserUseCase } from "src/iam/application/RegisterUserUseCase"
import type { HttpRequest, HttpResponse } from "./ports"
import { badRequest, created, serverError } from "./http-helper"
import { DomainError } from "@utils/DomainError"
import { MissingParamError } from "@utils/MissingParamError"

export class RegisterUserController {
    private readonly requiredParamNames = ['name', 'email', 'password']

    constructor(private readonly usecase: RegisterUserUseCase) {}

    private validateRequiredParams(request: HttpRequest) {
        const missingParams = this.requiredParamNames.filter(paramName => {
            return (!request.body[paramName]) ? true : false
        })

        if(missingParams.length > 0) {
            throw new MissingParamError(`Missing parameters from request: ${missingParams.join(', ')}.`)
        }

        return true
    }

    public async handle(request: HttpRequest): Promise<HttpResponse> {
        try {
            if(this.validateRequiredParams(request)) {
                const command = {
                    email: request.body.email,
                    name: request.body.name,
                    password: request.body.password
                }
            
                const response = await this.usecase.execute(command)
                return created(response)
            }
        } catch(error: unknown) {
            if(error instanceof DomainError) {
                return badRequest(error)
            } else if(error instanceof MissingParamError) {
                return badRequest(error)
            }

            return serverError(error)
        }
    }
}