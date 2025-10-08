import type { RegisterUserUseCase } from "src/iam/application/RegisterUserUseCase"
import type { HttpRequest, HttpResponse } from "./ports"
import { badRequest, created } from "./http-helper"

export class RegisterUserController {
    constructor(private readonly usecase: RegisterUserUseCase) {}

    public async handle(request: HttpRequest): Promise<HttpResponse> {
        const command = {
            email: request.body.email,
            name: request.body.name,
            password: request.body.password
        }

        try {
            const response = await this.usecase.execute(command)
            return created(response)
        } catch(error) {
            return badRequest(error)
        }
    }
}