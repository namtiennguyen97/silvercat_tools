# Silver Cat Tools - Cổng Tiện Ích Trực Tuyến Miễn Phí

Silver Cat Tools là một bộ sưu tập các ứng dụng tiện ích nhỏ (micro-utilities) chất lượng cao chạy hoàn toàn trên trình duyệt (client-side), đảm bảo tốc độ tối đa và tính riêng tư tuyệt đối cho dữ liệu của người dùng.

---

## 📌 HƯỚNG DẪN QUAN TRỌNG CHO LẦN PHÁT TRIỂN TIẾP THEO

> [!IMPORTANT]
> **1. Quy tắc Preview giao diện**
> *   **KHÔNG** chạy server localhost (Node.js, Live Server, Vite, v.v.).
> *   **BẮT BUỘC** sử dụng giao thức file tĩnh cục bộ để xem trước và kiểm thử trang web:
>     `file:///D:/free-utility-tools/index.html` hoặc `file:///D:/free-utility-tools/[thư_mục_công_cụ]/index.html`
>
> **2. Cơ chế đa ngôn ngữ (i18n)**
> *   Công cụ dịch nằm ở file gốc `/i18n.js`. Nó khớp từ khóa trong từ điển chính bằng quy tắc lọc URL: `window.location.pathname.includes(...)`.
> *   Mỗi khi tạo công cụ mới hoặc chuyển thư mục, hãy đảm bảo tên thư mục/file HTML khớp với quy tắc trong `i18n.js` để tự động load bộ từ vựng chung.
> *   Các từ vựng riêng của từng công cụ được định nghĩa trong đối tượng `localDictionary` bên trong file `script.js` cục bộ của công cụ đó.
> *   Để đồng bộ hóa dịch thời gian thực khi chuyển đổi cờ VI/EN, hãy đăng ký lắng nghe sự kiện:
>     ```javascript
>     window.addEventListener('languageChanged', () => {
>         applyLocalTranslation(); // Hàm cập nhật các thẻ chữ riêng biệt
>     });
>     ```
>
> **3. Cấu trúc tài nguyên chung**
> *   Tất cả các công cụ con nằm trong thư mục cấp 2 (ví dụ: `/text/replace-text/`) phải liên kết ngược lại tài nguyên dùng chung ở thư mục gốc bằng đường dẫn tương đối `../../`:
>     *   Logo: `../../logo.jpg`
>     *   CSS dùng chung: `../../style.css`
>     *   Dịch thuật dùng chung: `../../i18n.js`
>     *   Script dùng chung: `../../app.js`

---

## 📂 CẤU TRÚC THƯ MỤC DỰ ÁN

```
d:\free-utility-tools\
├── logo.jpg                     # Logo thương hiệu chung
├── style.css                    # CSS nền tảng chung (Navbar, layout, biến CSS màu)
├── app.js                       # Logic tương tác trang chủ chung
├── i18n.js                      # Engine đa ngôn ngữ (Tiếng Việt & Tiếng Anh)
├── index.html                   # Trang chủ hiển thị danh mục các công cụ
│
├── images/                      # Danh mục các công cụ xử lý hình ảnh
│   ├── image-compressor/        # Bộ nén ảnh chất lượng cao
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   │
│   └── image-converter/         # Bộ chuyển đổi định dạng ảnh hàng loạt
│       ├── index.html
│       ├── style.css
│       └── script.js
│
└── text/                        # Danh mục các công cụ xử lý văn bản
    ├── replace-text/            # Tìm kiếm & Thay thế chữ hàng loạt
    │   ├── index.html
    │   ├── style.css
    │   └── script.js
    │
    ├── word-counter/            # Bộ đếm từ & Phân tích mật độ, độ dễ đọc
    │   ├── index.html
    │   ├── style.css
    │   └── script.js
    │
    ├── markdown-converter/      # Trình soạn thảo Markdown & Live Preview HTML
    │   ├── index.html
    │   ├── style.css
    │   └── script.js
    │
    └── text-encoder/            # Bộ mã hóa/giải mã chuỗi (Base64, Hex, Binary, ROT13...)
        ├── index.html
        ├── style.css
        └── script.js
```

---

## 🛠️ CHI TIẾT CÁC CÔNG CỤ HIỆN CÓ

### 1. Nén Ảnh Chất Lượng Cao (`/images/image-compressor/`)
*   **Chức năng**: Nén ảnh giảm dung lượng JPG/PNG/WebP ngay trên trình duyệt mà không làm giảm độ sắc nét nhờ thuật toán tối ưu hóa canvas.
*   **Đặc điểm**: Hỗ trợ kéo thả ảnh và tải về kết quả trực quan.

### 2. Chuyển Đổi Định Dạng Ảnh (`/images/image-converter/`)
*   **Chức năng**: Chuyển đổi định dạng ảnh hàng loạt qua lại giữa JPG, PNG, WebP, BMP, GIF.
*   **Đặc điểm**: Xử lý đa luồng offline, xuất file nén zip tiện lợi.

### 3. Tìm Kiếm & Thay Thế Chữ (`/text/replace-text/`)
*   **Chức năng**: Tìm và thay thế chuỗi, hỗ trợ Regular Expression (RegEx), xóa dòng trống, xóa khoảng trắng thừa, loại bỏ dấu tiếng Việt.
*   **Đặc điểm**: Thích hợp để chuẩn hóa hoặc làm sạch dữ liệu văn bản nhanh.

### 4. Bộ Đếm Từ & Phân Tích Văn Bản (`/text/word-counter/`)
*   **Chức năng**: Đếm số từ, ký tự (có/không cách), câu, đoạn văn; đo lường thời gian đọc/thuyết trình; kiểm tra mật độ từ khóa và tính điểm độ dễ đọc (Flesch Readability).
*   **Đặc điểm**: Cập nhật chỉ số thời gian thực (real-time).

### 5. Trình Soạn Thảo Markdown (`/text/markdown-converter/`)
*   **Chức năng**: Soạn thảo cú pháp Markdown phổ thông và xem trước (live preview) giao diện HTML tương ứng song song.
*   **Đặc điểm**: Xuất bản ra mã nguồn HTML hoặc tải file `.html` hoàn chỉnh.

### 6. Mã Hóa & Giải Mã Văn Bản (`/text/text-encoder/`)
*   **Chức năng**: Mã hóa hoặc giải mã văn bản qua các chuẩn codec thông dụng: Base64, URL percent-encoding, HTML Entities, Hexadecimal, Binary và ROT13.
