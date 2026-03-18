import { useEffect, useState } from 'react'

type SelectionId = number | ''

const usePersistedSelection = (storageKey: string) => {
  const [value, setValue] = useState<SelectionId>(() => {
    const saved = localStorage.getItem(storageKey)
    return saved ? Number(saved) : ''
  })

  useEffect(() => {
    if (value !== '') {
      localStorage.setItem(storageKey, value.toString())
    } else {
      localStorage.removeItem(storageKey)
    }
  }, [storageKey, value])

  return [value, setValue] as const
}

export function useShiftsFilters() {
  const [selectedTeamId, setSelectedTeamId] = usePersistedSelection('careShift_selectedTeamId')
  const [selectedClientId, setSelectedClientId] = usePersistedSelection('careShift_selectedClientId')

  const handleTeamChange = (teamId: SelectionId) => {
    setSelectedTeamId(teamId)
    setSelectedClientId('')
  }

  return {
    selectedTeamId,
    selectedClientId,
    setSelectedTeamId,
    setSelectedClientId,
    handleTeamChange,
  }
}
