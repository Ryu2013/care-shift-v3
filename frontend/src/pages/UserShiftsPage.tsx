import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getUserShifts } from '../api/shifts'
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

    // ユーザー情報を特定
    const targetUser = users?.find(u => u.id === targetUserId)

    // FullCalendar 用のイベント配列を生成
    const calendarEvents = useMemo(() => {
        if (!shifts) return []

        return shifts.map((shift: Shift) => {
            const clientName = shift.client?.name || "利用者未定"
            const startTimeStr = formatTime(shift.start_time)
            const endTimeStr = formatTime(shift.end_time)
            const title = clientName

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
                extendedProps: { shift, startTimeStr, endTimeStr }
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
                                const { startTimeStr, endTimeStr } = arg.event.extendedProps;
                                return (
                                    <div
                                        className="w-full text-[0.65rem] sm:text-[0.7rem] px-1 py-0.5 leading-tight font-bold border-l-[3px] break-words whitespace-normal"
                                        style={{ borderColor: arg.event.borderColor }}
                                    >
                                        <div className="mb-0.5">{arg.event.title}</div>
                                        <div className="text-[0.55rem] sm:text-[0.6rem] font-normal leading-none">{startTimeStr}</div>
                                        <div className="text-[0.55rem] sm:text-[0.6rem] font-normal leading-none">{endTimeStr}</div>
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
