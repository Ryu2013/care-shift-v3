import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getShifts, updateShift } from '../../../api/shifts'
import { getTeams } from '../../../api/teams'
import { getClients } from '../../../api/clients'
import { getUsers } from '../../../api/users'
import type { Shift, Team, Client, User } from '../../../types'
import ShiftFormModal from './components/ShiftFormModal'
import ShiftsCalendar from './components/ShiftsCalendar'
import ShiftsFiltersPanel from './components/ShiftsFiltersPanel'
import { useShiftsFilters } from './hooks/useShiftsFilters'
import { Header } from '../../../components/Header'
import styles from './ShiftsPage.module.css'

export default function ShiftsPage() {
  // useState
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<Shift | undefined>()
  const [selectedDate, setSelectedDate] = useState<string | undefined>()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // useShiftsFilters
  const {
    selectedTeamId,
    selectedClientId,
    setSelectedTeamId,
    setSelectedClientId,
    handleTeamChange,
  } = useShiftsFilters()

  // useQuery
  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => getTeams().then((res: { data: Team[] }) => res.data)
  })

  const isTeamSelectionValid =
    teams !== undefined && (selectedTeamId === '' || teams.some((team) => team.id === selectedTeamId))

  const { data: clients } = useQuery({
    queryKey: ['clients', selectedTeamId],
    queryFn: () => getClients(selectedTeamId || undefined).then((res: { data: Client[] }) => res.data),
    enabled: isTeamSelectionValid
  })

  const isClientSelectionValid =
    clients !== undefined && (selectedClientId === '' || clients.some((client) => client.id === selectedClientId))

  const { data: users } = useQuery({
    queryKey: ['users', selectedTeamId],
    queryFn: () => getUsers(selectedTeamId || undefined).then((res: { data: User[] }) => res.data),
    enabled: isTeamSelectionValid
  })

  const { data: shifts, refetch } = useQuery({
    queryKey: ['shifts', year, month, selectedClientId],
    queryFn: () => getShifts({ client_id: selectedClientId || undefined }).then((r: { data: Shift[] }) => r.data),
    enabled: isClientSelectionValid
  })

  // useEffect
  useEffect(() => {
    if (!teams || selectedTeamId === '') return

    const teamExists = teams.some((team) => team.id === selectedTeamId)
    if (!teamExists) {
      setSelectedTeamId('')
      setSelectedClientId('')
    }
  }, [teams, selectedTeamId, setSelectedTeamId, setSelectedClientId])

  useEffect(() => {
    if (!clients || selectedClientId === '') return

    const clientExists = clients.some((client) => client.id === selectedClientId)
    if (!clientExists) {
      setSelectedClientId('')
    }
  }, [clients, selectedClientId, setSelectedClientId])

  // handlers
  const handleDateClick = (arg: any) => {
    const clickedDate = new Date(arg.date)
    const dateStr = `${clickedDate.getFullYear()}-${String(clickedDate.getMonth() + 1).padStart(2, '0')}-${String(clickedDate.getDate()).padStart(2, '0')}`

    setSelectedShift(undefined)
    setSelectedDate(dateStr)
    setIsModalOpen(true)
  }

  const handleEventClick = (info: any) => {
    const shiftId = Number(info.event.id)
    const shift = shifts?.find(s => s.id === shiftId)
    if (shift) {
      setSelectedShift(shift)
      setIsModalOpen(true)
    }
  }

  const handleEventDrop = async (info: any) => {
    const shiftId = Number(info.event.id)
    const newDateStr = info.event.startStr

    try {
      await updateShift(shiftId, { date: newDateStr })
      refetch()
    } catch (e) {
      console.error("Failed to update shift date", e)
      info.revert()
      alert('シフトの日付変更に失敗しました')
    }
  }

  // return
  return (
    <div className="min-h-[100vh]">
      <Header />

      <div className={`${styles.content} p-4 pt-20 mx-auto max-w-7xl`}>
        <ShiftsFiltersPanel
          selectedTeamId={selectedTeamId}
          selectedClientId={selectedClientId}
          teams={teams}
          clients={clients}
          onTeamChange={handleTeamChange}
          onClientChange={setSelectedClientId}
          onCreateShift={() => {
            setSelectedShift(undefined)
            setSelectedDate(undefined)
            setIsModalOpen(true)
          }}
        />
        <ShiftsCalendar
          shifts={shifts}
          users={users}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
          onEventDrop={handleEventDrop}
          onCurrentDateChange={setCurrentDate}
        />
      </div>

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
