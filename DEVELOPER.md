# 🛠️ Silver Cat Tools - Developer Guidelines

Tài liệu này chứa các quy tắc phát triển, cấu trúc thư mục và cơ chế hoạt động kỹ thuật của dự án **Silver Cat Tools**. Vui lòng đọc kỹ trước khi bắt đầu tạo công cụ mới hoặc chỉnh sửa mã nguồn hiện tại.

---

## 📌 HƯỚNG DẪN QUAN TRỌNG KHI PHÁT TRIỂN

> [!IMPORTANT]
> **1. Quy tắc Preview giao diện**
> *   **KHÔNG** chạy server localhost (Node.js, Live Server, Vite, v.v.).
> *   **BẮT BUỘC** sử dụng giao thức file tĩnh cục bộ (file protocol) để xem trước và kiểm thử trang web:
>     `file:///D:/free-utility-tools/index.html` hoặc `file:///D:/free-utility-tools/[thư_mục_công_cụ]/index.html`
>
> **2. Cấu trúc tài nguyên dùng chung**
> *   Tất cả các công cụ con nằm trong thư mục cấp 2 (ví dụ: `/text/replace-text/`) phải liên kết ngược lại tài nguyên dùng chung ở thư mục gốc bằng đường dẫn tương đối `../../`:
>     *   Logo: `../../logo.jpg`
>     *   CSS dùng chung: `../../style.css`
>     *   Dịch thuật dùng chung: `../../i18n.js`
>     *   Script dùng chung: `../../app.js`

---

## 🌐 CƠ CHẾ ĐA NGÔN NGỮ (i18n)

Hệ thống dịch thuật hỗ trợ hai ngôn ngữ: **Tiếng Việt (VI)** và **Tiếng Anh (EN)**. Cơ chế hoạt động dựa trên các nguyên tắc sau:

1.  **Engine dịch thuật chính (`/i18n.js`):**
    *   Tự động tải bộ từ vựng chung dựa trên phân tích URL thông qua `window.location.pathname.includes(...)`.
    *   Dịch các thành phần giao diện chung (Navbar, Footer, các tiêu đề danh mục).
    *   Lưu lựa chọn ngôn ngữ của người dùng vào `localStorage` dưới khóa `preferredLanguage`.

2.  **Từ điển riêng của từng công cụ (`localDictionary`):**
    *   Mỗi công cụ tự định nghĩa từ vựng riêng trong đối tượng `localDictionary` bên trong file `script.js` cục bộ của nó.
    *   *Ví dụ cấu trúc từ điển cục bộ:*
        ```javascript
        const localDictionary = {
            vi: {
                'tool-title': 'Bộ Nén Ảnh',
                'btn-compress': 'Bắt đầu nén'
            },
            en: {
                'tool-title': 'Image Compressor',
                'btn-compress': 'Start Compress'
            }
        };
        ```

3.  **Lắng nghe sự kiện chuyển đổi ngôn ngữ:**
    *   Để đồng bộ hóa dịch thuật thời gian thực khi người dùng chuyển đổi cờ VI/EN trên thanh điều hướng, hãy đăng ký lắng nghe sự kiện `languageChanged` trong file script của công cụ:
        ```javascript
        window.addEventListener('languageChanged', () => {
            applyLocalTranslation(); // Hàm cập nhật các thẻ chữ riêng biệt của công cụ
        });
        ```

---

## 📂 CẤU TRÚC THƯ MỤC DỰ ÁN

```
d:\free-utility-tools\
├── logo.jpg                     # Logo thương hiệu chung
├── style.css                    # CSS nền tảng chung (Navbar, layout, biến CSS màu)
├── app.js                       # Logic tương tác trang chủ chung
├── i18n.js                      # Engine đa ngôn ngữ (Tiếng Việt & Tiếng Anh)
├── index.html                   # Trang chủ hiển thị danh mục các công cụ
├── DEVELOPER.md                 # Tài liệu này (Hướng dẫn phát triển)
│
├── images/                      # Danh mục các công cụ xử lý hình ảnh
│   ├── color-palette/           # Trích xuất bảng màu từ hình ảnh
│   ├── image-compressor/        # Bộ nén ảnh chất lượng cao
│   ├── image-converter/         # Bộ chuyển đổi định dạng ảnh hàng loạt
│   ├── image-cropper/           # Cắt & xoay ảnh cơ bản
│   ├── image-pixelator/         # Tạo ảnh Pixel & ASCII Art
│   ├── image-to-pdf/            # Ghép ảnh thành PDF
│   └── image-watermarker/       # Chèn Watermark hàng loạt
│
├── text/                        # Danh mục các công cụ xử lý văn bản
│   ├── replace-text/            # Tìm kiếm & Thay thế chữ hàng loạt
│   ├── word-counter/            # Bộ đếm từ & Phân tích mật độ, độ dễ đọc
│   ├── markdown-converter/      # Trình soạn thảo Markdown & Live Preview HTML
│   └── text-encoder/            # Bộ mã hóa/giải mã chuỗi (Base64, Hex, Binary, ROT13...)
│
└── videos/                      # Danh mục công cụ xử lý video
    └── video-downloader/        # Tải video TikTok/FB không dính logo watermark
```
