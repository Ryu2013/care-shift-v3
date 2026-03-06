import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { getShifts, updateShift } from '../api/shifts'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { signOut } from '../api/auth'
import { getTeams } from '../api/teams'
import { getClients } from '../api/clients'
import { getUsers } from '../api/users'
import type { Shift, Team, Client, User } from '../types'
import ShiftFormModal from '../components/ShiftFormModal'
import { HamburgerMenuButton } from '../components/HamburgerMenuButton'

const formatTime = (timeString: string) => {
  if (timeString.includes('T')) {
    const match = timeString.match(/T(\d{2}:\d{2})/)
    return match ? match[1] : timeString.substring(0, 5)
  }
  return timeString.substring(0, 5)
}

export default function ShiftsPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('')
  const [selectedClientId, setSelectedClientId] = useState<number | ''>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<Shift | undefined>(undefined)
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

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

  const handleSignOut = async () => {
    try {
      await signOut()
      // セッション消去とフロントのme（currentUser）のRAMクリアを確実に行う
      queryClient.removeQueries({ queryKey: ['currentUser'] })
      queryClient.clear()
      navigate('/login')
    } catch (e) {
      console.error(e)
    }
  }

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
      const title = `${userName} (${startTimeStr}-${endTimeStr})`

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
        extendedProps: { shift }
      }
    })
  }, [shifts, users])

  return (
    <div className="min-h-screen bg-white">
      {/* Menu/Header Area */}
      <header className="flex justify-between items-center p-4 border-b bg-white relative z-50">
        <div className="flex items-center gap-3">
          <img src="/src/assets/logo.png" alt="ケアシフト ロゴ" className="h-8" />
          <span className="font-bold text-lg tracking-wide hidden sm:block text-[#333]">シフト管理アプリ</span>
        </div>

        {/* デスクトップ用ナビゲーション */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/rooms" className="font-bold text-gray-700 hover:text-[#5daaf5] transition-colors">チャット</Link>
          <Link to="/settings" className="font-bold text-gray-700 hover:text-[#5daaf5] transition-colors">部署/会社</Link>
          <Link to="/clients" className="font-bold text-gray-700 hover:text-[#5daaf5] transition-colors">利用者とスタッフ</Link>
          <Link to="/work-statuses" className="font-bold text-gray-700 hover:text-[#5daaf5] transition-colors">出退勤状況</Link>
          <Link to="/two-factor-setup" className="font-bold text-gray-700 hover:text-[#5daaf5] transition-colors">二段階認証</Link>
          <button onClick={handleSignOut} className="font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer">ログアウト</button>
        </nav>

        {/* ハンバーガーボタン (モバイル用) */}
        <HamburgerMenuButton className="md:hidden">
          <nav className="flex flex-col items-center gap-8 pt-20">
            <Link to="/rooms" className="font-bold text-xl text-[#333]">チャット</Link>
            <Link to="/settings" className="font-bold text-xl text-[#333]">部署/会社</Link>
            <Link to="/clients" className="font-bold text-xl text-[#333]">利用者とスタッフ</Link>
            <Link to="/work-statuses" className="font-bold text-xl text-[#333]">出退勤状況</Link>
            <Link to="/two-factor-setup" className="font-bold text-xl text-[#333]">二段階認証</Link>
            <button onClick={handleSignOut} className="font-bold text-xl text-red-500 mt-2">ログアウト</button>
          </nav>
        </HamburgerMenuButton>
      </header>

      <div className="p-4 mx-auto max-w-7xl">
        {/* Filter Area & Legend */}
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <select
              value={selectedTeamId}
              onChange={(e) => {
                setSelectedTeamId(e.target.value ? Number(e.target.value) : '')
                setSelectedClientId('') // Reset client when team changes
              }}
              className="border rounded p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">チーム選択</option>
              {teams?.map((team: Team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>

            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value ? Number(e.target.value) : '')}
              className="border rounded p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">利用者選択</option>
              {clients?.map((client: Client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>

            <button
              onClick={() => {
                setSelectedShift(undefined)
                setSelectedDate(undefined)
                setIsModalOpen(true)
              }}
              className="px-6 py-2 text-white bg-[#5daaf5] rounded-full hover:bg-[#4a90e2] transition-all font-bold shadow-md hover:-translate-y-0.5"
            >
              新規シフト
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-6">
          <div className="px-3 py-1.5 text-xs font-bold rounded-tr-lg border-l-4 bg-[#F19494] border-[#E35B5B] shadow-sm">日勤</div>
          <div className="px-3 py-1.5 text-xs font-bold rounded-tr-lg border-l-4 bg-[#B4E2FF] border-[#69C5FF] shadow-sm">夜勤</div>
          <div className="px-3 py-1.5 text-xs font-bold rounded-tr-lg border-l-4 bg-[#C8F7C5] border-[#4CAF50] shadow-sm">同行</div>
          <div className="px-3 py-1.5 text-xs font-bold rounded-tr-lg border-l-4 bg-[#E0E0E0] border-[#A0A0A0] shadow-sm">未配置</div>
        </div>

        {/* FullCalendar Component */}
        <div className="calendar-container shadow-inner rounded-sm overflow-hidden bg-white border border-[#aeaeae] p-2">
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
              // カスタムイベント描画
              return (
                <div className="w-full text-[0.7rem] px-1 py-0.5 leading-tight overflow-hidden truncate font-bold border-l-4" style={{ borderColor: arg.event.borderColor }}>
                  {arg.event.title}
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
