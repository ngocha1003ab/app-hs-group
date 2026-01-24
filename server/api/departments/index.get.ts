
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')

    if (!licenseKey) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized: Missing license key'
        })
    }

    const db = await useDb()

    // Filter departments by license key
    db.data.departments = db.data.departments || []

    // Filter departments by license key
    let departments = db.data.departments.filter(d => d.license_key === licenseKey)

    // Role-based filtering
    const memberId = getCookie(event, 'member_id')
    if (memberId) {
        const currentUser = db.data.members.find(m => m.id === memberId && m.license_key === licenseKey)
        if (currentUser && currentUser.role !== 'Owner') {
            // Leaders (and Members) see only their own department
            departments = departments.filter(d => d.id === currentUser.department_id)
        }
    }

    // Get all members for this license to optimize mapping (avoiding O(N*M) full scans if possible, though lowdb is in-memory so it's fine)
    db.data.members = db.data.members || []
    const members = db.data.members.filter(m => m.license_key === licenseKey)

    // Map members to their departments
    const result = departments.map(dept => {
        const deptMembers = members.filter(m => m.department_id === dept.id)
        return {
            ...dept,
            members: deptMembers
        }
    })

    // Sort by newest first (optional, but good UX)
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})
