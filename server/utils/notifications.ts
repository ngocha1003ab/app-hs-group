
import { useDb } from './db'

export const createNotification = async (
    licenseKey: string,
    recipientId: string, // 'owner' or memberId
    title: string,
    description: string,
    type: 'task_assigned' | 'task_updated' | 'comment_added' | 'other',
    link?: string
) => {
    const db = await useDb()
    db.data.notifications = db.data.notifications || []

    const newNotification = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        user_id: recipientId,
        title,
        description,
        type,
        link,
        read: false,
        license_key: licenseKey,
        created_at: new Date().toISOString()
    }

    db.data.notifications.unshift(newNotification) // Add to top
    await db.write()
}
