
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')
    const memberId = getCookie(event, 'member_id')

    if (!licenseKey) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const body = await readBody(event)
    const { name, username, avatar, phone, email, oldPassword, newPassword } = body

    const db = await useDb()

    // Check Username Uniqueness if username is being updated
    if (username) {
        const isTakenMember = db.data.members.some(m => m.username === username && m.id !== memberId) // logic covers owner too since owner has no memberId so safe? No, owner ID is undefined in member check.
        // Wait, if I am member, my ID is memberId. If I am owner, memberId is undefined.
        // Logic:
        // If I am member: check other members with diff ID. Check all settings/owners (assuming owners not in members).
        // If I am owner: check all members. Check other settings with diff license/member_id? But owner is identified by license_key & !member_id.

        // Simplified Global Check (excluding self)

        let isTaken = false

        // Check members
        const conflictMember = db.data.members.find(m => m.username === username)
        if (conflictMember) {
            if (memberId) {
                if (conflictMember.id !== memberId) isTaken = true
            } else {
                // For owner, any member match is a conflict
                isTaken = true
            }
        }

        // Check owners/settings
        if (!isTaken) {
            const conflictSetting = db.data.settings?.find(s => s.username === username)
            if (conflictSetting) {
                if (memberId) {
                    // For member, any setting match is conflict
                    isTaken = true
                } else {
                    // For owner, check if it's NOT ME (same license, no member_id)
                    // If conflict is same license AND no member_id, it is me.
                    if (!(conflictSetting.license_key === licenseKey && !conflictSetting.member_id)) {
                        isTaken = true
                    }
                }
            }
        }

        if (isTaken) {
            throw createError({ statusCode: 409, message: 'Tên đăng nhập đã tồn tại' })
        }
    }

    if (memberId) {
        // Update Member
        const memberIndex = db.data.members.findIndex(m => m.id === memberId)
        if (memberIndex === -1) {
            throw createError({ statusCode: 404, message: 'Member not found' })
        }

        const member = db.data.members[memberIndex]

        // Update fields
        if (name) member.name = name
        if (username) member.username = username
        if (avatar) member.avatar = avatar
        if (phone) member.phone = phone
        if (email) member.email = email
        if (newPassword) member.password = newPassword

        db.data.members[memberIndex] = member
    } else {
        // Update Owner (Settings) - KEEPING FOR SETTINGS METADATA
        if (!Array.isArray(db.data.settings)) {
            db.data.settings = []
        }

        let settingsIndex = db.data.settings.findIndex(s => s.license_key === licenseKey && !s.member_id)
        if (settingsIndex === -1) {
            db.data.settings.push({ license_key: licenseKey })
            settingsIndex = db.data.settings.length - 1
        }

        if (name) db.data.settings[settingsIndex].name = name
        if (username) db.data.settings[settingsIndex].username = username
        if (avatar) db.data.settings[settingsIndex].avatar = avatar
        if (phone) db.data.settings[settingsIndex].phone = phone
        if (email) db.data.settings[settingsIndex].email = email
        if (newPassword) db.data.settings[settingsIndex].password = newPassword

        // SYNC TO MEMBERS TABLE (Create/Update Owner Account in Members)
        let ownerMemberIndex = db.data.members.findIndex(m => m.license_key === licenseKey && m.role === 'Owner')

        const now = new Date().toISOString()

        if (ownerMemberIndex === -1) {
            // Create new Owner Member
            // Generate simple ID like 'owner_' + timestamp or just use what we have
            const newOwner = {
                id: 'owner_' + Date.now().toString(36),
                name: name || 'Chủ doanh nghiệp',
                username: username || '',
                password: newPassword || '',
                email: email || '',
                phone: phone || '',
                avatar: avatar || '',
                role: 'Owner' as const,
                department_id: '', // Owner no dept
                license_key: licenseKey,
                created_at: now
            }
            db.data.members.push(newOwner)
        } else {
            // Update existing Owner Member
            const owner = db.data.members[ownerMemberIndex]
            if (name) owner.name = name
            if (username) owner.username = username
            if (avatar) owner.avatar = avatar
            if (phone) owner.phone = phone
            if (email) owner.email = email
            if (newPassword) owner.password = newPassword

            db.data.members[ownerMemberIndex] = owner
        }
    }

    await db.write()

    return { success: true }
})
