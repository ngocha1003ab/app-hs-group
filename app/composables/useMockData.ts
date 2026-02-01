// Shared state (Global mock DB)
const currentUser = ref({
    id: 'user-1',
    name: 'Nguyễn Quản Trị',
    username: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Nguyen+Quan+Tri&background=0D8ABC&color=fff',
    role: 'Owner',
    email: 'admin@sheetvn.com',
    phone: '0909123456'
})

const departments = ref([
    { id: 'dept-1', name: 'Ban Giám Đốc', description: 'Điều hành và quản lý chung' },
    { id: 'dept-2', name: 'Phòng Kinh Doanh', description: 'Tìm kiếm khách hàng và bán hàng' },
    { id: 'dept-3', name: 'Phòng Marketing', description: 'Quảng bá thương hiệu và sản phẩm' },
    { id: 'dept-4', name: 'Phòng Kỹ Thuật', description: 'Phát triển và bảo trì hệ thống' },
    { id: 'dept-5', name: 'Phòng Nhân Sự', description: 'Tuyển dụng và quản lý nhân sự' }
])

const employees = ref([
    {
        id: 'emp-1',
        name: 'Nguyễn Văn An',
        username: 'an.nguyen',
        avatar: 'https://i.pravatar.cc/150?u=emp-1',
        role: 'Leader',
        department_id: 'dept-2',
        email: 'an.nguyen@company.com',
        phone: '0912345678'
    },
    {
        id: 'emp-2',
        name: 'Trần Thị Bình',
        username: 'binh.tran',
        avatar: 'https://i.pravatar.cc/150?u=emp-2',
        role: 'Member',
        department_id: 'dept-2',
        email: 'binh.tran@company.com',
        phone: '0912345679'
    },
    {
        id: 'emp-3',
        name: 'Lê Hoàng Cường',
        username: 'cuong.le',
        avatar: 'https://i.pravatar.cc/150?u=emp-3',
        role: 'Leader',
        department_id: 'dept-4',
        email: 'cuong.le@company.com',
        phone: '0912345680'
    },
    {
        id: 'emp-4',
        name: 'Phạm Minh Dung',
        username: 'dung.pham',
        avatar: 'https://i.pravatar.cc/150?u=emp-4',
        role: 'Member',
        department_id: 'dept-3',
        email: 'dung.pham@company.com',
        phone: '0912345681'
    },
    {
        id: 'emp-5',
        name: 'Hoàng Văn Em',
        username: 'em.hoang',
        avatar: 'https://i.pravatar.cc/150?u=emp-5',
        role: 'Member',
        department_id: 'dept-4',
        email: 'em.hoang@company.com',
        phone: '0912345682'
    },
    {
        id: 'emp-6',
        name: 'Vũ Thị Hoa',
        username: 'hoa.vu',
        avatar: 'https://i.pravatar.cc/150?u=emp-6',
        role: 'Member',
        department_id: 'dept-5',
        email: 'hoa.vu@company.com',
        phone: '0912345683'
    }
])

