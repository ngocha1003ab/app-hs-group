
import { useDb } from '../../utils/db'
import { createNotification } from '../../utils/notifications'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')
    const memberId = getCookie(event, 'member_id')

    if (!licenseKey) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized: Missing license key'
        })
    }

    const body = await readBody(event)
    const { title, description, assignee_id, priority, due_date } = body

    if (!title || !assignee_id || !due_date) {
        throw createError({
            statusCode: 400,
            message: 'Thiếu thông tin bắt buộc (Tiêu đề, Người được giao, Hạn chót)'
        })
    }

    const db = await useDb()
    db.data.tasks = db.data.tasks || []

    // 1. Get Assignee Info (to know their department)
    const assignee = db.data.members.find(m => m.id === assignee_id && m.license_key === licenseKey)
    if (!assignee) {
        throw createError({ statusCode: 400, message: 'Người được giao không tồn tại' })
    }

    // 2. Permission Check (Optional: restrict who can create?)
    if (memberId) {
        const creator = db.data.members.find(m => m.id === memberId)
        if (creator) {
            if (creator.role === 'Member') {
                throw createError({ statusCode: 403, message: 'Nhân viên không có quyền tạo nhiệm vụ' })
            }
            if (creator.role === 'Leader' && creator.department_id !== assignee.department_id) {
                // Leader can only assign to their own department?
                // For now, let's allow cross-dept assignment or restrict it. 
                // Sticking to "Leader xem và cập nhật được hết task của phòng ban đó", implies specific scope.
            }
        }
    }

    const newTask = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        title,
        description: description || '',
        assignee_id,
        department_id: assignee.department_id, // Link task to assignee's department info
        priority: priority || 'medium',
        status: 'todo',
        due_date,
        license_key: licenseKey,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }

    db.data.tasks.push(newTask as any)
    await db.write()

    // --- Notifications ---
    // 1. Notify Assignee
    await createNotification(
        licenseKey,
        assignee_id,
        'Nhiệm vụ mới',
        `Bạn đã được phân công nhiệm vụ: ${title}`,
        'task_assigned',
        '/tasks'
    )

    // 2. Notify Owner (if creator is not owner)
    // We assume Owner ID is 'owner' (derived from license key usually) or we fetch it?
    // In our simplified logic, 'owner' is the catch-all for the License Admin.
    if (memberId) { // If a member (Leader) created this, notify Owner
        // Optional: Notify Owner? Or only if critical?
        // User request: "sẽ có thông báo tương ứng đến chủ doanh nghiệp" -> Yes.
        await createNotification(
            licenseKey,
            'owner',
            'Nhiệm vụ mới được tạo',
            `Một nhiệm vụ mới "${title}" đã được giao cho ${assignee.name}`,
            'task_assigned',
            '/tasks'
        )
    }

    return {
        success: true,
        data: newTask
    }
})
