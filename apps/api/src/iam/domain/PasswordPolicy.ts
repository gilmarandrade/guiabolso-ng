export class PasswordPolicy {
    satisfies(password: string): boolean {
        const minLenght = 8
        const hasLetter = /[a-zA-Z]/.test(password)
        const hasNumber = /[0-9]/.test(password)
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

        return password.length >= minLenght &&
            hasLetter &&
            hasNumber &&
            hasSpecialChar
    }

    getDescription() {
        return 'Password must be at least 8 characters and contain letters, numbers and special characters'
    }
}