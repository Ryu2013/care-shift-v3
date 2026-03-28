import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { inviteUser } from '../../../../api/users'
import { getTeams } from '../../../../api/teams'
import type { Role, Team, UserInvitationInput } from '../../../../types'
import styles from './InviteUserModal.module.css'

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ErrorResponse {
  errors?: string[]
}

function buildInitialFormState() {
  return {
    name: '',
    email: '',
    teamId: '' as number | '',
    role: 'employee' as Role,
  }
}

function toErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const errors = (error.response?.data as ErrorResponse | undefined)?.errors

    if (errors && errors.length > 0) {
      return errors.join('\n')
    }
  }

  return '招待の送信に失敗しました'
}

export default function InviteUserModal({ isOpen, onClose }: InviteUserModalProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [teamId, setTeamId] = useState<number | ''>('')
  const [role, setRole] = useState<Role>('employee')
  const [errorMessage, setErrorMessage] = useState('')

  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => getTeams().then((res: { data: Team[] }) => res.data),
    enabled: isOpen,
  })

  function resetForm() {
    const initialState = buildInitialFormState()
    setName(initialState.name)
    setEmail(initialState.email)
    setTeamId(initialState.teamId)
    setRole(initialState.role)
    setErrorMessage('')
  }

  const inviteMutation = useMutation({
    mutationFn: (data: UserInvitationInput) => inviteUser(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      resetForm()
      alert('招待メールを送信しました')
      onClose()
    },
    onError: (error: unknown) => {
      setErrorMessage(toErrorMessage(error))
    },
  })

  function handleClose() {
    resetForm()
    onClose()
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (teamId === '') {
      setErrorMessage('部署を選択してください')
      return
    }

    inviteMutation.mutate({
      name,
      email,
      team_id: teamId,
      role,
    })
  }

  if (!isOpen) return null

  return (
    <div className={`${styles.backdrop} fixed inset-0 z-50 flex items-center justify-center p-4`}>
      <div className={`${styles.modal} w-full max-w-md overflow-hidden animate-fade-in-up`}>
        <div className={`${styles.header} flex items-center justify-between p-6`}>
          <h2 className={`${styles.title} text-xl`}>スタッフを招待</h2>
          <button onClick={handleClose} className={styles.closeButton} aria-label="招待モーダルを閉じる">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="invitationName" className={`${styles.label} block text-sm`}>お名前 <span className={styles.required}>*</span></label>
              <input
                id="invitationName"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                placeholder="例：山田 太郎"
                className={`${styles.field} w-full px-4 py-2`}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="invitationEmail" className={`${styles.label} block text-sm`}>メールアドレス <span className={styles.required}>*</span></label>
              <input
                id="invitationEmail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="例：example@mail.com"
                className={`${styles.field} w-full px-4 py-2`}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="invitationTeamId" className={`${styles.label} block text-sm`}>部署（チーム） <span className={styles.required}>*</span></label>
              <select
                id="invitationTeamId"
                value={teamId}
                onChange={(event) => setTeamId(event.target.value ? Number(event.target.value) : '')}
                required
                className={`${styles.field} w-full px-4 py-2`}
              >
                <option value="">部署を選択</option>
                {teams?.map((team: Team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="invitationRole" className={`${styles.label} block text-sm`}>権限 <span className={styles.required}>*</span></label>
              <select
                id="invitationRole"
                value={role}
                onChange={(event) => setRole(event.target.value as Role)}
                required
                className={`${styles.field} w-full px-4 py-2`}
              >
                <option value="employee">スタッフ</option>
                <option value="admin">管理者</option>
              </select>
            </div>

            {errorMessage ? (
              <p className={styles.errorText}>
                {errorMessage}
              </p>
            ) : null}

            <div className="pt-4">
              <button
                type="submit"
                disabled={inviteMutation.isPending}
                className={`${styles.submitButton} w-full py-3`}
              >
                {inviteMutation.isPending ? '送信中...' : '招待メールを送る'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