// Helper to init tasks - nhiều task hơn để calendar đẹp hơn
const initTasks = () => {
    const today = new Date()
    const formatISO = (date: Date) => date.toISOString().split('T')[0]

    // Helper to create date relative to today
    const daysFromNow = (days: number) => {
        const d = new Date(today)
        d.setDate(today.getDate() + days)
        return formatISO(d)
    }

    return [
        // === TASKS FOR THIS WEEK ===
        {
            id: 'task-1',
            title: 'Lên kế hoạch Marketing Quý 2',
            description: 'Tổng hợp ý tưởng và ngân sách cho các chiến dịch quảng cáo mùa hè.',
            assignee_id: 'emp-4',
            department_id: 'dept-3',
            priority: 'high',
            status: 'in-progress',
            category: 'marketing',
            due_date: daysFromNow(1)
        },
        {
            id: 'task-2',
            title: 'Fix lỗi đăng nhập trên Mobile',
            description: 'Khách hàng báo lỗi không thể đăng nhập bằng vân tay trên iOS 17.',
            assignee_id: 'emp-3',
            department_id: 'dept-4',
            priority: 'high',
            status: 'todo',
            category: 'development',
            due_date: daysFromNow(0)
        },
        {
            id: 'task-3',
            title: 'Tuyển dụng nhân viên Sale',
            description: 'Đăng tin tuyển dụng và lọc CV vòng 1 cho vị trí Sales Executive.',
            assignee_id: 'emp-6',
            department_id: 'dept-5',
            priority: 'medium',
            status: 'done',
            category: 'admin',
            due_date: daysFromNow(-1)
        },
        {
            id: 'task-4',
            title: 'Báo cáo doanh thu tháng 1',
            description: 'Tổng hợp số liệu doanh thu từ các kênh bán hàng online và offline.',
            assignee_id: 'emp-1',
            department_id: 'dept-2',
            priority: 'medium',
            status: 'in-progress',
            category: 'business',
            due_date: daysFromNow(7)
        },
        {
            id: 'task-5',
            title: 'Thiết kế Banner khuyến mãi',
            description: 'Thiết kế bộ banner cho chương trình giảm giá Black Friday.',
            assignee_id: 'emp-2',
            department_id: 'dept-3',
            priority: 'low',
            status: 'todo',
            category: 'design',
            due_date: daysFromNow(1)
        },
        {
            id: 'task-6',
            title: 'Họp team kỹ thuật',
            description: 'Review code và plan sprint mới.',
            assignee_id: 'emp-5',
            department_id: 'dept-4',
            priority: 'medium',
            status: 'done',
            category: 'development',
            due_date: daysFromNow(-5)
        },
        {
            id: 'task-7',
            title: 'Kiểm kê tài sản văn phòng',
            description: 'Định kỳ kiểm kê bàn ghế, máy tính.',
            assignee_id: 'emp-6',
            department_id: 'dept-5',
            priority: 'low',
            status: 'todo',
            category: 'admin',
            due_date: daysFromNow(7)
        },
        // === THÊM NHIỀU TASK MỚI ===
        {
            id: 'task-8',
            title: 'Họp ban giám đốc',
            description: 'Họp thường kỳ hàng tuần giữa các trưởng phòng.',
            assignee_id: 'emp-1',
            department_id: 'dept-1',
            priority: 'high',
            status: 'todo',
            category: 'business',
            due_date: daysFromNow(2)
        },
        {
            id: 'task-9',
            title: 'Đào tạo nhân viên mới',
            description: 'Onboarding cho 3 nhân viên mới vào tuần này.',
            assignee_id: 'emp-6',
            department_id: 'dept-5',
            priority: 'medium',
            status: 'in-progress',
            category: 'admin',
            due_date: daysFromNow(3)
        },
        {
            id: 'task-10',
            title: 'Review chiến lược bán hàng',
            description: 'Phân tích kết quả Q1 và điều chỉnh chiến lược.',
            assignee_id: 'emp-1',
            department_id: 'dept-2',
            priority: 'high',
            status: 'todo',
            category: 'business',
            due_date: daysFromNow(4)
        },
        {
            id: 'task-11',
            title: 'Cập nhật database khách hàng',
            description: 'Làm sạch và cập nhật thông tin 500+ khách hàng.',
            assignee_id: 'emp-2',
            department_id: 'dept-2',
            priority: 'medium',
            status: 'in-progress',
            category: 'business',
            due_date: daysFromNow(5)
        },
        {
            id: 'task-12',
            title: 'Quay video sản phẩm mới',
            description: 'Sản xuất video giới thiệu sản phẩm cho YouTube.',
            assignee_id: 'emp-4',
            department_id: 'dept-3',
            priority: 'high',
            status: 'todo',
            category: 'video',
            due_date: daysFromNow(6)
        },
        {
            id: 'task-13',
            title: 'Gửi email khuyến mãi Tết',
            description: 'Soạn và gửi email marketing cho chiến dịch Tết.',
            assignee_id: 'emp-4',
            department_id: 'dept-3',
            priority: 'medium',
            status: 'done',
            category: 'marketing',
            due_date: daysFromNow(-2)
        },
        {
            id: 'task-14',
            title: 'Phát triển API thanh toán',
            description: 'Tích hợp cổng thanh toán VNPay và Momo.',
            assignee_id: 'emp-3',
            department_id: 'dept-4',
            priority: 'high',
            status: 'in-progress',
            category: 'development',
            due_date: daysFromNow(8)
        },
        {
            id: 'task-15',
            title: 'Kiểm thử ứng dụng mobile',
            description: 'QA testing cho phiên bản iOS và Android mới.',
            assignee_id: 'emp-5',
            department_id: 'dept-4',
            priority: 'medium',
            status: 'todo',
            category: 'development',
            due_date: daysFromNow(9)
        },
        {
            id: 'task-16',
            title: 'Thiết kế UI trang chủ mới',
            description: 'Redesign giao diện trang chủ website công ty.',
            assignee_id: 'emp-2',
            department_id: 'dept-3',
            priority: 'medium',
            status: 'in-progress',
            category: 'design',
            due_date: daysFromNow(10)
        },
        {
            id: 'task-17',
            title: 'Liên hệ đối tác chiến lược',
            description: 'Gặp gỡ và đàm phán hợp tác với 3 đối tác tiềm năng.',
            assignee_id: 'emp-1',
            department_id: 'dept-2',
            priority: 'high',
            status: 'todo',
            category: 'business',
            due_date: daysFromNow(3)
        },
        {
            id: 'task-18',
            title: 'Xử lý khiếu nại khách hàng',
            description: 'Giải quyết các ticket hỗ trợ khẩn cấp trong tuần.',
            assignee_id: 'emp-2',
            department_id: 'dept-2',
            priority: 'high',
            status: 'in-progress',
            category: 'other',
            due_date: daysFromNow(0)
        },
        {
            id: 'task-19',
            title: 'Chụp ảnh sản phẩm mới',
            description: 'Studio shoot cho bộ sưu tập mùa xuân.',
            assignee_id: 'emp-4',
            department_id: 'dept-3',
            priority: 'medium',
            status: 'todo',
            category: 'image',
            due_date: daysFromNow(5)
        },
        {
            id: 'task-20',
            title: 'Chuẩn bị tài liệu hợp đồng',
            description: 'Soạn thảo hợp đồng cho đối tác mới.',
            assignee_id: 'emp-6',
            department_id: 'dept-5',
            priority: 'medium',
            status: 'done',
            category: 'document',
            due_date: daysFromNow(-3)
        },
        {
            id: 'task-21',
            title: 'Training SEO cho team',
            description: 'Workshop về tối ưu SEO cho đội ngũ content.',
            assignee_id: 'emp-4',
            department_id: 'dept-3',
            priority: 'low',
            status: 'todo',
            category: 'marketing',
            due_date: daysFromNow(11)
        },
        {
            id: 'task-22',
            title: 'Setup máy chủ mới',
            description: 'Cấu hình và deploy server production mới.',
            assignee_id: 'emp-3',
            department_id: 'dept-4',
            priority: 'high',
            status: 'todo',
            category: 'development',
            due_date: daysFromNow(2)
        },
        {
            id: 'task-23',
            title: 'Đánh giá hiệu suất nhân viên',
            description: 'Review KPI và đánh giá hiệu suất Q1.',
            assignee_id: 'emp-6',
            department_id: 'dept-5',
            priority: 'medium',
            status: 'in-progress',
            category: 'admin',
            due_date: daysFromNow(12)
        },
        {
            id: 'task-24',
            title: 'Cập nhật catalog sản phẩm',
            description: 'Chỉnh sửa và cập nhật danh mục sản phẩm trên website.',
            assignee_id: 'emp-2',
            department_id: 'dept-3',
            priority: 'low',
            status: 'todo',
            category: 'document',
            due_date: daysFromNow(4)
        },
        {
            id: 'task-25',
            title: 'Phân tích đối thủ cạnh tranh',
            description: 'Nghiên cứu chiến lược marketing của đối thủ.',
            assignee_id: 'emp-4',
            department_id: 'dept-3',
            priority: 'medium',
            status: 'in-progress',
            category: 'marketing',
            due_date: daysFromNow(6)
        },
        {
            id: 'task-26',
            title: 'Backup dữ liệu hàng tuần',
            description: 'Thực hiện sao lưu toàn bộ database và files.',
            assignee_id: 'emp-5',
            department_id: 'dept-4',
            priority: 'medium',
            status: 'done',
            category: 'development',
            due_date: daysFromNow(-4)
        },
        {
            id: 'task-27',
            title: 'Tổ chức team building',
            description: 'Lên kế hoạch và tổ chức sự kiện team building Q2.',
            assignee_id: 'emp-6',
            department_id: 'dept-5',
            priority: 'low',
            status: 'todo',
            category: 'other',
            due_date: daysFromNow(14)
        },
        {
            id: 'task-28',
            title: 'Cải thiện tốc độ website',
            description: 'Tối ưu hóa hiệu suất và thời gian tải trang.',
            assignee_id: 'emp-3',
            department_id: 'dept-4',
            priority: 'high',
            status: 'in-progress',
            category: 'development',
            due_date: daysFromNow(1)
        },
        {
            id: 'task-29',
            title: 'Viết blog giới thiệu sản phẩm',
            description: 'Tạo nội dung blog về 5 sản phẩm bán chạy nhất.',
            assignee_id: 'emp-4',
            department_id: 'dept-3',
            priority: 'medium',
            status: 'todo',
            category: 'document',
            due_date: daysFromNow(8)
        },
        {
            id: 'task-30',
            title: 'Xây dựng báo cáo tài chính',
            description: 'Lập báo cáo tài chính quý 1 cho ban giám đốc.',
            assignee_id: 'emp-1',
            department_id: 'dept-1',
            priority: 'high',
            status: 'in-progress',
            category: 'business',
            due_date: daysFromNow(5)
        }
    ]
}

