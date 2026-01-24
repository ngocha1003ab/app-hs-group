
import { useDb } from '../../utils/db'
import { createNotification } from '../../utils/notifications'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')
    const memberId = getCookie(event, 'member_id')

    if (!licenseKey) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const body = await readBody(event)
    const { taskId, content, image } = body

    if (!taskId) {
        throw createError({ statusCode: 400, message: 'Missing taskId' })
    }

    if (!content && !image) {
        throw createError({ statusCode: 400, message: 'Comment must have either content or image' })
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
        content: content || undefined, // Optional text content
        image: image || undefined, // Optional image URL
        license_key: licenseKey,
        created_at: new Date().toISOString()
    }

    db.data.comments = db.data.comments || []
    db.data.comments.push(newComment)
    await db.write()

    // --- Notifications ---
    // Rule 1: Use commenter name for better notification
    const commenterName = userId === 'owner' ? 'Admin' : (db.data.members.find(m => m.id === userId)?.name || 'Ai đó')

    // Rule 2: If assignee exists and is NOT the commenter, notify assignee
    if (task.assignee_id && task.assignee_id !== userId) {
        await createNotification(
            licenseKey,
            task.assignee_id,
            'Bình luận mới',
            `${commenterName} đã bình luận trong nhiệm vụ: ${task.title}`,
            'comment_added',
            '/progress' // Or specific task link if routing supported params
        )
    }

    // Rule 3: If assignee IS the commenter (Member commenting on own task), notify Supervisors (Leader + Owner)
    if (task.assignee_id === userId) {
        // A. Notify Owner
        if (userId !== 'owner') {
            await createNotification(
                licenseKey,
                'owner',
                'Bình luận mới',
                `${commenterName} đã bình luận trong nhiệm vụ: ${task.title}`,
                'comment_added',
                '/progress'
            )
        }

        // B. Notify Department Leader (if exists and is not the commenter)
        if (task.department_id) {
            const leader = db.data.members.find(m => m.department_id === task.department_id && m.role === 'Leader' && m.license_key === licenseKey)
            if (leader && leader.id !== userId) {
                await createNotification(
                    licenseKey,
                    leader.id,
                    'Bình luận mới',
                    `${commenterName} đã bình luận trong nhiệm vụ: ${task.title}`,
                    'comment_added',
                    '/progress'
                )
            }
        }
    }

    return {
        success: true,
        data: newComment
    }
})
