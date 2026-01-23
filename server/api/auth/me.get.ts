
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')
    const memberId = getCookie(event, 'member_id')

    if (!licenseKey) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const db = await useDb()

    // Fetch Global Settings for Company Name
    if (!Array.isArray(db.data.settings)) {
        db.data.settings = []
    }
    const globalSettings = db.data.settings.find(s => s.license_key === licenseKey && !s.member_id)
    const companyName = globalSettings?.companyName || 'Dashboard'

    // Default User
    let user: any = {
        name: 'Admin User',
        role: 'Owner',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=random',
        phone: '',
        email: ''
    }

    if (memberId) {
        const member = db.data.members.find(m => m.id === memberId)
        if (member) {
            user = {
                name: member.name,
                role: member.role,
                avatar: member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`,
                id: member.id,
                username: member.username || '',
                phone: member.phone || '',
                email: member.email || ''
            }
        }
    } else {
        // Owner Check
        const ownerMember = db.data.members.find(m => m.license_key === licenseKey && m.role === 'Owner')

        if (ownerMember) {
            user = {
                name: ownerMember.name,
                role: 'Owner',
                avatar: ownerMember.avatar || 'https://ui-avatars.com/api/?name=Owner&background=random',
                id: ownerMember.id,
                username: ownerMember.username || '',
                phone: ownerMember.phone || '',
                email: ownerMember.email || ''
            }
        } else {
            // Fallback Profile from Settings
            const settings = globalSettings || { license_key: licenseKey } as any

            user = {
                name: settings.name || 'Chủ doanh nghiệp',
                role: 'Owner',
                avatar: settings.avatar || 'https://ui-avatars.com/api/?name=Owner&background=random',
                id: 'owner',
                username: settings.username || '',
                phone: settings.phone || '',
                email: settings.email || ''
            }
        }
    }

    return {
        success: true,
        user,
        companyName
    }
})
