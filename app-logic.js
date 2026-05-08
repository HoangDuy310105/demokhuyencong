// =====================================================
// LOGIC ỨNG DỤNG v3.1 - Sửa lỗi chuyển trang + biểu đồ
// =====================================================
let State = {
  view: 'dashboard',
  projectFilter: { search: '', status: -1, field: -1 },
  selectedProject: null,
  selectedCompany: null,
  charts: {},
  currentRole: 'CNNT', // Vai trò mặc định
};

// ---- CHUYỂN ĐỔI VAI TRÒ ----
function switchRole(roleId) {
  State.currentRole = roleId;
  const role = ROLES[roleId];

  // Cập nhật header
  document.getElementById('header-name').textContent = role.name;
  document.getElementById('header-role').textContent = role.short + ' · Đang hoạt động';
  document.getElementById('header-role').style.color = role.color;
  const av = document.getElementById('header-avatar');
  av.style.background = role.color;
  av.innerHTML = `<i class="fa-solid ${role.icon} text-xs"></i>`;

  // Tạo lại menu điều hướng
  buildSidebar(roleId);

  showToast(`Đã chuyển quyền: ${role.name}`, 'warn');

  // Hiển thị lại giao diện hiện tại
  switchView('dashboard');
}

function buildSidebar(roleId) {
  const role = ROLES[roleId];
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  nav.innerHTML = role.menus.map((m, idx) => {
    // Đếm số lượng (Badge)
    let badgeHtml = '';
    if (m.badge && m.filterStatus !== null && m.filterStatus !== undefined) {
      const count = AppData.projects.filter(p => p.status === m.filterStatus).length;
      if (count > 0) badgeHtml = `<span class="ml-auto bg-rose-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5">${count}</span>`;
    }
    const menuId = m.menuId || `menu-${m.view}-${idx}`;
    const filterAttr = m.filterStatus !== undefined && m.filterStatus !== null ? `data-filter="${m.filterStatus}"` : '';
    return `<div id="${menuId}" class="nav-item" ${filterAttr} onclick="handleMenuClick(this,'${m.view}',${m.filterStatus ?? 'null'})">`
         + `<i class="fa-solid ${m.icon} w-5 mr-2.5 text-center"></i>${m.label}${badgeHtml}</div>`;
  }).join('');

  // Bảng vai trò — bôi đậm vai trò hiện tại
  Object.keys(ROLES).forEach(rid => {
    const btn = document.getElementById('rbtn-' + rid);
    if (!btn) return;
    if (rid === roleId) { btn.style.background = ROLES[rid].color; btn.style.color = '#fff'; }
    else { btn.style.background = ''; btn.style.color = '#94a3b8'; }
  });
}

function handleMenuClick(el, view, filterStatus) {
  // Cài đặt bộ lọc trước khi chuyển trang
  if (filterStatus !== null && filterStatus !== undefined) {
    State.projectFilter.status = filterStatus;
    // Đồng bộ với danh sách bộ lọc
    const sel = document.getElementById('proj-status-filter');
    if (sel) sel.value = filterStatus;
  } else {
    State.projectFilter.status = -1;
    const sel = document.getElementById('proj-status-filter');
    if (sel) sel.value = -1;
  }
  State.projectFilter.search = '';
  const searchInput = document.getElementById('proj-search');
  if (searchInput) searchInput.value = '';

  // Bôi đậm menu đang chọn
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');

  switchView(view);
}

// ---- ĐIỀU HƯỚNG ----
function switchView(v) {
  State.view = v;
  document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active-view'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const section = document.getElementById('view-' + v);
  if (section) {
    section.classList.add('active-view');
    section.style.animation = 'none';
    section.offsetHeight; /* kích hoạt tải lại (reflow) */
    section.style.animation = 'fadeIn 0.3s ease forwards';
  }
  const menu = document.getElementById('menu-' + v) || document.querySelector(`.nav-item[onclick*="'${v}'"]`);
  if (menu) {
    menu.classList.add('active');
    const breadcrumb = document.getElementById('breadcrumb-view');
    if (breadcrumb) {
      // Lấy văn bản bỏ qua phần số lượng
      const clone = menu.cloneNode(true);
      const badge = clone.querySelector('span');
      if(badge) badge.remove();
      breadcrumb.textContent = clone.textContent.trim();
      
      // Hiệu ứng mờ dần cho chữ
      breadcrumb.style.animation = 'none';
      breadcrumb.offsetHeight;
      breadcrumb.style.animation = 'fadeIn 0.3s ease forwards';
    }
  }
  if (v === 'dashboard') renderDashboard();
  else if (v === 'projects')  renderProjects();
  else if (v === 'funds')     renderFunds();
  else if (v === 'companies') renderCompanies();
  else if (v === 'ocop')      renderOcop();
  else if (v === 'kpi')       renderKpi();
  else if (v === 'reports')   renderReports();
  else if (v === 'users')     renderUsers();
  else if (v === 'settings')  renderSettings();
  else if (v === 'map')       renderMap();
  else if (v === 'documents') renderDocuments();
}

// ---- THÔNG BÁO (TOAST) ----
function showToast(msg, type='success') {
  const t = document.createElement('div');
  const icon = type==='success' ? 'fa-check-circle' : type==='warn' ? 'fa-triangle-exclamation' : 'fa-circle-exclamation';
  const bg   = type==='success' ? 'bg-emerald-600' : type==='warn' ? 'bg-amber-500' : 'bg-rose-600';
  t.className = `fixed bottom-8 right-8 z-[999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm ${bg} toast-enter`;
  t.innerHTML = `<i class="fa-solid ${icon} text-xl"></i><span>${msg}</span>`;
  document.body.appendChild(t);
  setTimeout(() => { t.classList.add('toast-exit'); setTimeout(() => t.remove(), 400); }, 4000);
}

// ---- CỬA SỔ POPUP (MODAL) ----
function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// ---- TỔNG QUAN (Theo Vai Trò) ----
function renderDashboard() {
  renderRoleBanner();
  const rid = State.currentRole;
  if (rid === 'CNNT')  renderDashCNNT();
  else if (rid === 'TTKC')  renderDashTTKC();
  else if (rid === 'SO')    renderDashSO();
  else if (rid === 'BO')    renderDashBO();
  else if (rid === 'ADMIN') renderDashAdmin();
  setTimeout(() => initRoleCharts(rid), 80);
}

function kpiCard(label, value, sub, color) {
  return `<div class="panel p-5 border-b-4" style="border-bottom-color:${color}">
    <div class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">${label}</div>
    <div class="text-3xl font-black text-slate-900">${value}</div>
    <div class="mt-3 text-xs text-slate-400">${sub}</div>
  </div>`;
}

function alertCard(label, count, desc, color, icon, onclick) {
  return `<div class="rounded-2xl p-5 cursor-pointer hover:opacity-90 transition-opacity" style="background:${color}15;border:2px solid ${color}40" onclick="${onclick}">
    <div class="flex items-center justify-between mb-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg" style="background:${color}">
        <i class="fa-solid ${icon}"></i>
      </div>
      <span class="text-4xl font-black" style="color:${color}">${count}</span>
    </div>
    <div class="font-black text-slate-800">${label}</div>
    <div class="text-xs text-slate-500 mt-1">${desc}</div>
    <div class="mt-3 text-xs font-bold" style="color:${color}">Xử lý ngay →</div>
  </div>`;
}

// 🟢 CNNT — Cổng đăng ký đề án
function renderDashCNNT() {
  const myProjects = AppData.projects.filter(p => p.companyId === 'DN01'); // công ty demo
  const pending = myProjects.filter(p => p.status < 5).length;
  const done = myProjects.filter(p => p.status === 5).length;
  document.getElementById('dash-dynamic-content').innerHTML = `
    <div class="flex justify-between items-start">
      <div><h1 class="text-2xl font-black text-slate-900">Cổng đăng ký Khuyến công</h1><p class="text-slate-500 text-sm mt-1">Quản lý đề án của doanh nghiệp bạn</p></div>
      <button onclick="openModal('modal-create')" class="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-white shadow-lg" style="background:#16a34a"><i class="fa-solid fa-plus-circle"></i>TẠO ĐỀ ÁN MỚI</button>
    </div>
    <div class="grid grid-cols-3 gap-4">
      ${kpiCard('Tổng đề án của tôi', myProjects.length, 'Từ tất cả các năm', '#16a34a')}
      ${kpiCard('Đang xử lý', pending, 'Chờ duyệt hoặc thực hiện', '#f59e0b')}
      ${kpiCard('Hoàn thành', done, 'Đã nghiệm thu & quyết toán', '#10b981')}
    </div>
    <div class="bg-amber-50 border border-amber-200 rounded-2xl p-5">
      <div class="flex items-center gap-2 mb-4"><i class="fa-solid fa-triangle-exclamation text-amber-500"></i><span class="font-black text-amber-800">Lưu ý nghiệp vụ quan trọng</span></div>
      <div class="grid grid-cols-3 gap-4 text-sm">
        <div class="bg-white rounded-xl p-3 border border-amber-100"><div class="text-[10px] font-black text-amber-500 uppercase mb-1">Hạn nộp hồ sơ QG</div><div class="font-bold text-slate-800">Trước ngày 20/05 hàng năm</div></div>
        <div class="bg-white rounded-xl p-3 border border-amber-100"><div class="text-[10px] font-black text-amber-500 uppercase mb-1">Báo cáo tiến độ</div><div class="font-bold text-slate-800">Trước ngày 25 hàng tháng</div></div>
        <div class="bg-white rounded-xl p-3 border border-amber-100"><div class="text-[10px] font-black text-amber-500 uppercase mb-1">Định mức hỗ trợ</div><div class="font-bold text-slate-800">Tối đa 150 triệu / đề án (TT28)</div></div>
      </div>
    </div>
    <div class="panel overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 class="font-bold text-slate-800"><i class="fa-solid fa-list-check mr-2 text-emerald-500"></i>Đề án của tôi</h3>
        <button onclick="handleMenuClick(document.querySelector('.nav-item'),'projects',null)" class="text-xs font-bold" style="color:#16a34a">Xem tất cả →</button>
      </div>
      <table class="w-full text-sm"><thead><tr class="text-[10px] text-slate-400 font-black uppercase bg-slate-50 border-b border-slate-100">
        <th class="px-4 py-3 text-left">Mã ĐA</th><th class="px-4 py-3 text-left">Tên Đề án</th><th class="px-4 py-3 text-right">Kinh phí</th><th class="px-4 py-3 text-center">Tiến trình</th><th class="px-4 py-3 text-center">Hành động</th>
      </tr></thead><tbody>
        ${myProjects.map(p => {
          const act = ROLES.CNNT.actions[p.status];
          return `<tr class="hover:bg-slate-50 cursor-pointer" onclick="viewProjectDetail('${p.id}')">
            <td class="px-4 py-3 font-bold text-slate-400 text-xs">${p.id}</td>
            <td class="px-4 py-3 font-semibold text-slate-800">${p.name}</td>
            <td class="px-4 py-3 text-right font-mono font-bold text-xs">${formatVND(p.budget)}</td>
            <td class="px-4 py-3 text-center"><div class="flex flex-col items-center gap-1">${statusBadge(p.status)}<div class="mt-1">${renderWorkflowBar(p.status,false)}</div></div></td>
            <td class="px-4 py-3 text-center">${act ? `<button class="action-btn ${act.cls} border-0 text-xs" onclick="event.stopPropagation();roleAction('${p.id}',${act.nextStatus},'${act.label}')">${act.label}</button>` : '<span class="text-xs text-slate-400">—</span>'}</td>
          </tr>`;
        }).join('')}
      </tbody></table>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div class="panel p-5"><h3 class="font-bold text-slate-800 mb-4"><i class="fa-solid fa-chart-donut mr-2 text-emerald-500"></i>Trạng thái đề án của tôi</h3><div class="h-52 flex items-center justify-center"><canvas id="ch-cnnt-status"></canvas></div></div>
      <div class="panel p-5"><h3 class="font-bold text-slate-800 mb-4"><i class="fa-solid fa-chart-bar mr-2 text-emerald-500"></i>Kế hoạch vs Thực chi (triệu VNĐ)</h3><div class="h-52"><canvas id="ch-cnnt-budget"></canvas></div></div>
    </div>`;
}

