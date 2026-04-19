# Otplib Cloudflare Worker
> 🌐 Language / Ngôn ngữ: [English](README.md) | **Tiếng Việt**

Công cụ tạo mật khẩu dùng một lần (TOTP/OTP) chạy trên Cloudflare Workers với giao diện người dùng trên trình duyệt.

## Tính năng

- Giao diện đa ngôn ngữ (Tiếng Anh, Nhật, Hàn, Đức, Thái, Trung, Việt) — file ngôn ngữ được tải theo yêu cầu
- Tạo mã TOTP từ bất kỳ khóa bí mật Base32 nào
- Tự động làm mới mỗi 30 giây với bộ đếm ngược trực tiếp
- Tự động dừng sau 5 phút với thông báo trong ứng dụng; nhấn **Tạo mã** để khởi động lại
- Nút tạm dừng / tiếp tục bộ đếm ngược
- Sao chép OTP vào clipboard chỉ với một cú nhấp
- Ô nhập khóa bí mật có nút hiện/ẩn
- Chuyển đổi giao diện sáng / tối (lưu qua các phiên bằng `localStorage`)
- `frame-ancestors 'none'` được áp dụng qua HTTP response header để hỗ trợ đầy đủ trên trình duyệt
- Không cần công cụ build — HTML thuần, Tailwind CDN và Vanilla JS

## Công nghệ sử dụng

| Tầng | Công nghệ |
|---|---|
| Runtime | [Cloudflare Workers](https://workers.cloudflare.com/) |
| Thư viện OTP | [otplib](https://otplib.yeojz.dev) v12 (browser preset qua unpkg CDN) |
| Giao diện | [Tailwind CSS](https://tailwindcss.com/) v3 (CDN, không cần build) |
| Frontend | Vanilla JavaScript (ES6+) |
| Đa ngôn ngữ | Engine tải lazy tùy chỉnh — file JSON ngôn ngữ được fetch theo yêu cầu |
| Lưu trữ | `localStorage` (cài đặt giao diện, ngôn ngữ) |
| Công cụ build | Không có |

## Yêu cầu

- [Node.js](https://nodejs.org/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/): `npm install -g wrangler`

## Bắt đầu

### Phát triển

```bash
wrangler dev
```

Mở `http://localhost:8787` trên trình duyệt.

### Triển khai

```bash
# Triển khai môi trường mặc định
wrangler deploy

# Triển khai môi trường production
wrangler deploy --env production
```

## Cấu trúc dự án

```
├── index.js          # Điểm vào Cloudflare Worker
├── wrangler.jsonc    # Cấu hình Wrangler
├── assets/
│   ├── index.html    # Giao diện ứng dụng chính
│   ├── 404.html      # Trang lỗi 404
│   ├── app.js        # JavaScript frontend
│   ├── tailwind-config.js
│   ├── favicon.ico
│   ├── favicon.png
│   └── locales/      # File ngôn ngữ i18n (tải theo yêu cầu)
│       ├── en.json
│       ├── ja.json
│       ├── ko.json
│       ├── de.json
│       ├── th.json
│       ├── zh.json
│       └── vi.json
```

## Lưu ý quan trọng

> ⚠️ Công cụ này chỉ dùng để **kiểm tra nhanh mã MFA**. Chúng tôi **không lưu trữ** khóa bí mật hay bất kỳ thông tin nào.
> **Hãy lưu lại khóa bí mật ở nơi an toàn** trước khi rời khỏi trang. Mất khóa có thể khiến bạn mất quyền truy cập tài khoản vĩnh viễn.
> Chúng tôi **không chịu bất kỳ trách nhiệm nào** đối với việc mất quyền truy cập do mất khóa bí mật.

## Nguồn

- Tạo OTP bởi [otplib](https://otplib.yeojz.dev)
- Triển khai trên [Cloudflare Workers](https://workers.cloudflare.com/)
