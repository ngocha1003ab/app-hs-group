
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')
    const memberId = getCookie(event, 'member_id')
    const query = getQuery(event)
    const taskId = query.taskId as string

    if (!licenseKey) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    if (!taskId) {
        return [] // Return empty if no task specified
    }

    const db = await useDb()
    db.data.comments = db.data.comments || []

    // 1. Verify access to the task
    // We reuse the logic: can the user SEE this task?
    // Tasks are filtered by role in /api/tasks logic. 
    // Here we must duplicate the check to ensure they don't snoop comments on tasks they can't see.

    // Find the task
    const task = db.data.tasks.find(t => t.id === taskId && t.license_key === licenseKey)

    if (!task) {
        // Task doesn't exist or not in license
        return []
    }

    // Role check logic
    if (memberId) {
        const member = db.data.members.find(m => m.id === memberId)
        if (member) {
            if (member.role === 'Member') {
                // Members check: Must be assigned to them
                if (task.assignee_id !== memberId) {
                    throw createError({ statusCode: 403, message: 'Bạn không có quyền xem bình luận của nhiệm vụ này' })
                }
            } else if (member.role === 'Leader') {
                // Leader check: Must be in their department
                if (task.department_id !== member.department_id) {
                    throw createError({ statusCode: 403, message: 'Bạn không có quyền xem bình luận của phòng ban khác' })
                }
            }
        }
    }
    // Owner (no memberId) sees all.

    // 2. Filter comments for this task
    const comments = db.data.comments.filter(c => c.task_id === taskId && c.license_key === licenseKey)

    // 3. Join with User data (name, avatar)
    // We return a DTO
    const enrichedComments = comments.map(c => {
        let user
        if (c.user_id === 'owner') {
            user = { name: 'Admin', avatar: 'https://ui-avatars.com/api/?name=Admin&background=random' }
        } else {
            const m = db.data.members.find(m => m.id === c.user_id)
            user = m ? { name: m.name, avatar: m.avatar } : { name: 'Unknown', avatar: '' }
        }

        return {
            id: c.id,
            userId: c.user_id,
            userName: user.name,
            userAvatar: user.avatar,
            content: c.content,
            createdAt: c.created_at
        }
    })

    // Sort oldest first or newest first? Usually older first for chat, or newest top. UI shows list.
    return enrichedComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
})