// 🔵 TTKC — Hỗ trợ lập hồ sơ
function renderDashTTKC() {
  const newProjects = AppData.projects.filter(p => p.status === 0);
  const inProgress  = AppData.projects.filter(p => p.status > 0 && p.status < 5);
  document.getElementById('dash-dynamic-content').innerHTML = `
    <div><h1 class="text-2xl font-black text-slate-900">Trung tâm Khuyến công — Hỗ trợ lập hồ sơ</h1><p class="text-slate-500 text-sm mt-1">Hỗ trợ các cơ sở CNNT chuẩn bị và nộp đề án</p></div>
    <div class="grid grid-cols-4 gap-4">
      ${kpiCard('Tổng đề án tỉnh', AppData.projects.length, 'Tất cả trạng thái', '#0891b2')}
      ${kpiCard('Cần hỗ trợ lập hồ sơ', newProjects.length, 'Đang ở trạng thái Khởi tạo', '#f59e0b')}
      ${kpiCard('Đang thực hiện', inProgress.length, 'Cần theo dõi tiến độ', '#2563eb')}
      ${kpiCard('Doanh nghiệp', AppData.companies.length, 'Trong hệ thống', '#10b981')}
    </div>
    <div class="panel overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <div class="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
        <h3 class="font-black text-slate-800">Hồ sơ chưa nộp — Cần hỗ trợ (${newProjects.length} đề án)</h3>
      </div>
      <table class="w-full text-sm"><thead><tr class="text-[10px] text-slate-400 font-black uppercase bg-slate-50 border-b"><th class="px-4 py-3 text-left">Mã ĐA</th><th class="px-4 py-3 text-left">Tên đề án</th><th class="px-4 py-3 text-left">Đơn vị thụ hưởng</th><th class="px-4 py-3 text-right">Kinh phí dự kiến</th><th class="px-4 py-3 text-center">Hỗ trợ</th></tr></thead>
      <tbody>${newProjects.map(p => {
        const co = getCompany(p.companyId);
        return `<tr class="hover:bg-slate-50 cursor-pointer" onclick="viewProjectDetail('${p.id}')">
          <td class="px-4 py-3 font-bold text-slate-400 text-xs">${p.id}</td>
          <td class="px-4 py-3 font-semibold text-slate-800">${p.name}</td>
          <td class="px-4 py-3 text-slate-600 text-xs">${co.name}</td>
          <td class="px-4 py-3 text-right font-mono font-bold">${formatVND(p.budget)}</td>
          <td class="px-4 py-3 text-center"><span class="action-btn text-[10px]">Hỗ trợ lập hồ sơ</span></td>
        </tr>`;
      }).join('')}</tbody></table>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div class="panel p-5"><h3 class="font-bold text-slate-800 mb-4"><i class="fa-solid fa-chart-bar mr-2 text-cyan-500"></i>Số đề án theo trạng thái</h3><div class="h-52"><canvas id="ch-ttkc-status"></canvas></div></div>
      <div class="panel p-5"><h3 class="font-bold text-slate-800 mb-4"><i class="fa-solid fa-chart-pie mr-2 text-cyan-500"></i>Cơ cấu lĩnh vực khũyến công</h3><div class="h-52 flex items-center justify-center"><canvas id="ch-ttkc-field"></canvas></div></div>
    </div>`;
}

// 🟡 SỞ CT — Thẩm định & Nghiệm thu
function renderDashSO() {
  const waitApproval   = AppData.projects.filter(p => p.status === 1);
  const waitAcceptance = AppData.projects.filter(p => p.status === 3);
  const totalBudget = AppData.projects.reduce((s,p)=>s+(p.budget||0),0);
  document.getElementById('dash-dynamic-content').innerHTML = `
    <div><h1 class="text-2xl font-black text-slate-900">Sở Công Thương — Quản lý Khuyến công Tỉnh</h1><p class="text-slate-500 text-sm mt-1">Thẩm định hồ sơ và nghiệm thu đề án tại địa phương</p></div>
    <div class="grid grid-cols-2 gap-4">
      ${alertCard('Hồ sơ chờ Sở thẩm định', waitApproval.length, 'Click để thẩm định và duyệt trình Bộ', '#d97706','fa-magnifying-glass-chart', "handleMenuClick(document.getElementById('menu-projects-1'),'projects',1)")}
      ${alertCard('Đề án chờ Nghiệm thu', waitAcceptance.length, 'Kiểm tra thực địa và xác nhận hoàn thành', '#7c3aed','fa-clipboard-check', "handleMenuClick(document.getElementById('menu-projects-2'),'projects',3)")}
    </div>
    <div class="grid grid-cols-3 gap-4">
      ${kpiCard('Tổng đề án tỉnh', AppData.projects.length, 'Tất cả trạng thái', '#d97706')}
      ${kpiCard('Kinh phí kế hoạch', formatVND(totalBudget), 'Tổng ngân sách được phân bổ', '#0891b2')}
      ${kpiCard('Doanh nghiệp tỉnh', AppData.companies.length, 'Đang tham gia chương trình KC', '#10b981')}
    </div>
    <div class="panel overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <div class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
        <h3 class="font-black text-slate-800">Hồ sơ cần thẩm định ngay (${waitApproval.length})</h3>
      </div>
      <table class="w-full text-sm"><thead><tr class="text-[10px] text-slate-400 font-black uppercase bg-slate-50 border-b"><th class="px-4 py-3 text-left">Mã ĐA</th><th class="px-4 py-3 text-left">Tên đề án</th><th class="px-4 py-3 text-left">Đơn vị thụ hưởng</th><th class="px-4 py-3 text-right">Kinh phí</th><th class="px-4 py-3 text-center">Thao tác Sở</th></tr></thead>
      <tbody>${waitApproval.map(p => {
        const co = getCompany(p.companyId);
        return `<tr class="hover:bg-orange-50 cursor-pointer" onclick="viewProjectDetail('${p.id}')">
          <td class="px-4 py-3 font-bold text-slate-400 text-xs">${p.id}</td>
          <td class="px-4 py-3 font-semibold text-slate-800">${p.name}</td>
          <td class="px-4 py-3 text-slate-600 text-xs">${co.name}</td>
          <td class="px-4 py-3 text-right font-mono font-bold">${formatVND(p.budget)}</td>
          <td class="px-4 py-3 text-center flex gap-2 justify-center">
            <button class="action-btn bg-orange-500 text-white border-0 text-xs" onclick="event.stopPropagation();roleAction('${p.id}',2,'Duyệt Sở')">✓ Duyệt Sở</button>
            <button class="action-btn bg-rose-50 text-rose-600 border-rose-200 text-xs" onclick="event.stopPropagation();roleAction('${p.id}',0,'Từ chối')">✗ Từ chối</button>
          </td>
        </tr>`;
      }).join('') || '<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400 text-sm">✅ Không có hồ sơ cần thẩm định</td></tr>'}</tbody></table>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div class="panel p-5"><h3 class="font-bold text-slate-800 mb-4"><i class="fa-solid fa-chart-bar mr-2 text-amber-500"></i>Pipeline Thẩm định — Số hồ sơ theo giai đoạn</h3><div class="h-52"><canvas id="ch-so-pipeline"></canvas></div></div>
      <div class="panel p-5"><h3 class="font-bold text-slate-800 mb-4"><i class="fa-solid fa-chart-pie mr-2 text-amber-500"></i>Cơ cấu lĩnh vực đề án Tỉnh</h3><div class="h-52 flex items-center justify-center"><canvas id="ch-so-field"></canvas></div></div>
    </div>`;
}

// 🔴 BỘ CT — Tổng quan Quốc gia
function renderDashBO() {
  const waitMinistry   = AppData.projects.filter(p => p.status === 2);
  const waitSettle     = AppData.projects.filter(p => p.status === 4);
  const totalBudget    = AppData.projects.reduce((s,p)=>s+(p.budget||0),0);
  const totalDisbursed = AppData.projects.reduce((s,p)=>s+(p.disbursedAdvance||0)+(p.disbursedSettle||0)+(p.disbursed||0),0);
  const pct = totalBudget ? Math.round(totalDisbursed/totalBudget*100) : 0;
  document.getElementById('dash-dynamic-content').innerHTML = `
    <div><h1 class="text-2xl font-black text-slate-900">Bộ / Cục Công Thương — Tổng quan Quốc gia</h1><p class="text-slate-500 text-sm mt-1">Phê duyệt kế hoạch và kiểm soát toàn bộ dòng tiền Khuyến công</p></div>
    <div class="grid grid-cols-2 gap-4">
      ${alertCard('Hồ sơ chờ Bộ phê duyệt', waitMinistry.length, 'Đã qua thẩm định Sở — cần phê duyệt cấp Bộ', '#dc2626','fa-stamp', "handleMenuClick(document.getElementById('menu-projects-0'),'projects',2)")}
      ${alertCard('Đề án chờ Quyết toán', waitSettle.length, 'Đã nghiệm thu — cần quyết toán ngân sách', '#7c3aed','fa-file-invoice-dollar', "handleMenuClick(document.getElementById('menu-settle'),'projects',4)")}
    </div>
    <div class="grid grid-cols-4 gap-4">
      ${kpiCard('Tổng đề án Quốc gia', AppData.projects.length, 'Toàn hệ thống 2024', '#dc2626')}
      ${kpiCard('Kinh phí kế hoạch', formatVND(totalBudget), 'Tổng ngân sách Khuyến công', '#d97706')}
      ${kpiCard('Đã giải ngân', formatVND(totalDisbursed), `Tỷ lệ ${pct}% kế hoạch`, '#10b981')}
      ${kpiCard('Hoàn thành', AppData.projects.filter(p=>p.status===5).length, `/${AppData.projects.length} đề án`, '#2563eb')}
    </div>
    <div class="grid grid-cols-3 gap-5">
      <div class="col-span-2 panel p-5"><h3 class="font-bold text-slate-800 mb-4"><i class="fa-solid fa-chart-line mr-2 text-red-500"></i>Xu hướng Tăng trưởng Khuyến công Quốc gia (2020-2024)</h3><div class="h-64"><canvas id="ch-projects"></canvas></div></div>
      <div class="panel p-5"><h3 class="font-bold text-slate-800 mb-4"><i class="fa-solid fa-chart-pie mr-2 text-red-500"></i>Cơ cấu Lĩnh vực</h3><div class="h-52 flex items-center"><canvas id="ch-fields"></canvas></div></div>
    </div>
    <div class="panel overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <div class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
        <h3 class="font-black text-slate-800">Hồ sơ chờ Bộ phê duyệt (${waitMinistry.length})</h3>
      </div>
      <table class="w-full text-sm"><thead><tr class="text-[10px] text-slate-400 font-black uppercase bg-slate-50 border-b"><th class="px-4 py-3 text-left">Mã ĐA</th><th class="px-4 py-3 text-left">Tên đề án</th><th class="px-4 py-3 text-left">Đơn vị</th><th class="px-4 py-3 text-right">Kinh phí</th><th class="px-4 py-3 text-center">Phê duyệt Bộ</th></tr></thead>
      <tbody>${waitMinistry.map(p => {
        const co = getCompany(p.companyId);
        return `<tr class="hover:bg-red-50 cursor-pointer" onclick="viewProjectDetail('${p.id}')">
          <td class="px-4 py-3 font-bold text-slate-400 text-xs">${p.id}</td>
          <td class="px-4 py-3 font-semibold text-slate-800">${p.name}</td>
          <td class="px-4 py-3 text-slate-600 text-xs">${co.name}</td>
          <td class="px-4 py-3 text-right font-mono font-bold">${formatVND(p.budget)}</td>
          <td class="px-4 py-3 text-center">
            <button class="action-btn bg-blue-600 text-white border-0" onclick="event.stopPropagation();roleAction('${p.id}',3,'Phê duyệt Bộ')">✓ Phê duyệt & Ký HĐ</button>
          </td>
        </tr>`;
      }).join('') || '<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400 text-sm">✅ Không có hồ sơ chờ phê duyệt</td></tr>'}</tbody></table>
    </div>`;
  renderDashCharts();
}

