import { useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { Shift, User } from '../../../../types'
import styles from './ShiftsCalendar.module.css'

type ShiftsCalendarProps = {
  shifts?: Shift[]
  users?: User[]
  onDateClick: (arg: any) => void
  onEventClick: (info: any) => void
  onEventDrop: (info: any) => void
  onCurrentDateChange: (date: Date) => void
}

export default function ShiftsCalendar({
  shifts,
  users,
  onDateClick,
  onEventClick,
  onEventDrop,
  onCurrentDateChange,
}: ShiftsCalendarProps) {
  const calendarEvents = useMemo(() => {
    if (!shifts) return []

    return shifts.map((shift) => {
      const userName = users?.find((user) => user.id === shift.user_id)?.name || '未配置'
      let bgColor = '#F19494'
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
        title: userName,
        start: shift.date,
        allDay: true,
        backgroundColor: bgColor,
        borderColor,
        textColor,
        extendedProps: {
          shift,
          startTimeStr: shift.start_time,
          endTimeStr: shift.end_time,
        },
      }
    })
  }, [shifts, users])

  return (
    <div className={`${styles.calendarCard} calendar-container overflow-hidden p-2 mt-2`}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={calendarEvents}
        locale="ja"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '',
        }}
        buttonText={{
          today: '今日',
        }}
        height="auto"
        contentHeight={800}
        dayMaxEvents={true}
        editable={true}
        droppable={true}
        dateClick={onDateClick}
        eventClick={onEventClick}
        eventDrop={onEventDrop}
        datesSet={(arg: any) => {
          onCurrentDateChange(arg.view.currentStart)
        }}
        eventContent={(arg: any) => {
          const { startTimeStr, endTimeStr } = arg.event.extendedProps

          return (
            <div
              className={`${styles.eventCard} w-full text-[0.65rem] sm:text-[0.7rem] px-1 py-0.5 leading-tight border-l-[3px] break-words whitespace-normal`}
              style={{ borderColor: arg.event.borderColor }}
            >
              <div className="mb-0.5">{arg.event.title}</div>
              <div className={`${styles.eventTime} text-[0.55rem] sm:text-[0.6rem] leading-none`}>{startTimeStr}</div>
              <div className={`${styles.eventTime} text-[0.55rem] sm:text-[0.6rem] leading-none`}>{endTimeStr}</div>
            </div>
          )
        }}
      />
    </div>
  )
}
