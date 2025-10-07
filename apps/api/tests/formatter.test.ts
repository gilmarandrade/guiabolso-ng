import { describe, expect, it } from 'vitest'
import { formatFileSize } from '@utils/formatter'

describe('formatFileSize function', () => {
    it('should return "1.00 GB" for sizeBytes = 1073741824', () => {
        expect(formatFileSize(1073741824)).toBe('1.00 GB')
    })
})
