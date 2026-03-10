import { createConsumer } from '@rails/actioncable'

const defaultActionCableURL =
    typeof window === 'undefined'
        ? 'ws://localhost:3000/api/cable'
        : `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/cable`

const ActionCableURL =
    import.meta.env.VITE_ACTION_CABLE_URL || defaultActionCableURL

export const cable = createConsumer(ActionCableURL)
