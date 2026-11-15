# Đưa game Đồng Thanh lên mạng (miễn phí)

Sau khi làm xong, bạn sẽ có một link dạng `https://dong-thanh-xxxx.onrender.com`.
Ai có link cũng chơi được: không cần tài khoản Claude, không cần đăng nhập.

Bạn cần 2 tài khoản miễn phí: **GitHub** (nơi cất code) và **Render** (nơi chạy máy chủ).
Toàn bộ mất khoảng 10 phút.

---

## Bước 1. Đưa code lên GitHub

1. Vào https://github.com/signup để tạo tài khoản (bỏ qua nếu đã có).
2. Vào https://github.com/new để tạo kho chứa code:
   - **Repository name:** `dong-thanh`
   - Chọn **Public** hoặc **Private** đều được.
   - Bấm **Create repository**.
3. Ở trang vừa hiện ra, bấm dòng chữ **uploading an existing file**.
4. Mở thư mục `dong-thanh-online` trên máy rồi kéo thả vào trang GitHub các mục sau:
   - `server.js`
   - `package.json`
   - `package-lock.json`
   - `.gitignore` (file này bị ẩn: trong File Explorer bật **View → Show → Hidden items**; thiếu file này cũng không sao)
   - thư mục `public` (kéo cả thư mục, bên trong có `index.html`)

   **Không** kéo thư mục `node_modules`.
5. Bấm **Commit changes**.

Kiểm tra: trong kho trên GitHub phải thấy `server.js`, `package.json` và thư mục `public/index.html`.

## Bước 2. Chạy máy chủ trên Render

1. Vào https://render.com, bấm **Get Started**, chọn **GitHub** để đăng nhập bằng tài khoản GitHub vừa tạo.
2. Bấm **+ New** → **Web Service**.
3. Chọn kho `dong-thanh`. Nếu không thấy, bấm **Configure GitHub** / **Connect account** và cho phép Render đọc kho đó.
4. Điền:

   | Ô | Giá trị |
   |---|---|
   | Name | `dong-thanh` (tên này sẽ nằm trong link) |
   | Language | `Node` |
   | Branch | `main` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Instance Type | **Free** |

5. Bấm **Deploy Web Service** và chờ 2 đến 3 phút, tới khi thấy chữ **Live** màu xanh.
6. Link game nằm ở góc trên bên trái, dạng `https://dong-thanh-xxxx.onrender.com`. Mở thử, rồi gửi link cho bạn bè.

## Cách chơi với bạn

- **Phòng riêng:** một người bấm **Tạo phòng**, gửi mã 4 ký tự. Người kia nhập mã rồi bấm **Vào phòng**.
- Hoặc gửi link kèm mã phía sau, ví dụ `https://dong-thanh-xxxx.onrender.com/#AB12`: mã sẽ tự điền sẵn.
- **Ghép trận ngẫu nhiên:** những ai đang mở trang và chọn cùng chế độ sẽ được ghép với nhau.

## Lưu ý về gói miễn phí

- Sau khoảng 15 phút không ai vào, Render cho máy chủ ngủ. Người mở trang tiếp theo phải chờ **30 đến 60 giây** để nó thức dậy (trang sẽ hiện "Đang kết nối máy chủ…"). Sau đó chơi bình thường.
- Khi máy chủ khởi động lại, các phòng đang chơi sẽ mất. Chỉ cần tạo phòng mới.

## Khi muốn cập nhật game

Thay file mới trên GitHub: mở kho → **Add file → Upload files** → kéo file mới vào (ví dụ `public/index.html`) → **Commit changes**.
Render tự deploy lại sau khoảng 2 phút.

## Chạy thử trên máy (không bắt buộc)

```bash
npm install
npm start
```

Mở http://localhost:3000 ở hai tab để thử chơi hai người.
