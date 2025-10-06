export class Email {
    public readonly value: string

    constructor(value: string) {
        if(!this.isValid(value)) {
            throw new Error('Invalid email address')
        }
        this.value = value
    }

    private isValid(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    equals(other: Email): boolean {
        return this.value === other.value
    }
}