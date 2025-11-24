# Hướng dẫn khởi động HanoiTransit

## Yêu cầu
- Node.js v16 trở lên
- npm

## Các bước chạy ứng dụng

### 1. Khởi động Backend Server

Mở terminal/cmd và chạy:

```cmd
cd D:\web20251\HanoiTransit\server
npm install
node server.js
```

Server sẽ chạy trên port **4000** và tự động load dữ liệu GTFS:
- ✅ 6495 điểm dừng (stops)
- ✅ 224 tuyến xe buýt (routes)
- ✅ 62344 cạnh đồ thị (edges)

### 2. Khởi động Frontend Client

Mở terminal/cmd MỚI (để server vẫn chạy) và chạy:

```cmd
cd D:\web20251\HanoiTransit\client
npm install
npm run dev
```

Client sẽ chạy trên port **5173** (hoặc port khác nếu 5173 đang bận).

### 3. Truy cập ứng dụng

Mở trình duyệt và truy cập:
- **http://localhost:5173**

## Các tính năng chính

1. **Tìm lộ trình**: Nhập điểm đi và điểm đến để tìm đường đi tối ưu
   - Nhanh nhất
   - Ít chuyển tuyến nhất
   - Rẻ nhất

2. **Tra cứu tuyến**: Tìm kiếm thông tin các tuyến xe buýt

3. **Trang cá nhân**: Đăng ký/Đăng nhập để lưu lộ trình yêu thích

## Khắc phục sự cố

### Lỗi: "Cannot find module"
Chạy `npm install` trong thư mục tương ứng (server hoặc client)

### Lỗi: Port đã được sử dụng
- Server: Thay đổi PORT trong server.js
- Client: Vite sẽ tự động chọn port khác

### Không lấy được dữ liệu
- Đảm bảo server đã chạy và load đủ dữ liệu GTFS
- Kiểm tra console log khi server khởi động
- Kiểm tra file GTFS trong `server/data/gtfs/`

## API Endpoints

Backend cung cấp các endpoints sau:

- `POST /api/route/find` - Tìm lộ trình
- `GET /api/route/details?id=` - Chi tiết lộ trình
- `GET /api/nearby?lat=&lng=` - Tìm điểm dừng gần
- `GET /api/search/line?q=` - Tìm tuyến xe
- `GET /api/search/line/details?id=` - Chi tiết tuyến xe
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/user/favorites` - Lộ trình yêu thích

## Cấu trúc dữ liệu GTFS

Dữ liệu xe buýt Hà Nội được lưu trong `server/data/gtfs/`:
- `stops.txt` - Danh sách điểm dừng
- `stops-enriched.txt` - Điểm dừng với tên tiếng Việt
- `routes.txt` - Danh sách tuyến
- `trips.txt` - Các chuyến đi
- `stop_times.txt` - Lịch trình
- `calendar.txt` - Lịch hoạt động

