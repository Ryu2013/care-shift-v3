import { describe, expect, it } from 'vitest'
import { extractErrorMessage } from './extractErrorMessage'

describe('extractErrorMessage', () => {
  it('response.data.errors を改行区切りで返す', () => {
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

  it('使えるメッセージがないときは fallback を返す', () => {
    expect(extractErrorMessage({}, 'fallback')).toBe('fallback')
  })
})
