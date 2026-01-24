
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')
    const memberId = getCookie(event, 'member_id')

    if (!licenseKey) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized: Missing license key'
        })
    }

    const db = await useDb()

    // Safety check
    db.data.members = db.data.members || []

    // Filter members by license key
    let members = db.data.members.filter(m => m.license_key === licenseKey)

    // If user is a Leader (not Owner), filter by department
    if (memberId) {
        const currentUser = db.data.members.find(m => m.id === memberId)
        if (currentUser && currentUser.role === 'Leader') {
            // Leader can only see members from their department
            members = members.filter(m => m.department_id === currentUser.department_id)
        } else if (currentUser && currentUser.role === 'Member') {
            // Member can see all members in their department (to view task assignees)
            // But they can't create/assign tasks (that's handled in task creation API)
            members = members.filter(m => m.department_id === currentUser.department_id)
        }
    }

    // Sort by newest first
    return members.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})
