// API 基础URL - 根据当前路径自动检测
const pathParts = window.location.pathname.split('/');
const appIndex = pathParts.indexOf('app');
const BASE_PATH = appIndex >= 0 ? '/' + pathParts.slice(1, appIndex + 2).join('/') : '';
const API_BASE = BASE_PATH + '/api';

// 页面跳转 - 适配代理路径
function goToPage(page) {
    window.location.href = BASE_PATH + '/' + page;
}

// 页面状态
let currentPage = 'dashboard';
let kidsData = [];
let subjectsData = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadDashboard();
    loadKidsSelect();
    loadSubjectsSelect();

    // 设置今天的日期
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('recordDate').value = today;
    document.getElementById('achievementDate').value = today;

    // 星星评分
    initStarRating();
});

// 导航初始化
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            if (page) {
                switchPage(page);
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            }
        });
    });
}

// 切换页面
function switchPage(page) {
    currentPage = page;
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(`page-${page}`).classList.remove('hidden');

    // 加载对应页面数据
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'kids':
            loadKids();
            break;
        case 'records':
            loadRecords();
            break;
        case 'subjects':
            loadSubjects();
            break;
        case 'achievements':
            loadAchievements();
            break;
        case 'points':
            loadPoints();
            break;
    }
}

// ==================== 数据加载 ====================

// 加载仪表板数据
async function loadDashboard() {
    try {
        // 加载统计数据
        const kidsRes = await fetch(`${API_BASE}/kids`);
        const kids = await kidsRes.json();
        const totalKids = kids.success ? kids.data.length : 0;

        let totalRecords = 0;
        let totalMinutes = 0;
        let totalAchievements = 0;

        for (const kid of kids.data || []) {
            const statsRes = await fetch(`${API_BASE}/stats/${kid.id}`);
            const stats = await statsRes.json();
            if (stats.success) {
                totalRecords += parseInt(stats.data.total_records) || 0;
                totalMinutes += parseInt(stats.data.total_minutes) || 0;
                totalAchievements += parseInt(stats.data.total_achievements) || 0;
            }
        }

        document.getElementById('totalKids').textContent = totalKids;
        document.getElementById('totalRecords').textContent = totalRecords;
        document.getElementById('totalMinutes').textContent = totalMinutes;
        document.getElementById('totalAchievements').textContent = totalAchievements;

        // 加载最近记录
        const recordsRes = await fetch(`${API_BASE}/records?limit=10`);
        const records = await recordsRes.json();
        renderRecentRecords(records.data || []);

        // 加载日历数据
        initCalendar();
        loadCalendarData();

    } catch (error) {
        showToast('加载数据失败', 'error');
    }
}

// 加载小朋友列表
async function loadKids() {
    try {
        const res = await fetch(`${API_BASE}/kids`);
        const data = await res.json();
        kidsData = data.data || [];
        renderKidsTable(kidsData);
    } catch (error) {
        showToast('加载小朋友列表失败', 'error');
    }
}

// 加载学习记录
async function loadRecords() {
    try {
        const kidId = document.getElementById('filterKid').value;
        let url = `${API_BASE}/records?limit=100`;
        if (kidId) url += `&kid_id=${kidId}`;

        const res = await fetch(url);
        const data = await res.json();
        renderRecordsTable(data.data || []);
    } catch (error) {
        showToast('加载学习记录失败', 'error');
    }
}

// 加载科目列表
async function loadSubjects() {
    try {
        const res = await fetch(`${API_BASE}/subjects`);
        const data = await res.json();
        subjectsData = data.data || [];
        renderSubjectsTable(subjectsData);
    } catch (error) {
        showToast('加载科目列表失败', 'error');
    }
}

// 加载成就列表
async function loadAchievements() {
    try {
        const kidId = document.getElementById('filterAchievementKid').value;
        let url = `${API_BASE}/achievements`;
        if (kidId) url += `?kid_id=${kidId}`;

        const res = await fetch(url);
        const data = await res.json();
        renderAchievementsTable(data.data || []);
    } catch (error) {
        showToast('加载成就列表失败', 'error');
    }
}

// 加载积分记录
async function loadPoints() {
    try {
        const kidId = document.getElementById('filterPointsKid').value;
        let url = `${API_BASE}/points`;
        if (kidId) url += `?kid_id=${kidId}`;

        const res = await fetch(url);
        const data = await res.json();
        renderPointsTable(data.data || []);
    } catch (error) {
        showToast('加载积分记录失败', 'error');
    }
}

