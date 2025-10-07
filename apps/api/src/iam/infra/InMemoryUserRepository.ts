import type { Email } from "../domain/Email"
import type { User } from "../domain/User"
import type { UserId } from "../domain/UserId"
import type { UserRepository } from "../domain/UserRepository"

export class InMemoryUserRepository implements UserRepository {

    public list: User[] = []

    async save(user: User): Promise<void> {
        this.list.push(user)
    }

    async findById(id: UserId): Promise<User | null> {
        return this.list.find(el => el.id.equals(id))
    }

    async findByEmail(email: Email): Promise<User | null> {
        return this.list.find(el => el.email.equals(email))
    }
}