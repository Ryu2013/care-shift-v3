import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getShifts } from '../api/shifts'
import { signOut } from '../api/auth'
import { getTeams } from '../api/teams'
import { getClients } from '../api/clients'
import type { Shift, Team, Client } from '../types'
import ShiftFormModal from '../components/ShiftFormModal'

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

export default function ShiftsPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('')
  const [selectedClientId, setSelectedClientId] = useState<number | ''>('')
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const { data: shifts, refetch } = useQuery({
    queryKey: ['shifts', year, month, selectedClientId],
    queryFn: () => getShifts({ client_id: selectedClientId || undefined }).then((r: { data: Shift[] }) => r.data),
  })

  const handleSignOut = async () => {
    try {
      await signOut()
      queryClient.clear()
      navigate('/login')
    } catch (e) {
      console.error(e)
    }
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  // Calculate padding blocks for calendar
  const paddingBefore = Array.from({ length: firstDay }, (_, i) => i)
  const totalCells = paddingBefore.length + daysInMonth
  // 42 cells total for 6 rows
  const paddingAfter = Array.from({ length: 42 - totalCells }, (_, i) => i)

  // Memoize mapping shifts to dates
  const shiftsByDate = useMemo(() => {
    if (!shifts) return {}
    const grouped: Record<string, Shift[]> = {}
    shifts.forEach((shift: Shift) => {
      // Assuming shift.date is "YYYY-MM-DD"
      if (!grouped[shift.date]) {
        grouped[shift.date] = []
      }
      grouped[shift.date].push(shift)
    })
    return grouped
  }, [shifts])

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))

  const formatTime = (timeString: string) => {
    // Assuming format "HH:MM:SS" or similar, just taking first 5 chars
    return timeString.substring(0, 5)
  }

  const getShiftColorClasses = (shift: Shift) => {
    // 未配置 (Unassigned)
    if (shift.user_id === null) {
      return "bg-[#E0E0E0] border-l-[#A0A0A0] text-[#333]"
    }
    // 同行 (Escort)
    if (shift.is_escort || shift.shift_type === 'escort') {
      return "bg-[#C8F7C5] border-l-[#4CAF50] text-[#333]"
    }
    // 夜勤 (Night)
    if (shift.shift_type === 'night') {
      return "bg-[#B4E2FF] border-l-[#69C5FF] text-[#333]"
    }
    // 日勤 (Day/Default)
    return "bg-[#F19494] border-l-[#E35B5B] text-[#333]"
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Menu/Header Area */}
      <div className="flex gap-4 p-4 border-b">
        <span className="font-bold cursor-pointer hover:text-blue-500" onClick={() => navigate('/rooms')}>チャット</span>
        <span className="font-bold cursor-pointer hover:text-blue-500">部署/会社</span>
        <span className="font-bold cursor-pointer hover:text-blue-500" onClick={() => navigate('/clients')}>利用者とスタッフ</span>
        <span className="font-bold cursor-pointer hover:text-blue-500" onClick={() => navigate('/work-statuses')}>出退勤状況</span>
        <span className="font-bold cursor-pointer hover:text-blue-500">二段階認証</span>
        <span className="font-bold cursor-pointer hover:text-blue-500 text-red-500 ml-auto" onClick={handleSignOut}>ログアウト</span>
      </div>

      <div className="p-4 mx-auto max-w-7xl">
        {/* Filter Area & Legend */}
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="px-3 py-1 border rounded hover:bg-gray-50 transition-colors">&lt;</button>
            <h2 className="text-xl font-bold w-32 text-center">{year}年{month + 1}月</h2>
            <button onClick={nextMonth} className="px-3 py-1 border rounded hover:bg-gray-50 transition-colors">&gt;</button>

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
              onClick={() => setIsModalOpen(true)}
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

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-t border-l border-[#aeaeae] shadow-inner rounded-sm overflow-hidden">
          {/* Week Headers */}
          {['日', '月', '火', '水', '木', '金', '土'].map(wday => (
            <div key={wday} className="font-bold text-center py-3 border-b border-r border-[#aeaeae] bg-gray-50 text-sm text-gray-700">
              {wday}
            </div>
          ))}

          {/* Padding Before */}
          {paddingBefore.map(i => (
            <div key={`empty-before-${i}`} className="min-h-[140px] bg-[#f9f9f9] border-b border-r border-[#aeaeae] border-dashed"></div>
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const dateNum = i + 1
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`
            const dayShifts = shiftsByDate[dateStr] || []
            const isToday = new Date().toDateString() === new Date(year, month, dateNum).toDateString()

            return (
              <div
                key={`day-${dateNum}`}
                className={`min-h-[140px] p-1.5 bg-[#FFF8F0] border-b border-r border-[#aeaeae] border-dashed flex flex-col transition-colors hover:bg-orange-50/30 group`}
              >
                <div className={`text-sm mb-1.5 flex items-center justify-between`}>
                  <span className={`${isToday ? 'bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold' : 'text-gray-600 font-medium'}`}>
                    {dateNum}
                  </span>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="opacity-0 group-hover:opacity-100 text-blue-400 hover:text-blue-600 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
                  {dayShifts.map(shift => (
                    <div
                      key={shift.id}
                      className={`text-[0.65rem] p-1.5 rounded-tr-md rounded-br-md border-l-4 ${getShiftColorClasses(shift)} leading-tight shadow-sm cursor-pointer hover:brightness-95 transition-all`}
                    >
                      <div className="font-bold truncate">{shift.user_id ? `スタッフ ${shift.user_id}` : "未配置"}</div>
                      <div className="opacity-80 font-mono tracking-tighter">{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Padding After */}
          {paddingAfter.map(i => (
            <div key={`empty-after-${i}`} className="min-h-[140px] bg-[#f9f9f9] border-b border-r border-[#aeaeae] border-dashed"></div>
          ))}
        </div>
      </div>

      {/* Shift Modal */}
      <ShiftFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
        teamId={selectedTeamId || undefined}
        clientId={selectedClientId || undefined}
      />
    </div>
  )
}
