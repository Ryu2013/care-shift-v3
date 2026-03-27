import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { getUserShifts, updateUserShiftStatus } from '../../api/shifts'
import { createEmployeeServiceRecord, getEmployeeServiceRecords, updateEmployeeServiceRecord } from '../../api/service_records'
import { getOfficeServiceTypes } from '../../api/service_types'
import { getOfficeUsers } from '../../api/users'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { ServiceRecord, ServiceRecordInput, Shift, User } from '../../types'
import ServiceRecordFormModal from '../service-records/components/ServiceRecordFormModal'
import { Header } from '../../components/Header'
import styles from './UserShiftsPage.module.css'

function toMonthValue(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function buildShiftLabel(shift: Shift) {
    return `${shift.date} ${shift.start_time} - ${shift.end_time} / ${shift.client?.name || '利用者未定'}`
}

export default function UserShiftsPage() {
    const queryClient = useQueryClient()
    const { data: currentUser } = useCurrentUser()
    const [searchParams] = useSearchParams()
    const userIdParam = searchParams.get('user_id')
    const targetUserId = userIdParam ? Number(userIdParam) : currentUser?.id

    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedShiftForRecord, setSelectedShiftForRecord] = useState<Shift | undefined>(undefined)
    const [selectedServiceRecord, setSelectedServiceRecord] = useState<ServiceRecord | undefined>(undefined)
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const currentMonthValue = toMonthValue(new Date())

    const { data: users } = useQuery({
        queryKey: ['officeUsers'],
        queryFn: () => getOfficeUsers().then((res: { data: User[] }) => res.data),
    })

    const { data: shifts, isLoading } = useQuery({
        queryKey: ['user-shifts', year, month, targetUserId],
        queryFn: () => getUserShifts({ user_id: targetUserId }).then((r: { data: Shift[] }) => r.data),
        enabled: !!targetUserId
    })

    const { data: serviceTypes } = useQuery({
        queryKey: ['office-service-types'],
        queryFn: () => getOfficeServiceTypes().then((res) => res.data),
        enabled: !!targetUserId
    })

    const { data: serviceRecords } = useQuery({
        queryKey: ['employee-service-records', currentMonthValue],
        queryFn: () => getEmployeeServiceRecords({ date: currentMonthValue }).then((res) => res.data),
        enabled: !!targetUserId
    })

    const mutation = useMutation({
        mutationFn: ({ id, work_status }: { id: number, work_status: string }) => updateUserShiftStatus(id, work_status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-shifts', year, month, targetUserId] })
        }
    })

    const saveServiceRecordMutation = useMutation({
        mutationFn: async ({ values, submitMode }: { values: ServiceRecordInput, submitMode: 'draft' | 'submitted' }) => {
            const payload = {
                ...values,
                note: values.note === '' ? null : values.note,
                submitted_at: submitMode === 'submitted'
                    ? new Date().toISOString()
                    : selectedServiceRecord?.submitted_at ?? null
            }

            if (selectedServiceRecord) {
                return updateEmployeeServiceRecord(selectedServiceRecord.id, payload)
            }

            return createEmployeeServiceRecord(payload)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['employee-service-records', currentMonthValue] })
            setSelectedShiftForRecord(undefined)
            setSelectedServiceRecord(undefined)
        }
    })

    const handleToggleWorkStatus = (shiftId: number) => {
        mutation.mutate({ id: shiftId, work_status: 'work' })
    }

    const serviceRecordByShiftId = useMemo(() => {
        const map = new Map<number, ServiceRecord>()
        if (!serviceRecords) return map

        for (let index = 0; index < serviceRecords.length; index += 1) {
            map.set(serviceRecords[index].shift_id, serviceRecords[index])
        }

        return map
    }, [serviceRecords])

    // ユーザー情報を特定
    const targetUser = users?.find(u => u.id === targetUserId)

    // 今日のシフトを抽出 (YYYY-MM-DD 文字列による比較)
    const todayStr = new Date().toLocaleDateString('ja-JP').split('/').map((s, i) => i > 0 ? s.padStart(2, '0') : s).join('-')
    const todaysShifts = useMemo(() => {
        if (!shifts) return []
        return shifts.filter((s: Shift) => s.date === todayStr)
    }, [shifts, todayStr])

    // FullCalendar 用のイベント配列を生成
    const calendarEvents = useMemo(() => {
        if (!shifts) return []

        return shifts.map((shift: Shift) => {
            const clientName = shift.client?.name || "利用者未定"
            const startTimeStr = shift.start_time
            const endTimeStr = shift.end_time
            const title = clientName
            const isWorking = shift.work_status === 'work' || String(shift.work_status) === '1'

            let bgColor = '#F19494' // day default
            let borderColor = '#E35B5B'
            let textColor = '#333333'

            if (shift.client_id === null) {
                bgColor = '#E0E0E0'
                borderColor = '#A0A0A0'
            } else if (shift.is_escort || shift.shift_type === 'escort') {
                bgColor = '#C8F7C5'
                borderColor = '#4CAF50'
            } else if (shift.shift_type === 'night') {
                bgColor = '#B4E2FF'
                borderColor = '#69C5FF'
            }

            return {
                id: shift.id.toString(),
                title: title,
                start: shift.date,
                allDay: true,
                backgroundColor: bgColor,
                borderColor: borderColor,
                textColor: textColor,
                extendedProps: { shift, startTimeStr, endTimeStr, isWorking }
            }
        })
    }, [shifts])

    return (
        <div className="min-h-[100vh]">
            <Header />

            <div className={`${styles.content} p-4 pt-20 mx-auto max-w-7xl`}>
                <div className={`${styles.summaryCard} p-4 mb-4 flex flex-col md:flex-row items-center justify-between gap-4`}>
                    <div className="flex items-center gap-4">
                        <h2 className={`${styles.heading} text-xl`}>
                            {targetUser ? `${targetUser.name} さんのシフト` : (isLoading ? '読み込み中...' : 'ユーザーが指定されていません')}
                        </h2>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-3">
                        <div className={`${styles.legendItem} ${styles.legendDay} px-3 py-1.5 text-xm border-l-4`}>日勤</div>
                        <div className={`${styles.legendItem} ${styles.legendNight} px-3 py-1.5 text-xm border-l-4`}>夜勤</div>
                        <div className={`${styles.legendItem} ${styles.legendEscort} px-3 py-1.5 text-xm border-l-4`}>同行</div>
                        <div className={`${styles.legendItem} ${styles.legendUnassigned} px-3 py-1.5 text-xm border-l-4`}>未配置</div>
                    </div>
                </div>

                {/* 本日のシフトステータス切り替えエリア */}
                {todaysShifts.length > 0 && (
                    <div className={`${styles.todayPanel} mb-4 p-4 flex flex-col gap-3`}>
                        <h3 className={`${styles.heading} flex items-center gap-2`}>
                            <svg className={`${styles.todayIcon} w-5 h-5`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            本日のシフト
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {todaysShifts.map(shift => {
                                const isWorking = shift.work_status === 'work' || String(shift.work_status) === '1'
                                const startTimeStr = shift.start_time
                                const endTimeStr = shift.end_time
                                const serviceRecord = serviceRecordByShiftId.get(shift.id)
                                return (
                                    <div key={shift.id} className={`${styles.shiftCard} flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3`}>
                                        <div>
                                            <div className={`${styles.shiftClientName} text-sm`}>
                                                {shift.client?.name || '利用者未定'}
                                            </div>
                                            <div className={`${styles.shiftTime} text-xs font-mono`}>
                                                {startTimeStr} - {endTimeStr}
                                            </div>
                                            <div className={`${styles.shiftTime} text-xs mt-1`}>
                                                {serviceRecord
                                                    ? serviceRecord.submitted_at ? '訪問記録: 提出済み' : '訪問記録: 下書きあり'
                                                    : '訪問記録: 未作成'}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {shift.client?.latitude && shift.client?.longitude && (
                                                <a
                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${shift.client.latitude},${shift.client.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`${styles.routeButton} px-4 py-2 text-sm flex items-center justify-center gap-2`}
                                                >
                                                    <svg className="w-4 h-4 ml-0.5" viewBox="0 0 34 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M17 0C7.6 0 0 7.6 0 17C0 27.6 14.9 46.3 15.6 47.1C16.3 48.2 17.7 48.2 18.5 47.1C19.1 46.3 34 27.6 34 17C34 7.6 26.4 0 17 0Z" fill="#34A853" />
                                                        <path d="M17 0C7.6 0 0 7.6 0 17C0 19.4 0.5 21.7 1.4 23.8L17 12V0Z" fill="#E35B5B" />
                                                        <path d="M34 17C34 7.6 26.4 0 17 0V12L28.8 28.4C32 25.5 34 21.5 34 17Z" fill="#5daaf5" />
                                                        <path d="M17 12L1.4 23.8C3.1 27.2 5.7 30.1 8.7 32.2L17 12Z" fill="#fcd86dff" />
                                                        <circle cx="17" cy="17" r="6.5" fill="white" />
                                                    </svg>
                                                    経路
                                                </a>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedShiftForRecord(shift)
                                                    setSelectedServiceRecord(serviceRecord)
                                                }}
                                                className={`${styles.routeButton} px-4 py-2 text-sm flex items-center justify-center gap-2`}
                                            >
                                                {serviceRecord ? '訪問記録' : '記録'}
                                            </button>
                                            <button
                                                onClick={() => handleToggleWorkStatus(shift.id)}
                                                disabled={mutation.isPending || isWorking}
                                                className={`
                                                    ${styles.workButton}
                                                    flex items-center justify-center gap-2 min-w-[120px]
                                                    ${isWorking
                                                        ? styles.workButtonDone
                                                        : styles.workButtonReady
                                                    }
                                                    px-5 py-2 text-sm
                                                `}
                                            >
                                                {mutation.isPending ? '更新中...' : (isWorking ? '出勤済み' : '出勤')}
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {targetUserId && (
                    <div className={`${styles.calendarCard} calendar-container overflow-hidden p-2 mt-2`}>
                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            events={calendarEvents}
                            locale="ja"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: ''
                            }}
                            buttonText={{
                                today: '今日'
                            }}
                            height="auto"
                            contentHeight={800}
                            dayMaxEvents={true}
                            editable={false}
                            droppable={false}
                            datesSet={(arg: any) => {
                                setCurrentDate(arg.view.currentStart)
                            }}
                            eventContent={(arg: any) => {
                                const { startTimeStr, endTimeStr, isWorking } = arg.event.extendedProps;
                                return (
                                    <div
                                        className={`${styles.eventCard} w-full text-[0.65rem] sm:text-[0.7rem] px-1 py-0.5 leading-tight border-l-[3px] break-words whitespace-normal`}
                                        style={{ borderColor: arg.event.borderColor }}
                                    >
                                        <div className="mb-0.5">{arg.event.title}</div>
                                        <div className={`${styles.eventTime} text-[0.55rem] sm:text-[0.6rem] leading-none`}>{startTimeStr}</div>
                                        <div className={`${styles.eventTime} text-[0.55rem] sm:text-[0.6rem] leading-none`}>{endTimeStr}</div>
                                        {isWorking && (
                                            <div className={`${styles.workedBadge} mt-0.5 text-[0.55rem] px-1 py-0.5 inline-block`}>
                                                出勤済み
                                            </div>
                                        )}
                                    </div>
                                )
                            }}
                        />
                    </div>
                )}
            </div>

            <ServiceRecordFormModal
                isOpen={selectedShiftForRecord !== undefined}
                onClose={() => {
                    setSelectedShiftForRecord(undefined)
                    setSelectedServiceRecord(undefined)
                }}
                onSave={async (values, submitMode) => {
                    await saveServiceRecordMutation.mutateAsync({ values, submitMode })
                }}
                serviceTypes={serviceTypes ?? []}
                serviceRecord={selectedServiceRecord}
                shiftId={selectedShiftForRecord?.id}
                shiftLabel={selectedShiftForRecord ? buildShiftLabel(selectedShiftForRecord) : ''}
                allowSubmitActions
                pending={saveServiceRecordMutation.isPending}
            />
        </div>
    )
}