// 加载小朋友下拉框
async function loadKidsSelect() {
    try {
        const res = await fetch(`${API_BASE}/kids`);
        const data = await res.json();
        kidsData = data.data || [];

        // 更新所有小朋友选择框
        updateSelect('filterKid', kidsData);
        updateSelect('filterAchievementKid', kidsData);
        updateSelect('filterPointsKid', kidsData);
        updateSelect('recordKidId', kidsData);
        updateSelect('achievementKidId', kidsData);
        updateSelect('pointsKidId', kidsData);
    } catch (error) {
        console.error('加载小朋友选项失败', error);
    }
}

// 加载科目下拉框
async function loadSubjectsSelect() {
    try {
        const res = await fetch(`${API_BASE}/subjects`);
        const data = await res.json();
        subjectsData = data.data || [];
        updateSelect('recordSubjectId', subjectsData, 'name');
    } catch (error) {
        console.error('加载科目选项失败', error);
    }
}

// 更新选择框
function updateSelect(selectId, items, labelField = 'name') {
    const select = document.getElementById(selectId);
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">请选择</option>';

    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item[labelField];
        select.appendChild(option);
    });

    select.value = currentValue;
}

// ==================== 渲染表格 ====================

function renderKidsTable(kids) {
    const tbody = document.getElementById('kidsTable');
    if (!kids.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">暂无数据</td></tr>';
        return;
    }

    tbody.innerHTML = kids.map(kid => `
        <tr>
            <td>${kid.id}</td>
            <td><strong>${kid.name}</strong></td>
            <td>${kid.nickname || '-'}</td>
            <td>${kid.grade || '-'}</td>
            <td>-</td>
            <td>-</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editKid(${kid.id})">编辑</button>
                <button class="btn btn-sm btn-danger" onclick="deleteKid(${kid.id})">删除</button>
            </td>
        </tr>
    `).join('');
}

function renderRecordsTable(records) {
    const tbody = document.getElementById('recordsTable');
    if (!records.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">暂无数据</td></tr>';
        return;
    }

    tbody.innerHTML = records.map(record => `
        <tr>
            <td>${record.kid_name}</td>
            <td><span style="background:${record.subject_color};padding:4px 10px;border-radius:15px;">${record.subject_icon} ${record.subject_name}</span></td>
            <td>${record.learning_date}</td>
            <td>${record.duration}分钟</td>
            <td>${record.content.substring(0, 20)}${record.content.length > 20 ? '...' : ''}</td>
            <td>${'⭐'.repeat(record.performance)}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteRecord(${record.id})">删除</button>
            </td>
        </tr>
    `).join('');
}

function renderSubjectsTable(subjects) {
    const tbody = document.getElementById('subjectsTable');
    if (!subjects.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">暂无数据</td></tr>';
        return;
    }

    tbody.innerHTML = subjects.map(subject => `
        <tr>
            <td>${subject.id}</td>
            <td style="font-size:1.5rem">${subject.icon}</td>
            <td>${subject.name}</td>
            <td><span style="display:inline-block;width:30px;height:20px;background:${subject.color};border-radius:4px;"></span> ${subject.color}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteSubject(${subject.id})">删除</button>
            </td>
        </tr>
    `).join('');
}

function renderAchievementsTable(achievements) {
    const tbody = document.getElementById('achievementsTable');
    if (!achievements.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">暂无数据</td></tr>';
        return;
    }

    tbody.innerHTML = achievements.map(item => `
        <tr>
            <td>${item.kid_id}</td>
            <td style="font-size:1.5rem">${item.badge_icon}</td>
            <td><strong>${item.title}</strong></td>
            <td>${item.description || '-'}</td>
            <td>${item.earned_at}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteAchievement(${item.id})">删除</button>
            </td>
        </tr>
    `).join('');
}

function renderPointsTable(points) {
    const tbody = document.getElementById('pointsTable');
    if (!points.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">暂无数据</td></tr>';
        return;
    }

    tbody.innerHTML = points.map(item => `
        <tr>
            <td>${item.kid_name}</td>
            <td><span class="tag ${item.record_type === 'earn' ? 'tag-success' : 'tag-warning'}">${item.record_type === 'earn' ? '获得' : '消耗'}</span></td>
            <td style="color:${item.record_type === 'earn' ? '#4caf50' : '#ff9800'};font-weight:bold">${item.record_type === 'earn' ? '+' : ''}${item.points}</td>
            <td>${item.reason || '-'}</td>
            <td>${new Date(item.created_at).toLocaleString()}</td>
        </tr>
    `).join('');
}

