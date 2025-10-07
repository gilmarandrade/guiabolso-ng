import type { HashedPassword } from "./HashedPassword"

export interface PasswordHasher {
    hash(password: string): Promise<HashedPassword>
}