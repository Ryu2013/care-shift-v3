import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getUserShifts, updateUserShiftStatus } from '../api/shifts'
import { getOfficeUsers } from '../api/users'
import { useCurrentUser } from '../hooks/useCurrentUser'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { Shift, User } from '../types'
import { Header } from '../components/Header'

const formatTime = (timeString: string) => {
    if (timeString.includes('T')) {
        const match = timeString.match(/T(\d{2}:\d{2})/)
        return match ? match[1] : timeString.substring(0, 5)
    }
    return timeString.substring(0, 5)
}

export default function UserShiftsPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { data: currentUser } = useCurrentUser()
    const [searchParams] = useSearchParams()
    const userIdParam = searchParams.get('user_id')
    const targetUserId = userIdParam ? Number(userIdParam) : currentUser?.id

    const [currentDate, setCurrentDate] = useState(new Date())
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const { data: users } = useQuery({
        queryKey: ['officeUsers'],
        queryFn: () => getOfficeUsers().then((res: { data: User[] }) => res.data),
    })

    const { data: shifts, isLoading } = useQuery({
        queryKey: ['user-shifts', year, month, targetUserId],
        queryFn: () => getUserShifts({ user_id: targetUserId }).then((r: { data: Shift[] }) => r.data),
        enabled: !!targetUserId
    })

    const mutation = useMutation({
        mutationFn: ({ id, work_status }: { id: number, work_status: string }) => updateUserShiftStatus(id, work_status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-shifts', year, month, targetUserId] })
        }
    })

    const handleToggleWorkStatus = (shiftId: number) => {
        mutation.mutate({ id: shiftId, work_status: 'work' })
    }

    // ユーザー情報を特定
    const targetUser = users?.find(u => u.id === targetUserId)

    // 今日のシフトを抽出 (YYYY-MM-DD 文字列による比較)
    const todayStr = new Date().toLocaleDateString('ja-JP').split('/').map((s, i) => i > 0 ? s.padStart(2, '0') : s).join('-')
    const todaysShifts = useMemo(() => {
        if (!shifts || currentUser?.id !== targetUserId) return []
        return shifts.filter((s: Shift) => s.date === todayStr)
    }, [shifts, todayStr, currentUser, targetUserId])

    // FullCalendar 用のイベント配列を生成
    const calendarEvents = useMemo(() => {
        if (!shifts) return []

        return shifts.map((shift: Shift) => {
            const clientName = shift.client?.name || "利用者未定"
            const startTimeStr = formatTime(shift.start_time)
            const endTimeStr = formatTime(shift.end_time)
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

            <div className="p-4 pt-20 mx-auto max-w-7xl">
                <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl p-4 mb-4 border border-white/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            {targetUser ? `${targetUser.name} さんのシフト` : (isLoading ? '読み込み中...' : 'ユーザーが指定されていません')}
                        </h2>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-3">
                        <div className="px-3 py-1.5 text-xm font-bold rounded-tr-lg border-l-4 bg-[#F19494]/90 border-[#E35B5B] shadow-sm">日勤</div>
                        <div className="px-3 py-1.5 text-xm font-bold rounded-tr-lg border-l-4 bg-[#B4E2FF]/90 border-[#69C5FF] shadow-sm">夜勤</div>
                        <div className="px-3 py-1.5 text-xm font-bold rounded-tr-lg border-l-4 bg-[#C8F7C5]/90 border-[#4CAF50] shadow-sm">同行</div>
                        <div className="px-3 py-1.5 text-xm font-bold rounded-tr-lg border-l-4 bg-[#E0E0E0]/90 border-[#A0A0A0] shadow-sm">未配置</div>
                    </div>
                </div>

                {/* 本日のシフトステータス切り替えエリア */}
                {todaysShifts.length > 0 && (
                    <div className="mb-4 bg-white/80 backdrop-blur-sm shadow-sm rounded-xl p-4 border border-[#5daaf5]/30 flex flex-col gap-3">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#5daaf5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            本日のシフト
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {todaysShifts.map(shift => {
                                const isWorking = shift.work_status === 'work' || String(shift.work_status) === '1'
                                const startTimeStr = formatTime(shift.start_time)
                                const endTimeStr = formatTime(shift.end_time)
                                return (
                                    <div key={shift.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                        <div>
                                            <div className="font-bold text-gray-800 text-sm">
                                                {shift.client?.name || '利用者未定'}
                                            </div>
                                            <div className="text-gray-500 text-xs font-mono">
                                                {startTimeStr} - {endTimeStr}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleToggleWorkStatus(shift.id)}
                                            disabled={mutation.isPending || isWorking}
                                            className={`
                                                px-5 py-2 rounded-full font-bold text-sm transition-all shadow-sm
                                                flex items-center justify-center gap-2 min-w-[120px]
                                                ${isWorking
                                                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                                    : 'bg-[#5daaf5] text-white hover:bg-[#4a90e2] hover:-translate-y-0.5 hover:shadow-md'
                                                }
                                            `}
                                        >
                                            {mutation.isPending ? '更新中...' : (isWorking ? '出勤済み' : '出勤する')}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {targetUserId && (
                    <div className="calendar-container shadow-sm rounded-xl overflow-hidden bg-[var(--white-color)] border border-gray-200/60 p-2 mt-2">
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
                                        className="w-full text-[0.65rem] sm:text-[0.7rem] px-1 py-0.5 leading-tight font-bold border-l-[3px] break-words whitespace-normal"
                                        style={{ borderColor: arg.event.borderColor }}
                                    >
                                        <div className="mb-0.5">{arg.event.title}</div>
                                        <div className="text-[0.55rem] sm:text-[0.6rem] font-normal leading-none">{startTimeStr}</div>
                                        <div className="text-[0.55rem] sm:text-[0.6rem] font-normal leading-none">{endTimeStr}</div>
                                        {isWorking && (
                                            <div className="mt-0.5 text-[0.55rem] font-bold text-white bg-[#5daaf5] px-1 py-0.5 rounded-sm inline-block">
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
        </div>
    )
}
