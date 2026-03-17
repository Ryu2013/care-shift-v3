import type { Client, Team } from '../../../../types'
import styles from './ShiftsFiltersPanel.module.css'

type ShiftsFiltersPanelProps = {
  selectedTeamId: number | ''
  selectedClientId: number | ''
  teams?: Team[]
  clients?: Client[]
  onTeamChange: (teamId: number | '') => void
  onClientChange: (clientId: number | '') => void
  onCreateShift: () => void
}

export default function ShiftsFiltersPanel({
  selectedTeamId,
  selectedClientId,
  teams,
  clients,
  onTeamChange,
  onClientChange,
  onCreateShift,
}: ShiftsFiltersPanelProps) {
  return (
    <div className={`${styles.panel} p-4 mb-4`}>
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <select
              value={selectedTeamId}
              onChange={(e) => onTeamChange(e.target.value ? Number(e.target.value) : '')}
              className={`${styles.select} w-full sm:w-auto p-1.5 md:p-2 text-sm md:text-base`}
            >
              <option value="">チーム選択</option>
              {teams?.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>

            <select
              value={selectedClientId}
              onChange={(e) => onClientChange(e.target.value ? Number(e.target.value) : '')}
              className={`${styles.select} w-full sm:w-auto p-1.5 md:p-2 text-sm md:text-base`}
            >
              <option value="">利用者選択</option>
              {clients?.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={onCreateShift}
            className={`${styles.createButton} w-full sm:w-auto px-4 py-2 md:px-6 md:py-2 text-sm md:text-base whitespace-nowrap`}
          >
            新規シフト
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <div className={`${styles.legendItem} ${styles.legendDay} px-3 py-1.5 text-xm border-l-4`}>日勤</div>
        <div className={`${styles.legendItem} ${styles.legendNight} px-3 py-1.5 text-xm border-l-4`}>夜勤</div>
        <div className={`${styles.legendItem} ${styles.legendEscort} px-3 py-1.5 text-xm border-l-4`}>同行</div>
        <div className={`${styles.legendItem} ${styles.legendUnassigned} px-3 py-1.5 text-xm border-l-4`}>未配置</div>
      </div>
    </div>
  )
}
