/**
 * Quản lý Công việc - Google Apps Script Backend
 * Sử dụng SpreadsheetApp.getActiveSpreadsheet() để lấy sheet đang mở
 */

// ============ CONFIGURATION ============
const SHEET_NAMES = {
    SETTINGS: 'Cài Đặt',
    DEPARTMENTS: 'Phòng Ban',
    EMPLOYEES: 'Nhân Viên',
    CATEGORIES: 'Danh Mục',
    TASKS: 'Nhiệm Vụ',
    COMMENTS: 'Bình Luận',
    NOTIFICATIONS: 'Thông Báo'
};

// ============ WEB APP ENTRY ============
function doGet() {
    return HtmlService.createHtmlOutputFromFile('index')
        .setTitle('Quản lý Công việc')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ============ HELPERS ============
function getSheet(name) {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function generateId(prefix) {
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

function getSheetData(sheetName) {
    const sheet = getSheet(sheetName);
    if (!sheet) return [];
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    const headers = data[0];
    return data.slice(1).map((row, idx) => {
        const obj = { _rowIndex: idx + 2 };
        headers.forEach((h, i) => { obj[h] = row[i]; });
        return obj;
    });
}

function findRowByColumn(sheetName, colName, value) {
    const data = getSheetData(sheetName);
    return data.find(r => r[colName] === value);
}

function appendRow(sheetName, rowData) {
    const sheet = getSheet(sheetName);
    // Get headers from first row to ensure correct order
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(h => rowData[h] === undefined ? '' : rowData[h]);
    sheet.appendRow(row);
}

function updateRow(sheetName, rowIndex, rowData) {
    const sheet = getSheet(sheetName);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    headers.forEach((h, i) => {
        if (rowData[h] !== undefined) {
            sheet.getRange(rowIndex, i + 1).setValue(rowData[h]);
        }
    });
}

function deleteRow(sheetName, rowIndex) {
    getSheet(sheetName).deleteRow(rowIndex);
}

// ============ AUTH ============
function login(username, password) {
    // Check admin first
    const settingsData = getSheetData(SHEET_NAMES.SETTINGS);
    const settings = settingsData.length > 0 ? settingsData[0] : null;

    if (settings && settings['Tên đăng nhập'] === username && settings['Mật khẩu'] === password) {
        return {
            success: true,
            user: {
                id: 'owner',
                name: settings['Họ tên'],
                username: settings['Tên đăng nhập'],
                email: settings['Email'] || '',
                phone: settings['Điện thoại'] || '',
                avatar: settings['Ảnh đại diện'] || '',
                role: 'Owner',
                department_id: null
            }
        };
    }

    // Check employees
    const emp = findRowByColumn(SHEET_NAMES.EMPLOYEES, 'Tên đăng nhập', username);
    if (emp && emp['Mật khẩu'] === password) {
        return {
            success: true,
            user: {
                id: emp['ID'],
                name: emp['Họ tên'],
                username: emp['Tên đăng nhập'],
                email: emp['Email'] || '',
                phone: emp['Điện thoại'] || '',
                avatar: emp['Ảnh đại diện'] || '',
                role: emp['Vai trò'],
                department_id: emp['ID Phòng ban']
            }
        };
    }
    return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu' };
}

function getMe(userId) {
    if (userId === 'owner') {
        const settings = getSheetData(SHEET_NAMES.SETTINGS)[0];
        return {
            success: true,
            user: {
                id: 'owner', name: settings['Họ tên'], username: settings['Tên đăng nhập'],
                email: settings['Email'] || '', phone: settings['Điện thoại'] || '',
                avatar: settings['Ảnh đại diện'] || '', role: 'Owner', department_id: null
            }
        };
    }
    const emp = findRowByColumn(SHEET_NAMES.EMPLOYEES, 'ID', userId);
    if (emp) {
        return {
            success: true,
            user: {
                id: emp['ID'], name: emp['Họ tên'], username: emp['Tên đăng nhập'],
                email: emp['Email'] || '', phone: emp['Điện thoại'] || '',
                avatar: emp['Ảnh đại diện'] || '', role: emp['Vai trò'],
                department_id: emp['ID Phòng ban']
            }
        };
    }
    return { success: false };
}

// ============ SETTINGS ============
function getSettings() {
    const data = getSheetData(SHEET_NAMES.SETTINGS)[0];
    return data ? { companyName: data['Tên công ty'], description: data['Mô tả'] } : {};
}

function updateCompanySettings(companyName, description) {
    const sheet = getSheet(SHEET_NAMES.SETTINGS);
    sheet.getRange(2, 1).setValue(companyName);
    sheet.getRange(2, 2).setValue(description);
    return { success: true };
}

function updateProfile(userId, data) {
    if (userId === 'owner') {
        const sheet = getSheet(SHEET_NAMES.SETTINGS);
        if (data.name) sheet.getRange(2, 5).setValue(data.name);
        if (data.email) sheet.getRange(2, 6).setValue(data.email);
        if (data.phone) sheet.getRange(2, 7).setValue(data.phone);
        if (data.avatar) sheet.getRange(2, 8).setValue(data.avatar);
        if (data.username) sheet.getRange(2, 3).setValue(data.username);
        if (data.newPassword) sheet.getRange(2, 4).setValue(data.newPassword);
    } else {
        const emp = findRowByColumn(SHEET_NAMES.EMPLOYEES, 'ID', userId);
        if (emp) {
            const updates = {};
            if (data.name) updates['Họ tên'] = data.name;
            if (data.email) updates['Email'] = data.email;
            if (data.phone) updates['Điện thoại'] = data.phone;
            if (data.avatar) updates['Ảnh đại diện'] = data.avatar;
            if (data.username) updates['Tên đăng nhập'] = data.username;
            if (data.newPassword) updates['Mật khẩu'] = data.newPassword;
            updateRow(SHEET_NAMES.EMPLOYEES, emp._rowIndex, updates);
        }
    }
    return { success: true };
}

// ============ DEPARTMENTS ============
function getDepartments() {
    return getSheetData(SHEET_NAMES.DEPARTMENTS).map(d => ({
        id: d['ID'], name: d['Tên phòng ban'], description: d['Mô tả'], created_at: d['Ngày tạo']
    }));
}

function createDepartment(name, description) {
    const id = generateId('pb');
    appendRow(SHEET_NAMES.DEPARTMENTS, {
        'ID': id, 'Tên phòng ban': name, 'Mô tả': description || '', 'Ngày tạo': new Date().toISOString()
    });
    return { success: true, id };
}

function updateDepartment(id, name, description) {
    const dept = findRowByColumn(SHEET_NAMES.DEPARTMENTS, 'ID', id);
    if (dept) {
        updateRow(SHEET_NAMES.DEPARTMENTS, dept._rowIndex, { 'Tên phòng ban': name, 'Mô tả': description });
        return { success: true };
    }
    return { success: false, message: 'Không tìm thấy phòng ban' };
}

function deleteDepartment(id) {
    const dept = findRowByColumn(SHEET_NAMES.DEPARTMENTS, 'ID', id);
    if (dept) { deleteRow(SHEET_NAMES.DEPARTMENTS, dept._rowIndex); return { success: true }; }
    return { success: false };
}

// ============ EMPLOYEES ============
function getEmployees(userRole, userDeptId) {
    let data = getSheetData(SHEET_NAMES.EMPLOYEES);
    if (userRole === 'Leader') data = data.filter(e => e['ID Phòng ban'] === userDeptId);
    const depts = getDepartments();
    return data.map(e => ({
        id: e['ID'], name: e['Họ tên'], username: e['Tên đăng nhập'],
        email: e['Email'], phone: e['Điện thoại'], avatar: e['Ảnh đại diện'],
        role: e['Vai trò'], department_id: e['ID Phòng ban'],
        department: depts.find(d => d.id === e['ID Phòng ban']),
        created_at: e['Ngày tạo']
    }));
}

function createEmployee(data) {
    const existing = findRowByColumn(SHEET_NAMES.EMPLOYEES, 'Tên đăng nhập', data.username);
    if (existing) return { success: false, message: 'Tên đăng nhập đã tồn tại' };
    const id = generateId('nv');
    appendRow(SHEET_NAMES.EMPLOYEES, {
        'ID': id, 'Họ tên': data.name, 'Tên đăng nhập': data.username,
        'Mật khẩu': data.password || '123456', 'Email': data.email || '',
        'Điện thoại': data.phone || '', 'Ảnh đại diện': data.avatar || '',
        'Vai trò': data.role || 'Member', 'ID Phòng ban': data.department_id,
        'Ngày tạo': new Date().toISOString()
    });
    return { success: true, id };
}

function updateEmployee(id, data) {
    const emp = findRowByColumn(SHEET_NAMES.EMPLOYEES, 'ID', id);
    if (!emp) return { success: false, message: 'Không tìm thấy nhân viên' };
    const updates = {};
    if (data.name) updates['Họ tên'] = data.name;
    if (data.username) updates['Tên đăng nhập'] = data.username;
    if (data.password) updates['Mật khẩu'] = data.password;
    if (data.email !== undefined) updates['Email'] = data.email;
    if (data.phone !== undefined) updates['Điện thoại'] = data.phone;
    if (data.avatar !== undefined) updates['Ảnh đại diện'] = data.avatar;
    if (data.role) updates['Vai trò'] = data.role;
    if (data.department_id) updates['ID Phòng ban'] = data.department_id;
    updateRow(SHEET_NAMES.EMPLOYEES, emp._rowIndex, updates);
    return { success: true };
}

function deleteEmployee(id) {
    const emp = findRowByColumn(SHEET_NAMES.EMPLOYEES, 'ID', id);
    if (emp) { deleteRow(SHEET_NAMES.EMPLOYEES, emp._rowIndex); return { success: true }; }
    return { success: false };
}

// ============ CATEGORIES ============
function getCategories() {
    return getSheetData(SHEET_NAMES.CATEGORIES).map(c => ({
        id: c['ID'], name: c['Tên danh mục'], icon: c['Icon'],
        color: c['Màu sắc'], is_default: c['Mặc định'] === true || c['Mặc định'] === 'TRUE',
        created_at: c['Ngày tạo']
    }));
}

function createCategory(name, icon, color) {
    const id = generateId('dm');
    appendRow(SHEET_NAMES.CATEGORIES, {
        'ID': id, 'Tên danh mục': name, 'Icon': icon, 'Màu sắc': color,
        'Mặc định': false, 'Ngày tạo': new Date().toISOString()
    });
    return { success: true, id };
}

function updateCategory(id, name, icon, color) {
    const cat = findRowByColumn(SHEET_NAMES.CATEGORIES, 'ID', id);
    if (cat) {
        updateRow(SHEET_NAMES.CATEGORIES, cat._rowIndex, { 'Tên danh mục': name, 'Icon': icon, 'Màu sắc': color });
        return { success: true };
    }
    return { success: false };
}

function deleteCategory(id) {
    const cat = findRowByColumn(SHEET_NAMES.CATEGORIES, 'ID', id);
    if (cat && cat['Mặc định'] !== true && cat['Mặc định'] !== 'TRUE') {
        deleteRow(SHEET_NAMES.CATEGORIES, cat._rowIndex);
        return { success: true };
    }
    return { success: false, message: 'Không thể xóa danh mục mặc định' };
}

// ============ TASKS ============
function getTasks(userRole, userId, userDeptId) {
    try {
        let data = getSheetData(SHEET_NAMES.TASKS);
        console.log('getTasks - raw data count:', data.length, 'userRole:', userRole);

        if (userRole === 'Member') data = data.filter(t => t['ID Người thực hiện'] === userId);
        else if (userRole === 'Leader') data = data.filter(t => t['ID Phòng ban'] === userDeptId);
        else if (userRole !== 'Owner') return []; // Fallback security

        const emps = getSheetData(SHEET_NAMES.EMPLOYEES);
        const cats = getCategories();
        const depts = getDepartments();

        return data.map(t => {
            const assigneeRaw = emps.find(e => e['ID'] === t['ID Người thực hiện']);
            return {
                id: t['ID'], title: t['Tiêu đề'], description: t['Mô tả'],
                assignee_id: t['ID Người thực hiện'], department_id: t['ID Phòng ban'],
                category_id: t['ID Danh mục'], priority: t['Độ ưu tiên'], status: t['Trạng thái'],
                due_date: t['Hạn hoàn thành'], completed_at: t['Ngày hoàn thành'],
                created_by: t['ID Người tạo'], created_at: t['Ngày tạo'],
                assignee: assigneeRaw ? { id: assigneeRaw['ID'], name: assigneeRaw['Họ tên'] } : null,
                category: cats.find(c => c.id === t['ID Danh mục']),
                department: depts.find(d => d.id === t['ID Phòng ban'])
            };
        });
    } catch (e) {
        console.error('getTasks error:', e.message, e.stack);
        return [];
    }
}

function createTask(data, createdBy) {
    // Auto-fill department if missing
    let deptId = data.department_id;
    if (!deptId && data.assignee_id) {
        const emps = getSheetData(SHEET_NAMES.EMPLOYEES);
        const assignee = emps.find(e => e['ID'] === data.assignee_id);
        if (assignee) deptId = assignee['ID Phòng ban'];
    }

    const id = generateId('nv');
    appendRow(SHEET_NAMES.TASKS, {
        'ID': id, 'Tiêu đề': data.title, 'Mô tả': data.description || '',
        'ID Người thực hiện': data.assignee_id, 'ID Phòng ban': deptId || '',
        'ID Danh mục': data.category_id || '', 'Độ ưu tiên': data.priority || 'medium',
        'Trạng thái': 'todo', 'Hạn hoàn thành': data.due_date, 'Ngày hoàn thành': '',
        'ID Người tạo': createdBy, 'Ngày tạo': new Date().toISOString()
    });
    // Create notification
    createNotification(data.assignee_id, 'Nhiệm vụ mới', `Bạn được giao nhiệm vụ: ${data.title}`, '/progress');
    return { success: true, id };
}

function updateTask(id, data) {
    const task = findRowByColumn(SHEET_NAMES.TASKS, 'ID', id);
    if (!task) return { success: false };
    const updates = {};
    if (data.title) updates['Tiêu đề'] = data.title;
    if (data.description !== undefined) updates['Mô tả'] = data.description;
    if (data.assignee_id) updates['ID Người thực hiện'] = data.assignee_id;
    if (data.department_id) updates['ID Phòng ban'] = data.department_id;
    if (data.category_id !== undefined) updates['ID Danh mục'] = data.category_id;
    if (data.priority) updates['Độ ưu tiên'] = data.priority;
    if (data.status) {
        updates['Trạng thái'] = data.status;
        if (data.status === 'done') updates['Ngày hoàn thành'] = new Date().toISOString();
    }
    if (data.due_date) updates['Hạn hoàn thành'] = data.due_date;
    updateRow(SHEET_NAMES.TASKS, task._rowIndex, updates);
    return { success: true };
}

function deleteTask(id) {
    const task = findRowByColumn(SHEET_NAMES.TASKS, 'ID', id);
    if (task) { deleteRow(SHEET_NAMES.TASKS, task._rowIndex); return { success: true }; }
    return { success: false };
}

// ============ COMMENTS ============
function getComments(taskId) {
    const data = getSheetData(SHEET_NAMES.COMMENTS).filter(c => c['ID Nhiệm vụ'] === taskId);
    const emps = getSheetData(SHEET_NAMES.EMPLOYEES);
    const settingsData = getSheetData(SHEET_NAMES.SETTINGS);
    const settings = settingsData.length > 0 ? settingsData[0] : {};

    return data.map(c => {
        let user = null;
        if (c['ID Người bình luận'] === 'owner') {
            user = { id: 'owner', name: settings['Họ tên'], avatar: settings['Ảnh đại diện'] };
        } else {
            const emp = emps.find(e => e['ID'] === c['ID Người bình luận']);
            if (emp) user = { id: emp['ID'], name: emp['Họ tên'], avatar: emp['Ảnh đại diện'] };
        }
        return {
            id: c['ID'], task_id: taskId, user_id: c['ID Người bình luận'], content: c['Nội dung'],
            image: c['Hình ảnh'], created_at: c['Ngày tạo'], user
        };
    });
}

function createComment(taskId, userId, content, image) {
    const id = generateId('bl');
    appendRow(SHEET_NAMES.COMMENTS, {
        'ID': id, 'ID Nhiệm vụ': taskId, 'ID Người bình luận': userId,
        'Nội dung': content, 'Hình ảnh': image || '', 'Ngày tạo': new Date().toISOString()
    });
    return { success: true, id };
}

// ============ NOTIFICATIONS ============
function getNotifications(userId, page, limit) {
    page = page || 1; limit = limit || 10;
    let data = getSheetData(SHEET_NAMES.NOTIFICATIONS)
        .filter(n => n['ID Người nhận'] === userId || n['ID Người nhận'] === 'all')
        .sort((a, b) => new Date(b['Ngày tạo']) - new Date(a['Ngày tạo']));
    const total = data.length;
    data = data.slice((page - 1) * limit, page * limit);
    return {
        data: data.map(n => ({
            id: n['ID'], user_id: n['ID Người nhận'], title: n['Tiêu đề'],
            description: n['Nội dung'], link: n['Đường dẫn'],
            read: n['Đã đọc'] === true || n['Đã đọc'] === 'TRUE', created_at: n['Ngày tạo']
        })),
        total, page, limit
    };
}

function createNotification(userId, title, description, link) {
    const id = generateId('tb');
    appendRow(SHEET_NAMES.NOTIFICATIONS, {
        'ID': id, 'ID Người nhận': userId, 'Tiêu đề': title,
        'Nội dung': description, 'Đường dẫn': link || '', 'Đã đọc': false,
        'Ngày tạo': new Date().toISOString()
    });
}

function markNotificationRead(id) {
    const notif = findRowByColumn(SHEET_NAMES.NOTIFICATIONS, 'ID', id);
    if (notif) { updateRow(SHEET_NAMES.NOTIFICATIONS, notif._rowIndex, { 'Đã đọc': true }); }
    return { success: true };
}

function getUnreadCount(userId) {
    const data = getSheetData(SHEET_NAMES.NOTIFICATIONS)
        .filter(n => (n['ID Người nhận'] === userId || n['ID Người nhận'] === 'all')
            && n['Đã đọc'] !== true && n['Đã đọc'] !== 'TRUE');
    return { count: data.length };
}

// ============ DASHBOARD ============
function getDashboardStats(userRole, userId, userDeptId) {
    const tasks = getTasks(userRole, userId, userDeptId);
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const todoTasks = tasks.filter(t => t.status === 'todo').length;
    const overdueTasks = tasks.filter(t => {
        if (t.status === 'done') return false;
        const due = new Date(t.due_date);
        return due < now;
    }).length;

    const completedThisMonth = tasks.filter(t => {
        if (t.status !== 'done' || !t.completed_at) return false;
        const d = new Date(t.completed_at);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    const emps = userRole === 'Owner' ? getSheetData(SHEET_NAMES.EMPLOYEES) : [];
    const depts = userRole === 'Owner' ? getDepartments() : [];

    // Chart data - tasks by status per day (last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dayStr = d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' });
        const dayTasks = tasks.filter(t => {
            const cd = new Date(t.created_at);
            return cd.toDateString() === d.toDateString();
        });
        chartData.push({
            label: dayStr,
            todo: dayTasks.filter(t => t.status === 'todo').length,
            inProgress: dayTasks.filter(t => t.status === 'in-progress').length,
            done: dayTasks.filter(t => t.status === 'done').length
        });
    }

    return {
        totalTasks, doneTasks, inProgressTasks, todoTasks, overdueTasks, completedThisMonth,
        totalEmployees: emps.length, totalDepartments: depts.length, chartData
    };
}

// ============ DEBUG ============
function debugData() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets().map(s => s.getName());

    const tasksSheet = ss.getSheetByName(SHEET_NAMES.TASKS);
    let tasksData = [];
    let tasksHeaders = [];
    if (tasksSheet) {
        const data = tasksSheet.getDataRange().getValues();
        tasksHeaders = data[0];
        tasksData = data.slice(1);
    }

    // Sheet match check
    const sheetChecks = {};
    Object.keys(SHEET_NAMES).forEach(key => {
        const expectedName = SHEET_NAMES[key];
        const exists = ss.getSheetByName(expectedName) !== null;
        sheetChecks[key] = { expected: expectedName, exists: exists };
    });

    return {
        actualSheets: sheets,
        sheetChecks: sheetChecks,
        tasksHeaders: tasksHeaders,
        tasksRowCount: tasksData.length,
        firstTask: tasksData[0] || null
    };
}

// Wrapper function for frontend - use this instead of getTasks directly
function getTasksSafe(userRole, userId, userDeptId) {
    try {
        Logger.log('getTasksSafe called with: ' + userRole + ', ' + userId + ', ' + userDeptId);
        const result = getTasks(userRole, userId, userDeptId);
        Logger.log('getTasksSafe returning: ' + (result ? result.length : 0) + ' tasks');
        // Return JSON string to avoid serialization issues
        return JSON.stringify(result || []);
    } catch (e) {
        Logger.log('getTasksSafe error: ' + e.message);
        return '[]';
    }
}
