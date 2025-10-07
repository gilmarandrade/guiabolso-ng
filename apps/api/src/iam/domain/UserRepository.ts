import type { User } from "./User"
import type { UserId } from "./UserId"

export interface UserRepository {
    save(user: User): Promise<void>
    findById(id: UserId): Promise<User | null>
}