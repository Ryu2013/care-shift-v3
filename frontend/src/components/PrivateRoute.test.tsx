import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PrivateRoute from './PrivateRoute'
import { renderWithProviders } from '../test/test-utils'

vi.mock('../hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))

import { useCurrentUser } from '../hooks/useCurrentUser'

const mockedUseCurrentUser = vi.mocked(useCurrentUser)

describe('PrivateRoute', () => {
  it('ユーザー取得中は読み込み表示を出す', () => {
    mockedUseCurrentUser.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useCurrentUser>)

    renderWithProviders(<PrivateRoute><div>protected</div></PrivateRoute>)

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('認証済みユーザーには子要素を表示する', () => {
    mockedUseCurrentUser.mockReturnValue({
      data: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin', office_id: 1, team_id: 1, address: null },
      isLoading: false,
    } as ReturnType<typeof useCurrentUser>)

    renderWithProviders(<PrivateRoute><div>protected</div></PrivateRoute>)

    expect(screen.getByText('protected')).toBeInTheDocument()
  })

  it('未認証ユーザーはログイン画面へ遷移させる', () => {
    mockedUseCurrentUser.mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useCurrentUser>)

    renderWithProviders(<PrivateRoute><div>protected</div></PrivateRoute>, { initialEntries: ['/rooms'] })

    expect(screen.queryByText('protected')).not.toBeInTheDocument()
  })
})
