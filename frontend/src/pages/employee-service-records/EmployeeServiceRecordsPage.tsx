import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Header } from '../../components/Header'
import { getUserShifts } from '../../api/shifts'
import { createEmployeeServiceRecord, getEmployeeServiceRecords, updateEmployeeServiceRecord } from '../../api/service_records'
import { getOfficeServiceTypes } from '../../api/service_types'
import type { ServiceRecord, Shift } from '../../types'
import ServiceRecordFormModal, { type ServiceRecordFormValues } from '../service-records/components/ServiceRecordFormModal'
import styles from './EmployeeServiceRecordsPage.module.css'

function toMonthValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function buildShiftLabelFromShift(shift: Shift) {
  return `${shift.date} ${shift.start_time} - ${shift.end_time} / ${shift.client?.name ?? '利用者未設定'}`
}

function buildSubmitTimestamp(submitMode: 'draft' | 'submitted', currentSubmittedAt: string | null) {
  if (submitMode === 'submitted') return new Date().toISOString()
  return currentSubmittedAt
}

export default function EmployeeServiceRecordsPage() {
  const queryClient = useQueryClient()
  const [month, setMonth] = useState(toMonthValue(new Date()))
  const [selectedShift, setSelectedShift] = useState<Shift | undefined>(undefined)
  const [selectedRecord, setSelectedRecord] = useState<ServiceRecord | undefined>(undefined)

  const shiftsQuery = useQuery({
    queryKey: ['employee-shifts-for-records', month],
    queryFn: () => getUserShifts({ date: month }).then((response) => response.data)
  })

  const recordsQuery = useQuery({
    queryKey: ['employee-service-records', month],
    queryFn: () => getEmployeeServiceRecords({ date: month }).then((response) => response.data)
  })

  const serviceTypesQuery = useQuery({
    queryKey: ['office-service-types'],
    queryFn: () => getOfficeServiceTypes().then((response) => response.data)
  })

  const createMutation = useMutation({
    mutationFn: createEmployeeServiceRecord,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['employee-service-records'] })
      setSelectedShift(undefined)
      setSelectedRecord(undefined)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: Partial<ServiceRecordFormValues> }) =>
      updateEmployeeServiceRecord(id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['employee-service-records'] })
      setSelectedShift(undefined)
      setSelectedRecord(undefined)
    }
  })

  const recordsByShiftId = useMemo(() => {
    const map = new Map<number, ServiceRecord>()
    const items = recordsQuery.data ?? []

    for (let index = 0; index < items.length; index += 1) {
      map.set(items[index].shift_id, items[index])
    }

    return map
  }, [recordsQuery.data])

  const shiftCards = useMemo(() => {
    return (shiftsQuery.data ?? []).map((shift) => ({
      shift,
      record: recordsByShiftId.get(shift.id)
    }))
  }, [recordsByShiftId, shiftsQuery.data])

  async function handleSave(values: ServiceRecordFormValues, submitMode: 'draft' | 'submitted') {
    const payload = {
      ...values,
      note: values.note === '' ? null : values.note,
      submitted_at: buildSubmitTimestamp(submitMode, selectedRecord?.submitted_at ?? null)
    }

    if (selectedRecord) {
      await updateMutation.mutateAsync({ id: selectedRecord.id, values: payload })
      return
    }

    await createMutation.mutateAsync(payload as Required<ServiceRecordFormValues>)
  }

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.content}>
        <section className={styles.hero}>
          <div>
            <h1>訪問記録</h1>
            <p>自分のシフトごとに訪問記録を作成し、必要に応じて提出します。</p>
          </div>

          <label className={styles.monthField}>
            <span>対象月</span>
            <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          </label>
        </section>

        <section className={styles.listSection}>
          {shiftsQuery.isLoading || recordsQuery.isLoading ? (
            <p className={styles.emptyText}>読み込み中...</p>
          ) : shiftCards.length === 0 ? (
            <p className={styles.emptyText}>この月のシフトがありません。</p>
          ) : (
            <div className={styles.cardList}>
              {shiftCards.map(({ shift, record }) => (
                <article key={shift.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h2>{shift.client?.name ?? '利用者未設定'}</h2>
                      <p>{shift.date} {shift.start_time} - {shift.end_time}</p>
                    </div>
                    <span className={record?.submitted_at ? styles.submittedBadge : styles.draftBadge}>
                      {record ? (record.submitted_at ? '提出済み' : '下書き保存') : '未作成'}
                    </span>
                  </div>

                  <div className={styles.metaRow}>
                    <div>
                      <span>勤務状態</span>
                      <strong>{shift.work_status === 'work' ? '出勤済み' : '未出勤'}</strong>
                    </div>
                    <div>
                      <span>サービス種別</span>
                      <strong>{record?.service_type.name ?? '未選択'}</strong>
                    </div>
                  </div>

                  <p className={styles.noteText}>{record?.note || '備考なし'}</p>

                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedShift(shift)
                        setSelectedRecord(record)
                      }}
                    >
                      {record ? '記録を編集' : '記録を作成'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <ServiceRecordFormModal
        isOpen={selectedShift !== undefined}
        onClose={() => {
          setSelectedShift(undefined)
          setSelectedRecord(undefined)
        }}
        onSave={handleSave}
        serviceTypes={serviceTypesQuery.data ?? []}
        serviceRecord={selectedRecord}
        shiftId={selectedShift?.id}
        shiftLabel={selectedShift ? buildShiftLabelFromShift(selectedShift) : ''}
        allowSubmitActions
        pending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
