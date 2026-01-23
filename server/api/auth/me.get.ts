
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')
    const memberId = getCookie(event, 'member_id')
    const memberRole = getCookie(event, 'member_role')

    if (!licenseKey) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // Default to Owner info if no member logged in check
    let user = {
        name: 'Admin User',
        role: 'Owner',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=random'
    }

    if (memberId) {
        const db = await useDb()
        const member = db.data.members.find(m => m.id === memberId)
        if (member) {
            user = {
                name: member.name,
                role: member.role, // 'Leader' | 'Member'
                avatar: member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`
            }
        }
    } else {
        // If license key exists but no memberId, it's the main License Owner
        // Optionally fetch license name if stored in DB
        user.name = 'Chủ sở hữu'
        user.role = 'Owner'
    }

    return {
        success: true,
        user
    }
})