function renderRecentRecords(records) {
    const tbody = document.getElementById('recentRecords');
    if (!records.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">暂无数据</td></tr>';
        return;
    }

    tbody.innerHTML = records.slice(0, 5).map(record => `
        <tr>
            <td>${record.kid_name}</td>
            <td>${record.subject_icon} ${record.subject_name}</td>
            <td>${record.learning_date}</td>
            <td>${record.duration}分钟</td>
            <td>${'⭐'.repeat(record.performance)}</td>
        </tr>
    `).join('');
}

// ==================== 模态框操作 ====================

function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function showKidModal(kid = null) {
    document.getElementById('kidModalTitle').textContent = kid ? '编辑小朋友' : '添加小朋友';
    document.getElementById('kidId').value = kid ? kid.id : '';
    document.getElementById('kidName').value = kid ? kid.name : '';
    document.getElementById('kidNickname').value = kid ? kid.nickname || '' : '';
    document.getElementById('kidBirthDate').value = kid ? kid.birth_date || '' : '';
    document.getElementById('kidGrade').value = kid ? kid.grade || '' : '';
    document.getElementById('kidColor').value = kid ? kid.favorite_color : '#FFD93D';
    showModal('kidModal');
}

function showRecordModal() {
    showModal('recordModal');
}

function showSubjectModal() {
    showModal('subjectModal');
}

function showAchievementModal() {
    showModal('achievementModal');
}

function showPointsModal() {
    showModal('pointsModal');
}

// ==================== 保存操作 ====================

async function saveKid() {
    const id = document.getElementById('kidId').value;
    const data = {
        name: document.getElementById('kidName').value,
        nickname: document.getElementById('kidNickname').value,
        birth_date: document.getElementById('kidBirthDate').value,
        grade: document.getElementById('kidGrade').value,
        favorite_color: document.getElementById('kidColor').value
    };

    if (!data.name) {
        showToast('请输入姓名', 'error');
        return;
    }

    try {
        const url = id ? `${API_BASE}/kids/${id}` : `${API_BASE}/kids`;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if (result.success) {
            showToast(id ? '更新成功' : '添加成功', 'success');
            closeModal('kidModal');
            loadKids();
            loadKidsSelect();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('操作失败', 'error');
    }
}

async function saveRecord() {
    const data = {
        kid_id: document.getElementById('recordKidId').value,
        subject_id: document.getElementById('recordSubjectId').value,
        learning_date: document.getElementById('recordDate').value,
        duration: document.getElementById('recordDuration').value,
        content: document.getElementById('recordContent').value,
        performance: document.querySelectorAll('#recordRating .star.active').length,
        mood: document.getElementById('recordMood').value,
        notes: document.getElementById('recordNotes').value
    };

    if (!data.kid_id || !data.subject_id || !data.duration || !data.content) {
        showToast('请填写必填项', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/records`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if (result.success) {
            showToast(`保存成功！获得 ${result.data.points_earned} 积分`, 'success');
            closeModal('recordModal');
            loadRecords();
            // 清空表单
            document.getElementById('recordDuration').value = '';
            document.getElementById('recordContent').value = '';
            document.getElementById('recordNotes').value = '';
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('保存失败', 'error');
    }
}

async function saveSubject() {
    const data = {
        name: document.getElementById('subjectName').value,
        icon: document.getElementById('subjectIcon').value,
        color: document.getElementById('subjectColor').value
    };

    if (!data.name) {
        showToast('请输入科目名称', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/subjects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if (result.success) {
            showToast('添加成功', 'success');
            closeModal('subjectModal');
            loadSubjects();
            loadSubjectsSelect();
            // 清空表单
            document.getElementById('subjectName').value = '';
            document.getElementById('subjectIcon').value = '';
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('保存失败', 'error');
    }
}

async function saveAchievement() {
    const data = {
        kid_id: document.getElementById('achievementKidId').value,
        title: document.getElementById('achievementTitle').value,
        description: document.getElementById('achievementDesc').value,
        badge_icon: document.getElementById('achievementIcon').value,
        earned_at: document.getElementById('achievementDate').value
    };

    if (!data.kid_id || !data.title) {
        showToast('请填写必填项', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/achievements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if (result.success) {
            showToast('添加成功', 'success');
            closeModal('achievementModal');
            loadAchievements();
            // 清空表单
            document.getElementById('achievementTitle').value = '';
            document.getElementById('achievementDesc').value = '';
            document.getElementById('achievementIcon').value = '';
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('保存失败', 'error');
    }
}

async function savePoints() {
    const data = {
        kid_id: document.getElementById('pointsKidId').value,
        points: parseInt(document.getElementById('pointsValue').value),
        reason: document.getElementById('pointsReason').value,
        record_type: document.getElementById('pointsType').value
    };

    if (!data.kid_id || !data.points) {
        showToast('请填写必填项', 'error');
        return;
    }

    // 消耗积分时转为负数
    if (data.record_type === 'spend') {
        data.points = -Math.abs(data.points);
    }

    try {
        const res = await fetch(`${API_BASE}/points`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if (result.success) {
            showToast('操作成功', 'success');
            closeModal('pointsModal');
            loadPoints();
            // 清空表单
            document.getElementById('pointsValue').value = '';
            document.getElementById('pointsReason').value = '';
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('操作失败', 'error');
    }
}

// ==================== 删除操作 ====================

async function deleteKid(id) {
    if (!confirm('确定要删除这个小朋友吗？所有相关记录也会被删除。')) return;

    try {
        const res = await fetch(`${API_BASE}/kids/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
            showToast('删除成功', 'success');
            loadKids();
            loadKidsSelect();
        }
    } catch (error) {
        showToast('删除失败', 'error');
    }
}

async function deleteRecord(id) {
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
        const res = await fetch(`${API_BASE}/records/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
            showToast('删除成功', 'success');
            loadRecords();
        }
    } catch (error) {
        showToast('删除失败', 'error');
    }
}

async function deleteSubject(id) {
    if (!confirm('确定要删除这个科目吗？')) return;

    try {
        const res = await fetch(`${API_BASE}/subjects/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
            showToast('删除成功', 'success');
            loadSubjects();
            loadSubjectsSelect();
        }
    } catch (error) {
        showToast('删除失败', 'error');
    }
}

