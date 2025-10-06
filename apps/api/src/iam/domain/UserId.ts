export class UserId {
    public readonly value: string

    constructor(value: string) {
        if(!this.isValid(value)) {
            throw new Error('User ID cannot be empty');
        }
        this.value = value
    }

    private isValid(value: string): boolean {
        // TODO verificar se é um valid uuid or mongo objectId
        return value && value.length > 0
    }

    equals(other: UserId): boolean {
        return this.value === other.value
    }
}