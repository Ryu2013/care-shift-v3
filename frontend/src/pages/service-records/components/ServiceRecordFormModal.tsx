import { useEffect, useState } from 'react'
import type { AppearanceStatus, ServiceRecord, ServiceType } from '../../../types'
import styles from './ServiceRecordFormModal.module.css'

export interface ServiceRecordFormValues {
  shift_id?: number
  service_type_id: number
  is_first_visit: boolean
  is_emergency: boolean
  schedule_changed: boolean
  appearance_status: AppearanceStatus
  has_sweating: boolean
  body_temperature: number | null
  systolic_bp: number | null
  diastolic_bp: number | null
  environment_preparation: boolean
  consultation_support: boolean
  information_collection_and_provision: boolean
  record_checked: boolean
  note: string | null
  submitted_at: string | null
}

interface ServiceRecordFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (values: ServiceRecordFormValues, submitMode: 'draft' | 'submitted') => Promise<void>
  serviceTypes: ServiceType[]
  serviceRecord?: ServiceRecord
  shiftLabel: string
  allowSubmitActions?: boolean
  pending?: boolean
  shiftId?: number
}

function buildInitialValues(
  serviceRecord: ServiceRecord | undefined,
  serviceTypes: ServiceType[],
  shiftId: number | undefined
): ServiceRecordFormValues {
  return {
    shift_id: shiftId,
    service_type_id: serviceRecord?.service_type_id ?? serviceTypes[0]?.id ?? 0,
    is_first_visit: serviceRecord?.is_first_visit ?? false,
    is_emergency: serviceRecord?.is_emergency ?? false,
    schedule_changed: serviceRecord?.schedule_changed ?? false,
    appearance_status: serviceRecord?.appearance_status ?? 'good',
    has_sweating: serviceRecord?.has_sweating ?? false,
    body_temperature: serviceRecord?.body_temperature ?? null,
    systolic_bp: serviceRecord?.systolic_bp ?? null,
    diastolic_bp: serviceRecord?.diastolic_bp ?? null,
    environment_preparation: serviceRecord?.environment_preparation ?? false,
    consultation_support: serviceRecord?.consultation_support ?? false,
    information_collection_and_provision: serviceRecord?.information_collection_and_provision ?? false,
    record_checked: serviceRecord?.record_checked ?? false,
    note: serviceRecord?.note ?? '',
    submitted_at: serviceRecord?.submitted_at ?? null
  }
}

function parseOptionalNumber(value: string) {
  if (value === '') return null

  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export default function ServiceRecordFormModal({
  isOpen,
  onClose,
  onSave,
  serviceTypes,
  serviceRecord,
  shiftLabel,
  allowSubmitActions = false,
  pending = false,
  shiftId,
}: ServiceRecordFormModalProps) {
  const [values, setValues] = useState<ServiceRecordFormValues>(
    buildInitialValues(serviceRecord, serviceTypes, shiftId)
  )

  useEffect(() => {
    if (!isOpen) return

    setValues(buildInitialValues(serviceRecord, serviceTypes, shiftId))
  }, [isOpen, serviceRecord, serviceTypes, shiftId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>, submitMode: 'draft' | 'submitted') {
    event.preventDefault()

    if (!values.service_type_id) {
      alert('サービス種別を選択してください')
      return
    }

    await onSave(values, submitMode)
  }

  function handleBooleanChange(key: keyof ServiceRecordFormValues, checked: boolean) {
    setValues((current) => ({ ...current, [key]: checked }))
  }

  function renderCheckbox(
    key: keyof ServiceRecordFormValues,
    label: string
  ) {
    return (
      <label className={styles.checkboxItem}>
        <input
          type="checkbox"
          checked={Boolean(values[key])}
          onChange={(event) => handleBooleanChange(key, event.target.checked)}
        />
        <span>{label}</span>
      </label>
    )
  }

  if (!isOpen) return null

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{serviceRecord ? '訪問記録を編集' : '訪問記録を作成'}</h2>
            <p className={styles.subtitle}>{shiftLabel}</p>
          </div>
          <button type="button" onClick={onClose} className={styles.closeButton}>閉じる</button>
        </div>

        <form className={styles.form} onSubmit={(event) => handleSubmit(event, 'draft')}>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span>サービス種別</span>
              <select
                value={values.service_type_id}
                onChange={(event) => {
                  setValues((current) => ({ ...current, service_type_id: Number(event.target.value) }))
                }}
              >
                <option value={0}>選択してください</option>
                {serviceTypes.map((serviceType) => (
                  <option key={serviceType.id} value={serviceType.id}>
                    {serviceType.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>顔色</span>
              <select
                value={values.appearance_status}
                onChange={(event) => {
                  setValues((current) => ({ ...current, appearance_status: event.target.value as AppearanceStatus }))
                }}
              >
                <option value="good">良</option>
                <option value="poor">不良</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>体温（℃）</span>
              <input
                type="number"
                step="0.1"
                value={values.body_temperature ?? ''}
                onChange={(event) => {
                  setValues((current) => ({ ...current, body_temperature: parseOptionalNumber(event.target.value) }))
                }}
              />
            </label>

            <label className={styles.field}>
              <span>血圧（上）</span>
              <input
                type="number"
                value={values.systolic_bp ?? ''}
                onChange={(event) => {
                  setValues((current) => ({ ...current, systolic_bp: parseOptionalNumber(event.target.value) }))
                }}
              />
            </label>

            <label className={styles.field}>
              <span>血圧（下）</span>
              <input
                type="number"
                value={values.diastolic_bp ?? ''}
                onChange={(event) => {
                  setValues((current) => ({ ...current, diastolic_bp: parseOptionalNumber(event.target.value) }))
                }}
              />
            </label>
          </div>

          <div className={styles.section}>
            <h3>加算・状態</h3>
            <div className={styles.checkboxGrid}>
              {renderCheckbox('is_first_visit', '特定加算（初回）')}
              {renderCheckbox('is_emergency', '特定加算（緊急）')}
              {renderCheckbox('schedule_changed', '予定変更あり')}
              {renderCheckbox('has_sweating', '発汗あり')}
            </div>
          </div>

          <div className={styles.section}>
            <h3>実施項目</h3>
            <div className={styles.checkboxGrid}>
              {renderCheckbox('environment_preparation', '環境整備')}
              {renderCheckbox('consultation_support', '相談援助')}
              {renderCheckbox('information_collection_and_provision', '情報収集・提供')}
              {renderCheckbox('record_checked', '記録実施')}
            </div>
          </div>

          <label className={styles.field}>
            <span>特記事項・備考</span>
            <textarea
              rows={5}
              value={values.note ?? ''}
              onChange={(event) => {
                setValues((current) => ({ ...current, note: event.target.value }))
              }}
            />
          </label>

          <div className={styles.footer}>
            {serviceRecord?.submitted_at ? (
              <span className={styles.submittedBadge}>提出済み</span>
            ) : (
              <span className={styles.draftBadge}>下書き</span>
            )}

            <div className={styles.actions}>
              <button type="submit" className={styles.secondaryButton} disabled={pending}>
                {pending ? '保存中...' : '保存'}
              </button>
              {allowSubmitActions && (
                <button
                  type="button"
                  className={styles.primaryButton}
                  disabled={pending}
                  onClick={async (event) => {
                    await handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>, 'submitted')
                  }}
                >
                  {pending ? '提出中...' : '提出する'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
