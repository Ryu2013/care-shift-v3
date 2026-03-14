import { describe, expect, it } from 'vitest'
import { extractErrorMessage } from './extractErrorMessage'

describe('extractErrorMessage', () => {
  it('returns joined errors from response.data.errors', () => {
    expect(
      extractErrorMessage(
        {
          response: {
            data: {
              errors: ['error1', 'error2'],
            },
          },
        },
        'fallback',
      ),
    ).toBe('error1\nerror2')
  })

  it('returns the fallback when no usable message exists', () => {
    expect(extractErrorMessage({}, 'fallback')).toBe('fallback')
  })
})
