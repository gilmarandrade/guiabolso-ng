import type { DomainEventsPublisher } from "../domain/domain-events"
import { Email } from "../domain/Email"
import type { PasswordPolicy } from "../domain/PasswordPolicy"
import type { PasswordHasher } from "../domain/types"
import { User } from "../domain/User"
import type { UserRepository } from "../domain/UserRepository"

export class RegisterUserUseCase {
        private userRepository: UserRepository
        private passwordHasher: PasswordHasher
        private passwordPolicy: PasswordPolicy
        private eventPublisher: DomainEventsPublisher

        constructor(
            userRepository: UserRepository,
            passwordHasher: PasswordHasher,
            passwordPolicy: PasswordPolicy,
            eventPublisher: DomainEventsPublisher
        ) {
            this.userRepository = userRepository
            this.passwordHasher = passwordHasher
            this.passwordPolicy = passwordPolicy
            this.eventPublisher = eventPublisher
        }

        async execute(command: {
            email: string,
            name: string,
            password: string
        }): Promise<{ userId: string }> {
            const email = new Email(command.email)
            const existingUser = await this.userRepository.findByEmail(email)

            if(existingUser) {
                throw new Error('User with this email already exists')
            }

            if(!this.passwordPolicy.satisfies(command.password)) {
                throw new Error(this.passwordPolicy.getDescription())
            }

            const userId = this.userRepository.nextId()
            const hashedPassword = await this.passwordHasher.hash(command.password)

            const user = User.create(
                userId,
                email,
                command.name,
                hashedPassword
            )
            
            await this.userRepository.save(user)

            await this.eventPublisher.publish(user.domainEvents)
            user.clearEvents()

            return { userId: userId.value }
        }

}