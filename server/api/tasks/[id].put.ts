
import { useDb } from '../../utils/db'

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
    const { title, description, priority, status, due_date, assignee_id } = body

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
            // Member Check: Cannot change Due Date
            if (due_date && due_date !== currentTask.due_date) {
                throw createError({ statusCode: 403, message: 'Nhân viên không được sửa hạn hoàn thành' })
            }
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

    return {
        success: true,
        data: updatedTask
    }
})
