// =====================================================
// APP DATA - Mock Data Engine cho Prototype v4.0 (Full Requirements)
// =====================================================
const STATUS = {
  0:  { label: '0. Đăng ký cơ sở',     cls: 'bg-slate-100 text-slate-600 border-slate-300',   step: 0 },
  1:  { label: '1. Thẩm định cơ sở',   cls: 'bg-amber-100 text-amber-700 border-amber-300',   step: 1 },
  2:  { label: '2. Thẩm định cấp Bộ',  cls: 'bg-orange-100 text-orange-700 border-orange-300', step: 2 },
  3:  { label: '3. Phê duyệt KH',      cls: 'bg-red-100 text-red-700 border-red-300',         step: 3 },
  4:  { label: '4. Giao Kế hoạch',     cls: 'bg-cyan-100 text-cyan-700 border-cyan-300',      step: 4 },
  5:  { label: '5. Ký hợp đồng',       cls: 'bg-indigo-100 text-indigo-700 border-indigo-300',step: 5 },
  6:  { label: '6. Đang thực hiện',    cls: 'bg-blue-100 text-blue-700 border-blue-300',      step: 6 },
  7:  { label: '7. Kiểm tra giám sát', cls: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300', step: 7 },
  8:  { label: '8. Báo cáo kết quả',   cls: 'bg-purple-100 text-purple-700 border-purple-300', step: 8 },
  9:  { label: '9. Thanh lý Quyết toán', cls: 'bg-teal-100 text-teal-700 border-teal-300',    step: 9 },
  10: { label: '10. Hoàn tất',         cls: 'bg-emerald-100 text-emerald-700 border-emerald-300', step: 10 },
};

// Role definitions — màu, tên, quyền chuyển trạng thái, menu riêng
const ROLES = {
  CNNT: {
    id:'CNNT', name:'Nguyễn Thị Hoa - Cơ sở CNNT', short:'Cơ sở CNNT',
    color:'#16a34a', icon:'fa-shop', canCreate: true,
    welcome: 'Chào mừng bạn đến với Cổng đăng ký Khuyến công. Hãy tạo và theo dõi đề án của doanh nghiệp bạn.',
    menus: [
      { view:'dashboard',  icon:'fa-chart-pie',    label:'Dashboard của tôi' },
      { view:'projects',   icon:'fa-list-check',   label:'Đề án của tôi',    filterStatus: null },
      { view:'companies',  icon:'fa-shop',          label:'Hồ sơ Doanh nghiệp' },
      { view:'ocop',       icon:'fa-award',         label:'Sản phẩm OCOP' },
    ],
    actions: { 
      0: { label:'Nộp hồ sơ (Đăng ký)', nextStatus:1, cls:'bg-amber-500 text-white' },
      6: { label:'Báo cáo tiến độ', nextStatus:7, cls:'bg-blue-500 text-white' }
    }
  },
  TTKC: {
    id:'TTKC', name:'Trần Văn Minh - TT Khuyến công', short:'TT Khuyến công',
    color:'#0891b2', icon:'fa-building-columns', canCreate: false,
    welcome: 'Bạn đang xem với quyền Trung tâm Khuyến công. Hỗ trợ cơ sở lập hồ sơ và theo dõi tiến độ thực hiện.',
    menus: [
      { view:'dashboard',  icon:'fa-chart-pie',    label:'Tổng quan KC' },
      { view:'projects',   icon:'fa-list-check',   label:'Danh sách đề án',  filterStatus: null },
      { view:'companies',  icon:'fa-shop',          label:'Cơ sở CNNT' },
      { view:'ocop',       icon:'fa-award',         label:'Sản phẩm OCOP' },
    ],
    actions: {}
  },
  SO: {
    id:'SO', name:'Lê Minh Tuấn - Sở Công Thương', short:'Sở Công Thương',
    color:'#d97706', icon:'fa-landmark', canCreate: false,
    welcome: 'Bạn đang thẩm định hồ sơ cấp Tỉnh. Xem xét kỹ trước khi trình Bộ phê duyệt.',
    menus: [
      { view:'dashboard',  icon:'fa-chart-pie',       label:'Tổng quan Tỉnh' },
      { view:'projects',   icon:'fa-file-magnifying-glass', label:'Thẩm định cơ sở', filterStatus: 1, badge: true },
      { view:'projects',   icon:'fa-clipboard-check', label:'Kiểm tra giám sát',  filterStatus: 7, badge: true, menuId:'menu-acceptance' },
      { view:'projects',   icon:'fa-list-check',      label:'Toàn bộ đề án',     filterStatus: null },
      { view:'companies',  icon:'fa-shop',             label:'Doanh nghiệp Tỉnh' },
      { view:'ocop',       icon:'fa-award',            label:'OCOP Tỉnh' },
    ],
    rejectFrom: [1],
    actions: {
      1: { label:'✓ Thẩm định Sở → Trình Bộ', nextStatus:2, cls:'bg-orange-500 text-white' },
      7: { label:'✓ Xác nhận Kiểm tra',  nextStatus:8, cls:'bg-purple-600 text-white' },
      8: { label:'Duyệt Báo cáo Sở', nextStatus:9, cls:'bg-teal-500 text-white' }
    }
  },
  BO: {
    id:'BO', name:'Phạm Quốc Hùng - Cục Công Thương ĐP', short:'Bộ / Cục CTĐP',
    color:'#dc2626', icon:'fa-flag', canCreate: false,
    welcome: 'Bạn đang quản lý cấp Trung ương. Phê duyệt kế hoạch và kiểm soát toàn bộ dòng tiền Khuyến công Quốc gia.',
    menus: [
      { view:'dashboard',  icon:'fa-chart-pie',    label:'Tổng quan Quốc gia' },
      { view:'projects',   icon:'fa-stamp',         label:'Phê duyệt cấp Bộ', filterStatus: 2, badge: true },
      { view:'projects',   icon:'fa-file-invoice-dollar', label:'Thanh lý Quyết toán', filterStatus: 9, badge: true, menuId:'menu-settle' },
      { view:'funds',      icon:'fa-vault',         label:'Giải ngân Kinh phí' },
      { view:'kpi',        icon:'fa-chart-line',    label:'Chỉ tiêu KPI Quốc gia' },
      { view:'companies',  icon:'fa-shop',           label:'Doanh nghiệp' },
      { view:'ocop',       icon:'fa-award',          label:'Sản phẩm OCOP' },
    ],
    actions: {
      2: { label:'✓ Thẩm định Bộ',   nextStatus:3, cls:'bg-red-500 text-white' },
      3: { label:'✓ Phê duyệt Kế hoạch', nextStatus:4, cls:'bg-blue-600 text-white' },
      4: { label:'Thông báo & Giao KH', nextStatus:5, cls:'bg-cyan-600 text-white' },
      5: { label:'Ký hợp đồng / Giao NV', nextStatus:6, cls:'bg-indigo-600 text-white' },
      9: { label:'✓ Quyết toán & Hoàn tất', nextStatus:10, cls:'bg-emerald-600 text-white' },
    }
  },
  ADMIN: {
    id:'ADMIN', name:'Quản trị viên Hệ thống', short:'Admin Hệ thống',
    color:'#7c3aed', icon:'fa-shield-halved', canCreate: true,
    welcome: 'Truy cập đầy đủ toàn bộ hệ thống Khuyến công Quốc gia.',
    menus: [
      { view:'dashboard', icon:'fa-chart-pie',       label:'Tổng quan Hệ thống' },
      { view:'projects',  icon:'fa-list-check',      label:'Toàn bộ Đề án',      filterStatus: null },
      { view:'funds',     icon:'fa-vault',           label:'Kinh phí & Quyết toán' },
      { view:'reports',   icon:'fa-file-contract',   label:'Báo cáo Thông tư 34' },
      { view:'users',     icon:'fa-users',           label:'Quản lý Người dùng' },
      { view:'companies', icon:'fa-shop',            label:'Doanh nghiệp' },
      { view:'ocop',      icon:'fa-award',           label:'Sản phẩm OCOP' },
      { view:'map',       icon:'fa-map-location-dot',label:'Bản đồ GIS' },
      { view:'documents', icon:'fa-book-bookmark',   label:'Văn bản & Hội nghị' },
      { view:'kpi',       icon:'fa-chart-line',      label:'Chỉ tiêu KPI' },
      { view:'settings',  icon:'fa-gear',            label:'Cấu hình Hệ thống' },
    ],
    actions: {
      0:{label:'Nộp Sở',nextStatus:1,cls:'bg-amber-500 text-white'},
      1:{label:'Thẩm định Sở',nextStatus:2,cls:'bg-orange-500 text-white'},
      2:{label:'Thẩm định Bộ',nextStatus:3,cls:'bg-red-500 text-white'},
      3:{label:'Phê duyệt KH',nextStatus:4,cls:'bg-blue-600 text-white'},
      4:{label:'Giao KH',nextStatus:5,cls:'bg-cyan-600 text-white'},
      5:{label:'Ký hợp đồng',nextStatus:6,cls:'bg-indigo-600 text-white'},
      6:{label:'Đang TH',nextStatus:7,cls:'bg-fuchsia-600 text-white'},
      7:{label:'Kiểm tra',nextStatus:8,cls:'bg-purple-600 text-white'},
      8:{label:'Báo cáo',nextStatus:9,cls:'bg-teal-600 text-white'},
      9:{label:'Quyết toán',nextStatus:10,cls:'bg-emerald-600 text-white'},
    },
    rejectFrom:[1,2,3],
  }
};

const FIELDS = [
  'Đào tạo nghề, truyền nghề',
  'Hỗ trợ máy móc, công nghệ mới',
  'Phát triển SP CNNT tiêu biểu (OCOP)',
  'Xúc tiến thương mại, hội chợ',
  'Tư vấn KH&CN, sản xuất sạch hơn',
  'Liên doanh liên kết, cụm CN',
  'Hợp tác quốc tế về khuyến công',
  'Nâng cao năng lực quản lý KC',
];

const AppData = {
  companies: [
    { id: 'DN01', name: 'Cty TNHH Gỗ Mỹ Nghệ ABC',     tax: '0100123456', sector: 'Chế biến gỗ',       workers: 120, province: 'Hà Nội',     icon: 'fa-tree' },
    { id: 'DN02', name: 'HTX Thêu Ren Hoa Lư',           tax: '0300456789', sector: 'Thủ công mỹ nghệ', workers: 85,  province: 'Ninh Bình',  icon: 'fa-scissors' },
    { id: 'DN03', name: 'Cty CP Thực phẩm Sạch Phú Quý', tax: '1400789123', sector: 'Chế biến thực phẩm',workers: 210, province: 'Bình Định',  icon: 'fa-bowl-food' },
    { id: 'DN04', name: 'Cty TNHH Cơ khí Tiến Phát',    tax: '0600321654', sector: 'Cơ khí chế tạo',    workers: 95,  province: 'Bình Dương', icon: 'fa-gears' },
    { id: 'DN05', name: 'HTX Dệt May Thành Công',        tax: '0101654987', sector: 'Dệt may',           workers: 160, province: 'Nam Định',   icon: 'fa-shirt' },
    { id: 'DN06', name: 'Cty CP Vật liệu Xanh Eco',     tax: '0800987321', sector: 'Vật liệu XD',       workers: 75,  province: 'Đồng Nai',   icon: 'fa-leaf' },
    { id: 'DN07', name: 'Làng nghề Gốm Bát Tràng',      tax: '0100147258', sector: 'Gốm sứ',             workers: 230, province: 'Hà Nội',     icon: 'fa-jar' },
    { id: 'DN08', name: 'Cty TNHH Chế biến Cao su VN',  tax: '1500369147', sector: 'Chế biến cao su',    workers: 180, province: 'Bình Phước', icon: 'fa-industry' },
  ],

  projects: [
    { id:'DA-2401', name:'Hỗ trợ máy CNC cho xưởng gỗ',          type:'Quốc gia (Điểm)',    field:0, start:'2024-01-15', end:'2024-09-30', budget:300000000, source:'NS Trung ương', companyId:'DN01', location:'Gia Lâm, Hà Nội',   contractor:'TT KC Hà Nội',    supervisor:'Sở CT Hà Nội',    status:9, disbursedAdvance: 100000000, disbursedSettle: 195000000 },
    { id:'DA-2402', name:'Đào tạo nghề thêu ren xuất khẩu',       type:'Địa phương',         field:1, start:'2024-02-01', end:'2024-07-31', budget:150000000, source:'NS Địa phương', companyId:'DN02', location:'Hoa Lư, Ninh Bình',  contractor:'TT Dạy nghề NB',  supervisor:'Sở CT Ninh Bình', status:8, disbursedAdvance: 75000000, disbursedSettle: 0 },
    { id:'DA-2403', name:'Phát triển sản phẩm OCOP cá ngừ',       type:'Địa phương',         field:2, start:'2024-03-10', end:'2024-12-31', budget:200000000, source:'NS Địa phương', companyId:'DN03', location:'Quy Nhơn, Bình Định', contractor:'TT KC Bình Định', supervisor:'Sở CT Bình Định', status:6, disbursedAdvance: 120000000, disbursedSettle: 0 },
    { id:'DA-2404', name:'Ứng dụng robot hàn tự động',             type:'Quốc gia (Nhóm)',    field:0, start:'2024-04-01', end:'2025-03-31', budget:500000000, source:'NS Trung ương', companyId:'DN04', location:'Thuận An, Bình Dương', contractor:'Cty Robot VN',    supervisor:'Sở CT Bình Dương',status:4, disbursedAdvance: 0, disbursedSettle: 0 },
    { id:'DA-2405', name:'Nâng cao năng lực dệt may xuất khẩu',   type:'Địa phương',         field:1, start:'2024-05-15', end:'2024-11-30', budget:180000000, source:'NS Địa phương', companyId:'DN05', location:'TP Nam Định',         contractor:'TT KC Nam Định',  supervisor:'Sở CT Nam Định',  status:3, disbursedAdvance: 0, disbursedSettle: 0 },
    { id:'DA-2406', name:'Sản xuất vật liệu xây dựng xanh',       type:'Địa phương',         field:2, start:'2024-06-01', end:'2025-01-31', budget:250000000, source:'NS Địa phương', companyId:'DN06', location:'Biên Hòa, Đồng Nai', contractor:'Viện VLXD',       supervisor:'Sở CT Đồng Nai',  status:2, disbursedAdvance: 0, disbursedSettle: 0 },
    { id:'DA-2407', name:'Bảo tồn và phát triển làng nghề gốm',   type:'Quốc gia (Cụ thể)',  field:4, start:'2024-07-01', end:'2025-06-30', budget:400000000, source:'NS Trung ương', companyId:'DN07', location:'Bát Tràng, Hà Nội',  contractor:'TT KC Hà Nội',    supervisor:'Sở CT Hà Nội',    status:1, disbursedAdvance: 0, disbursedSettle: 0 },
    { id:'DA-2408', name:'Chế biến sâu cao su tự nhiên',           type:'Địa phương',         field:0, start:'2024-08-15', end:'2025-04-30', budget:350000000, source:'NS Địa phương', companyId:'DN08', location:'Đồng Phú, Bình Phước',contractor:'Viện CN Cao su',  supervisor:'Sở CT Bình Phước',status:0, disbursedAdvance: 0, disbursedSettle: 0 },
    { id:'DA-2409', name:'Xúc tiến thương mại hàng TCMN',          type:'Quốc gia (Điểm)',    field:3, start:'2024-09-01', end:'2024-12-31', budget:120000000, source:'NS Trung ương', companyId:'DN02', location:'TP.HCM (Hội chợ)',    contractor:'Cty XTND',        supervisor:'Cục CTĐP',        status:1, disbursedAdvance: 0, disbursedSettle: 0 },
    { id:'DA-2410', name:'Tư vấn cải tiến quy trình sản xuất gỗ', type:'Địa phương',         field:4, start:'2024-10-01', end:'2025-03-31', budget:80000000,  source:'NS Địa phương', companyId:'DN01', location:'Đông Anh, Hà Nội',  contractor:'Viện QLCN',       supervisor:'Sở CT Hà Nội',    status:0, disbursedAdvance: 0, disbursedSettle: 0 },
    { id:'DA-2411', name:'Đào tạo kỹ năng số cho HTX',             type:'Địa phương',         field:1, start:'2024-11-01', end:'2025-05-31', budget:90000000,  source:'NS Địa phương', companyId:'DN05', location:'TP Nam Định',         contractor:'FPT Edu',          supervisor:'Sở CT Nam Định',  status:0, disbursedAdvance: 0, disbursedSettle: 0 },
    { id:'DA-2412', name:'Hội chợ Công nghiệp Nông thôn 2024',    type:'Quốc gia (Nhóm)',    field:3, start:'2024-12-01', end:'2024-12-31', budget:150000000, source:'NS Trung ương', companyId:'DN07', location:'Hà Nội (VEIA)',       contractor:'Cty Hội chợ VN',  supervisor:'Cục CTĐP',        status:0, disbursedAdvance: 0, disbursedSettle: 0 },
  ],

  ocop: [
    { id:'OCOP01', name:'Chè Thái Nguyên Tân Cương',  company:'HTX Tân Cương',   stars:4, category:'Đồ uống', certified:'2023-06-01' },
    { id:'OCOP02', name:'Mật ong rừng Điện Biên',     company:'Cty Ong Vàng',    stars:5, category:'Thực phẩm', certified:'2022-10-15' },
    { id:'OCOP03', name:'Nước mắm Phú Quốc Hữu Cơ',  company:'Cty Mắm PQ',      stars:5, category:'Thực phẩm', certified:'2021-05-20' },
    { id:'OCOP04', name:'Tranh thêu Hà Đông',         company:'HTX Thêu XK',     stars:3, category:'Thủ công',  certified:'2024-01-10' },
    { id:'OCOP05', name:'Gốm Bát Tràng cao cấp',      company:'Làng nghề BT',    stars:4, category:'Thủ công',  certified:'2023-09-30' },
  ],

  // Full 12 KPIs from Document V2
  kpi: {
    labels: ['2020','2021','2022','2023','2024'],
    // 1. Số lượng cơ sở CNNT được hỗ trợ
    projects:    [38, 51, 74, 98, 120],
    // 2. Giá trị sản xuất CN-TTCN (Tỷ VNĐ)
    productionValue: [150, 180, 220, 290, 350],
    // 3. Tăng trưởng năng suất lao động (%)
    productivityGrowth: [5.2, 6.1, 7.5, 8.0, 9.2],
    // 4. Số lượng máy móc công nghệ mới
    newMachines: [12, 15, 25, 40, 55],
    // 5. Số lượng quy trình sạch
    cleanProcesses: [5, 8, 12, 18, 24],
    // 6. Số lượng SP mới
    newProducts: [20, 35, 45, 60, 85],
    // 7. Số lao động được đào tạo
    jobsTrained: [1200, 1580, 2100, 2800, 3450],
    // 8. Tăng thu nhập bình quân (%)
    incomeGrowth: [4.5, 5.0, 6.2, 7.1, 8.5],
    // 9. Số sản phẩm OCOP
    ocopProducts: [10, 15, 25, 45, 65],
    // 10. Số cơ sở tham gia XTTM
    tradePromo: [15, 20, 35, 50, 75],
    // 11. Số nhãn hiệu bảo hộ
    trademarks: [5, 8, 15, 22, 30],
    // 12. Tăng trưởng thuế (Tỷ VNĐ)
    taxGrowth: [10, 15, 22, 35, 50]
  }
};

// Utility functions
function formatVND(n) {
  if(n >= 1e9) return (n/1e9).toFixed(1) + ' Tỷ';
  if(n >= 1e6) return (n/1e6).toFixed(0) + ' Triệu';
  return n.toLocaleString('vi-VN');
}
function statusBadge(s) {
  const st = STATUS[s] || {label: 'Không xác định', cls: 'bg-gray-100 text-gray-600'};
  return `<span class="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold border ${st.cls}">${st.label}</span>`;
}
function fieldName(idx) { return FIELDS[idx] || 'Khác'; }
function getCompany(id) { return AppData.companies.find(c => c.id === id) || {}; }
function getProjectsByCompany(cid) { return AppData.projects.filter(p => p.companyId === cid); }
