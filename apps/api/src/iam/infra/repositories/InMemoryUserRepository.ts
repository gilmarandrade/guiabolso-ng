import type { Email } from "../../domain/Email"
import type { User } from "../../domain/User"
import { UserId } from "../../domain/UserId"
import type { UserRepository } from "../../domain/UserRepository"

export class InMemoryUserRepository implements UserRepository {
    public _nextId: number = 1

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

    nextId(): UserId {
        return new UserId(''+this._nextId++)
    }
}