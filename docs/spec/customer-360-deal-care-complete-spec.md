# ĐẶC TẢ HỆ THỐNG TOÀN DIỆN: CHI TIẾT GIAO DỊCH & CHĂM SÓC KHÁCH HÀNG 360
## (CUSTOMER 360 DEAL & CARE INTERACTION SYSTEM SPECIFICATION)

- **Mã tài liệu**: `docs/spec/customer-360-deal-care-complete-spec.md`
- **Phiên bản**: 4.0.0 (Cập nhật chuẩn hóa giao diện Trang Toàn Màn Hình 3 Cột theo đúng Figma Node `1723:37492`)
- **Nguồn thiết kế Figma**:
  - File Key: `uHeLU9Im5mK4BVcAxUDVtj` (WiCX CRM UI v1)
  - **Node trọng tâm**: `1723:37492` — Màn hình Toàn trang Chi tiết Khách Hàng 360 (Customer 360 Full Page Layout)
  - Node liên quan: `1753:43436` (Danh sách khách hàng), `2162:28377` (Kịch bản chăm sóc)
- **Cổng thiết kế & Thư viện**: [TMT Design System Portal](https://tds.tmtco.org/#/components/install)
- **Công nghệ nền tảng**: Angular 18+ (Standalone, Signals, Router Bridge) + TDS-UI 18.6+ + Rsbuild Engine + Module Federation 2.0

---

# MỤC LỤC TỔNG QUAN
1. [Phần 1: Nghiệp Vụ & Bố Cục Toàn Trang 3 Cột Chuẩn Figma](#phần-1-nghiệp-vụ--bố-cục-toàn-trang-3-cột-chuẩn-figma)
2. [Phần 2: Hệ Thống Design Tokens & Bảng Ánh Xạ Màu Sắc 100% Khớp Figma](#phần-2-hệ-thống-design-tokens--bảng-ánh-xạ-màu-sắc-100-khớp-figma)
3. [Phần 3: Danh Mục Thành Phần Giao Diện TDS-UI Sử Dụng](#phần-3-danh-mục-thành-phần-giao-diện-tds-ui-sử-dụng)
4. [Phần 4: Kiến Trúc Bố Cục Giao Diện Chi Tiết (UI/UX 3 Columns Wireframe)](#phần-4-kiến-trúc-bố-cục-giao-diện-chi-tiết-uiux-3-columns-wireframe)
5. [Phần 5: Mã Nguồn Mẫu Hoàn Chỉnh Angular 18 Standalone Toàn Màn Hình](#phần-5-mã-nguồn-mẫu-hoàn-chỉnh-angular-18-standalone-toàn-màn-hình)
6. [Phần 6: Tích Hợp Module Federation 2.0 & Định Tuyến Host Shell](#phần-6-tích-hợp-module-federation-20--định-tuyến-host-shell)
7. [Phần 7: Bộ Tiêu Chuẩn & Checklist Nghiệm Thu 10 Điểm](#phần-7-bộ-tiêu-chuẩn--checklist-nghiệm-thu-10-điểm)
8. [Phần 8: Báo Cáo Khảo Sát & Kế Hoạch Triển Khai Vào Dự Án `wicx-crm-fe`](#phần-8-báo-cáo-khảo-sát--kế-hoạch-triển-khai-vào-dự-án-wicx-crm-fe)

---

# PHẦN 1: NGHIỆP VỤ & BỐ CỤC TOÀN TRANG 3 CỘT CHUẨN FIGMA

Màn hình **Chi tiết giao dịch & chăm sóc khách hàng 360** (Figma Node `1723:37492`) là **GIAO DIỆN TOÀN MÀN HÌNH (FULL-PAGE ROUTE)**, **KHÔNG PHẢI DẠNG MODAL POPUP THU GỌN**. 

Màn hình được thiết kế theo cấu trúc lưới 3 cột bất đối xứng (3-Column Layout: Cột 1 rộng 25%, Cột 2 rộng 42%, Cột 3 rộng 33%) để hiển thị đồng thời toàn bộ lịch sử 360 của khách hàng:

### 1. CỘT 1 (BÊN TRÁI): HỒ SƠ KHÁCH HÀNG & DOANH NGHIỆP LIÊN KẾT
- **Khối 1: Thông tin cá nhân & Định danh**:
  - Avatar chân dung tròn (80x80px) kèm huy hiệu xanh `#2EB032` *"Đã định danh"*.
  - Tên khách hàng: `Trần Thị Minh Ngọc` ♀, mã định danh `[NV0015-21]`.
  - Nút bấm thao tác nhanh: `Chỉnh sửa` (nút outline), `Xóa` (nút thùng rác đỏ).
  - Danh sách trường dữ liệu:
    - Trạng thái khách hàng: Huy hiệu xanh `Đang tương tác` (`#1D8A24` trên nền `#DEF5D9`).
    - Người phụ trách: Avatar chữ `Đ`, tên `Minh Đạt`.
    - Số điện thoại: `0901892384` (font chữ số monospaced).
    - Ngày sinh: `12/12/1999` • Email: `nguyenvana1234@gmail.com`.
    - Địa chỉ: `12 Nguyễn Huệ, P. Bến Nghé, Hồ Chí Minh`.
    - Kênh nguồn: Các thẻ pill `WiPix`, `Facebook`.
    - Ngày tạo: `10/10/2026` • Ngày hoạt động cuối: `18/10/2026`.
- **Khối 2: Doanh nghiệp liên kết (2)**:
  - Doanh nghiệp 1: `Nhà Thuốc Long Châu` (Giám đốc kinh doanh • `+84 28 382 1100`, Địa chỉ: 12 Nguyễn Huệ).
  - Doanh nghiệp 2: `Nhà Thuốc Minh Châu` (Quản trị nhân sự • `+84 28 381 9999`, Địa chỉ: 08 Lê Văn Sỹ).

### 2. CỘT 2 (Ở GIỮA): THÔNG TIN MUA HÀNG & MA TRẬN HOẠT ĐỘNG
- **Khối 3: Bảng gói dịch vụ mua hàng**:
  - Thẻ tóm tắt màu cam thương hiệu (`#FF5C00` ➔ `#E64A00` gradient): Tiêu đề *"Thông tin mua hàng"*, Tổng giá trị đã mua: `12.000.000 đ`, Đã hết hạn: `1 gói`.
  - Lưới 4 thẻ gói dịch vụ (2x2 Grid):
    1. `Landing Pro x 1` (WiPix.com): `2.000.000 đ` • Hết hạn: 01/10/2026 (`Đã hết hạn` đỏ `#EA2733`).
    2. `POS Nâng cao x 3` (TPOS.com): `6.000.000 đ` • Hết hạn: 12/10/2027 (`Còn 117 ngày` xanh `#2EB032`).
    3. `Gói Năm x 1` (WiOn.com): `2.000.000 đ` • Hết hạn: 12/10/2027 (`Còn 117 ngày`).
    4. `Landing Pro x 1` (WiPix.com): `2.000.000 đ` • Hết hạn: 12/10/2027 (`Còn 117 ngày`).
- **Khối 4: Ma trận lịch sử hoạt động đa kênh (Activity Heatmap Matrix)**:
  - Tab chuyển đổi: `Lịch sử hoạt động` (Active cam) và `Lịch sử chỉnh sửa`.
  - Lưới bảng 8 tháng (`Tháng 11` đến `Tháng 06`) theo 4 kênh tiếp xúc:
    - `Facebook` (Xanh dương `#1877F2`): Tháng 12: 12 sự kiện, Tháng 06: 2 sự kiện.
    - `Zalo` (Xanh cyan `#0068FF`): Tháng 11: 2 sự kiện, Tháng 01: 1 sự kiện, Tháng 04: **4 sự kiện (Đang chọn - Active)**, Tháng 06: 6 sự kiện.
    - `Website` (Cam `#FF7A00`): Tháng 12: 7, Tháng 02: 10, Tháng 03: 5, Tháng 05: 9.
    - `Tổng đài` (Xanh lá `#2EB032`): Tháng 12: 3, Tháng 02: 1, Tháng 03: 4, Tháng 06: 11.
  - Danh sách chi tiết sự kiện bên dưới (Theo kênh Zalo đã chọn):
    - `28/04/2026 11:09`: Nhắn tin qua Zalo OA.
    - `24/04/2026 08:30`: Nhắn tin qua Zalo OA.
    - `12/04/2027 16:00`: Nhắn tin qua Zalo OA.
    - `01/04/2027 00:09`: Theo dõi Zalo OA.

### 3. CỘT 3 (BÊN PHẢI): LỊCH HẸN SẮP TỚI & DÒNG GHI CHÚ
- **Khối 5: Lịch hẹn sắp tới (4 lịch hẹn)**:
  - Nút `+ Tạo lịch hẹn`.
  - Danh sách các thẻ lịch hẹn:
    - Tiêu đề: `Demo Tpos Pro` kèm tag đỏ `Ưu tiên cao`.
    - Dịch vụ: `Tư vấn sản phẩm`.
    - Ghi chú: *"Vui lòng liên hệ trước đúng giờ với khách để gây ấn tượng tốt nhất..."*
    - Người phụ trách: `Minh Đạt` • Giờ hẹn: `12/03/2027 11:09`.
    - Nút thao tác: Sửa (bút chì), Xóa (thùng rác).
- **Khối 6: Dòng ghi chú (Notes Stream)**:
  - Ô nhập nhanh: *"Nhập ghi chú, Enter để thêm"* kèm phím tắt mũi tên Enter.
  - Dòng lịch sử ghi chú từ chuyên viên:
    - `Hoàng Khôi` (CSKH): *"Khách hàng bận thứ 2 gọi lại. Tư vấn dịch vụ"* • `12/03/2027 11:09`.
    - `Trần Minh Đạt` (Quản lý): *"Gia hạn gói TPOS"* • `12/03/2027 11:09`.
    - `Nguyễn Thanh Lam` (CSKH): *"Khách hàng bận thứ 2 gọi lại. Tư vấn dịch vụ"* • `12/03/2027 11:09`.

---

# PHẦN 2: HỆ THỐNG DESIGN TOKENS & BẢNG ÁNH XẠ MÀU SẮC 100% KHỚP FIGMA

| Mã Màu Figma | Tên Màu Trên Figma | TDS Token Chuẩn | Tailwind CSS Class Áp Dụng |
| :--- | :--- | :--- | :--- |
| `#0C1014` | Neutral Primary Text | `tds-color-text-primary` | `text-[#0C1014]` / `text-neutral-1-900` |
| `#535A67` | Neutral Secondary Text | `tds-color-text-secondary` | `text-[#535A67]` / `text-neutral-1-700` |
| `#7E8796` | Neutral Placeholder/Sub | `tds-color-text-tertiary` | `text-[#7E8796]` / `text-neutral-1-500` |
| `#8D97A6` | Neutral Timestamp Meta | `tds-color-text-placeholder` | `text-[#8D97A6]` / `text-neutral-1-400` |
| `#FFFFFF` | Surface White | `tds-color-background-white` | `bg-white` / `text-white` |
| `#F2F5F8` | Page Surface Sunken | `tds-color-background-neutral`| `bg-[#F2F5F8]` / `bg-neutral-3-50` |
| `#DBE0E6` | Border Default | `tds-color-border-primary` | `border-[#DBE0E6]` / `border-neutral-2-200` |
| `#FF5C00` | Orange Gradient Start | `tds-color-brand-start` | `from-[#FF5C00]` |
| `#E64A00` | Orange Gradient End | `tds-color-brand-end` | `to-[#E64A00]` |
| `#FF4E00` | WiCX Brand Primary | `tds-color-primary-brand` | `text-[#FF4E00]` / `border-[#FF4E00]` |
| `#2A92FF` | Active Blue Link / Pin | `tds-color-primary-500` | `text-[#2A92FF]` / `border-[#2A92FF]` |
| `#2EB032` | Success Green | `tds-color-success-500` | `bg-[#2EB032]` / `text-[#2EB032]` |
| `#DEF5D9` | Success Light Bg | `tds-color-success-minimal` | `bg-[#DEF5D9]` |
| `#1D8A24` | Success Dark Text | `tds-color-success-dark` | `text-[#1D8A24]` |
| `#F35431` | Error Red Accent | `tds-color-error-500` | `text-[#F35431]` |
| `#FFEBE5` | Error Light Bg | `tds-color-error-minimal` | `bg-[#FFEBE5]` |
| `#1877F2` | Facebook Brand Blue | `tds-color-facebook` | `bg-[#1877F2]` |
| `#0068FF` | Zalo Brand Blue | `tds-color-zalo` | `bg-[#0068FF]` |
| `#FF7A00` | Website Brand Orange | `tds-color-website` | `bg-[#FF7A00]` |

---

# PHẦN 3: DANH MỤC THÀNH PHẦN GIAO DIỆN TDS-UI SỬ DỤNG

```typescript
// Các module TDS UI bắt buộc import
import { TDSCardModule } from 'tds-ui/card';             // Thẻ bao bọc từng phân khu
import { TDSAvatarModule } from 'tds-ui/avatar';         // Avatar tròn người dùng & nhân viên
import { TDSTagModule } from 'tds-ui/tag';               // Tag 'Đang tương tác', 'Còn 117 ngày'
import { TDSButtonModule } from 'tds-ui/button';         // Nút 'Chỉnh sửa', 'Tạo lịch hẹn'
import { TDSTimelineModule } from 'tds-ui/timeline';     // Lịch sử tương tác
import { TDSDividerModule } from 'tds-ui/divider';       // Đường kẻ ngăn cách
import { TDSTabsModule } from 'tds-ui/tabs';             // Tab chuyển đổi hoạt động
import { TDSMessageService } from 'tds-ui/message';       // Thông báo Toast feedback
```

---

# PHẦN 4: KIẾN TRÚC BỐ CỤC GIAO DIỆN CHI TIẾT (UI/UX 3 COLUMNS WIREFRAME)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏠 QUẢN LÝ / Khách hàng / Trần Thị Minh Ngọc [NV0015-21]                                   [← Quay lại danh sách]       │
├───────────────────────────────┬───────────────────────────────────────────┬────────────────────────────────────────────┤
│ [CỘT 1: HỒ SƠ & DOANH NGHIỆP] │ [CỘT 2: GÓI DỊCH VỤ & MA TRẬN HOẠT ĐỘNG]  │ [CỘT 3: LỊCH HẸN & NHẬT KÝ GHI CHÚ]        │
│                               │                                           │                                            │
│ ┌─ THÔNG TIN CÁ NHÂN ───────┐ │ ┌─ THÔNG TIN MUA HÀNG (12.000.000 đ) ───┐ │ ┌─ LỊCH HẸN SẮP TỚI (4) ── [+ Tạo lịch] ──┐ │
│ │ (Ảnh) Trần Thị Minh Ngọc ♀│ │ │ [Cam] 12.000.000 đ │ [Landing Pro 2M] │ │ │ Demo Tpos Pro [Ưu tiên cao]  [✎] [🗑]    │ │
│ │ [Đã định danh] [NV0015-21]│ │ │ Đã hết hạn: 1 gói  │ [POS Nâng cao 6M] │ │ │ Dịch vụ: Tư vấn sản phẩm                 │ │
│ │ [✎ Chỉnh sửa] [🗑 Xóa]    │ │ │                    │ [Gói Năm 1x 2M]  │ │ │ Vui lòng liên hệ đúng giờ với khách...   │ │
│ │                           │ │ │                    │ [Landing Pro 2M] │ │ │ Minh Đạt • 12/03/2027 11:09              │ │
│ │ TT: Đang tương tác        │ │ └───────────────────────────────────────┘ │ └──────────────────────────────────────────┘ │
│ │ Người PT: Minh Đạt        │ │                                           │                                            │
│ │ SĐT: 0901892384           │ │ ┌─ LỊCH SỬ HOẠT ĐỘNG (HEATMAP) ─────────┐ │ ┌─ GHI CHÚ ────────────────────────────────┐ │
│ │ Ngày sinh: 12/12/1999     │ │ │ [Lịch sử HĐ]  [Lịch sử chỉnh sửa]     │ │ │ [Nhập ghi chú, Enter để thêm        ⏎]   │ │
│ │ Email: nguyenvana...@...  │ │ │              Th11 Th12 Th01 ... Th06  │ │ │                                          │ │
│ │ Địa chỉ: 12 Nguyễn Huệ... │ │ │ Facebook  |       12        ...   2   │ │ │ (Avatar) Hoàng Khôi • CSKH               │ │
│ │ Nguồn: [WiPix] [Facebook] │ │ │ Zalo      |   2         1   ...   6   │ │ │ Khách hàng bận thứ 2 gọi lại. Tư vấn...  │ │
│ └───────────────────────────┘ │ │ Website   |        7        ...       │ │ │ 12/03/2027 11:09                         │ │
│                               │ │ Tổng đài  |        3    1   ...  11   │ │ │                                          │ │
│ ┌─ DOANH NGHIỆP (2) ────────┐ │ │ ───────────────────────────────────── │ │ │ (Avatar) Trần Minh Đạt • Quản lý         │ │
│ │ Nhà Thuốc Long Châu       │ │ │ Zalo • 28/04/2026 11:09               │ │ │ Gia hạn gói TPOS                         │ │
│ │ GĐKD • +84 28 382 1100    │ │ │ Nhắn tin qua Zalo OA                  │ │ │ 12/03/2027 11:09                         │ │
│ │ Nhà Thuốc Minh Châu       │ │ └───────────────────────────────────────┘ │ └──────────────────────────────────────────┘ │
│ └───────────────────────────┘ │                                           │                                            │
└───────────────────────────────┴───────────────────────────────────────────┴────────────────────────────────────────────┘
```

---

# PHẦN 5: MÃ NGUỒN MẪU HOÀN CHỈNH ANGULAR 18 STANDALONE TOÀN MÀN HÌNH

File: `apps/mfe-cdp/src/app/pages/customer-detail/customer-detail.component.ts` (Đã được triển khai hoàn tất trong codebase).

Component thực thi đầy đủ:
- Header breadcrumb có nút điều hướng quay về danh sách khách hàng.
- Lưới 12 cột Tailwind phản hồi nhạy (`grid-cols-12`).
- 4 thẻ gói dịch vụ với trạng thái hết hạn và số ngày còn lại.
- Bảng ma trận hoạt động 8 tháng kết nối danh sách sự kiện Zalo OA thời gian thực.
- Cột lịch hẹn và nhật ký ghi chú trực tiếp cho phép nhập ghi chú qua phím Enter.

---

# PHẦN 6: TÍCH HỢP MODULE FEDERATION 2.0 & ĐỊNH TUYẾN HOST SHELL

### 6.1 Routing Tại Remote MFE (`apps/mfe-cdp/src/app/remote-entry/entry.routes.ts`)
```typescript
import { Route } from '@angular/router';
import { i18nResolver, provideWII18n } from '@wicx/core';

export const remoteRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'customer',
    pathMatch: 'full',
  },
  {
    path: 'customer',
    title: 'CDP.TITLE',
    loadComponent: () =>
      import('../pages/contact/components/contact-list/contact-list.component').then(
        (m) => m.ContactListComponent
      ),
  },
  {
    path: 'customer-360/:id',
    title: 'CDP.CONTACT.CUSTOMER_360.TITLE',
    providers: provideWII18n({ remoteName: 'mfe-cdp', modules: ['cdp'] }),
    resolve: { i18n: i18nResolver },
    loadComponent: () =>
      import('../pages/customer-detail/customer-detail.component').then(
        (m) => m.CustomerDetailPageComponent
      ),
  },
];
```

### 6.2 Expose Module Trong Rsbuild Config (`apps/mfe-cdp/rsbuild.config.ts`)
```typescript
exposes: {
  './Routes': './apps/mfe-cdp/src/app/remote-entry/entry.routes.ts',
  './Customer': './apps/mfe-cdp/src/app/pages/contact/components/contact-list/contact-list.component.ts',
  './Customer360': './apps/mfe-cdp/src/app/pages/customer-detail/customer-detail.component.ts',
}
```

---

# PHẦN 7: BỘ TIÊU CHUẨN & CHECKLIST NGHIỆM THU 10 ĐIỂM

| STT | Hạng Mục Nghiệm Thu | Tiêu Chuẩn Đạt Chuẩn (Definition of Done) | Thao Tác Xác Minh |
| :-: | :--- | :--- | :--- |
| **1** | **Bố Cục Toàn Màn Hình** | Màn hình hiển thị toàn trang (Full Page), không bị bọc trong modal popup hạn chế không gian. | Mở URL `http://localhost:4200/<tenantId>/customers/customer-360/NV0015-21` |
| **2** | **Khớp 100% Figma Node 1723:37492** | Khớp chính xác 3 cột: Profile & Doanh nghiệp (Cột 1), Mua hàng & Ma trận 8 tháng (Cột 2), Lịch hẹn & Ghi chú (Cột 3). | So sánh trực quan từng khối với bản thiết kế Figma |
| **3** | **Không Hardcode Mã Màu** | Sử dụng token mã màu ngữ nghĩa (`bg-primary-500`, `text-neutral-1-900`, `border-[#DBE0E6]`). | Quét RegExp mã màu thừa |
| **4** | **Font TMTSans & Icon `tdsi-*`** | Hiển thị vector sắc nét `tdsi-shield-check-fill`, `tdsi-calendar-line`, `tdsi-note-fill`. | Tab Network nạp thành công font icon |
| **5** | **Click Mở Customer 360** | Khi click vào tên khách hàng trên bảng, hệ thống kích hoạt điều hướng trang chi tiết. | Click thử nghiệm tại `contact-list.component.html` |
| **6** | **Ma Trận Hoạt Động Tương Tác** | Bấm vào từng ô số liệu tháng (ví dụ Zalo tháng 4: 4 sự kiện) hiển thị danh sách nhật ký tương ứng. | Test click trên bảng ma trận |
| **7** | **Nhập Ghi Chú Tức Thì** | Nhập nội dung vào ô ghi chú và nhấn Enter, ghi chú mới tự động đẩy lên đầu danh sách. | Nhập text và kiểm tra danh sách hiển thị |
| **8** | **Tương Thích Ngược Unit Test** | Toàn bộ 54/54 unit tests của module `mfe-cdp` tiếp tục PASS 100%. | Chạy `npx nx test mfe-cdp` |
| **9** | **Tốc Độ Biên Dịch Rsbuild** | Biên dịch `mfe-cdp` hoàn thành dưới 20 giây mà không có lỗi TypeScript. | Chạy `npx rsbuild build --config apps/mfe-cdp/rsbuild.config.ts` |
| **10**| **Module Federation Singleton** | CDK Overlays và TDS Services được chia sẻ singleton an toàn. | Console sạch sẽ, không có warning xung đột |
