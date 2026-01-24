
import { useDb } from '../../utils/db'
import { createNotification } from '../../utils/notifications'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')
    const memberId = getCookie(event, 'member_id')
    const id = getRouterParam(event, 'id')

    if (!licenseKey) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        })
    }

    const body = await readBody(event)
    // Extract fields
    const { title, description, priority, status, due_date, assignee_id, category } = body

    const db = await useDb()
    const taskIndex = db.data.tasks.findIndex(t => t.id === id && t.license_key === licenseKey)

    if (taskIndex === -1) {
        throw createError({ statusCode: 404, message: 'Nhiệm vụ không tồn tại' })
    }

    const currentTask = db.data.tasks[taskIndex]

    // --- Permission Check ---
    if (memberId) {
        const user = db.data.members.find(m => m.id === memberId)
        if (!user) throw createError({ statusCode: 401, message: 'User not found' })

        if (user.role === 'Member') {
            // Member Check: Must be assigned to them
            if (currentTask.assignee_id !== memberId) {
                throw createError({ statusCode: 403, message: 'Bạn không có quyền sửa nhiệm vụ này' })
            }

            // Member Check: Can ONLY update status
            // If any other field is being updated, throw error
            if (title !== undefined && title !== currentTask.title) throw createError({ statusCode: 403, message: 'Nhân viên không được sửa tên nhiệm vụ' })
            if (description !== undefined && description !== currentTask.description) throw createError({ statusCode: 403, message: 'Nhân viên không được sửa mô tả' })
            if (priority !== undefined && priority !== currentTask.priority) throw createError({ statusCode: 403, message: 'Nhân viên không được sửa độ ưu tiên' })
            if (due_date !== undefined && due_date !== currentTask.due_date) throw createError({ statusCode: 403, message: 'Nhân viên không được sửa hạn hoàn thành' })
            if (assignee_id !== undefined && assignee_id !== currentTask.assignee_id) throw createError({ statusCode: 403, message: 'Nhân viên không được chuyển giao nhiệm vụ' })
            if (category !== undefined && category !== currentTask.category) throw createError({ statusCode: 403, message: 'Nhân viên không được sửa danh mục' })
        }

        if (user.role === 'Leader') {
            // Leader Check: Must be in their department
            if (currentTask.department_id !== user.department_id) {
                throw createError({ statusCode: 403, message: 'Bạn chỉ được quản lý nhiệm vụ trong phòng ban của mình' })
            }
        }
    }

    // Update
    const updatedTask = {
        ...currentTask,
        title: title !== undefined ? title : currentTask.title,
        description: description !== undefined ? description : currentTask.description,
        priority: priority !== undefined ? priority : currentTask.priority,
        status: status !== undefined ? status : currentTask.status,
        category: category !== undefined ? category : currentTask.category,
        due_date: due_date !== undefined ? due_date : currentTask.due_date,
        // If assignee changes, we might need to update department_id too? 
        // For simplicity assuming assignee update logic handles department sync if needed, 
        // but frontend usually restricts this.
        assignee_id: assignee_id !== undefined ? assignee_id : currentTask.assignee_id,
        updated_at: new Date().toISOString()
    }

    // If assignee changed, update department_id
    if (assignee_id && assignee_id !== currentTask.assignee_id) {
        const newAssignee = db.data.members.find(m => m.id === assignee_id)
        if (newAssignee) {
            updatedTask.department_id = newAssignee.department_id
        }
    }

    db.data.tasks[taskIndex] = updatedTask
    await db.write()

    // --- Notifications ---
    // 1. Status Update: Notify Assignee (if update wasn't by them) or Leader/Owner
    // 1. Status Update: Notify Assignee (if update wasn't by them) or Supervisors
    if (status !== undefined && status !== currentTask.status) {

        const actorId = memberId || 'owner'
        const actorName = memberId
            ? (db.data.members.find(m => m.id === memberId)?.name || 'Nhân viên')
            : 'Chủ doanh nghiệp'

        const statusMap: Record<string, string> = {
            'todo': 'Cần làm',
            'in-progress': 'Đang làm',
            'done': 'Hoàn thành'
        }
        const statusText = statusMap[status] || status

        // If the ACTOR is the assignee, we must notify UP (Leader + Owner)
        if (currentTask.assignee_id === actorId) {

            // A. Notify Owner (Always)
            if (actorId !== 'owner') {
                await createNotification(licenseKey, 'owner', 'Cập nhật tiến độ', `"${actorName}" đã cập nhật trạng thái nhiệm vụ "${updatedTask.title}" sang: ${statusText}`, 'task_updated', '/tasks')
            }

            // B. Notify Department Leader (If exists and is not the actor)
            if (currentTask.department_id) {
                const leader = db.data.members.find(m => m.department_id === currentTask.department_id && m.role === 'Leader' && m.license_key === licenseKey)
                if (leader && leader.id !== actorId) {
                    await createNotification(licenseKey, leader.id, 'Cập nhật tiến độ', `"${actorName}" đã cập nhật trạng thái nhiệm vụ "${updatedTask.title}" sang: ${statusText}`, 'task_updated', '/tasks')
                }
            }
        }

        // If Leader/Owner updated it, notify Assignee
        if (!memberId || (memberId && memberId !== currentTask.assignee_id)) {
            await createNotification(licenseKey, updatedTask.assignee_id, 'Cập nhật nhiệm vụ', `Nhiệm vụ "${updatedTask.title}" đã được cập nhật trạng thái sang: ${statusText}`, 'task_updated', '/tasks')
        }
    }

    // 2. Re-assignment
    if (assignee_id && assignee_id !== currentTask.assignee_id) {
        await createNotification(licenseKey, assignee_id, 'Phân công lại', `Bạn được giao nhiệm vụ: ${updatedTask.title}`, 'task_assigned', '/tasks')
    }

    return {
        success: true,
        data: updatedTask
    }
})
