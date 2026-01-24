
export interface LicenseCheckResponse {
    success: boolean
    data?: {
        id: number
        key_license: string
        expired_at: string | null // null means lifetime
        product_id: number
        email: string
        status: number
    }
    message?: string
}

export const validateLicenseKey = async (key: string): Promise<LicenseCheckResponse> => {
    try {
        const response = await $fetch<LicenseCheckResponse>('https://shop.sheetvn.com/api/user/license/checking', {
            method: 'GET',
            query: {
                key_license: key,
                product_id: 627
            }
        })
        return response
    } catch (error) {
        console.error('License validation error:', error)
        return {
            success: false,
            message: 'Lỗi kết nối đến máy chủ xác thực.'
        }
    }
}