async function deleteAchievement(id) {
    if (!confirm('确定要删除这个成就吗？')) return;

    try {
        const res = await fetch(`${API_BASE}/achievements/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
            showToast('删除成功', 'success');
            loadAchievements();
        }
    } catch (error) {
        showToast('删除失败', 'error');
    }
}

// ==================== 辅助功能 ====================

function editKid(id) {
    const kid = kidsData.find(k => k.id === id);
    if (kid) showKidModal(kid);
}

function initStarRating() {
    document.querySelectorAll('#recordRating .star').forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.star);
            document.querySelectorAll('#recordRating .star').forEach((s, index) => {
                s.classList.toggle('active', index < rating);
            });
        });
    });
}

function refreshData() {
    loadDashboard();
    showToast('数据已刷新', 'success');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// 点击模态框外部关闭
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
});

// ==================== 日历功能 ====================

let currentCalendarDate = new Date();
let calendarRecords = [];

// 初始化日历
function initCalendar() {
    // 填充小朋友选择器
    const select = document.getElementById('calendarKidSelect');
    if (select && kidsData.length > 0) {
        select.innerHTML = '<option value="">所有小朋友</option>' +
            kidsData.map(kid => `<option value="${kid.id}">${kid.name}</option>`).join('');
    }
}

// 加载日历数据
async function loadCalendarData() {
    try {
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth() + 1;
        const kidId = document.getElementById('calendarKidSelect')?.value || '';

        // 更新月份标签
        document.getElementById('currentMonthLabel').textContent =
            `${year}年${month}月`;

        // 获取该月的所有记录
        let url = `${API_BASE}/records?limit=1000`;
        if (kidId) {
            url += `&kid_id=${kidId}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        calendarRecords = data.data || [];

        // 过滤当前月份的记录
        const monthRecords = calendarRecords.filter(record => {
            const recordDate = new Date(record.learning_date);
            return recordDate.getFullYear() === year &&
                   recordDate.getMonth() === currentCalendarDate.getMonth();
        });

        renderCalendar(year, month, monthRecords);
    } catch (error) {
        console.error('加载日历数据失败:', error);
    }
}

// 渲染日历
function renderCalendar(year, month, records) {
    const container = document.getElementById('calendarContainer');
    if (!container) return;

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // 按日期分组记录
    const recordsByDate = {};
    records.forEach(record => {
        const date = record.learning_date;
        if (!recordsByDate[date]) {
            recordsByDate[date] = {
                records: [],
                totalMinutes: 0,
                hasReading: false,
                hasPractice: false
            };
        }
        recordsByDate[date].records.push(record);
        recordsByDate[date].totalMinutes += parseInt(record.duration) || 0;

        // 判断记录类型
        if (record.subject_name === '阅读' || record.content?.includes('朗读')) {
            recordsByDate[date].hasReading = true;
        }
        if (record.subject_name === '练习' || record.content?.includes('练习')) {
            recordsByDate[date].hasPractice = true;
        }
    });

    // 生成日历HTML
    let html = '<table class="calendar"><thead><tr>';
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    weekDays.forEach(day => {
        html += `<th>${day}</th>`;
    });
    html += '</tr></thead><tbody>';

    let dayCount = 1;
    let prevMonthDays = new Date(year, month - 1, 0).getDate();

    for (let week = 0; week < 6; week++) {
        html += '<tr>';
        for (let day = 0; day < 7; day++) {
            const cellIndex = week * 7 + day;

            if (week === 0 && day < startDayOfWeek) {
                // 上个月的日期
                const prevDay = prevMonthDays - startDayOfWeek + day + 1;
                html += `<td class="other-month"><div class="date-number">${prevDay}</div></td>`;
            } else if (dayCount > daysInMonth) {
                // 下个月的日期
                const nextDay = dayCount - daysInMonth;
                html += `<td class="other-month"><div class="date-number">${nextDay}</div></td>`;
                dayCount++;
            } else {
                // 当前月的日期
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayCount).padStart(2, '0')}`;
                const dayData = recordsByDate[dateStr];
                const isToday = new Date().toISOString().split('T')[0] === dateStr;

                let cellClass = isToday ? 'today' : '';
                html += `<td class="${cellClass}" onclick="showDayDetail('${dateStr}')">`;
                html += `<div class="date-number">${dayCount}</div>`;

                if (dayData) {
                    html += '<div class="study-info">';

                    // 显示学习类型标记
                    if (dayData.hasReading || dayData.hasPractice) {
                        html += '<div>';
                        if (dayData.hasReading) html += '<span class="study-dot reading" title="阅读"></span>';
                        if (dayData.hasPractice) html += '<span class="study-dot practice" title="练习"></span>';
                        if (!dayData.hasReading && !dayData.hasPractice) html += '<span class="study-dot record" title="记录"></span>';
                        html += '</div>';
                    }

                    // 显示记录数和时长
                    html += `<div class="study-count">${dayData.records.length} 条记录</div>`;
                    html += `<div style="color: #666; font-size: 0.7rem;">${dayData.totalMinutes} 分钟</div>`;

                    html += '</div>';
                }

                html += '</td>';
                dayCount++;
            }
        }
        html += '</tr>';

        if (dayCount > daysInMonth && week > 0) break;
    }

    html += '</tbody></table>';
    container.innerHTML = html;
}

// 切换月份
function changeMonth(delta) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    loadCalendarData();
}

// 回到今天
function goToToday() {
    currentCalendarDate = new Date();
    loadCalendarData();
}

// 显示某天详情
function showDayDetail(dateStr) {
    const dayData = calendarRecords.filter(r => r.learning_date === dateStr);
    if (dayData.length === 0) return;

    const kidName = dayData[0].kid_name || '未知';
    const totalMinutes = dayData.reduce((sum, r) => sum + (parseInt(r.duration) || 0), 0);

    let content = `<h3>${dateStr} 学习记录</h3>`;
    content += `<p><strong>小朋友：</strong>${kidName}</p>`;
    content += `<p><strong>总时长：</strong>${totalMinutes} 分钟</p>`;
    content += `<p><strong>记录数：</strong>${dayData.length} 条</p>`;
    content += '<hr style="margin: 15px 0;">';
    content += '<table style="width: 100%; font-size: 0.9rem;">';
    content += '<tr><th style="text-align: left;">科目</th><th style="text-align: left;">内容</th><th>时长</th><th>评分</th></tr>';

    dayData.forEach(record => {
        content += `<tr>
            <td>${record.subject_icon || ''} ${record.subject_name || '未知'}</td>
            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${record.content || '-'}</td>
            <td style="text-align: center;">${record.duration}分钟</td>
            <td style="text-align: center;">${'⭐'.repeat(record.performance || 0)}</td>
        </tr>`;
    });

    content += '</table>';

    // 创建弹窗
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; align-items: center; justify-content: center;';
    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 30px; width: 90%; max-width: 600px; max-height: 80vh; overflow-y: auto;">
            ${content}
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="this.closest('.modal').remove()" class="btn btn-primary">关闭</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}
