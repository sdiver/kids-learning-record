// API 基础URL
const API_BASE = 'http://localhost:3000/api';

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
