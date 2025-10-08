import { DomainError } from "@utils/DomainError"

export class HashedPassword {
    public readonly value: string

    constructor(value: string) {
        if(!this.isValid(value)) {
            throw new DomainError('Password hash cannot be empty')
        }
        this.value = value
    }

    private isValid(value: string): boolean {
        return value && value.length > 0
    }

    equals(other: HashedPassword): boolean {
        return this.value === other.value
    }
}