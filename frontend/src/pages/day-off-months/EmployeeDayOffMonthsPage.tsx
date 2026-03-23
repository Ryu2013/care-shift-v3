import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Header } from '../../components/Header'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { getEmployeeDayOffMonth, saveEmployeeDayOffMonth } from '../../api/day-off-months'
import styles from './EmployeeDayOffMonthsPage.module.css'

const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土']
type CalendarCell = { type: 'empty' } | { type: 'day'; date: Date; dateString: string }

function toMonthValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

function toDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDateLabel(dateString: string) {
  return new Intl.DateTimeFormat('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' }).format(new Date(dateString))
}

function buildCalendarCells(monthDate: Date): CalendarCell[] {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
  const leadingEmptyDays = firstDay.getDay()
  const dayCells: CalendarCell[] = []

  for (let index = 0; index < leadingEmptyDays; index += 1) {
    dayCells.push({ type: 'empty' })
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
    dayCells.push({ type: 'day', date, dateString: toDateString(date) })
  }

  return dayCells
}

function isDeadlinePassed(deadlineDate: string | undefined) {
  if (!deadlineDate) return false

  return new Date(deadlineDate) < new Date(new Date().toDateString())
}

function getSaveErrorMessage(error: any) {
  return error?.response?.data?.errors?.[0] ?? '希望休の保存に失敗しました。'
}

export default function EmployeeDayOffMonthsPage() {
  const queryClient = useQueryClient()
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser()
  const [monthValue, setMonthValue] = useState(toMonthValue(new Date()))
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['employee-day-off-month', monthValue],
    queryFn: () => getEmployeeDayOffMonth(monthValue).then((res) => res.data),
    enabled: !!currentUser
  })

  useEffect(() => {
    setSelectedDates(data?.day_off_month?.request_dates ?? [])
  }, [data?.day_off_month?.request_dates])

  const saveMutation = useMutation({
    mutationFn: () => saveEmployeeDayOffMonth(monthValue, selectedDates),
    onSuccess: async () => {
      setErrorMessage('')
      await queryClient.invalidateQueries({ queryKey: ['employee-day-off-month', monthValue] })
    },
    onError: (error: any) => {
      setErrorMessage(getSaveErrorMessage(error))
    }
  })

  const monthDate = useMemo(() => new Date(`${monthValue}-01T00:00:00`), [monthValue])
  const daysInMonth = useMemo(() => buildCalendarCells(monthDate), [monthDate])

  const isPastDeadline = isDeadlinePassed(data?.deadline_date)
  const limit = data?.office.monthly_day_off_limit ?? 0

  const toggleDate = (dateString: string) => {
    setErrorMessage('')
    setSelectedDates((current) => {
      if (current.includes(dateString)) {
        return current.filter((date) => date !== dateString)
      }
      if (current.length >= limit) {
        setErrorMessage(`希望休は月${limit}日までです`)
        return current
      }
      return [...current, dateString].sort()
    })
  }

  if (isLoadingUser) return null
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role === 'admin') return <Navigate to="/admin-day-off-months" replace />

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.content}>
        <div className={styles.heroCard}>
          <div className={styles.heroHeader}>
            <div>
              <p className={styles.eyebrow}>DAY OFF</p>
              <h1 className={styles.pageTitle}>希望休提出</h1>
              <p className={styles.pageDescription}>月ごとの希望休日を選択して提出します。</p>
            </div>
            <div className={styles.monthControl}>
              <label htmlFor="targetMonth" className={styles.fieldLabel}>対象月</label>
              <input
                id="targetMonth"
                type="month"
                value={monthValue}
                onChange={(e) => setMonthValue(e.target.value)}
                className={styles.monthInput}
              />
            </div>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.pillRow}>
                <span className={`${styles.pill} ${styles.pillActive}`}>選択中 {selectedDates.length} / {limit}日</span>
                <span className={`${styles.pill} ${styles.pillWarning}`}>提出期限 {data?.deadline_date ?? '--'}</span>
              </div>
              <p className={styles.summaryText}>
                {data?.day_off_month?.submitted_at
                  ? `最終提出: ${new Date(data.day_off_month.submitted_at).toLocaleString('ja-JP')}`
                  : 'まだ提出されていません。'}
              </p>
            </div>

            <div className={styles.summaryCard}>
              <p className={styles.cardHeading}>選択した日付</p>
              <div className={styles.selectedList}>
                {selectedDates.length > 0 ? selectedDates.map((date) => (
                  <span key={date} className={styles.selectedChip}>{formatDateLabel(date)}</span>
                )) : <span className={styles.emptyText}>まだ選択されていません</span>}
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className={styles.errorBox}>
              {errorMessage}
            </div>
          )}

          <div className={styles.calendarCard}>
            <div className={styles.calendarGrid}>
              {weekdayLabels.map((label) => (
                <div key={label} className={styles.weekday}>{label}</div>
              ))}
              {daysInMonth.map((cell, index) => {
                if (cell.type === 'empty') {
                  return <div key={`empty-${index}`} className={styles.dayCellEmpty} />
                }

                const isSelected = selectedDates.includes(cell.dateString)
                const isDisabled = !isSelected && selectedDates.length >= limit

                return (
                  <button
                    key={cell.dateString}
                    type="button"
                    disabled={isDisabled || isPastDeadline || isLoading}
                    onClick={() => toggleDate(cell.dateString)}
                    className={`${styles.dayCell} ${isSelected ? styles.daySelected : ''} ${isDisabled ? styles.dayOverLimit : ''}`}
                  >
                    <div className={styles.dayWeekLabel}>{weekdayLabels[cell.date.getDay()]}</div>
                    <div className={styles.dayNumber}>{cell.date.getDate()}</div>
                    <div className={styles.dayActionLabel}>{isSelected ? '選択中' : '選択する'}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || isLoading || isPastDeadline}
              className={styles.submitButton}
            >
              {saveMutation.isPending ? '提出中...' : '希望休を提出する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
