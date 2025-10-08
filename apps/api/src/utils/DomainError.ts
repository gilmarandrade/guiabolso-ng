export class DomainError extends Error {
    public readonly name = "DomainError"

    constructor(message?: string) {
    	super(message)
    }
    
}