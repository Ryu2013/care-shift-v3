import { useEffect, useState } from 'react'
import type { AppearanceStatus, ServiceRecord, ServiceRecordInput, ServiceType } from '../../../types'
import styles from './ServiceRecordFormModal.module.css'

type ServiceRecordTab = 'basic' | 'body' | 'life' | 'note'

interface ServiceRecordFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (values: ServiceRecordInput, submitMode: 'draft' | 'submitted') => Promise<void>
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
): ServiceRecordInput {
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
    toilet_assist: serviceRecord?.toilet_assist ?? false,
    portable_toilet_assist: serviceRecord?.portable_toilet_assist ?? false,
    diaper_change: serviceRecord?.diaper_change ?? false,
    pad_change: serviceRecord?.pad_change ?? false,
    linen_change: serviceRecord?.linen_change ?? false,
    perineal_cleaning: serviceRecord?.perineal_cleaning ?? false,
    urinal_washing: serviceRecord?.urinal_washing ?? false,
    urine_count: serviceRecord?.urine_count ?? null,
    urine_amount: serviceRecord?.urine_amount ?? null,
    stool_count: serviceRecord?.stool_count ?? null,
    stool_status: serviceRecord?.stool_status ?? '',
    posture_support: serviceRecord?.posture_support ?? false,
    meal_assist_full: serviceRecord?.meal_assist_full ?? false,
    meal_assist_partial: serviceRecord?.meal_assist_partial ?? false,
    water_intake: serviceRecord?.water_intake ?? null,
    meal_completed: serviceRecord?.meal_completed ?? false,
    meal_leftover: serviceRecord?.meal_leftover ?? false,
    bathing_assist: serviceRecord?.bathing_assist ?? false,
    shower_bath: serviceRecord?.shower_bath ?? false,
    hair_wash: serviceRecord?.hair_wash ?? false,
    partial_bath_hand: serviceRecord?.partial_bath_hand ?? false,
    partial_bath_foot: serviceRecord?.partial_bath_foot ?? false,
    full_body_cleaning: serviceRecord?.full_body_cleaning ?? false,
    partial_cleaning: serviceRecord?.partial_cleaning ?? false,
    face_wash: serviceRecord?.face_wash ?? false,
    oral_care: serviceRecord?.oral_care ?? false,
    dressing_assist: serviceRecord?.dressing_assist ?? false,
    nail_care: serviceRecord?.nail_care ?? false,
    ear_care: serviceRecord?.ear_care ?? false,
    hair_care: serviceRecord?.hair_care ?? false,
    beard_shave: serviceRecord?.beard_shave ?? false,
    makeup: serviceRecord?.makeup ?? false,
    position_change: serviceRecord?.position_change ?? false,
    transfer_assist: serviceRecord?.transfer_assist ?? false,
    mobility_assist: serviceRecord?.mobility_assist ?? false,
    outing_preparation: serviceRecord?.outing_preparation ?? false,
    outing_accompaniment: serviceRecord?.outing_accompaniment ?? false,
    commute_assist: serviceRecord?.commute_assist ?? false,
    shopping_assist: serviceRecord?.shopping_assist ?? false,
    wake_up_assist: serviceRecord?.wake_up_assist ?? false,
    bedtime_assist: serviceRecord?.bedtime_assist ?? false,
    medication_support: serviceRecord?.medication_support ?? false,
    medication_application: serviceRecord?.medication_application ?? false,
    suction: serviceRecord?.suction ?? false,
    enema: serviceRecord?.enema ?? false,
    tube_feeding: serviceRecord?.tube_feeding ?? false,
    hospital_assist: serviceRecord?.hospital_assist ?? false,
    watch_over: serviceRecord?.watch_over ?? false,
    independence_cleaning_support: serviceRecord?.independence_cleaning_support ?? false,
    independence_laundry_support: serviceRecord?.independence_laundry_support ?? false,
    independence_bed_make_support: serviceRecord?.independence_bed_make_support ?? false,
    independence_clothing_arrangement_support: serviceRecord?.independence_clothing_arrangement_support ?? false,
    independence_cooking_support: serviceRecord?.independence_cooking_support ?? false,
    independence_shopping_support: serviceRecord?.independence_shopping_support ?? false,
    voice_toilet_meal: serviceRecord?.voice_toilet_meal ?? false,
    voice_hygiene: serviceRecord?.voice_hygiene ?? false,
    voice_hospital: serviceRecord?.voice_hospital ?? false,
    voice_sleep: serviceRecord?.voice_sleep ?? false,
    voice_medication: serviceRecord?.voice_medication ?? false,
    cleaning_room: serviceRecord?.cleaning_room ?? false,
    cleaning_toilet: serviceRecord?.cleaning_toilet ?? false,
    cleaning_portable_toilet: serviceRecord?.cleaning_portable_toilet ?? false,
    cleaning_table: serviceRecord?.cleaning_table ?? false,
    cleaning_kitchen: serviceRecord?.cleaning_kitchen ?? false,
    cleaning_bathroom: serviceRecord?.cleaning_bathroom ?? false,
    cleaning_entrance: serviceRecord?.cleaning_entrance ?? false,
    garbage_disposal: serviceRecord?.garbage_disposal ?? false,
    laundry_wash: serviceRecord?.laundry_wash ?? false,
    laundry_dry: serviceRecord?.laundry_dry ?? false,
    laundry_store: serviceRecord?.laundry_store ?? false,
    laundry_iron: serviceRecord?.laundry_iron ?? false,
    bed_make: serviceRecord?.bed_make ?? false,
    sheet_change: serviceRecord?.sheet_change ?? false,
    futon_dry: serviceRecord?.futon_dry ?? false,
    clothing_arrangement: serviceRecord?.clothing_arrangement ?? false,
    clothing_repair: serviceRecord?.clothing_repair ?? false,
    cooking: serviceRecord?.cooking ?? false,
    cooking_preparation: serviceRecord?.cooking_preparation ?? false,
    meal_serving: serviceRecord?.meal_serving ?? false,
    menu_note: serviceRecord?.menu_note ?? '',
    shopping_daily_goods: serviceRecord?.shopping_daily_goods ?? false,
    medicine_pickup: serviceRecord?.medicine_pickup ?? false,
    money_advance: serviceRecord?.money_advance ?? null,
    money_spent: serviceRecord?.money_spent ?? null,
    money_change: serviceRecord?.money_change ?? null,
    shopping_detail: serviceRecord?.shopping_detail ?? '',
    environment_preparation: serviceRecord?.environment_preparation ?? false,
    consultation_support: serviceRecord?.consultation_support ?? false,
    information_collection_and_provision: serviceRecord?.information_collection_and_provision ?? false,
    record_checked: serviceRecord?.record_checked ?? false,
    note: serviceRecord?.note ?? '',
    special_note: serviceRecord?.special_note ?? '',
    instruction_note: serviceRecord?.instruction_note ?? '',
    report_note: serviceRecord?.report_note ?? '',
    image_file: serviceRecord?.image_file ?? '',
    image: null,
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
  const [activeTab, setActiveTab] = useState<ServiceRecordTab>('basic')
  const [values, setValues] = useState<ServiceRecordInput>(
    buildInitialValues(serviceRecord, serviceTypes, shiftId)
  )

  useEffect(() => {
    if (!isOpen) return

    setActiveTab('basic')
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

  function handleBooleanChange(key: keyof ServiceRecordInput, checked: boolean) {
    setValues((current) => ({ ...current, [key]: checked }))
  }

  function renderCheckbox(
    key: keyof ServiceRecordInput,
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
          <div className={styles.tabList}>
            <button
              type="button"
              className={activeTab === 'basic' ? styles.activeTabButton : styles.tabButton}
              onClick={() => setActiveTab('basic')}
            >
              事前
            </button>
            <button
              type="button"
              className={activeTab === 'body' ? styles.activeTabButton : styles.tabButton}
              onClick={() => setActiveTab('body')}
            >
              身体
            </button>
            <button
              type="button"
              className={activeTab === 'life' ? styles.activeTabButton : styles.tabButton}
              onClick={() => setActiveTab('life')}
            >
              生活
            </button>
            <button
              type="button"
              className={activeTab === 'note' ? styles.activeTabButton : styles.tabButton}
              onClick={() => setActiveTab('note')}
            >
              特記
            </button>
          </div>

          {activeTab === 'basic' && (
            <>
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
            </>
          )}

          {activeTab === 'body' && (
            <>
              <div className={styles.section}>
                <h3>身体: 排泄</h3>
                <div className={styles.checkboxGrid}>
                  {renderCheckbox('toilet_assist', 'トイレ介助')}
                  {renderCheckbox('portable_toilet_assist', 'ポータブルトイレ介助')}
                  {renderCheckbox('diaper_change', 'おむつ交換')}
                  {renderCheckbox('pad_change', 'パッド交換')}
                  {renderCheckbox('linen_change', 'リネン等交換')}
                  {renderCheckbox('perineal_cleaning', '陰部清潔介助')}
                  {renderCheckbox('urinal_washing', '尿器洗浄')}
                </div>
                <div className={styles.grid}>
                  <label className={styles.field}>
                    <span>排尿回数</span>
                    <input
                      type="number"
                      value={values.urine_count ?? ''}
                      onChange={(event) => {
                        setValues((current) => ({ ...current, urine_count: parseOptionalNumber(event.target.value) }))
                      }}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>排尿量（cc）</span>
                    <input
                      type="number"
                      value={values.urine_amount ?? ''}
                      onChange={(event) => {
                        setValues((current) => ({ ...current, urine_amount: parseOptionalNumber(event.target.value) }))
                      }}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>排便回数</span>
                    <input
                      type="number"
                      value={values.stool_count ?? ''}
                      onChange={(event) => {
                        setValues((current) => ({ ...current, stool_count: parseOptionalNumber(event.target.value) }))
                      }}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>排便状態</span>
                    <input
                      type="text"
                      value={values.stool_status ?? ''}
                      onChange={(event) => {
                        setValues((current) => ({ ...current, stool_status: event.target.value }))
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className={styles.section}>
                <h3>身体: 食事</h3>
                <div className={styles.checkboxGrid}>
                  {renderCheckbox('posture_support', '姿勢の確保')}
                  {renderCheckbox('meal_assist_full', '食事介助（全介助）')}
                  {renderCheckbox('meal_assist_partial', '食事介助（一部介助）')}
                  {renderCheckbox('meal_completed', '食事完食')}
                  {renderCheckbox('meal_leftover', '食事残しあり')}
                </div>
                <div className={styles.grid}>
                  <label className={styles.field}>
                    <span>水分補給量（cc）</span>
                    <input
                      type="number"
                      value={values.water_intake ?? ''}
                      onChange={(event) => {
                        setValues((current) => ({ ...current, water_intake: parseOptionalNumber(event.target.value) }))
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className={styles.section}>
                <h3>身体: 入浴・清拭</h3>
                <div className={styles.checkboxGrid}>
                  {renderCheckbox('bathing_assist', '入浴介助')}
                  {renderCheckbox('shower_bath', 'シャワー浴')}
                  {renderCheckbox('hair_wash', '洗髪')}
                  {renderCheckbox('partial_bath_hand', '部分浴（手）')}
                  {renderCheckbox('partial_bath_foot', '部分浴（足）')}
                  {renderCheckbox('full_body_cleaning', '清拭（全身）')}
                  {renderCheckbox('partial_cleaning', '清拭（部分）')}
                </div>
              </div>

              <div className={styles.section}>
                <h3>身体: 身体整容</h3>
                <div className={styles.checkboxGrid}>
                  {renderCheckbox('face_wash', '洗面')}
                  {renderCheckbox('oral_care', '口腔ケア')}
                  {renderCheckbox('dressing_assist', '更衣介助')}
                  {renderCheckbox('nail_care', '整容（爪）')}
                  {renderCheckbox('ear_care', '整容（耳）')}
                  {renderCheckbox('hair_care', '整容（髪）')}
                  {renderCheckbox('beard_shave', '整容（髭）')}
                  {renderCheckbox('makeup', '整容（化粧）')}
                </div>
              </div>

              <div className={styles.section}>
                <h3>身体: 移動</h3>
                <div className={styles.checkboxGrid}>
                  {renderCheckbox('position_change', '体位変換')}
                  {renderCheckbox('transfer_assist', '移乗介助')}
                  {renderCheckbox('mobility_assist', '移動介助')}
                  {renderCheckbox('outing_preparation', '外出準備介助')}
                  {renderCheckbox('outing_accompaniment', '外出受入介助')}
                  {renderCheckbox('commute_assist', '通院介助')}
                  {renderCheckbox('shopping_assist', '買物介助')}
                </div>
              </div>

              <div className={styles.section}>
                <h3>身体: 起床・就寝</h3>
                <div className={styles.checkboxGrid}>
                  {renderCheckbox('wake_up_assist', '起床介助')}
                  {renderCheckbox('bedtime_assist', '就寝介助')}
                </div>
              </div>

              <div className={styles.section}>
                <h3>身体: 服薬・医療</h3>
                <div className={styles.checkboxGrid}>
                  {renderCheckbox('medication_support', '服薬介助・確認')}
                  {renderCheckbox('medication_application', '薬の塗布')}
                  {renderCheckbox('suction', '痰の吸引')}
                  {renderCheckbox('enema', '浣腸')}
                  {renderCheckbox('tube_feeding', '経管栄養')}
                  {renderCheckbox('hospital_assist', '院内介助')}
                  {renderCheckbox('watch_over', '見守り')}
                </div>
              </div>

              <div className={styles.section}>
                <h3>身体: 自立支援</h3>
                <div className={styles.checkboxGrid}>
                  {renderCheckbox('independence_cleaning_support', '自立支援（掃除）')}
                  {renderCheckbox('independence_laundry_support', '自立支援（洗濯）')}
                  {renderCheckbox('independence_bed_make_support', '自立支援（ベッドメイク）')}
                  {renderCheckbox('independence_clothing_arrangement_support', '自立支援（衣類整理）')}
                  {renderCheckbox('independence_cooking_support', '自立支援（調理）')}
                  {renderCheckbox('independence_shopping_support', '自立支援（買い物）')}
                </div>
              </div>

              <div className={styles.section}>
                <h3>身体: 声掛け・見守り</h3>
                <div className={styles.checkboxGrid}>
                  {renderCheckbox('voice_toilet_meal', '声掛け（排泄・食事）')}
                  {renderCheckbox('voice_hygiene', '声掛け（清拭・入浴・整容）')}
                  {renderCheckbox('voice_hospital', '声掛け（通院・外出）')}
                  {renderCheckbox('voice_sleep', '声掛け（起床・就寝）')}
                  {renderCheckbox('voice_medication', '声掛け（服薬）')}
                </div>
              </div>
            </>
          )}

          {activeTab === 'life' && (
            <>
              <div className={styles.section}>
                <h3>生活: 清掃</h3>
                <div className={styles.checkboxGrid}>
                  {renderCheckbox('cleaning_room', '清掃（居室）')}
                  {renderCheckbox('cleaning_toilet', '清掃（トイレ）')}
                  {renderCheckbox('cleaning_portable_toilet', '清掃（ポータブルトイレ）')}
                  {renderCheckbox('cleaning_table', '清掃（卓上）')}
                  {renderCheckbox('cleaning_kitchen', '清掃（台所）')}
                  {renderCheckbox('cleaning_bathroom', '清掃（浴室）')}
                  {renderCheckbox('cleaning_entrance', '清掃（玄関）')}
                  {renderCheckbox('garbage_disposal', 'ゴミ出し')}
                </div>
              </div>

              <div className={styles.section}>
                <h3>生活: 洗濯</h3>
                <div className={styles.checkboxGrid}>
                  {renderCheckbox('laundry_wash', '洗濯（洗う）')}
                  {renderCheckbox('laundry_dry', '洗濯（乾燥・物干し）')}
                  {renderCheckbox('laundry_store', '洗濯（取入れ・収納）')}
                  {renderCheckbox('laundry_iron', '洗濯（アイロン）')}
                </div>
              </div>

              <div className={styles.section}>
                <h3>生活: 衣類・寝具</h3>
                <div className={styles.checkboxGrid}>
                  {renderCheckbox('bed_make', 'ベッドメイク')}
                  {renderCheckbox('sheet_change', 'シーツ・カバー交換')}
                  {renderCheckbox('futon_dry', '布団干し')}
                  {renderCheckbox('clothing_arrangement', '衣類の整理')}
                  {renderCheckbox('clothing_repair', '被服の補修')}
                </div>
              </div>

              <div className={styles.section}>
                <h3>生活: 調理</h3>
                <div className={styles.checkboxGrid}>
                  {renderCheckbox('cooking', '調理')}
                  {renderCheckbox('cooking_preparation', '下拵え')}
                  {renderCheckbox('meal_serving', '配膳・下膳')}
                </div>
                <label className={styles.field}>
                  <span>献立・調理内容</span>
                  <textarea
                    rows={4}
                    value={values.menu_note ?? ''}
                    onChange={(event) => {
                      setValues((current) => ({ ...current, menu_note: event.target.value }))
                    }}
                  />
                </label>
              </div>

              <div className={styles.section}>
                <h3>生活: 買物等</h3>
                <div className={styles.checkboxGrid}>
                  {renderCheckbox('shopping_daily_goods', '日用品等の買物')}
                  {renderCheckbox('medicine_pickup', '薬の受取り')}
                </div>
                <div className={styles.grid}>
                  <label className={styles.field}>
                    <span>預り金額（円）</span>
                    <input
                      type="number"
                      value={values.money_advance ?? ''}
                      onChange={(event) => {
                        setValues((current) => ({ ...current, money_advance: parseOptionalNumber(event.target.value) }))
                      }}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>購入金額（円）</span>
                    <input
                      type="number"
                      value={values.money_spent ?? ''}
                      onChange={(event) => {
                        setValues((current) => ({ ...current, money_spent: parseOptionalNumber(event.target.value) }))
                      }}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>お釣り（円）</span>
                    <input
                      type="number"
                      value={values.money_change ?? ''}
                      onChange={(event) => {
                        setValues((current) => ({ ...current, money_change: parseOptionalNumber(event.target.value) }))
                      }}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>内訳</span>
                    <textarea
                      rows={4}
                      value={values.shopping_detail ?? ''}
                      onChange={(event) => {
                        setValues((current) => ({ ...current, shopping_detail: event.target.value }))
                      }}
                    />
                  </label>
                </div>
              </div>
            </>
          )}

          {activeTab === 'note' && (
            <>
              <label className={styles.field}>
                <span>特記事項</span>
                <textarea
                  rows={5}
                  value={values.special_note ?? ''}
                  onChange={(event) => {
                    setValues((current) => ({ ...current, special_note: event.target.value }))
                  }}
                />
              </label>

              <label className={styles.field}>
                <span>指示</span>
                <textarea
                  rows={4}
                  value={values.instruction_note ?? ''}
                  onChange={(event) => {
                    setValues((current) => ({ ...current, instruction_note: event.target.value }))
                  }}
                />
              </label>

              <label className={styles.field}>
                <span>報告</span>
                <textarea
                  rows={4}
                  value={values.report_note ?? ''}
                  onChange={(event) => {
                    setValues((current) => ({ ...current, report_note: event.target.value }))
                  }}
                />
              </label>

              <label className={styles.field}>
                <span>添付画像</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null
                    setValues((current) => ({
                      ...current,
                      image: file,
                      image_file: file?.name ?? current.image_file
                    }))
                  }}
                />
              </label>

              {(values.image_file || serviceRecord?.image_url) && (
                <div className={styles.imageMeta}>
                  <span>保存ファイル: {values.image_file || '未設定'}</span>
                  {serviceRecord?.image_url && (
                    <a href={serviceRecord.image_url} target="_blank" rel="noreferrer">
                      画像を確認
                    </a>
                  )}
                </div>
              )}

              <label className={styles.field}>
                <span>補足備考</span>
                <textarea
                  rows={5}
                  value={values.note ?? ''}
                  onChange={(event) => {
                    setValues((current) => ({ ...current, note: event.target.value }))
                  }}
                />
              </label>
            </>
          )}

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
