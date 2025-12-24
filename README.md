# Figma UI – React + Tailwind (Vite)

This project is ready to import into **CodeSandbox** or run locally.

## Prerequisites (Yêu cầu hệ thống)
Để chạy được ứng dụng này, bạn cần:
* **VS Code:** Phiên bản mới nhất (Recommended: Koala/Ladybug...).
* **JDK:** Java Development Kit 17 hoặc mới hơn.
* **Internet:** Bắt buộc (để kết nối với Server Online).

## Server Information (Thông tin Server)
Backend đã được deploy và đang chạy online, không cần cài đặt local.
* **Base URL:** `http://34.151.64.207/`
* **Status:** Online (Active).


## Quick start (local)
 **Clone Project:**
    ```bash
   git clone -b webadmin https://github.com/PhuThuan323/Hermosa.git
    ```
```bash
npm install
npm run dev
```

## Match your Figma exactly
- Edit `src/styles/index.css` color tokens to match your Figma's brand colors and backgrounds.
- If you have a custom font, change the `<link>` in `index.html` and/or add `@font-face`.
- Tweak spacing and radii via Tailwind utility classes.

## Pages
- `/login`
- `/dashboard`
- `/orders`
- `/customers`
- `/products`

## Popups (modals)
Each management page includes a modal matching the "Add/Create" flow. Wire additional fields as needed.
