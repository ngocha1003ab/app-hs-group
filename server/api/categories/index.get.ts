import { useDb, Category } from '../../utils/db'

// Default categories that will be seeded for new licenses
const DEFAULT_CATEGORIES = [
    { name: 'Video', icon: 'i-heroicons-video-camera', color: '#EF4444' },
    { name: 'Hình ảnh', icon: 'i-heroicons-photo', color: '#F97316' },
    { name: 'Văn bản', icon: 'i-heroicons-document-text', color: '#EAB308' },
    { name: 'Kinh doanh', icon: 'i-heroicons-briefcase', color: '#22C55E' },
    { name: 'Thiết kế', icon: 'i-heroicons-paint-brush', color: '#06B6D4' },
    { name: 'Lập trình', icon: 'i-heroicons-code-bracket', color: '#8B5CF6' },
    { name: 'Marketing', icon: 'i-heroicons-megaphone', color: '#EC4899' },
    { name: 'Hành chính', icon: 'i-heroicons-clipboard-document-list', color: '#64748B' },
    { name: 'Khác', icon: 'i-heroicons-ellipsis-horizontal-circle', color: '#94A3B8' }
]

export default defineEventHandler(async (event) => {
    const licenseKey = getCookie(event, 'license_key')

    if (!licenseKey) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized: Missing license key'
        })
    }

    const db = await useDb()

    // Initialize categories array if not exists
    db.data.categories = db.data.categories || []

    // Get categories for this license
    let categories = db.data.categories.filter(c => c.license_key === licenseKey)

    // If no categories exist for this license, seed default categories
    if (categories.length === 0) {
        const now = new Date().toISOString()
        const defaultCats: Category[] = DEFAULT_CATEGORIES.map((cat, index) => ({
            id: `cat_default_${index + 1}_${Date.now()}`,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            license_key: licenseKey,
            is_default: true,
            created_at: now
        }))

        db.data.categories.push(...defaultCats)
        await db.write()
        categories = defaultCats
    }

    // Sort by created_at (oldest first for defaults, then newest custom)
    return categories.sort((a, b) => {
        // Defaults first
        if (a.is_default && !b.is_default) return -1
        if (!a.is_default && b.is_default) return 1
        // Then by created_at
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })
})
