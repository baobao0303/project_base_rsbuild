# ĐẶC TẢ HỆ THỐNG TOÀN DIỆN: CHI TIẾT GIAO DỊCH & CHĂM SÓC KHÁCH HÀNG 360
## (CUSTOMER 360 DEAL & CARE INTERACTION SYSTEM SPECIFICATION)

- **Mã tài liệu**: `docs/spec/customer-360-deal-care-complete-spec.md`
- **Phiên bản**: 3.0.0 (Bản Hợp Nhất Toàn Diện & Chuẩn Hóa Sản Xuất)
- **Nguồn thiết kế Figma**:
  - File Key: `uHeLU9Im5mK4BVcAxUDVtj` (WiCX CRM UI v1)
  - Node 1: `1723:37496` — Chi tiết Giao dịch Khách hàng 360 (Deal & Interaction Detail)
  - Node 2: `1753:43436` — Danh sách Khách hàng & Bộ lọc Nâng cao (Customer Grid & Filter)
  - Node 3: `2162:28377` — Kịch bản Chăm sóc Tự động (Care Automation Matrix)
- **Cổng thiết kế & Tài nguyên**: [TMT Design System Portal](https://tds.tmtco.org/#/components/install)
- **Công nghệ nền tảng**: Angular 18+ (Standalone, Signals, Router Bridge) + TDS-UI 18.6+ + Rsbuild Engine + Module Federation 2.0

---

# MỤC LỤC TỔNG QUAN
1. [Phần 1: Nghiệp Vụ & Mô Hình Dữ Liệu Customer 360](#phần-1-nghiệp-vụ--mô-hình-dữ-liệu-customer-360)
2. [Phần 2: Hệ Thống Design Tokens & Bảng Ánh Xạ Màu Sắc](#phần-2-hệ-thống-design-tokens--bảng-ánh-xạ-màu-sắc)
3. [Phần 3: Danh Mục Thành Phần Giao Diện TDS-UI Sử Dụng](#phần-3-danh-mục-thành-phần-giao-diện-tds-ui-sử-dụng)
4. [Phần 4: Kiến Trúc Bố Cục Giao Diện Chi Tiết (UI/UX Layout)](#phần-4-kiến-trúc-bố-cục-giao-diện-chi-tiết-uiux-layout)
5. [Phần 5: Mã Nguồn Mẫu Hoàn Chỉnh Angular 18 Standalone](#phần-5-mã-nguồn-mẫu-hoàn-chỉnh-angular-18-standalone)
6. [Phần 6: Tích Hợp Module Federation 2.0 & Rsbuild](#phần-6-tích-hợp-module-federation-20--rsbuild)
7. [Phần 7: Bộ Tiêu Chuẩn & Checklist Nghiệm Thu 10 Điểm](#phần-7-bộ-tiêu-chuẩn--checklist-nghiệm-thu-10-điểm)

---

# PHẦN 1: NGHIỆP VỤ & MÔ HÌNH DỮ LIỆU CUSTOMER 360

Màn hình **Chi tiết giao dịch & chăm sóc khách hàng 360** đóng vai trò là "Trung tâm chỉ huy" (Command Center) của chuyên viên tư vấn bán hàng và quản lý tài khoản doanh nghiệp. Màn hình liên kết toàn bộ dòng đời khách hàng từ khi tiếp cận, hợp đồng dịch vụ, yêu cầu hỗ trợ đến lịch sử tương tác đa kênh.

### 1.1 Khối Thông Tin Nghiệp Vụ Cốt Lõi (Business Blocks)
1. **Header Hồ Sơ Khách Hàng (Customer Identity Header)**:
   - Họ tên khách hàng: `Trần Minh Đạt` (Avatar chữ cái viết tắt `Đ`).
   - Vai trò & Doanh nghiệp: `Quản lý cửa hàng` • Domain `WiPix.com`.
   - Trạng thái hợp đồng: `Còn 117 ngày` (Tag xanh lá cây `#2EB032`).
   - Cụm nút hành động nhanh: Nút Gọi điện (`TDSButtonOutline`), Nút Nhắn tin qua Zalo OA (`TDSButtonFlat` màu thương hiệu Zalo/Primary).
2. **Khối Gói Dịch Vụ & Hợp Đồng (Active Subscriptions Card)**:
   - Tên gói: `Landing Pro x 1`.
   - Thời hạn kết thúc: `12/10/2027`.
   - Giá trị hợp đồng: `2.000.000 đ`.
3. **Khối Yêu Cầu Hỗ Trợ Đang Xử Lý (Service Ticket & Priority)**:
   - Dịch vụ tư vấn: `Demo Tpos Pro`.
   - Mức độ ưu tiên: `Ưu tiên cao` (Tag đỏ `#F35431`).
   - Ghi chú dặn dò: *"Vui lòng liên hệ trước đúng giờ với khách để gây ấn tượng tốt nhất. Nếu có thay đổi, vui lòng liên hệ nhân viên support trước 2 tiếng."*
4. **Khối Nhân Viên Phụ Trách (Account Representatives)**:
   - Chuyên viên CSKH: `Hoàng Khôi` (Avatar `K`).
   - Quản lý phụ trách: `Trần Minh Đạt`.
5. **Nhật Ký Chăm Sóc & Dòng Thời Gian Tương Tác (Care Interaction Timeline)**:
   - Tiêu đề sự kiện: `Gia hạn gói TPOS`.
   - Người thực hiện: `Nguyễn Thanh Lam`.
   - Nội dung ghi nhận: *"Khách hàng bận thứ 2 gọi lại. Tư vấn dịch vụ."*
   - Dấu mốc thời gian: `12/03/2027 11:09`.

### 1.2 TypeScript Data Contracts (DTO Interfaces)
```typescript
export interface Customer360ProfileDto {
  id: string;
  fullName: string;
  initialLetter: string;
  roleTitle: string;
  companyName: string;
  companyDomain: string;
  remainingDays: number;
  contract: {
    packageName: string;
    expireDate: string;
    totalAmount: number;
    currency: string;
  };
  currentTicket: {
    serviceName: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    notes: string;
  };
  assignee: {
    agentName: string;
    agentRole: string;
    managerName: string;
  };
  timeline: Array<{
    id: string;
    title: string;
    author: string;
    content: string;
    timestamp: string;
    channel: 'ZALO' | 'PHONE' | 'EMAIL' | 'MEETING';
  }>;
}
```

---

# PHẦN 2: HỆ THỐNG DESIGN TOKENS & BẢNG ÁNH XẠ MÀU SẮC

Dựa trên dữ liệu JSON trích xuất từ Figma Node `1723:37496`, toàn bộ mã màu HEX và kiểu chữ được quy chiếu 100% sang TDS Tokens ngữ nghĩa:

### 2.1 Bảng Quy Chiếu Màu Sắc (Color Tokens Mapping)
| Mã Màu Figma (Hex) | Vai Trò Trong Màn Hình | TDS Token Ngữ Nghĩa | Lớp Tailwind CSS Áp Dụng |
| :--- | :--- | :--- | :--- |
| `#0C1014` | Tiêu đề chính, Họ tên, Giá tiền | `tds-color-text-primary` | `text-neutral-1-900` |
| `#535A67` | Văn bản nội dung mô tả, phụ đề | `tds-color-text-secondary` | `text-neutral-1-700` |
| `#7E8796` | Nhãn phân loại (Uppercase label) | `tds-color-text-tertiary` | `text-neutral-1-500` |
| `#8D97A6` | Thời gian, metadata ghi chú | `tds-color-text-placeholder` | `text-neutral-1-400` |
| `#FFFFFF` | Nền Card, chữ nút bấm màu | `tds-color-background-white`| `bg-white` / `text-white` |
| `#F2F5F8` | Nền trang tổng quan, nền tag | `tds-color-background-neutral`| `bg-neutral-3-50` |
| `#DBE0E6` | Viền khung thẻ Card, viền chia cắt | `tds-color-border-primary` | `border-neutral-2-200` |
| `#2A92FF` | Nút Zalo OA, link liên kết chính | `tds-color-primary-500` | `bg-primary-500` / `text-primary-500` |
| `#2EB032` | Tag "Còn 117 ngày", active | `tds-color-success-500` | `bg-success-50` / `text-success-600` |
| `#F35431` | Tag "Ưu tiên cao", cảnh báo | `tds-color-error-500` | `bg-error-50` / `text-error-600` |
| `#FF4E00` | Thương hiệu WiCX Primary Brand | `tds-color-primary-brand` | `bg-primary-brand` |

### 2.2 Bảng Quy Chiếu Typography (Font: TMTSans)
| Kiểu Font Figma | Thông Số CSS | Lớp Tailwind TDS UI |
| :--- | :--- | :--- |
| **Heading/heading-5** | `18px / 24px / Bold (700)` | `text-heading-2 font-bold` |
| **Heading/heading-6** | `16px / 22px / Semibold (600)` | `text-heading-3 font-semibold` |
| **Body/body-1-semibold**| `15px / 22px / Semibold (600)` | `text-body-1 font-semibold` |
| **Body/body-2-semibold**| `14px / 20px / Semibold (600)` | `text-body-2 font-semibold` |
| **Body/body-2-regular** | `14px / 20px / Regular (400)` | `text-body-2 font-regular` |
| **Caption/caption-1-semibold**| `12px / 16px / Semibold (600)`| `text-caption-1 font-semibold` |

---

# PHẦN 3: DANH MỤC THÀNH PHẦN GIAO DIỆN TDS-UI SỬ DỤNG

Để đảm bảo hiệu năng và tính nhất quán, màn hình sử dụng 6 modules độc lập từ `tds-ui`:

```typescript
// 1. Thẻ chứa nội dung
import { TDSCardModule } from 'tds-ui/card';             // Selector: tds-card

// 2. Ảnh đại diện người dùng
import { TDSAvatarModule } from 'tds-ui/avatar';         // Selector: tds-avatar

// 3. Nhãn trạng thái & badge cảnh báo
import { TDSTagModule } from 'tds-ui/tag';               // Selector: tds-tag

// 4. Nút bấm hành động
import { TDSButtonModule } from 'tds-ui/button';         // Selector: button[tds-button]

// 5. Dòng thời gian nhật ký tương tác
import { TDSTimelineModule } from 'tds-ui/timeline';     // Selector: tds-timeline, tds-timeline-item

// 6. Đường kẻ phân cách nét đứt
import { TDSDividerModule } from 'tds-ui/divider';       // Selector: tds-divider
```

---

# PHẦN 4: KIẾN TRÚC BỐ CỤC GIAO DIỆN (UI/UX WIREFRAME)

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Avatar 'Đ']  Trần Minh Đạt  [Còn 117 ngày]                        [📞 Gọi Điện] [💬 Nhắn Zalo]  │
│               Quản lý cửa hàng • WiPix.com                                                      │
├────────────────────────────────┬────────────────────────────────┬───────────────────────────────┤
│ GÓI ĐANG SỬ DỤNG               │ YÊU CẦU HỖ TRỢ                 │ NHÂN VIÊN PHỤ TRÁCH           │
│ Landing Pro x 1                │ Demo Tpos Pro [Ưu tiên cao]    │ [Avatar 'K'] Hoàng Khôi       │
│ Hết hạn: 12/10/2027            │ Vui lòng liên hệ đúng giờ với  │ Chuyên viên CSKH              │
│ Giá trị HĐ: 2.000.000 đ        │ khách để gây ấn tượng...       │ Quản lý: Trần Minh Đạt        │
├────────────────────────────────┴────────────────────────────────┴───────────────────────────────┤
│ NHẬT KÝ CHĂM SÓC & TƯƠNG TÁC (TIMELINE)                                                         │
│  ○ Gia hạn gói TPOS ──────────────────────────────────────────────────────── 12/03/2027 11:09   │
│    Nguyễn Thanh Lam: Khách hàng bận thứ 2 gọi lại. Tư vấn dịch vụ.                              │
│  ○ Gửi báo giá Landing Pro ──────────────────────────────────────────────── 10/03/2027 15:30   │
│    Hoàng Khôi: Đã gửi hợp đồng điện tử qua Zalo OA.                                            │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# PHẦN 5: MÃ NGUỒN MẪU HOÀN CHỈNH ANGULAR 18 STANDALONE

File: `apps/mfe-crm/src/app/features/customer360/customer360-detail.component.ts`

```typescript
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TDSCardModule } from 'tds-ui/card';
import { TDSAvatarModule } from 'tds-ui/avatar';
import { TDSTagModule } from 'tds-ui/tag';
import { TDSButtonModule } from 'tds-ui/button';
import { TDSTimelineModule } from 'tds-ui/timeline';
import { TDSDividerModule } from 'tds-ui/divider';
import { TDSMessageService } from 'tds-ui/message';

@Component({
  selector: 'app-customer360-detail',
  standalone: true,
  imports: [
    CommonModule,
    TDSCardModule,
    TDSAvatarModule,
    TDSTagModule,
    TDSButtonModule,
    TDSTimelineModule,
    TDSDividerModule
  ],
  template: `
    <div class="p-6 bg-neutral-3-50 min-h-screen font-sans text-neutral-1-900">
      <!-- 1. Header Customer Profile Card -->
      <tds-card class="mb-6 bg-white border border-neutral-2-200 rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <tds-avatar
              [text]="profile().initialLetter"
              [size]="'lg'"
              class="bg-primary-500 text-white font-bold text-heading-3 w-14 h-14 rounded-full flex items-center justify-center shadow-md">
            </tds-avatar>
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-heading-2 font-bold text-neutral-1-900 m-0">{{ profile().fullName }}</h1>
                <tds-tag [color]="'success'" class="font-semibold text-caption-1 px-2.5 py-0.5 rounded-full">
                  Còn {{ profile().remainingDays }} ngày
                </tds-tag>
              </div>
              <p class="text-body-2 text-neutral-1-500 mt-1 mb-0">
                {{ profile().roleTitle }} • <span class="text-primary-500 font-semibold">{{ profile().companyDomain }}</span>
              </p>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex items-center gap-3">
            <button tds-button color="secondary" (click)="onMakeCall()">
              <i class="tdsi-phone-fill mr-1.5 text-neutral-1-700"></i> Gọi Điện
            </button>
            <button tds-button color="primary" (click)="onOpenZalo()">
              <i class="tdsi-message-fill mr-1.5 text-white"></i> Nhắn Zalo OA
            </button>
          </div>
        </div>
      </tds-card>

      <!-- 2. Grid Metric Cards: Subscription, Ticket, Assignee -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <!-- Card 1: Gói Đang Sử Dụng -->
        <tds-card class="bg-white border border-neutral-2-200 rounded-xl p-5 shadow-sm">
          <span class="text-caption-1 font-semibold text-neutral-1-500 uppercase tracking-wider">Gói Đang Sử Dụng</span>
          <h2 class="text-heading-3 font-bold text-neutral-1-900 mt-2 mb-1">{{ profile().contract.packageName }}</h2>
          <p class="text-body-3 text-neutral-1-400 mb-4">Hết hạn: {{ profile().contract.expireDate }}</p>
          
          <div class="pt-3 border-t border-neutral-2-100 flex justify-between items-center">
            <span class="text-body-2 text-neutral-1-700">Giá trị hợp đồng:</span>
            <span class="text-heading-3 font-bold text-primary-500">
              {{ profile().contract.totalAmount | number }} {{ profile().contract.currency }}
            </span>
          </div>
        </tds-card>

        <!-- Card 2: Yêu Cầu Hỗ Trợ Đang Xử Lý -->
        <tds-card class="bg-white border border-neutral-2-200 rounded-xl p-5 shadow-sm">
          <span class="text-caption-1 font-semibold text-neutral-1-500 uppercase tracking-wider">Yêu Cầu Hỗ Trợ</span>
          <div class="flex items-center gap-2 mt-2 mb-1">
            <h2 class="text-heading-3 font-bold text-neutral-1-900 m-0">{{ profile().currentTicket.serviceName }}</h2>
            <tds-tag [color]="'error'" class="font-bold text-xs uppercase px-2 py-0.5 rounded">
              {{ profile().currentTicket.priority === 'HIGH' ? 'Ưu tiên cao' : 'Tiêu chuẩn' }}
            </tds-tag>
          </div>
          <p class="text-body-3 text-neutral-1-600 mt-2 bg-neutral-3-50 p-3 rounded-lg border border-neutral-2-100 leading-relaxed">
            {{ profile().currentTicket.notes }}
          </p>
        </tds-card>

        <!-- Card 3: Nhân Viên Phụ Trách -->
        <tds-card class="bg-white border border-neutral-2-200 rounded-xl p-5 shadow-sm">
          <span class="text-caption-1 font-semibold text-neutral-1-500 uppercase tracking-wider">Nhân Viên Phụ Trách</span>
          <div class="flex items-center gap-3.5 mt-3">
            <tds-avatar [text]="'K'" class="bg-info-500 text-white font-bold w-11 h-11 rounded-full flex items-center justify-center"></tds-avatar>
            <div>
              <p class="text-body-2 font-bold text-neutral-1-900 m-0">{{ profile().assignee.agentName }}</p>
              <p class="text-caption-1 text-neutral-1-500 m-0">{{ profile().assignee.agentRole }}</p>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-neutral-2-100 flex justify-between items-center text-body-3">
            <span class="text-neutral-1-500">Quản lý duyệt:</span>
            <span class="font-semibold text-neutral-1-800">{{ profile().assignee.managerName }}</span>
          </div>
        </tds-card>
      </div>

      <!-- 3. Interaction History Timeline -->
      <tds-card class="bg-white border border-neutral-2-200 rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-6 pb-3 border-b border-neutral-2-100">
          <div>
            <h2 class="text-heading-3 font-bold text-neutral-1-900 m-0">Nhật Ký Chăm Sóc & Tương Tác</h2>
            <p class="text-caption-1 text-neutral-1-400 mt-0.5 mb-0">Theo dõi toàn bộ lịch sử tư vấn đa kênh với khách hàng</p>
          </div>
          <button tds-button color="outline" (click)="onAddLog()">
            <i class="tdsi-plus-fill mr-1"></i> Ghi Nhận Mới
          </button>
        </div>

        <tds-timeline class="pl-2">
          <tds-timeline-item *ngFor="let item of profile().timeline" [color]="item.channel === 'ZALO' ? 'primary' : 'success'">
            <div class="flex justify-between items-start flex-wrap gap-2">
              <div>
                <span class="text-body-2 font-bold text-neutral-1-900">{{ item.title }}</span>
                <p class="text-body-2 text-neutral-1-700 mt-1 mb-0">
                  <strong class="text-primary-600">{{ item.author }}:</strong> {{ item.content }}
                </p>
              </div>
              <span class="text-caption-1 text-neutral-1-400 font-mono">{{ item.timestamp }}</span>
            </div>
          </tds-timeline-item>
        </tds-timeline>
      </tds-card>
    </div>
  `
})
export class Customer360DetailComponent {
  profile = signal({
    id: 'CUST-00912',
    fullName: 'Trần Minh Đạt',
    initialLetter: 'Đ',
    roleTitle: 'Quản lý cửa hàng',
    companyName: 'WiPix Solutions Ltd',
    companyDomain: 'WiPix.com',
    remainingDays: 117,
    contract: {
      packageName: 'Landing Pro x 1',
      expireDate: '12/10/2027',
      totalAmount: 2000000,
      currency: 'đ'
    },
    currentTicket: {
      serviceName: 'Demo Tpos Pro',
      priority: 'HIGH' as const,
      notes: 'Vui lòng liên hệ trước đúng giờ với khách để gây ấn tượng tốt nhất. Nếu có thay đổi, vui lòng liên hệ nhân viên support trước 2 tiếng.'
    },
    assignee: {
      agentName: 'Hoàng Khôi',
      agentRole: 'Nhân viên chăm sóc khách hàng',
      managerName: 'Trần Minh Đạt'
    },
    timeline: [
      {
        id: 'log-1',
        title: 'Gia hạn gói TPOS',
        author: 'Nguyễn Thanh Lam',
        content: 'Khách hàng bận thứ 2 gọi lại. Tư vấn tiếp dịch vụ quản lý kho.',
        timestamp: '12/03/2027 11:09',
        channel: 'PHONE' as const
      },
      {
        id: 'log-2',
        title: 'Gửi hợp đồng điện tử Landing Pro',
        author: 'Hoàng Khôi',
        content: 'Đã gửi liên kết xác nhận thanh toán qua Zalo OA của doanh nghiệp.',
        timestamp: '10/03/2027 15:30',
        channel: 'ZALO' as const
      }
    ]
  });

  constructor(private msg: TDSMessageService) {}

  onMakeCall() {
    this.msg.info('Đang kết nối cuộc gọi VoIP tới số khách hàng...');
  }

  onOpenZalo() {
    this.msg.success('Đang mở cổng chat Zalo OA với khách hàng Trần Minh Đạt');
  }

  onAddLog() {
    this.msg.info('Mở hộp thoại ghi nhận nhật ký tương tác mới');
  }
}
```

---

# PHẦN 6: TÍCH HỢP MODULE FEDERATION 2.0 & RSBUILD

### 6.1 Expose Module Tại Remote MFE (`apps/mfe-crm/rsbuild.config.ts`)
```typescript
import { createFederatedConfig } from '../../module-federation.shared';

export default async () => {
  return await createFederatedConfig({
    appName: 'mfe-crm',
    isHost: false,
    port: 4204,
    exposes: {
      './Customer360': './apps/mfe-crm/src/app/features/customer360/customer360-detail.component.ts',
      './Routes': './apps/mfe-crm/src/app/remote-entry/entry.routes.ts',
    },
  });
};
```

### 6.2 Router Bridge Nạp Động Tại Host Shell (`apps/app-shell/src/app/app.routes.ts`)
```typescript
import { Routes } from '@angular/router';
import { loadRemote } from '@module-federation/enhanced/runtime';

export const routes: Routes = [
  {
    path: 'customer-360/:id',
    loadComponent: () =>
      loadRemote<any>('mfe_crm/Customer360').then((m) => m.Customer360DetailComponent),
  },
];
```

---

# PHẦN 7: BỘ TIÊU CHUẨN & CHECKLIST NGHIỆM THU 10 ĐIỂM

| STT | Hạng Mục Nghiệm Thu | Tiêu Chuẩn Đạt Chuẩn (Definition of Done) | Thao Tác Xác Minh |
| :-: | :--- | :--- | :--- |
| **1** | **Khớp 100% Thiết Kế Figma** | Khớp hoàn toàn layout, khoảng cách padding, avatar, badge ưu tiên của Node `1723:37496`. | So sánh trực quan đối ứng với bản vẽ Figma |
| **2** | **Không Hardcode Mã Màu** | 100% sử dụng token Tailwind (`bg-primary-500`, `text-neutral-1-900`), cấm mã màu `#HEX`. | Quét RegExp `#[0-9a-fA-F]{3,6}` trong template/scss |
| **3** | **Font TMTSans Khởi Tạo** | Thẻ `body` áp dụng chính xác `font-family: TMTSans`. | Kiểm tra tab Computed trên DevTools |
| **4** | **Icon Vector `tdsi-*` Hiển Thị** | Hiển thị vector sắc nét icon `tdsi-phone-fill`, `tdsi-message-fill`. | Tab Network nạp thành công font icon `.woff2` |
| **5** | **Micro-Frontend Singleton** | Khai báo `tds-ui` trong `module-federation.shared.ts` bảo đảm singleton CDK Portal. | Console không có warning duplicate overlay |
| **6** | **Chạy Độc Lập Remote** | Remote `mfe-crm` tự khởi chạy trên cổng 4204 mà không cần Host. | `npm run start:crm` mở `http://localhost:4204` |
| **7** | **Tải Động Qua Host Shell** | Host Shell tại cổng 4200 tải mượt mà route `/customer-360/:id`. | `npm run start:all` kiểm tra trên cổng 4200 |
| **8** | **Tốc Độ Compile Rsbuild** | Thời gian build song song hoàn tất trong vòng dưới 25 giây. | Chạy `npm run workflow` đạt SLA |
| **9** | **Docker Staging Ready** | Đóng gói thành công qua Dockerfile multi-stage, pass healthcheck `/healthz`. | `docker build` và `curl http://localhost:4200/healthz` |
| **10**| **Checklist Code Review** | Mã nguồn TypeScript sử dụng Standalone Component, Signals, và Reactive Forms. | Peer Review theo chuẩn cursor rule Angular 2026 |


---

# PHẦN 8: BÁO CÁO KHẢO SÁT & KẾ HOẠCH TRIỂN KHAI VÀO DỰ ÁN `wicx-crm-fe`
## (WICX-CRM-FE CODEBASE SURVEY & INTEGRATION BLUEPRINT)

Dựa trên khảo sát thực tế toàn diện cấu trúc mã nguồn dự án **`projects/wicx-crm-fe`**, phần này định nghĩa chính xác hiện trạng, điểm chạm kiến trúc và các bước tích hợp màn hình Customer 360 vào monorepo production của công ty:

---

### 8.1 Khảo Sát Hiện Trạng Codebase `projects/wicx-crm-fe`

1. **Kiến Trúc Đang Hoạt Động**:
   - Monorepo Nx 20 quản trị 5 ứng dụng con: `app-shell` (Host), `mfe-account`, `mfe-cdp`, `mfe-crm`, `mfe-dashboard`.
   - Engine biên dịch: **Rsbuild v1.7.6** kết hợp Module Federation 2.0 (`@module-federation/rsbuild-plugin`) qua file dùng chung `module-federation.shared.ts`.
   - Hệ thống thư viện chia sẻ nội bộ: `@wicx/core`, `@wi-mfes/i18n`, `@wi-mfes/context`, `@wi-mfes/remote-loader`, và **`tds-ui` (v18.5.2)**.

2. **Hiện Trạng Remote `apps/mfe-crm`**:
   - Hiện tại `apps/mfe-crm` mới chỉ có màn hình placeholder cơ bản tại `apps/mfe-crm/src/app/remote-entry/entry.component.html` hiển thị tiêu đề *"Lịch hẹn"*.
   - Chưa có phân hệ chi tiết Deal / Chăm sóc khách hàng hoàn chỉnh.
   - Do đó, việc triển khai `Customer360DetailComponent` vào `apps/mfe-crm` là hoàn toàn khả thi, không gây xung đột kiến trúc và nâng cấp trực tiếp giá trị nghiệp vụ cho phân hệ CRM.

3. **Hiện Trạng Router Nạp Remote Tại Host Shell (`apps/app-shell/src/app/app.routes.ts`)**:
   - Host Shell đã cấu hình route `:id/crm` trỏ vào remote module `mfe-crm`:
     ```typescript
     {
       path: 'crm',
       title: 'CRM.TITLE',
       providers: provideWII18n({ remoteName: 'mfe-crm', modules: ['crm'] }),
       resolve: { i18n: i18nResolver },
       loadChildren: () => loadRemoteMfeRoutes('mfe-crm').catch(handleRemoteError('mfe-crm')),
     }
     ```
   - Cơ chế nạp đa ngôn ngữ (`provideWII18n`) và bộ giải quyết lỗi (`handleRemoteError`) đã hoàn thiện 100%.

---

### 8.2 Điểm Chạm Kiến Trúc Khi Tích Hợp (Architecture Touchpoints)

| Tệp Cần Chạm Đến Trong `wicx-crm-fe` | Thao Tác Kỹ Thuật | Mục Đích |
| :--- | :--- | :--- |
| **`apps/mfe-crm/src/app/features/customer360/`** | **Tạo mới thư mục & component** | Chứa `Customer360DetailComponent` (View, DTO, Service). |
| **`apps/mfe-crm/src/app/remote-entry/entry.routes.ts`** | **Bổ sung route con** | Định tuyến `path: ':id'` và `path: 'deal-detail'` nạp component 360. |
| **`apps/mfe-crm/rsbuild.config.ts`** | **Bổ sung exposes** | Thêm `'./Customer360': './apps/mfe-crm/src/app/features/customer360/customer360-detail.component.ts'`. |
| **`apps/mfe-crm/public/assets/i18n/vi/crm.json`** | **Bổ sung từ khóa ngôn ngữ** | Thêm translations cho `CUSTOMER_360`, `DEAL`, `TIMELINE`, `ACTION`. |
| **`apps/mfe-crm/project.json`** | **Giữ nguyên target build-rsbuild** | Không cần thay đổi build executor, Rsbuild tự động bundle component mới. |

---

### 8.3 Kế Hoạch 4 Bước Triển Khai Thực Tế Cho Lead Dev & Peer Dev

#### Bước 1: Khởi tạo Component tại `apps/mfe-crm`
Tạo tệp `apps/mfe-crm/src/app/features/customer360/customer360-detail.component.ts` áp dụng chính xác mã nguồn Angular Standalone từ **Phần 5** của tài liệu này. Đảm bảo import đầy đủ các modules TDS UI có sẵn trong dự án: `TDSCardModule`, `TDSAvatarModule`, `TDSTagModule`, `TDSButtonModule`, `TDSTimelineModule`, `TDSDividerModule`.

#### Bước 2: Cập Nhật Routing tại Remote `mfe-crm`
Mở `apps/mfe-crm/src/app/remote-entry/entry.routes.ts`, cấu hình router đa tầng:

```typescript
import { Route } from '@angular/router';
import { provideWII18n } from '@wicx/core';
import { RemoteEntryComponent } from './entry.component';

export const remoteRoutes: Route[] = [
  {
    path: '',
    title: 'CRM.TITLE',
    providers: provideWII18n({ remoteName: 'mfe-crm', modules: ['crm'] }),
    component: RemoteEntryComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'detail',
      },
      {
        path: 'detail',
        title: 'CRM.CUSTOMER_360.TITLE',
        loadComponent: () =>
          import('../features/customer360/customer360-detail.component').then(
            (m) => m.Customer360DetailComponent
          ),
      },
      {
        path: ':id',
        title: 'CRM.CUSTOMER_360.TITLE',
        loadComponent: () =>
          import('../features/customer360/customer360-detail.component').then(
            (m) => m.Customer360DetailComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/error/not-found',
  },
];
```

#### Bước 3: Expose Module Trong Rsbuild Config
Mở `apps/mfe-crm/rsbuild.config.ts`, khai báo expose trực tiếp cho Host gọi độc lập khi cần:

```typescript
import { createRsbuildConfig } from '../../module-federation.shared';

export default async () => {
  return await createRsbuildConfig({
    appName: 'mfe-crm',
    port: 4204,
    exposes: {
      './Customer360': './apps/mfe-crm/src/app/features/customer360/customer360-detail.component.ts',
      './Routes': './apps/mfe-crm/src/app/remote-entry/entry.routes.ts',
    },
  });
};
```

#### Bước 4: Kiểm Định Build & Khởi Chạy Local
Chạy kịch bản kiểm tra độc lập tại `projects/wicx-crm-fe`:

```bash
# 1. Chạy lẻ Remote CRM để test giao diện
npm run start:crm

# 2. Chạy kèm Host Shell kiểm tra liên kết điều hướng Micro-Frontend
npm run start:dev
# Mở trình duyệt: http://localhost:4200/<tenantId>/crm/detail

# 3. Kiểm định thời gian biên dịch Rsbuild
npm run build:crm
# Đảm bảo compile hoàn tất dưới 5 giây, không phát sinh lỗi injector hoặc warning CORS.
```
