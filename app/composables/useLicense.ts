
export interface LicenseInfo {
    key_license: string
    email: string
    expired_at: string | null
    [key: string]: any
}

export const useLicense = () => {
    // Persistent state using Nuxt's useState (synced with cookie)
    const license = useState<LicenseInfo | null>('license', () => null)

    // Cookie specifically for persistency across reloads
    const licenseCookie = useCookie<LicenseInfo | null>('license_data', {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        watch: true
    })

    // Initialize state from cookie if available
    if (licenseCookie.value && !license.value) {
        license.value = licenseCookie.value
    }

    // Setter to update both state and cookie
    const setLicense = (data: LicenseInfo) => {
        license.value = data
        licenseCookie.value = data
    }

    // Clear session
    const clearLicense = () => {
        license.value = null
        licenseCookie.value = null
    }

    return {
        license,
        setLicense,
        clearLicense
    }
}