// ---- BIỂU ĐỒ THEO VAI TRÒ ----
function initRoleCharts(rid) {
  if (typeof Chart === 'undefined') { setTimeout(() => initRoleCharts(rid), 200); return; }
  // Xóa biểu đồ hiện tại trong State.charts để tránh lỗi trùng Canvas
  Object.keys(State.charts).forEach(k => { try { State.charts[k].destroy(); } catch(e){} });
  State.charts = {};

  const mkChart = (id, type, data, options={}) => {
    const el = document.getElementById(id);
    if (!el) return;
    State.charts[id] = new Chart(el, { type, data, options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { font: { family:'Plus Jakarta Sans', weight:'700' }, boxWidth: 12, padding: 16 } } },
      ...options
    }});
  };

  const statusColors = ['#94a3b8','#f59e0b','#fb923c','#3b82f6','#a855f7','#10b981'];
  const fieldColors  = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#0891b2','#d97706','#64748b'];

  if (rid === 'CNNT') {
    const myP = AppData.projects.filter(p => p.companyId === 'DN01');
    // Biểu đồ Donut: Trạng thái đề án của tôi
    const counts = Object.keys(STATUS).map(s => myP.filter(p => p.status === parseInt(s)).length);
    mkChart('ch-cnnt-status','doughnut',{
      labels: Object.values(STATUS).map(s => s.label),
      datasets:[{ data: counts, backgroundColor: statusColors, borderWidth: 2, borderColor: '#fff' }]
    });
    // Biểu đồ Cột: Kế hoạch vs Đã giải ngân
    mkChart('ch-cnnt-budget','bar',{
      labels: myP.map(p => p.id),
      datasets:[
        { label:'Kế hoạch (tr.đ)', data: myP.map(p => Math.round(p.budget/1e6)), backgroundColor:'#3b82f680', borderColor:'#3b82f6', borderWidth:2, borderRadius:6 },
        { label:'Thực chi (tr.đ)',  data: myP.map(p => Math.round(p.disbursed/1e6)), backgroundColor:'#10b98180', borderColor:'#10b981', borderWidth:2, borderRadius:6 }
      ]
    },{ scales: { x:{ grid:{display:false}}, y:{ grid:{color:'#f1f5f9'}} } });
  }

  if (rid === 'TTKC') {
    // Biểu đồ Cột: Số lượng đề án theo trạng thái
    const stCounts = Object.keys(STATUS).map(s => AppData.projects.filter(p => p.status === parseInt(s)).length);
    mkChart('ch-ttkc-status','bar',{
      labels: Object.values(STATUS).map(s => s.label),
      datasets:[{ label:'Số đề án', data: stCounts, backgroundColor: statusColors, borderRadius: 8, borderSkipped: false }]
    },{ plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'},ticks:{stepSize:1}}} });
    // Biểu đồ Donut: Số lượng theo lĩnh vực
    const fCounts = FIELDS.map((f,i) => AppData.projects.filter(p => p.field === i).length);
    mkChart('ch-ttkc-field','doughnut',{
      labels: FIELDS.map(f => f.length > 20 ? f.slice(0,18)+'…' : f),
      datasets:[{ data: fCounts, backgroundColor: fieldColors, borderWidth: 2, borderColor:'#fff' }]
    });
  }

  if (rid === 'SO') {
    // Biểu đồ Cột: Luồng xét duyệt (số lượng ở mỗi bước)
    const pipeline = Object.keys(STATUS).map(s => AppData.projects.filter(p => p.status === parseInt(s)).length);
    mkChart('ch-so-pipeline','bar',{
      labels: Object.values(STATUS).map(s => s.label),
      datasets:[{ label:'Số hồ sơ', data: pipeline, backgroundColor: statusColors, borderRadius: 8, borderSkipped: false }]
    },{ indexAxis:'y', plugins:{legend:{display:false}}, scales:{x:{grid:{color:'#f1f5f9'},ticks:{stepSize:1}},y:{grid:{display:false}}} });
    // Biểu đồ Donut: Số lượng theo lĩnh vực
    const fCounts = FIELDS.map((f,i) => AppData.projects.filter(p => p.field === i).length);
    mkChart('ch-so-field','doughnut',{
      labels: FIELDS.map(f => f.length > 18 ? f.slice(0,16)+'…' : f),
      datasets:[{ data: fCounts, backgroundColor: fieldColors, borderWidth: 2, borderColor:'#fff' }]
    });
  }

  if (rid === 'ADMIN') {
    const years = [2020,2021,2022,2023,2024];
    const fieldsShort = ["Đào tạo nghề","Máy móc thiết bị","SP OCOP","Xúc tiến TM","Tư vấn KHCN","Liên kết Cụm CN","HTQT","Quản lý KC"];
    
    // 1. Tổng đề án (Line)
    const mockCounts = [45,62,78,95,AppData.projects.length];
    const mockBudget = [38,52,65,88,Math.round(AppData.projects.reduce((s,p)=>s+(p.budget||0),0)/1e9)];
    mkChart('ch-admin-trend','line',{
      labels: years, datasets:[
        {label:'Số đề án',data:mockCounts,borderColor:'#7c3aed',backgroundColor:'#7c3aed22',fill:true,tension:0.4,borderWidth:3,pointBackgroundColor:'#7c3aed'},
        {label:'Kinh phí (tỷ)',data:mockBudget,borderColor:'#f59e0b',backgroundColor:'#f59e0b11',fill:false,tension:0.4,borderWidth:2,borderDash:[4,2],pointBackgroundColor:'#f59e0b',yAxisID:'y1'}
      ]
    },{scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'},ticks:{stepSize:10}},y1:{position:'right',grid:{display:false},ticks:{callback:v=>v+'tỷ'}}},plugins:{legend:{position:'top'}}});

    // 10. Tỷ lệ hỗ trợ lĩnh vực hiện tại (Donut)
    mkChart('ch-admin-field-donut','doughnut',{
      labels: fieldsShort.slice(0,5),
      datasets:[{data:[30, 45, 15, 8, 2], backgroundColor:['#3b82f6','#10b981','#f59e0b','#ec4899','#8b5cf6'], borderWidth:2, borderColor:'#fff'}]
    },{cutout:'65%',plugins:{legend:{position:'right'}}});

    // 2. Đề án theo lĩnh vực theo thời gian (Bar grouped)
    mkChart('ch-admin-field-time','bar',{
      labels: years,
      datasets:[
        {label:'Máy móc thiết bị', data:[15, 20, 25, 35, 45], backgroundColor:'#10b981'},
        {label:'Đào tạo nghề', data:[10, 15, 18, 22, 30], backgroundColor:'#3b82f6'},
        {label:'SP OCOP', data:[5, 8, 12, 18, 15], backgroundColor:'#f59e0b'}
      ]
    },{scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'}}}});

    // 3. Đơn vị được hưởng theo lĩnh vực (Bar horizontal)
    mkChart('ch-admin-company-field','bar',{
      labels: fieldsShort.slice(0,6),
      datasets:[{label:'Số Đơn vị thụ hưởng', data:[45, 85, 30, 25, 12, 8], backgroundColor:'#14b8a6', borderRadius:4}]
    },{indexAxis:'y', scales:{x:{grid:{color:'#f1f5f9'}},y:{grid:{display:false}}}});

    // 4. Kinh phí thực hiện từng lĩnh vực (Bar)
    mkChart('ch-admin-budget-field','bar',{
      labels: fieldsShort.slice(0,5),
      datasets:[{label:'Kinh phí thực hiện (Tỷ VNĐ)', data:[12.5, 48.2, 8.5, 5.0, 1.2], backgroundColor:'#8b5cf6', borderRadius:4}]
    },{scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'}}}});

    // 5. So sánh hiệu quả DA vs Chỉ số KC (Radar)
    mkChart('ch-admin-efficiency','radar',{
      labels: ['Tăng trưởng DN','Giải quyết việc làm','Tăng thu NSNN','Đổi mới công nghệ','Phát triển LĐ'],
      datasets:[
        {label:'Kỳ vọng (Chỉ số KC)', data:[80, 75, 90, 85, 70], backgroundColor:'rgba(16, 185, 129, 0.2)', borderColor:'#10b981', pointBackgroundColor:'#10b981'},
        {label:'Thực tế (Hiệu quả DA)', data:[85, 80, 88, 92, 65], backgroundColor:'rgba(139, 92, 246, 0.2)', borderColor:'#8b5cf6', pointBackgroundColor:'#8b5cf6'}
      ]
    },{});

    // 6. Kinh phí KC thực hiện theo thời gian (Line area)
    mkChart('ch-admin-budget-done','line',{
      labels: years,
      datasets:[{label:'Đã thực hiện (Tỷ VNĐ)', data:[25, 38, 50, 75, 88], borderColor:'#10b981', backgroundColor:'#10b98122', fill:true, tension:0.4}]
    },{scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'}}}});

    // 7. Kinh phí KC dự kiến theo thời gian (Line dash)
    mkChart('ch-admin-budget-plan','line',{
      labels: years.concat([2025, 2026]),
      datasets:[
        {label:'Kế hoạch (Tỷ VNĐ)', data:[30, 45, 60, 85, 100, 120, 150], borderColor:'#64748b', backgroundColor:'#64748b11', fill:true, tension:0.4, borderDash:[5,5]}
      ]
    },{scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'}}}});

    // 8. Tổng DN được hỗ trợ theo thời gian (Line)
    mkChart('ch-admin-company-time','line',{
      labels: years,
      datasets:[{label:'Số Doanh nghiệp', data:[120, 185, 250, 340, 420], borderColor:'#6366f1', borderWidth:3, pointBackgroundColor:'#6366f1', pointRadius:4}]
    },{scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'}}}});

    // 9. Dự án đang thực hiện theo thời gian (Line)
    mkChart('ch-admin-active-time','line',{
      labels: years,
      datasets:[{label:'Dự án Đang thực hiện', data:[15, 22, 18, 35, 42], borderColor:'#3b82f6', backgroundColor:'#3b82f622', fill:true, tension:0.3}]
    },{scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'}}}});
  }

  if (rid === 'BO') {
    // Bộ CT đã vẽ sẵn biểu đồ dự án và lĩnh vực qua renderDashCharts — chỉ cần gọi lại
    renderDashCharts();
  }
}

function renderRoleBanner() {
  const role = ROLES[State.currentRole];
  const banner = document.getElementById('role-banner');
  if (!banner) return;
  const waiting = role.menus
    .filter(m => m.badge && m.filterStatus !== null && m.filterStatus !== undefined)
    .map(m => { const c = AppData.projects.filter(p => p.status === m.filterStatus).length; return c > 0 ? `<span class="font-black text-white">${c}</span> hồ sơ ${m.label.toLowerCase()}` : null; })
    .filter(Boolean).join(' · ');
  banner.style.display = 'flex';
  banner.style.background = role.color + '15';
  banner.style.border = `1px solid ${role.color}40`;
  banner.innerHTML = `
    <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shrink-0" style="background:${role.color}">
      <i class="fa-solid ${role.icon}"></i>
    </div>
    <div class="flex-1">
      <div class="font-black text-slate-900">${role.name}</div>
      <div class="text-sm mt-0.5" style="color:${role.color}">${role.short}</div>
      <div class="text-xs text-slate-500 mt-1">${role.welcome}</div>
      ${waiting ? `<div class="mt-2 text-xs font-bold" style="color:${role.color}"><i class="fa-solid fa-bell mr-1"></i>${waiting} đang chờ xử lý</div>` : ''}
    </div>`;
}

function renderDashCharts() {
  if(typeof Chart === 'undefined') { setTimeout(renderDashCharts, 200); return; }
  ['ch-projects','ch-fields'].forEach(id => { if(State.charts[id]) { State.charts[id].destroy(); } });

  // Biểu đồ 1: Đường - Tăng trưởng
  State.charts['ch-projects'] = new Chart(document.getElementById('ch-projects'), {
    type: 'line',
    data: {
      labels: AppData.kpi.labels,
      datasets: [{
        label: 'Đề án', data: AppData.kpi.projects,
        borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.08)',
        borderWidth: 3, tension: 0.4, fill: true, pointBackgroundColor: '#2563eb'
      },{
        label: 'Kinh phí (Tỷ)', data: AppData.kpi.budget,
        borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.06)',
        borderWidth: 3, tension: 0.4, fill: true, pointBackgroundColor:'#10b981'
      }]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'top'}},
      scales: { y:{grid:{color:'#f1f5f9'}}, x:{grid:{display:false}} } }
  });

  // Biểu đồ 2: Doughnut - Cơ cấu lĩnh vực
  const fieldCount = FIELDS.map((_,i) => AppData.projects.filter(p=>p.field===i).length);
  State.charts['ch-fields'] = new Chart(document.getElementById('ch-fields'), {
    type: 'doughnut',
    data: {
      labels: FIELDS,
      datasets: [{ data: fieldCount,
        backgroundColor: ['#2563eb','#10b981','#f59e0b','#8b5cf6','#ec4899'],
        borderWidth: 0 }]
    },
    options: { responsive:true, maintainAspectRatio:false, cutout:'65%',
      plugins:{legend:{position:'right', labels:{boxWidth:12, font:{size:11}}}} }
  });
}

// ---- QUẢN LÝ ĐỀ ÁN ----
function renderProjects() {
  const role = ROLES[State.currentRole];
  const { search, status, field } = State.projectFilter;
  const filtered = AppData.projects.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status < 0 || p.status === status;
    const matchField  = field < 0  || p.field === field;
    return matchSearch && matchStatus && matchField;
  });

  document.getElementById('proj-count').textContent = `${filtered.length} đề án`;

  const createBtn = document.getElementById('btn-create-project');
  if (createBtn) {
    createBtn.style.display = role.canCreate ? 'flex' : 'none';
  }

  const tbody = document.getElementById('projects-tbody');
  tbody.innerHTML = filtered.map(p => {
    const co = getCompany(p.companyId);
    // Tạo nút hành động dựa trên vai trò + trạng thái
    let actionHtml = '';
    const act = role.actions[p.status];
    if (act) {
      actionHtml = `<button class="action-btn ${act.cls} border-0" onclick="event.stopPropagation();roleAction('${p.id}',${act.nextStatus},'${act.label}')">${act.label}</button>`;
    }
    // Nút từ chối dành cho Sở Công Thương
    if (role.rejectFrom && role.rejectFrom.includes(p.status)) {
      actionHtml += ` <button class="action-btn bg-rose-50 text-rose-600 border-rose-200 ml-1" onclick="event.stopPropagation();roleAction('${p.id}',0,'Từ chối')">Từ chối</button>`;
    }
    if (!actionHtml && p.status < 10) {
      actionHtml = `<span class="text-[10px] text-slate-400 font-bold">Chờ ${STATUS[p.status+1]?.label.replace('Chờ ','') || '...'}</span>`;
    }
    if (p.status === 10) {
      actionHtml = '<span class="text-xs text-emerald-600 font-bold"><i class="fa-solid fa-check-double mr-1"></i>Hoàn tất</span>';
    }
    return `<tr class="hover:bg-slate-50 cursor-pointer transition-colors" onclick="viewProjectDetail('${p.id}')">
      <td class="px-5 py-4 font-bold text-slate-400 text-xs">${p.id}</td>
      <td class="px-5 py-4"><div class="font-bold text-slate-800">${p.name}</div><div class="text-xs text-blue-600 font-semibold mt-0.5">${p.type} · ${fieldName(p.field)}</div></td>
      <td class="px-5 py-4 text-sm text-slate-600">${co.name || '-'}</td>
      <td class="px-5 py-4 text-right font-mono font-bold text-slate-900">${formatVND(p.budget)}</td>
      <td class="px-5 py-4 text-center"><div class="flex flex-col items-center gap-1.5">${statusBadge(p.status)}<div class="mt-1">${renderWorkflowBar(p.status, false)}</div></div></td>
      <td class="px-5 py-4 text-center whitespace-nowrap">${actionHtml}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="6" class="px-5 py-10 text-center text-slate-400">Không tìm thấy đề án phù hợp</td></tr>';
}

function roleAction(pid, nextStatus, label) {
  const p = AppData.projects.find(x => x.id === pid);
  const oldLabel = STATUS[p.status].label;
  if (nextStatus === 0 && p.status !== 0) {
    // Yêu cầu xác nhận từ chối
    if (!confirm(`Từ chối đề án "${p.name}"?\nHồ sơ sẽ được trả về trạng thái "Khởi tạo" để Cơ sở bổ sung.`)) return;
    showToast(`Đã từ chối hồ sơ ${pid}. Yêu cầu bổ sung hồ sơ.`, 'error');
  } else {
    showToast(`Đề án ${pid}: ${oldLabel} → ${STATUS[nextStatus].label}`);
  }
  p.status = nextStatus;
  if (nextStatus === 10 && (p.disbursedAdvance + p.disbursedSettle) === 0) p.disbursedSettle = Math.round(p.budget * 0.95);
  renderProjects();
  if (State.view === 'dashboard') renderDashboard();
}

function filterProjects() {
  State.projectFilter.search = document.getElementById('proj-search').value;
  State.projectFilter.status = parseInt(document.getElementById('proj-status-filter').value);
  State.projectFilter.field  = parseInt(document.getElementById('proj-field-filter').value);
  renderProjects();
}

function showApproveMenu(pid, btn) {
  closeContextMenus();
  const p = AppData.projects.find(x => x.id === pid);
  const options = Object.entries(STATUS).map(([k,v]) =>
    `<div class="ctx-item ${p.status==k?'active':''}" onclick="setProjectStatus('${pid}',${k})">${v.label}</div>`
  ).join('');
  const menu = document.createElement('div');
  menu.className = 'ctx-menu'; menu.id = 'ctx-menu';
  menu.innerHTML = options;
  document.body.appendChild(menu);
  
  const r = btn.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  
  // Calculate position
  let topPos = r.bottom + 4;
  let leftPos = r.left;
  
  // If menu goes off bottom of screen, show it above the button instead
  if (topPos + menuRect.height > window.innerHeight) {
    topPos = r.top - menuRect.height - 4;
  }
  
  menu.style.top = topPos + 'px';
  menu.style.left = leftPos + 'px';
  
  setTimeout(() => document.addEventListener('click', closeContextMenus, {once:true}), 0);
}

function closeContextMenus() { document.getElementById('ctx-menu')?.remove(); }

function setProjectStatus(pid, newStatus) {
  const p = AppData.projects.find(x => x.id === pid);
  const oldLabel = STATUS[p.status].label;
  p.status = parseInt(newStatus);
  if(newStatus == 9 && (p.disbursedAdvance + p.disbursedSettle) === 0) p.disbursedSettle = Math.round(p.budget * 0.95);
  showToast(`Đề án ${pid}: ${oldLabel} → ${STATUS[newStatus].label}`);
  renderProjects();
  // Breadcrumb sẽ tự cập nhật qua renderDashboard ở lần hiển thị tới
  closeContextMenus();
  if(State.selectedProject === pid) viewProjectDetail(pid);
}

function viewProjectDetail(pid) {
  State.selectedProject = pid;
  const p = AppData.projects.find(x => x.id === pid);
  const co = getCompany(p.companyId);
  const totalDisbursed = (p.disbursedAdvance || 0) + (p.disbursedSettle || 0);
  const pct = p.budget > 0 ? Math.round(totalDisbursed/p.budget*100) : 0;

  document.getElementById('detail-title').textContent = p.name;
  document.getElementById('detail-content').innerHTML = `
    <div class="grid grid-cols-2 gap-4 text-sm">
      ${detailRow('Mã đề án', p.id)}
      ${detailRow('Loại đề án', p.type)}
      ${detailRow('Lĩnh vực', fieldName(p.field))}
      ${detailRow('Đơn vị thụ hưởng', `<button class="text-blue-600 font-bold hover:underline" onclick="closeModal('modal-detail');switchView('companies');highlightCompany('${co.id}')">${co.name}</button>`)}
      ${detailRow('Thời gian thực hiện', p.start + ' → ' + p.end)}
      ${detailRow('Kinh phí dự kiến', '<span class="font-bold font-mono text-blue-600">' + p.budget.toLocaleString() + ' VNĐ</span>')}
      ${detailRow('Nguồn kinh phí', p.source)}
      ${detailRow('Địa điểm', p.location)}
      ${detailRow('Đơn vị thi công', p.contractor)}
      ${detailRow('Đơn vị giám sát', p.supervisor)}
      ${detailRow('Đã Tạm ứng', '<span class="font-bold text-amber-600">' + formatVND(p.disbursedAdvance || 0) + '</span>')}
      ${detailRow('Đã Quyết toán', '<span class="font-bold text-emerald-600">' + formatVND(p.disbursedSettle || 0) + '</span>')}
    </div>
    <div class="mt-4 flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
      <span class="font-bold text-slate-700">Trạng thái hiện tại:</span>
      ${statusBadge(p.status)}
    </div>
    <div class="mt-5">
      <div class="flex justify-between text-xs font-bold mb-1.5">
        <span class="text-slate-500">Tiến độ giải ngân (Tạm ứng + Quyết toán)</span>
        <span class="text-blue-600">${formatVND(totalDisbursed)} / ${formatVND(p.budget)} (${pct}%)</span>
      </div>
      <div class="h-3 bg-slate-100 rounded-full overflow-hidden flex">
        <div class="h-full bg-amber-400" style="width:${p.budget > 0 ? (p.disbursedAdvance/p.budget*100) : 0}%;transition:width 0.8s ease" title="Tạm ứng"></div>
        <div class="h-full bg-emerald-500" style="width:${p.budget > 0 ? (p.disbursedSettle/p.budget*100) : 0}%;transition:width 0.8s ease" title="Quyết toán"></div>
      </div>
    </div>
    <div class="mt-5 flex gap-2 justify-end items-center border-t border-slate-200 pt-4">
      <!-- Nút Tải lên báo cáo tiến độ -->
      ${(p.status >= 5 && p.status <= 9 && (State.currentRole === 'CNNT' || State.currentRole === 'TTKC')) ? `<button class="btn-sm bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 mr-auto" onclick="showToast('Đã mở form tải lên Báo cáo tiến độ')"><i class="fa-solid fa-cloud-arrow-up mr-1 text-blue-500"></i> Nộp báo cáo / Hóa đơn</button>` : ''}
      
      <!-- Nút Hồ sơ giải ngân -->
      ${(p.status >= 3 && (State.currentRole === 'BO' || State.currentRole === 'ADMIN')) ? `<button class="btn-sm bg-emerald-600 text-white shadow-md shadow-emerald-500/30" onclick="closeModal('modal-detail');switchView('funds')"><i class="fa-solid fa-vault mr-1"></i> Hồ sơ Giải ngân</button>` : ''}
      
      <!-- Nút Trả hồ sơ -->
      ${((State.currentRole === 'SO' && p.status === 1) || (State.currentRole === 'BO' && p.status === 2)) ? `<button class="btn-sm bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-300" onclick="setProjectStatus('${p.id}', ${p.status - 1})"><i class="fa-solid fa-reply mr-1"></i> Yêu cầu làm lại</button>` : ''}
      
      <!-- Nút Duyệt theo Role -->
      ${(() => {
        const roleDef = ROLES[State.currentRole];
        const action = roleDef.actions && roleDef.actions[p.status];
        return action ? `<button class="btn-sm ${action.cls} shadow-md" onclick="setProjectStatus('${p.id}', ${action.nextStatus})">${action.label}</button>` : '';
      })()}
      
      <!-- Nút Ép Trạng thái (Chỉ Admin) -->
      ${(p.status < 10 && State.currentRole === 'ADMIN') ? `<button class="btn-sm bg-slate-800 text-white shadow-md" onclick="showApproveMenu('${p.id}', this)"><i class="fa-solid fa-bolt mr-1"></i> Ép trạng thái</button>` : ''}
    </div>`;

  // Các bước quy trình (State Machine) — Thanh tiến độ
  document.getElementById('detail-steps').innerHTML = renderWorkflowBar(p.status, true);

  openModal('modal-detail');
}

function renderWorkflowBar(currentStatus, fullMode = false) {
  const steps = Object.entries(STATUS);
  const total = steps.length - 1; // chỉ số lớn nhất
  const pct = Math.round((currentStatus / total) * 100);

  if (!fullMode) {
    // Thanh tiến độ thu nhỏ cho dòng bảng — dạng chấm
    const dots = steps.map(([k]) => {
      const s = parseInt(k);
      let cls = '';
      if (s < currentStatus)  cls = 'bg-blue-500';
      else if (s === currentStatus) cls = 'bg-amber-400 ring-2 ring-amber-300 ring-offset-1';
      else cls = 'bg-slate-200';
      return `<div title="${STATUS[k].label}" class="w-2.5 h-2.5 rounded-full ${cls} transition-all"></div>`;
    }).join('<div class="w-3 h-0.5 bg-slate-200"></div>');
    return `<div class="flex items-center gap-0">${dots}</div>`;
  }

  // Thanh tiến độ đầy đủ cho Modal
  return `
    <div class="w-full">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tiến trình xét duyệt</span>
        <span class="text-[10px] font-black text-blue-600">${pct}% hoàn thành</span>
      </div>
      <div class="relative">
        <!-- Đường kết nối nền -->
        <div class="absolute top-4 left-0 right-0 h-0.5 bg-slate-200" style="margin:0 1.25rem"></div>
        <!-- Đường tiến trình -->
        <div class="absolute top-4 left-0 h-0.5 bg-blue-500 transition-all duration-700" style="margin-left:1.25rem;width:calc(${pct}% - 2.5rem * ${pct}/100)"></div>
        <!-- Steps -->
        <div class="relative flex justify-between">
          ${steps.map(([k,v]) => {
            const s = parseInt(k);
            const done = s < currentStatus;
            const active = s === currentStatus;
            const future = s > currentStatus;
            return `<div class="flex flex-col items-center gap-1.5" style="min-width:1.5rem">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 shadow-sm transition-all ${
                done   ? 'bg-blue-600 border-blue-600 text-white' :
                active ? 'bg-white border-amber-400 text-amber-500 ring-4 ring-amber-100' :
                         'bg-white border-slate-200 text-slate-300'}"
              >${done ? '<i class="fa-solid fa-check text-xs"></i>' : s === 5 ? '<i class="fa-solid fa-trophy text-xs"></i>' : s+1}</div>
              <div class="text-center" style="min-width:4rem;margin-left:-0.75rem">
                <div class="text-[9px] font-black leading-tight ${
                  done ? 'text-blue-600' : active ? 'text-amber-600' : 'text-slate-300'
                }">${v.label.replace('Chờ duyệt ','')}</div>
                ${active ? '<div class="text-[8px] text-amber-500 font-bold">● Hiện tại</div>' : ''}
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
}

function detailRow(label, val) {
  return `<div class="bg-slate-50 rounded-lg p-3">
    <div class="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">${label}</div>
    <div class="text-slate-800 font-semibold">${val}</div>
  </div>`;
}

// Xem nhanh từ màn hình Tổng quan
function quickViewProject(pid) { switchView('projects'); setTimeout(() => viewProjectDetail(pid), 100); }

// ---- GIẢI NGÂN KINH PHÍ ----
function renderFunds() {
  const funded = AppData.projects.filter(p => p.status >= 2);
  const tbody = document.getElementById('funds-tbody');
  if (!tbody) return;
  tbody.innerHTML = funded.map(p => {
    const co = getCompany(p.companyId);
    const tD = (p.disbursedAdvance||0) + (p.disbursedSettle||0);
    const pct = p.budget > 0 ? Math.round(tD/p.budget*100) : 0;
    const remaining = p.budget - tD;
    return `<tr class="hover:bg-slate-50 transition-colors">
      <td class="px-5 py-4 font-bold text-xs text-slate-400">${p.id}</td>
      <td class="px-5 py-4">
        <div class="font-bold text-slate-800 text-sm">${p.name}</div>
        <div class="text-xs text-slate-400 mt-0.5">${co.name || ''}</div>
      </td>
      <td class="px-5 py-4 text-right font-mono font-bold text-slate-700">${formatVND(p.budget)}</td>
      <td class="px-5 py-4 text-right font-mono font-bold text-emerald-600">${formatVND(tD)}</td>
      <td class="px-5 py-4">
        <div class="flex items-center gap-2">
          <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full ${pct>=80?'bg-emerald-500':pct>=40?'bg-blue-500':'bg-amber-400'}" style="width:${pct}%"></div>
          </div>
          <span class="text-xs font-bold text-slate-500 w-9 text-right">${pct}%</span>
        </div>
      </td>
      <td class="px-5 py-4 text-center">${statusBadge(p.status)}</td>
      <td class="px-5 py-4 text-center">
        ${p.status < 4 ? `<button class="action-btn" onclick="openDisbursalModal('${p.id}')"><i class="fa-solid fa-file-invoice-dollar mr-1"></i> Quyết toán</button>` : '<span class="text-xs text-emerald-600 font-bold"><i class="fa-solid fa-check-double mr-1"></i>Hoàn tất</span>'}
      </td>
    </tr>`;
  }).join('');

  // Chỉ số KPI tổng hợp
  const totalBudget = funded.reduce((s,p)=>s+(p.budget||0),0);
  const totalDis    = funded.reduce((s,p)=>s+(p.disbursedAdvance||0)+(p.disbursedSettle||0)+(p.disbursed||0),0);
  document.getElementById('fund-total-budget').textContent    = formatVND(totalBudget);
  document.getElementById('fund-total-disbursed').textContent = formatVND(totalDis);
  document.getElementById('fund-remaining').textContent       = formatVND(totalBudget - totalDis);

  // Thêm khung chứa biểu đồ nếu chưa có
  const chartsSection = document.getElementById('fund-charts-section');
  if (chartsSection) {
    chartsSection.innerHTML = `
      <div class="grid grid-cols-3 gap-5">
        <div class="col-span-2 panel p-5">
          <h3 class="font-bold text-slate-800 mb-1"><i class="fa-solid fa-chart-bar mr-2 text-brand"></i>Kế hoạch vs Đã giải ngân vs Còn lại (Triệu VNĐ)</h3>
          <p class="text-xs text-slate-400 mb-4">So sánh kinh phí kế hoạch và thực chi theo từng đề án</p>
          <div style="height:280px"><canvas id="ch-fund-bar"></canvas></div>
        </div>
        <div class="panel p-5">
          <h3 class="font-bold text-slate-800 mb-1"><i class="fa-solid fa-chart-pie mr-2 text-brand"></i>Tổng tỷ lệ Giải ngân</h3>
          <p class="text-xs text-slate-400 mb-4">Toàn bộ ngân sách khuyến công</p>
          <div style="height:200px" class="flex items-center justify-center"><canvas id="ch-fund-donut"></canvas></div>
          <div class="mt-4 space-y-2">
            <div class="flex justify-between text-xs font-bold"><span class="text-emerald-600">■ Đã giải ngân</span><span>${formatVND(totalDis)}</span></div>
            <div class="flex justify-between text-xs font-bold"><span class="text-amber-500">■ Còn lại</span><span>${formatVND(totalBudget-totalDis)}</span></div>
            <div class="h-px bg-slate-100 my-2"></div>
            <div class="flex justify-between text-xs font-black"><span>Tổng kế hoạch</span><span>${formatVND(totalBudget)}</span></div>
          </div>
        </div>
      </div>
      <div class="panel p-5">
        <h3 class="font-bold text-slate-800 mb-1"><i class="fa-solid fa-chart-column mr-2 text-brand"></i>Giải ngân theo Lĩnh vực Khuyến công</h3>
        <p class="text-xs text-slate-400 mb-4">Tổng kinh phí phân bổ theo từng lĩnh vực hỗ trợ</p>
        <div style="height:220px"><canvas id="ch-fund-field"></canvas></div>
      </div>`;
    setTimeout(() => initFundCharts(funded, totalBudget, totalDis), 80);
  }
}

function initFundCharts(funded, totalBudget, totalDis) {
  if (typeof Chart === 'undefined') { setTimeout(() => initFundCharts(funded, totalBudget, totalDis), 200); return; }
  ['ch-fund-bar','ch-fund-donut','ch-fund-field'].forEach(id => {
    if (State.charts[id]) { State.charts[id].destroy(); delete State.charts[id]; }
  });

  // Biểu đồ 1: Cột ngang nhóm — Kế hoạch vs Giải ngân vs Còn lại theo đề án
  const labels = funded.map(p => p.id);
  State.charts['ch-fund-bar'] = new Chart(document.getElementById('ch-fund-bar'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label:'Kế hoạch', data: funded.map(p=>Math.round(p.budget/1e6)), backgroundColor:'#e2e8f0', borderColor:'#94a3b8', borderWidth:1, borderRadius:4 },
        { label:'Đã giải ngân', data: funded.map(p=>Math.round(((p.disbursedAdvance||0)+(p.disbursedSettle||0))/1e6)), backgroundColor:'#10b981cc', borderColor:'#10b981', borderWidth:2, borderRadius:4 },
        { label:'Còn lại', data: funded.map(p=>Math.round((p.budget-((p.disbursedAdvance||0)+(p.disbursedSettle||0)))/1e6)), backgroundColor:'#f59e0b55', borderColor:'#f59e0b', borderWidth:1, borderRadius:4 }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ position:'top', labels:{ font:{family:'Plus Jakarta Sans',weight:'700'}, boxWidth:12, padding:16 }}},
      scales:{
        x:{ stacked:false, grid:{display:false} },
        y:{ grid:{color:'#f1f5f9'}, ticks:{ callback: v => v + 'tr.' } }
      }
    }
  });

  // Biểu đồ 2: Donut — Đã giải ngân vs Còn lại
  const pctTotal = Math.round(totalDis/totalBudget*100);
  State.charts['ch-fund-donut'] = new Chart(document.getElementById('ch-fund-donut'), {
    type: 'doughnut',
    data: {
      labels: [`Đã giải ngân (${pctTotal}%)`, `Còn lại (${100-pctTotal}%)`],
      datasets:[{ data:[totalDis, totalBudget-totalDis], backgroundColor:['#10b981','#fde68a'], borderColor:['#fff','#fff'], borderWidth:3, hoverOffset:8 }]
    },
    options:{
      responsive:true, maintainAspectRatio:false, cutout:'68%',
      plugins:{
        legend:{ display:false },
        tooltip:{ callbacks:{ label: ctx => ' ' + formatVND(ctx.raw) } }
      }
    }
  });

  // Biểu đồ 3: Cột theo lĩnh vực — Tổng kinh phí mỗi lĩnh vực
  const fieldBudgets = FIELDS.map((f,i) => {
    const ps = funded.filter(p => p.field === i);
    return { budget: ps.reduce((s,p)=>s+(p.budget||0),0), dis: ps.reduce((s,p)=>s+(p.disbursedAdvance||0)+(p.disbursedSettle||0)+(p.disbursed||0),0) };
  }).filter(f => f.budget > 0);
  const fieldLabels  = FIELDS.filter((f,i) => funded.some(p=>p.field===i)).map(f=>f.length>22?f.slice(0,20)+'…':f);
  const fieldBudArr  = FIELDS.map((f,i) => funded.filter(p=>p.field===i).reduce((s,p)=>s+(p.budget||0),0)).filter(v=>v>0);
  const fieldDisArr  = FIELDS.map((f,i) => funded.filter(p=>p.field===i).reduce((s,p)=>s+(p.disbursedAdvance||0)+(p.disbursedSettle||0)+(p.disbursed||0),0)).filter(v=>v>0);
  const fieldColors  = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#0891b2','#d97706','#64748b'];

  State.charts['ch-fund-field'] = new Chart(document.getElementById('ch-fund-field'), {
    type: 'bar',
    data: {
      labels: fieldLabels,
      datasets: [
        { label:'Kế hoạch (tr.đ)', data: fieldBudArr.map(v=>Math.round(v/1e6)), backgroundColor: fieldColors.map(c=>c+'88'), borderColor: fieldColors, borderWidth:2, borderRadius:6 },
        { label:'Đã giải ngân (tr.đ)', data: fieldDisArr.map(v=>Math.round(v/1e6)), backgroundColor: '#10b98166', borderColor:'#10b981', borderWidth:2, borderRadius:6 }
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ position:'top', labels:{ font:{family:'Plus Jakarta Sans',weight:'700'}, boxWidth:12, padding:16 }}},
      scales:{
        x:{ grid:{display:false} },
        y:{ grid:{color:'#f1f5f9'}, ticks:{ callback: v=>v+'tr.' } }
      }
    }
  });
}

function openDisbursalModal(pid) {
  const p = AppData.projects.find(x => x.id === pid);
  const currentDisbursed = (p.disbursedAdvance||0) + (p.disbursedSettle||0);
  const remaining = p.budget - currentDisbursed;
  
  document.getElementById('dis-project-name').textContent = p.name;
  document.getElementById('dis-budget').textContent = p.budget.toLocaleString() + ' VNĐ';
  document.getElementById('dis-advance').textContent = (p.disbursedAdvance||0).toLocaleString() + ' VNĐ';
  document.getElementById('dis-settle').textContent = (p.disbursedSettle||0).toLocaleString() + ' VNĐ';
  document.getElementById('dis-max').textContent = 'Còn lại: ' + remaining.toLocaleString() + ' VNĐ (Tối đa 150tr theo TT28)';
  
  const disAmountInput = document.getElementById('dis-amount');
  disAmountInput.value = '';
  disAmountInput.oninput = (e) => checkDisLimit(e.target.value, remaining);
  
  document.getElementById('dis-error').classList.add('hidden');
  document.getElementById('dis-btn-submit').onclick = () => submitDisbursal(pid, remaining);
  openModal('modal-disbursal');
}

function checkDisLimit(val, remaining) {
  const err = document.getElementById('dis-error');
  const inp = document.getElementById('dis-amount');
  const numVal = Number(val);
  
  if(numVal > 150000000 || numVal > remaining) {
    err.classList.remove('hidden');
    err.textContent = numVal > remaining ? 'Vượt quá số kinh phí còn lại!' : 'Vượt quá định mức 150tr (TT28)!';
    inp.classList.add('border-rose-400', 'bg-rose-50');
  } else {
    err.classList.add('hidden');
    inp.classList.remove('border-rose-400', 'bg-rose-50');
  }
}

function submitDisbursal(pid, remaining) {
  const val = Number(document.getElementById('dis-amount').value);
  if(!val) { showToast('Vui lòng nhập số tiền!', 'error'); return; }
  if(val > 150000000) { showToast('Vượt định mức 150tr (TT28)! Không thể thực chi.', 'error'); return; }
  if(val > remaining) { showToast('Số tiền giải ngân vượt quá tổng mức được duyệt!', 'error'); return; }
  
  const p = AppData.projects.find(x => x.id === pid);
  
  // Tạm thời để đơn giản gán vào Settle
  const disType = document.getElementById('dis-type') ? document.getElementById('dis-type').value : 'settle';
  if (disType === 'advance') {
    p.disbursedAdvance = (p.disbursedAdvance || 0) + val;
  } else {
    p.disbursedSettle = (p.disbursedSettle || 0) + val;
  }
  
  const currentDisbursed = p.disbursedAdvance + p.disbursedSettle;
  
  // Tự động chuyển sang Thanh lý quyết toán nếu đã giải ngân trên 90%
  if(currentDisbursed >= p.budget * 0.9 && p.status < 9) {
    p.status = 9; 
    showToast(`Đề án '${p.name}' đã tự động chuyển sang Thanh lý hợp đồng!`, 'success');
  }
  
  closeModal('modal-disbursal');
  showToast(`Giải ngân ${formatVND(val)} cho đề án ${pid} thành công!`);
  renderFunds();
}

function saveNewCompany() {
  const name = document.getElementById('co-name').value;
  const type = document.getElementById('co-type').value;
  const tax = document.getElementById('co-tax').value;
  
  if(!name) { showToast('Vui lòng nhập tên doanh nghiệp!', 'error'); return; }
  if(!type || type === 'invalid') { showToast('Loại hình doanh nghiệp không hợp lệ!', 'error'); return; }
  
  const newId = 'CO' + (AppData.companies.length + 1).toString().padStart(3, '0');
  AppData.companies.unshift({
    id: newId,
    name: name,
    sector: type === 'dnnvv' ? 'Doanh nghiệp Nhỏ và Vừa' : type === 'htx' ? 'Hợp tác xã' : 'Hộ kinh doanh',
    location: 'Chưa cập nhật',
    icon: 'fa-building',
    tax: tax || 'N/A'
  });
  
  closeModal('modal-create-company');
  showToast('Đã thêm mới đơn vị thụ hưởng ' + name);
  renderCompanies();
  populateCompanyDropdown();
}

// ---- DOANH NGHIỆP ----
function renderCompanies(highlight = null) {
  State.selectedCompany = highlight;
  const grid = document.getElementById('companies-grid');
  grid.innerHTML = AppData.companies.map(co => {
    const projs = getProjectsByCompany(co.id);
    const isHL = co.id === highlight;
    return `<div class="panel p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all ${isHL?'border-blue-500 ring-2 ring-blue-200':''}" onclick="filterProjectsByCompany('${co.id}')">
      <div class="flex items-start gap-3">
        <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-xl shrink-0">
          <i class="fa-solid ${co.icon}"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-slate-800 text-sm leading-tight">${co.name}</div>
          <div class="text-xs text-slate-400 mt-0.5">${co.sector}</div>
        </div>
        <div class="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-black shrink-0">${projs.length}</div>
      </div>
      <div class="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div class="bg-slate-50 rounded-lg p-2"><span class="text-slate-400">MST: </span><span class="font-bold">${co.tax}</span></div>
        <div class="bg-slate-50 rounded-lg p-2"><span class="text-slate-400">Lao động: </span><span class="font-bold">${co.workers}</span></div>
        <div class="bg-slate-50 rounded-lg p-2 col-span-2"><span class="text-slate-400">Địa bàn: </span><span class="font-bold">${co.province}</span></div>
      </div>
      <button class="mt-3 w-full text-xs font-bold text-blue-600 hover:text-blue-800 text-center py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
        Xem ${projs.length} đề án liên quan →
      </button>
    </div>`;
  }).join('');
}

function highlightCompany(cid) { renderCompanies(cid); }

function filterProjectsByCompany(cid) {
  const co = getCompany(cid);
  switchView('projects');
  setTimeout(() => {
    document.getElementById('proj-search').value = '';
    State.projectFilter = { search: '', status: -1, field: -1, companyId: cid };
    const filtered = AppData.projects.filter(p => p.companyId === cid);
    document.getElementById('proj-count').textContent = `${filtered.length} đề án của ${co.name}`;
    const tbody = document.getElementById('projects-tbody');
    tbody.innerHTML = filtered.map(p => {
      return `<tr class="hover:bg-slate-50 cursor-pointer transition-colors" onclick="viewProjectDetail('${p.id}')">
        <td class="px-5 py-4 font-bold text-slate-400 text-xs">${p.id}</td>
        <td class="px-5 py-4"><div class="font-bold text-slate-800">${p.name}</div><div class="text-xs text-blue-600 font-semibold mt-0.5">${p.type} · ${fieldName(p.field)}</div></td>
        <td class="px-5 py-4 text-sm text-slate-600">${co.name}</td>
        <td class="px-5 py-4 text-right font-mono font-bold text-slate-900">${formatVND(p.budget)}</td>
        <td class="px-5 py-4 text-center">${statusBadge(p.status)}</td>
        <td class="px-5 py-4 text-center">
          ${p.status < 4 ? `<button class="action-btn" onclick="event.stopPropagation();showApproveMenu('${p.id}',this)">Cập nhật</button>` : '<span class="text-xs text-emerald-600 font-bold">Xong</span>'}
        </td></tr>`;
    }).join('');
  }, 100);
}

// ---- SẢN PHẨM OCOP ----
function renderOcop() {
  document.getElementById('ocop-grid').innerHTML = AppData.ocop.map(o => `
    <div class="panel p-5 hover:shadow-md transition-shadow">
      <div class="flex justify-between items-start mb-3">
        <span class="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-bold">${o.category}</span>
        <div class="flex text-amber-400">${'<i class="fa-solid fa-star text-xs"></i>'.repeat(o.stars)}${'<i class="fa-regular fa-star text-xs text-slate-200"></i>'.repeat(5-o.stars)}</div>
      </div>
      <h3 class="font-black text-slate-800 text-sm mb-1">${o.name}</h3>
      <p class="text-xs text-slate-500 mb-3">${o.company}</p>
      <div class="text-[10px] text-slate-400 font-bold uppercase">Cấp chứng nhận: <span class="text-slate-600">${o.certified}</span></div>
    </div>`).join('');
}

// ---- CHỈ TIÊU KPI ----
function renderKpi() {
  if(State.charts['ch-kpi']) { State.charts['ch-kpi'].destroy(); }
  State.charts['ch-kpi'] = new Chart(document.getElementById('ch-kpi'), {
    type: 'bar',
    data: {
      labels: AppData.kpi.labels,
      datasets: [
        { label: 'Lao động đào tạo', data: AppData.kpi.jobs, backgroundColor: '#2563eb', borderRadius: 4 },
        { label: 'Cơ sở hỗ trợ',     data: AppData.kpi.companies, backgroundColor: '#10b981', borderRadius: 4 },
      ]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'top'}},
      scales: { y:{grid:{color:'#f1f5f9'}}, x:{grid:{display:false}} } }
  });
}

// ---- TẠO ĐỀ ÁN MỚI ----
function submitProject() {
  const name       = document.getElementById('p_name').value.trim();
  const comp       = document.getElementById('p_company').value;
  const budget     = Number(document.getElementById('p_budget').value) || 0;
  const type       = document.getElementById('p_type').value;
  const field      = parseInt(document.getElementById('p_field').value);
  const location   = document.getElementById('p_location')?.value.trim() || '';
  const start      = document.getElementById('p_start')?.value || new Date().toISOString().slice(0,10);
  const end        = document.getElementById('p_end')?.value || '';
  const acceptance = document.getElementById('p_acceptance')?.value || '';
  const source     = document.getElementById('p_source')?.value || 'Ngân sách Địa phương';
  const contractor = document.getElementById('p_contractor')?.value.trim() || '';
  const supervisor = document.getElementById('p_supervisor')?.value.trim() || '';

  if(!name) { showToast('Vui lòng nhập tên đề án!', 'error'); return; }
  if(!comp) { showToast('Vui lòng chọn đơn vị thụ hưởng!', 'error'); return; }
  if(!start) { showToast('Vui lòng chọn ngày bắt đầu!', 'error'); return; }

  const newP = {
    id: 'DA-' + (2400 + AppData.projects.length + 1),
    name, type, field, budget,
    start, end, acceptance, source, location,
    contractor, supervisor,
    companyId: comp, status: 0, disbursed: 0
  };
  AppData.projects.unshift(newP);
  closeModal('modal-create');
  document.getElementById('form-create').reset();
  showToast(`Đã tạo đề án ${newP.id} thành công!`);
  renderProjects();
  renderDashboard();
}

// Đổ dữ liệu vào danh sách Doanh nghiệp
function populateCompanyDropdown() {
  const sel = document.getElementById('p_company');
  sel.innerHTML = '<option value="">-- Chọn đơn vị --</option>' +
    AppData.companies.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}


// ---- ĐĂNG NHẬP / ĐĂNG XUẤT ----
function loginAs(roleId) {
  const loginScreen = document.getElementById('login-screen');
  const mainApp     = document.getElementById('main-app');
  const btnLogout   = document.getElementById('btn-logout');

  // Hiệu ứng ẩn màn hình đăng nhập
  loginScreen.style.animation = 'loginFadeOut 0.5s ease forwards';
  setTimeout(() => {
    loginScreen.style.display = 'none';
    mainApp.style.display = 'flex';
    mainApp.style.animation = 'appFadeIn 0.4s ease forwards';
    btnLogout.style.display = 'block';

    // Khởi động ứng dụng với vai trò đã chọn
    State.currentRole = roleId;
    populateCompanyDropdown();
    buildSidebar(roleId);
    switchRole(roleId);
    switchView('dashboard');
  }, 480);
}

function logout() {
  const loginScreen = document.getElementById('login-screen');
  const mainApp     = document.getElementById('main-app');
  const btnLogout   = document.getElementById('btn-logout');
  mainApp.style.animation = 'loginFadeOut 0.35s ease forwards';
  setTimeout(() => {
    mainApp.style.display = 'none';
    loginScreen.style.display = 'flex';
    loginScreen.style.animation = 'appFadeIn 0.4s ease forwards';
    btnLogout.style.display = 'none';
    // Làm mới dữ liệu biểu đồ
    Object.values(State.charts).forEach(c => { try { c.destroy(); } catch(e){} });
    State.charts = {};
  }, 350);
}

// ---- DASHBOARD ADMIN ----
function renderDashAdmin() {
  const total    = AppData.projects.length;
  const pending  = AppData.projects.filter(p => p.status > 0 && p.status < 10).length;
  const done     = AppData.projects.filter(p => p.status === 10).length;
  const totalBudget = AppData.projects.reduce((s,p)=>s+(p.budget || 0),0);
  const totalDis    = AppData.projects.reduce((s,p)=>s+(p.disbursedAdvance||0)+(p.disbursedSettle||0),0);

  document.getElementById('dash-dynamic-content').innerHTML = `
    <div class="flex justify-between items-start">
      <div><h1 class="text-2xl font-black text-slate-900">Bảng điều khiển Quản trị Hệ thống (v4.0)</h1>
      <p class="text-slate-500 text-sm mt-1">Toàn cảnh hệ thống Khuyến công Quốc gia — Dữ liệu chuẩn TT34 & QĐ 1881</p></div>
      <div class="flex gap-2">
        <button onclick="switchView('reports')" class="btn-sm bg-purple-600 text-white"><i class="fa-solid fa-file-contract mr-2"></i>Báo cáo TT34</button>
        <button onclick="switchView('kpi')" class="btn-sm bg-blue-600 text-white"><i class="fa-solid fa-chart-line mr-2"></i>12 KPI</button>
      </div>
    </div>

    <!-- GIS Map Section (NEW) -->
    <div class="panel p-5 overflow-hidden">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-black text-slate-800"><i class="fa-solid fa-map-location-dot mr-2 text-rose-500"></i>Bản đồ số Khuyến công Quốc gia (GIS - Giả lập)</h3>
        <div class="flex gap-2">
          <span class="text-[10px] font-black px-2 py-1 bg-blue-100 text-blue-600 rounded">CƠ SỞ CNNT</span>
          <span class="text-[10px] font-black px-2 py-1 bg-amber-100 text-amber-600 rounded">OCOP</span>
          <span class="text-[10px] font-black px-2 py-1 bg-rose-100 text-rose-600 rounded">ĐIỂM XTTM</span>
        </div>
      </div>
      <div class="relative w-full h-[400px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
        <img src="anh3.jpg" class="w-full h-full object-cover opacity-30 grayscale" style="filter: brightness(0.8) contrast(1.2)"/>
        <!-- Fake Map Markers -->
        <div class="absolute top-[20%] left-[45%] w-4 h-4 bg-blue-600 rounded-full border-2 border-white animate-bounce shadow-lg"></div>
        <div class="absolute top-[35%] left-[55%] w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-md"></div>
        <div class="absolute top-[60%] left-[48%] w-5 h-5 bg-rose-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
        <div class="absolute top-[15%] left-[42%] w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>
        <div class="absolute top-[80%] left-[52%] w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-md"></div>
        <!-- Map Sidebar -->
        <div class="absolute bottom-4 left-4 p-3 bg-white/90 backdrop-blur rounded-xl border border-white shadow-xl max-w-[200px]">
          <div class="text-[10px] font-black text-slate-400 mb-2 uppercase">Thống kê theo vùng</div>
          <div class="space-y-1">
             <div class="flex justify-between text-[10px] font-bold"><span>Miền Bắc:</span><span class="text-blue-600">42 cơ sở</span></div>
             <div class="flex justify-between text-[10px] font-bold"><span>Miền Trung:</span><span class="text-amber-600">28 cơ sở</span></div>
             <div class="flex justify-between text-[10px] font-bold"><span>Miền Nam:</span><span class="text-rose-600">50 cơ sở</span></div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-4">
      ${kpiCard('Tổng đề án', total, 'Toàn quốc', '#7c3aed')}
      ${kpiCard('Đang xử lý', pending, 'Hồ sơ 1-9', '#f59e0b')}
      ${kpiCard('Hoàn tất', done, 'Đã quyết toán (bước 10)', '#10b981')}
      ${kpiCard('Tổng kinh phí', formatVND(totalBudget||0), 'Kế hoạch 2024', '#dc2626')}
    </div>

    <!-- Quick actions -->
    <div class="grid grid-cols-4 gap-3">
      <div class="panel p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow" onclick="switchView('projects')">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:#7c3aed20"><i class="fa-solid fa-list-check" style="color:#7c3aed"></i></div>
        <div><div class="font-black text-slate-800 text-sm">Toàn bộ Đề án</div><div class="text-xs text-slate-400">${total} đề án</div></div>
      </div>
      <div class="panel p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow" onclick="switchView('funds')">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:#10b98120"><i class="fa-solid fa-vault" style="color:#10b981"></i></div>
        <div><div class="font-black text-slate-800 text-sm">Kinh phí & Quyết toán</div><div class="text-xs text-slate-400">${formatVND(totalDis||0)} đã chi</div></div>
      </div>
      <div class="panel p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow" onclick="switchView('reports')">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:#0891b220"><i class="fa-solid fa-file-contract" style="color:#0891b2"></i></div>
        <div><div class="font-black text-slate-800 text-sm">Báo cáo Thông tư 34</div><div class="text-xs text-slate-400">Xuất báo cáo định kỳ</div></div>
      </div>
      <div class="panel p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow" onclick="switchView('settings')">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:#f59e0b20"><i class="fa-solid fa-gear" style="color:#f59e0b"></i></div>
        <div><div class="font-black text-slate-800 text-sm">Cấu hình Hệ thống</div><div class="text-xs text-slate-400">Phân quyền & tham số</div></div>
      </div>
    </div>

    <!-- Biểu đồ 1 & 10 -->
    <div class="grid grid-cols-3 gap-5 mb-5">
      <div class="col-span-2 panel p-5">
        <h3 class="font-bold text-slate-800 mb-1"><i class="fa-solid fa-chart-line mr-2 text-purple-500"></i>1. Tổng đề án theo thời gian</h3>
        <div style="height:240px"><canvas id="ch-admin-trend"></canvas></div>
      </div>
      <div class="panel p-5">
        <h3 class="font-bold text-slate-800 mb-1"><i class="fa-solid fa-chart-pie mr-2 text-purple-500"></i>10. Tỷ lệ hỗ trợ lĩnh vực hiện tại</h3>
        <div style="height:240px" class="flex items-center justify-center"><canvas id="ch-admin-field-donut"></canvas></div>
      </div>
    </div>

    <!-- Biểu đồ 2 & 3 -->
    <div class="grid grid-cols-2 gap-5 mb-5">
      <div class="panel p-5">
        <h3 class="font-bold text-slate-800 mb-1"><i class="fa-solid fa-chart-column mr-2 text-blue-500"></i>2. Đề án theo lĩnh vực theo thời gian</h3>
        <div style="height:240px"><canvas id="ch-admin-field-time"></canvas></div>
      </div>
      <div class="panel p-5">
        <h3 class="font-bold text-slate-800 mb-1"><i class="fa-solid fa-users mr-2 text-emerald-500"></i>3. Đơn vị được hưởng theo lĩnh vực</h3>
        <div style="height:240px"><canvas id="ch-admin-company-field"></canvas></div>
      </div>
    </div>

    <!-- Biểu đồ 4 & 5 -->
    <div class="grid grid-cols-2 gap-5 mb-5">
      <div class="panel p-5">
        <h3 class="font-bold text-slate-800 mb-1"><i class="fa-solid fa-money-bill-trend-up mr-2 text-amber-500"></i>4. Kinh phí thực hiện từng lĩnh vực</h3>
        <div style="height:240px"><canvas id="ch-admin-budget-field"></canvas></div>
      </div>
      <div class="panel p-5">
        <h3 class="font-bold text-slate-800 mb-1"><i class="fa-solid fa-radar mr-2 text-rose-500"></i>5. So sánh hiệu quả DA vs chỉ số KC</h3>
        <div style="height:240px" class="flex items-center justify-center"><canvas id="ch-admin-efficiency"></canvas></div>
      </div>
    </div>

    <!-- Biểu đồ 6 & 7 -->
    <div class="grid grid-cols-2 gap-5 mb-5">
      <div class="panel p-5">
        <h3 class="font-bold text-slate-800 mb-1"><i class="fa-solid fa-wallet mr-2 text-emerald-600"></i>6. Kinh phí KC thực hiện theo thời gian</h3>
        <div style="height:200px"><canvas id="ch-admin-budget-done"></canvas></div>
      </div>
      <div class="panel p-5">
        <h3 class="font-bold text-slate-800 mb-1"><i class="fa-solid fa-file-invoice-dollar mr-2 text-slate-500"></i>7. Kinh phí KC dự kiến theo thời gian</h3>
        <div style="height:200px"><canvas id="ch-admin-budget-plan"></canvas></div>
      </div>
    </div>

    <!-- Biểu đồ 8 & 9 -->
    <div class="grid grid-cols-2 gap-5 mb-5">
      <div class="panel p-5">
        <h3 class="font-bold text-slate-800 mb-1"><i class="fa-solid fa-building mr-2 text-indigo-500"></i>8. Tổng DN được hỗ trợ theo thời gian</h3>
        <div style="height:200px"><canvas id="ch-admin-company-time"></canvas></div>
      </div>
      <div class="panel p-5">
        <h3 class="font-bold text-slate-800 mb-1"><i class="fa-solid fa-spinner mr-2 text-blue-500"></i>9. Dự án đang thực hiện theo thời gian</h3>
        <div style="height:200px"><canvas id="ch-admin-active-time"></canvas></div>
      </div>
    </div>

    <!-- All projects table -->
    <div class="panel overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 class="font-bold text-slate-800"><i class="fa-solid fa-table mr-2 text-purple-500"></i>Tất cả đề án trong hệ thống</h3>
        <span class="text-xs text-slate-400 font-bold">${total} đề án</span>
      </div>
      <table class="w-full text-sm"><thead><tr class="text-[10px] text-slate-400 font-black uppercase bg-slate-50 border-b">
        <th class="px-4 py-3 text-left">Mã ĐA</th><th class="px-4 py-3 text-left">Tên đề án</th>
        <th class="px-4 py-3 text-left">Đơn vị</th><th class="px-4 py-3 text-right">Kinh phí</th>
        <th class="px-4 py-3 text-center">Trạng thái</th><th class="px-4 py-3 text-center">Hành động</th>
      </tr></thead><tbody>
      ${AppData.projects.map(p => {
        const co = getCompany(p.companyId);
        const act = ROLES.ADMIN.actions[p.status];
        return `<tr class="hover:bg-slate-50 cursor-pointer" onclick="viewProjectDetail('${p.id}')">
          <td class="px-4 py-3 font-bold text-slate-400 text-xs">${p.id}</td>
          <td class="px-4 py-3 font-semibold text-slate-800">${p.name}</td>
          <td class="px-4 py-3 text-slate-500 text-xs">${co.name||'-'}</td>
          <td class="px-4 py-3 text-right font-mono font-bold text-xs">${formatVND(p.budget||0)}</td>
          <td class="px-4 py-3 text-center">${statusBadge(p.status)}</td>
          <td class="px-4 py-3 text-center">${act ? `<button class="action-btn ${act.cls} border-0 text-xs" onclick="event.stopPropagation();roleAction('${p.id}',${act.nextStatus},'${act.label}')">${act.label}</button>` : '<span class="text-xs text-slate-400">—</span>'}</td>
        </tr>`;
      }).join('')}
      </tbody></table>
    </div>`;
}


// ---- KHỞI TẠO ----
window.addEventListener('load', () => {
  populateCompanyDropdown();
  // Hiển thị màn hình đăng nhập trước — loginAs() sẽ khởi động phần còn lại
});

// ---- GIAO DIỆN DÀNH RIÊNG CHO ADMIN ----
function renderReports() {
  const el = document.getElementById('view-reports');
  if (!el) { _addViewSection('reports'); }
  document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active-view'));
  const v = document.getElementById('view-reports');
  if (!v) return;
  v.classList.add('active-view');
  v.innerHTML = `
    <h1 class="text-2xl font-black text-slate-900">Báo cáo Thông tư 34/2022</h1>
    <p class="text-slate-500 text-sm">Xuất báo cáo định kỳ theo mẫu Thông tư 34/2022/TT-BCT</p>
    <div class="grid grid-cols-3 gap-4">
      ${['Báo cáo tháng','Báo cáo quý','Báo cáo năm'].map((r,i) => `
      <div class="panel p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
        <div class="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style="background:#7c3aed20"><i class="fa-solid fa-file-pdf text-2xl" style="color:#7c3aed"></i></div>
        <div class="font-black text-slate-800 mb-1">${r}</div>
        <div class="text-xs text-slate-400 mb-4">Tháng ${['5','Q1','2024'][i]} — ${AppData.projects.length} đề án</div>
        <button class="w-full py-2 rounded-xl font-bold text-sm text-white" style="background:#7c3aed" onclick="showToast('Đang tạo báo cáo PDF...')"><i class="fa-solid fa-download mr-2"></i>Xuất PDF</button>
      </div>`).join('')}
    </div>
    <div class="panel p-5 overflow-hidden">
      <h3 class="font-bold text-slate-800 mb-4"><i class="fa-solid fa-table mr-2 text-purple-500"></i>Bảng tổng hợp hoạt động Khuyến công — Tháng 05/2024</h3>
      <table class="w-full text-sm"><thead><tr class="text-[10px] text-slate-400 font-black uppercase bg-slate-50 border-b border-slate-100">
        <th class="px-4 py-3 text-left">STT</th><th class="px-4 py-3 text-left">Nội dung chỉ tiêu</th><th class="px-4 py-3 text-right">Kế hoạch</th><th class="px-4 py-3 text-right">Thực hiện</th><th class="px-4 py-3 text-right">Tỷ lệ</th>
      </tr></thead><tbody>
      ${[['1','Số đề án khuyến công','60',''+AppData.projects.length,''],['2','Kinh phí kế hoạch (tỷ đ)','100',''+Math.round(AppData.projects.reduce((s,p)=>s+(p.budget||0),0)/1e9),''],['3','Số cơ sở CNNT được hỗ trợ','120',''+AppData.companies.length,''],['4','Số lao động được đào tạo','500','3450',''],['5','Số sản phẩm OCOP bình chọn','30',''+AppData.products?.length||'5','']].map(([stt,noi,kh,th],i) => {const pct=Math.round(parseInt(th)/parseInt(kh)*100)||'—';return `<tr class="border-b border-slate-50 hover:bg-slate-50"><td class="px-4 py-3 text-slate-400 font-bold">${stt}</td><td class="px-4 py-3 font-semibold text-slate-800">${noi}</td><td class="px-4 py-3 text-right font-mono">${kh}</td><td class="px-4 py-3 text-right font-mono font-bold text-emerald-600">${th}</td><td class="px-4 py-3 text-right"><span class="font-black text-xs ${pct>=100?'text-emerald-600':pct>=70?'text-amber-600':'text-rose-600'}">${pct}%</span></td></tr>`}).join('')}
      </tbody></table>
    </div>`;
}

function renderUsers() {
  const el = document.getElementById('view-users');
  if (!el) _addViewSection('users');
  document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active-view'));
  const v = document.getElementById('view-users');
  if (!v) return;
  v.classList.add('active-view');
  const mockUsers = [
    {name:'Nguyễn Thị Hoa',role:'CNNT',unit:'Cty TNHH Gỗ Mỹ Nghệ ABC',status:'active'},
    {name:'Trần Văn Minh',role:'TTKC',unit:'TT Khuyến công Tỉnh',status:'active'},
    {name:'Lê Minh Tuấn',role:'SO',unit:'Sở Công Thương Tỉnh',status:'active'},
    {name:'Phạm Quốc Hùng',role:'BO',unit:'Cục Công nghiệp địa phương',status:'active'},
    {name:'Hoàng Thị Lan',role:'CNNT',unit:'HTX Thêu Ren Hoa Lư',status:'active'},
    {name:'Đỗ Văn Long',role:'CNNT',unit:'Cty CP Thực phẩm Sạch',status:'inactive'},
  ];
  const roleColors = {CNNT:'#16a34a',TTKC:'#0891b2',SO:'#d97706',BO:'#dc2626',ADMIN:'#7c3aed'};
  v.innerHTML = `
    <div class="flex justify-between items-center">
      <div><h1 class="text-2xl font-black text-slate-900">Quản lý Người dùng</h1><p class="text-slate-500 text-sm mt-1">Phân quyền tài khoản truy cập hệ thống</p></div>
      <button class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm" style="background:#7c3aed" onclick="showToast('Chức năng thêm người dùng đang phát triển')"><i class="fa-solid fa-user-plus"></i>Thêm người dùng</button>
    </div>
    <div class="panel overflow-hidden">
      <table class="w-full text-sm"><thead><tr class="text-[10px] text-slate-400 font-black uppercase bg-slate-50 border-b">
        <th class="px-5 py-3 text-left">Tên người dùng</th><th class="px-5 py-3 text-left">Vai trò</th><th class="px-5 py-3 text-left">Đơn vị</th><th class="px-5 py-3 text-center">Trạng thái</th><th class="px-5 py-3 text-center">Thao tác</th>
      </tr></thead><tbody class="divide-y divide-slate-50">
      ${mockUsers.map(u => `<tr class="hover:bg-slate-50">
        <td class="px-5 py-4"><div class="font-bold text-slate-800">${u.name}</div></td>
        <td class="px-5 py-4"><span class="text-xs font-black px-2 py-1 rounded-lg text-white" style="background:${roleColors[u.role]||'#7c3aed'}">${ROLES[u.role]?.short||u.role}</span></td>
        <td class="px-5 py-4 text-slate-500 text-xs">${u.unit}</td>
        <td class="px-5 py-4 text-center"><span class="text-xs font-bold px-2 py-1 rounded-full ${u.status==='active'?'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-500'}">${u.status==='active'?'Hoạt động':'Tạm khóa'}</span></td>
        <td class="px-5 py-4 text-center"><button class="action-btn text-xs" onclick="showToast('Chỉnh sửa: ${u.name}')">Chỉnh sửa</button></td>
      </tr>`).join('')}
      </tbody></table>
    </div>`;
}

function renderSettings() {
  const el = document.getElementById('view-settings');
  if (!el) _addViewSection('settings');
  document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active-view'));
  const v = document.getElementById('view-settings');
  if (!v) return;
  v.classList.add('active-view');
  v.innerHTML = `
    <h1 class="text-2xl font-black text-slate-900">Cấu hình Hệ thống</h1>
    <div class="grid grid-cols-2 gap-5">
      <div class="panel p-6 space-y-4">
        <h3 class="font-black text-slate-800"><i class="fa-solid fa-sliders mr-2 text-purple-500"></i>Tham số Nghiệp vụ</h3>
        ${[['Hạn mức tối đa / đề án (TT28)','150,000,000 VNĐ'],['Hạn nộp hồ sơ QG hàng năm','Trước 20/05'],['Chu kỳ báo cáo tiến độ','Hàng tháng (trước ngày 25)'],['Thời gian lưu trữ hồ sơ','10 năm']].map(([k,v])=>`<div class="flex justify-between items-center py-3 border-b border-slate-100"><span class="text-sm text-slate-600 font-semibold">${k}</span><span class="text-sm font-black text-brand">${v}</span></div>`).join('')}
      </div>
      <div class="panel p-6 space-y-4">
        <h3 class="font-black text-slate-800"><i class="fa-solid fa-database mr-2 text-purple-500"></i>Thông tin Hệ thống</h3>
        ${[['Phiên bản','v3.0 — Prototype'],['Cơ sở dữ liệu','PostgreSQL + JSONB'],['Backend','.NET 10 Web API'],['Tổng đề án',''+AppData.projects.length],['Tổng doanh nghiệp',''+AppData.companies.length],['Lần backup cuối','06/05/2024 13:00']].map(([k,v])=>`<div class="flex justify-between items-center py-3 border-b border-slate-100"><span class="text-sm text-slate-500">${k}</span><span class="text-sm font-bold text-slate-800">${v}</span></div>`).join('')}
      </div>
    </div>`;
}

function _addViewSection(id) {
  const container = document.querySelector('.content-area');
  if (!container) return;
  const d = document.createElement('div');
  d.id = 'view-' + id;
  d.className = 'view-section p-6 space-y-5';
  container.appendChild(d);
}

function renderMap() {
  const el = document.getElementById('view-map');
  if (!el) _addViewSection('map');
  document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active-view'));
  const v = document.getElementById('view-map');
  if (!v) return;
  v.classList.add('active-view');
  v.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <div><h1 class="text-2xl font-black text-slate-900">Bản đồ số Phân bổ (GIS)</h1><p class="text-slate-500 text-sm mt-1">Giám sát địa điểm Đơn vị thụ hưởng và điểm phân phối OCOP</p></div>
    </div>
    <div class="panel p-4 h-[600px] flex items-center justify-center bg-slate-100 relative overflow-hidden">
      <div class="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Vietnam_location_map.svg/1024px-Vietnam_location_map.svg.png')] bg-cover bg-center"></div>
      <div class="z-10 bg-white/90 backdrop-blur p-6 rounded-2xl shadow-xl text-center">
        <i class="fa-solid fa-map-location-dot text-4xl text-rose-500 mb-3"></i>
        <h3 class="font-bold text-slate-800 text-lg">Module GIS đang được tích hợp</h3>
        <p class="text-slate-500 text-sm mt-2 max-w-sm">Hệ thống đang kết nối dữ liệu địa lý thực tế từ vệ tinh để render bản đồ động (Dự kiến trong Phiên bản chính thức).</p>
      </div>
    </div>`;
}

function renderDocuments() {
  const el = document.getElementById('view-documents');
  if (!el) _addViewSection('documents');
  document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active-view'));
  const v = document.getElementById('view-documents');
  if (!v) return;
  v.classList.add('active-view');
  v.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <div><h1 class="text-2xl font-black text-slate-900">Văn bản Pháp luật & Hội nghị</h1><p class="text-slate-500 text-sm mt-1">Quản lý danh mục Nội bộ</p></div>
    </div>
    <div class="grid grid-cols-2 gap-5">
      <div class="panel p-5">
        <h3 class="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-3"><i class="fa-solid fa-gavel mr-2 text-brand"></i>Hệ thống Văn bản Khuyến công</h3>
        <ul class="space-y-3">
          ${['Quyết định 1881/QĐ-TTg phê duyệt chương trình KC 2021-2025','Thông tư 34/2022/TT-BCT hướng dẫn báo cáo Khuyến công','Thông tư 28/2018/TT-BTC quản lý kinh phí đề án','Nghị định 45/2012/NĐ-CP về khuyến công'].map(x => `<li class="flex gap-3 text-sm"><i class="fa-solid fa-file-pdf text-rose-500 mt-1"></i><span class="text-slate-700 font-semibold hover:text-brand cursor-pointer">${x}</span></li>`).join('')}
        </ul>
      </div>
      <div class="panel p-5">
        <h3 class="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-3"><i class="fa-solid fa-handshake mr-2 text-emerald-600"></i>Hội nghị Xúc tiến TMDL</h3>
        <ul class="space-y-3">
          ${['Hội chợ triển lãm sản phẩm CNNT tiêu biểu miền Bắc','Hội nghị giao thương kết nối cung cầu năm 2024','Tập huấn nâng cao năng lực xuất khẩu TMĐT'].map(x => `<li class="flex gap-3 text-sm"><i class="fa-solid fa-bullhorn text-amber-500 mt-1"></i><span class="text-slate-700 font-semibold hover:text-emerald-600 cursor-pointer">${x}</span></li>`).join('')}
        </ul>
      </div>
    </div>`;
}
