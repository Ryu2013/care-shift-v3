import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getShifts, updateShift } from '../api/shifts'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { getTeams } from '../api/teams'
import { getClients } from '../api/clients'
import { getUsers } from '../api/users'
import type { Shift, Team, Client, User } from '../types'
import ShiftFormModal from '../components/ShiftFormModal'
import { Header } from '../components/Header'

const formatTime = (timeString: string) => {
  if (timeString.includes('T')) {
    const match = timeString.match(/T(\d{2}:\d{2})/)
    return match ? match[1] : timeString.substring(0, 5)
  }
  return timeString.substring(0, 5)
}

export default function ShiftsPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>(() => {
    const saved = localStorage.getItem('careShift_selectedTeamId')
    return saved ? Number(saved) : ''
  })
  const [selectedClientId, setSelectedClientId] = useState<number | ''>(() => {
    const saved = localStorage.getItem('careShift_selectedClientId')
    return saved ? Number(saved) : ''
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<Shift | undefined>(undefined)
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Persist filters to localStorage
  useEffect(() => {
    if (selectedTeamId !== '') {
      localStorage.setItem('careShift_selectedTeamId', selectedTeamId.toString())
    } else {
      localStorage.removeItem('careShift_selectedTeamId')
    }
  }, [selectedTeamId])

  useEffect(() => {
    if (selectedClientId !== '') {
      localStorage.setItem('careShift_selectedClientId', selectedClientId.toString())
    } else {
      localStorage.removeItem('careShift_selectedClientId')
    }
  }, [selectedClientId])

  // Fetch teams for filter
  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => getTeams().then((res: { data: Team[] }) => res.data)
  })

  // Fetch clients for filter
  const { data: clients } = useQuery({
    queryKey: ['clients', selectedTeamId],
    queryFn: () => getClients(selectedTeamId || undefined).then((res: { data: Client[] }) => res.data),
    enabled: true // Always fetch or filter by team
  })

  // Fetch users for mapping shift.user_id to name
  const { data: users } = useQuery({
    queryKey: ['users', selectedTeamId],
    queryFn: () => getUsers(selectedTeamId || undefined).then((res: { data: User[] }) => res.data),
    enabled: true
  })

  const { data: shifts, refetch } = useQuery({
    queryKey: ['shifts', year, month, selectedClientId],
    queryFn: () => getShifts({ client_id: selectedClientId || undefined }).then((r: { data: Shift[] }) => r.data),
  })


  const handleDateClick = (arg: any) => {
    // 日付クリックで新規作成
    const clickedDate = new Date(arg.date)
    // タイムゾーンのズレを防ぐため、ローカルタイムとしてISO stringを生成
    const dateStr = `${clickedDate.getFullYear()}-${String(clickedDate.getMonth() + 1).padStart(2, '0')}-${String(clickedDate.getDate()).padStart(2, '0')}`

    setSelectedShift(undefined)
    setSelectedDate(dateStr)
    setIsModalOpen(true)
  }

  const handleEventClick = (info: any) => {
    // 既存シフトクリックで編集モーダル
    const shiftId = Number(info.event.id)
    const shift = shifts?.find(s => s.id === shiftId)
    if (shift) {
      setSelectedShift(shift)
      setIsModalOpen(true)
    }
  }

  const handleEventDrop = async (info: any) => {
    // ドラッグ＆ドロップで日付変更
    const shiftId = Number(info.event.id)
    const newDateStr = info.event.startStr // "YYYY-MM-DD"

    try {
      await updateShift(shiftId, { date: newDateStr })
      refetch() // 成功したら再取得
    } catch (e) {
      console.error("Failed to update shift date", e)
      info.revert() // エラー時はドラッグ元に戻す
      alert('シフトの日付変更に失敗しました')
    }
  }

  // FullCalendar 用のイベント配列を生成
  const calendarEvents = useMemo(() => {
    if (!shifts) return []

    return shifts.map((shift: Shift) => {
      const userName = users?.find(u => u.id === shift.user_id)?.name || "未配置"
      const startTimeStr = formatTime(shift.start_time)
      const endTimeStr = formatTime(shift.end_time)
      const title = userName

      // カスタムプロパティとして色を判別
      let bgColor = '#F19494' // day default
      let borderColor = '#E35B5B'
      let textColor = '#333333'

      if (shift.user_id === null) {
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
        allDay: true, // 時間による縦軸配置(TimeGrid)を使わず、日ごとのブロック(DayGrid)として扱うため
        backgroundColor: bgColor,
        borderColor: borderColor,
        textColor: textColor,
        extendedProps: { shift, startTimeStr, endTimeStr }
      }
    })
  }, [shifts, users])

  return (
    <div className="min-h-[100vh]">
      <Header />

      <div className="p-4 pt-20 mx-auto max-w-7xl">
        {/* Filters and Legend Area */}
        <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl p-4 mb-4 border border-white/50">
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <select
                  value={selectedTeamId}
                  onChange={(e) => {
                    setSelectedTeamId(e.target.value ? Number(e.target.value) : '')
                    setSelectedClientId('') // Reset client when team changes
                  }}
                  className="w-full sm:w-auto border border-gray-200/80 rounded-xl p-1.5 md:p-2 text-sm md:text-base focus:ring-2 focus:ring-blue-400 outline-none bg-white/90"
                >
                  <option value="">チーム選択</option>
                  {teams?.map((team: Team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>

                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full sm:w-auto border border-gray-200/80 rounded-xl p-1.5 md:p-2 text-sm md:text-base focus:ring-2 focus:ring-blue-400 outline-none bg-white/90"
                >
                  <option value="">利用者選択</option>
                  {clients?.map((client: Client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setSelectedShift(undefined)
                  setSelectedDate(undefined)
                  setIsModalOpen(true)
                }}
                className="w-full sm:w-auto px-4 py-2 md:px-6 md:py-2 text-sm md:text-base text-white bg-[#5daaf5] rounded-full hover:bg-[#4a90e2] transition-all font-bold shadow-md hover:-translate-y-0.5 whitespace-nowrap"
              >
                新規シフト
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3">
            <div className="px-3 py-1.5 text-xm font-bold rounded-tr-lg border-l-4 bg-[#F19494]/90 border-[#E35B5B] shadow-sm">日勤</div>
            <div className="px-3 py-1.5 text-xm font-bold rounded-tr-lg border-l-4 bg-[#B4E2FF]/90 border-[#69C5FF] shadow-sm">夜勤</div>
            <div className="px-3 py-1.5 text-xm font-bold rounded-tr-lg border-l-4 bg-[#C8F7C5]/90 border-[#4CAF50] shadow-sm">同行</div>
            <div className="px-3 py-1.5 text-xm font-bold rounded-tr-lg border-l-4 bg-[#E0E0E0]/90 border-[#A0A0A0] shadow-sm">未配置</div>
          </div>
        </div>

        {/* FullCalendar Component */}
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
            height="auto" // ヘッダー含めて自動リサイズ
            contentHeight={800} // 各セルの高さを確保
            dayMaxEvents={true} // マスに収まらない場合は "もっと見る" リンクを表示
            editable={true} // ドラッグ＆ドロップを有効化
            droppable={true}
            dateClick={handleDateClick} // 日付クリック
            eventClick={handleEventClick} // イベントクリック
            eventDrop={handleEventDrop} // イベントドラッグ完了
            datesSet={(arg: any) => {
              setCurrentDate(arg.view.currentStart)
            }}
            eventContent={(arg: any) => {
              // カスタムイベント描画 (複数行で折り返し表示)
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
      </div>

      {/* Shift Modal */}
      <ShiftFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedShift(undefined)
          setSelectedDate(undefined)
        }}
        onSuccess={() => refetch()}
        teamId={selectedTeamId || undefined}
        clientId={selectedClientId || undefined}
        shift={selectedShift}
        initialDate={selectedDate}
      />
    </div>
  )
}
