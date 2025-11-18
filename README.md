# TransitSmart – Ứng dụng Web Tìm kiếm Lộ trình Công cộng

## Công nghệ sử dụng

- **Frontend**
  - React 18 (SPA, React Router DOM cho điều hướng)
  - Vite 7 cho dev server & build
  - Axios cho HTTP client
  - Leaflet + React Leaflet để hiển thị bản đồ, tuyến đường
  - Context API (AuthContext) quản lý trạng thái đăng nhập, token

- **Backend**
  - Node.js + Express 5 (REST API mock)
  - CORS, Morgan middleware
  - JSON Web Token (jsonwebtoken) cho xác thực
  - bcryptjs để băm mật khẩu
  - uuid sinh khóa định danh, dữ liệu mock lưu in-memory (store.js, route cache)

- **Dữ liệu & Thuật toán**
  - Mock dataset (stops/lines/graph JSON)
  - Thuật toán Dijkstra tùy chỉnh trong `utils/graph.js` để tính lộ trình theo tiêu chí (nhanh nhất, ít chuyển, rẻ nhất)
  - Haversine distance cho tính khoảng cách, gợi ý trạm lân cận

## Chạy dự án

```bash
# Backend
cd server
npm install
npm run dev

# Frontend (mặc định trỏ http://localhost:4000)
cd client
npm install
npm run dev
```

Tùy chỉnh URL API qua biến môi trường `VITE_API_URL`.***

