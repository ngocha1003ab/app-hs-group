
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')
    const memberId = getCookie(event, 'member_id')

    if (!licenseKey) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const body = await readBody(event)
    const { taskId, content } = body

    if (!taskId || !content) {
        throw createError({ statusCode: 400, message: 'Missing taskId or content' })
    }

    const db = await useDb()

    // 1. Verify Access to Task
    const task = db.data.tasks.find(t => t.id === taskId && t.license_key === licenseKey)
    if (!task) {
        throw createError({ statusCode: 404, message: 'Task not found' })
    }

    let userId = 'owner' // Default if no memberId (Owner)

    if (memberId) {
        const member = db.data.members.find(m => m.id === memberId)
        if (!member) throw createError({ statusCode: 401, message: 'Member not found' })

        userId = memberId

        // Permission Logic for COMMENTING
        // "member chỉ bình luận được trong task của mình thôi"
        if (member.role === 'Member') {
            if (task.assignee_id !== memberId) {
                throw createError({ statusCode: 403, message: 'Nhân viên chỉ được bình luận trong nhiệm vụ của mình' })
            }
        }
        // "leader bình luận được trong task của phòng ban họ quản lý"
        if (member.role === 'Leader') {
            if (task.department_id !== member.department_id) {
                throw createError({ statusCode: 403, message: 'Leader chỉ được bình luận trong nhiệm vụ của phòng ban mình' })
            }
        }
        // "chủ doanh nghiệp thì bình luận được hết nhé" -> fallback to owner logic (allowed)
    }

    // 2. Create Comment
    const newComment = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        task_id: taskId,
        user_id: userId,
        content,
        license_key: licenseKey,
        created_at: new Date().toISOString()
    }

    db.data.comments = db.data.comments || []
    db.data.comments.push(newComment)
    await db.write()

    return {
        success: true,
        data: newComment
    }
})