const tasks = ref(initTasks())

const notifications = ref([
    {
        id: 'notif-1',
        title: 'Nhiệm vụ mới được giao',
        description: 'Bạn đã được giao nhiệm vụ "Lên kế hoạch Marketing Quý 2"',
        time: 'Vừa xong',
        read: false,
        created_at: new Date().toISOString()
    },
    {
        id: 'notif-2',
        title: 'Nhắc nhở hạn chót',
        description: 'Nhiệm vụ "Fix lỗi đăng nhập" sẽ hết hạn vào hôm nay.',
        time: '1 giờ trước',
        read: false,
        created_at: new Date(Date.now() - 3600 * 1000).toISOString()
    },
    {
        id: 'notif-3',
        title: 'Hoàn thành công việc',
        description: 'Nguyễn Văn An đã hoàn thành "Báo cáo doanh thu tháng 1"',
        time: '1 ngày trước',
        read: true,
        created_at: new Date(Date.now() - 86400 * 1000).toISOString()
    }
])

const comments = ref([
    {
        id: 'cmt-1',
        user_id: 'emp-1',
        content: 'Tôi đã cập nhật số liệu mới nhất vào file Excel.',
        image: '',
        created_at: new Date(Date.now() - 3600 * 1000).toISOString()
    },
    {
        id: 'cmt-2',
        user_id: 'emp-3',
        content: 'Đã nhận được thông tin, sẽ xử lý ngay.',
        image: 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=400&q=80',
        created_at: new Date().toISOString()
    }
])

export const useMockData = () => {
    return {
        currentUser,
        departments,
        employees,
        tasks,
        notifications,
        comments
    }
}
