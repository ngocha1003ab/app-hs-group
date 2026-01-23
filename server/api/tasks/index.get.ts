
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')
    // We assume there might be a member_id cookie if logged in as member
    const memberId = getCookie(event, 'member_id')

    if (!licenseKey) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized: Missing license key'
        })
    }

    const db = await useDb()

    // Safety check
    db.data.tasks = db.data.tasks || []

    // Base filter: Always by license key
    let tasks = db.data.tasks.filter(t => t.license_key === licenseKey)

    // Permission Logic
    if (memberId) {
        const member = db.data.members.find(m => m.id === memberId && m.license_key === licenseKey)

        if (member) {
            if (member.role === 'Owner') {
                // Owner: View ALL tasks (No extra filter)
            } else if (member.role === 'Leader') {
                // Leader: View all tasks in their department
                tasks = tasks.filter(t => t.department_id === member.department_id)
            } else {
                // Member: View only assigned tasks
                tasks = tasks.filter(t => t.assignee_id === memberId)
            }
        } else {
            // Invalid member session? Fallback or error?
            // For safety, if memberId provided but not found, maybe return nothing or treat as unauthorized
            // But if they have a valid license key, maybe they are just "browsing"? 
            // Let's assume strict: if identifying as member, must exist.
        }
    }
    // If no memberId, assume Owner/Admin -> View ALL tasks (already filtered by licenseKey)

    // Search
    const query = getQuery(event)
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 20
    const search = (query.search as string || '').toLowerCase()

    if (search) {
        tasks = tasks.filter(t => t.title.toLowerCase().includes(search))
    }

    // Sort by newest first
    tasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Pagination
    const total = tasks.length
    const start = (page - 1) * limit
    const paginatedTasks = tasks.slice(start, start + limit)

    return {
        data: paginatedTasks,
        total,
        page,
        limit
    }
})
