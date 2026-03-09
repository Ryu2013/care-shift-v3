import { createConsumer } from '@rails/actioncable'

// Use WebSockets locally on port 3000
const ActionCableURL =
    import.meta.env.VITE_ACTION_CABLE_URL || 'ws://localhost:3000/api/cable'

export const cable = createConsumer(ActionCableURL)
