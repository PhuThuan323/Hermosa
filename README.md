# Hermosa Backend #

Hướng dẫn cài đặt và deploy **Hermosa Backend** trên **Ubuntu Server**.

## 🛠 Prerequisites (Yêu cầu hệ thống)

* **OS:** Ubuntu 20.04+
* **Internet:** Bắt buộc
* **Git**
* **Nginx**
* **Node.js** (cài qua NVM)
* **PM2**

## Clone Source Code

```bash
sudo apt install git
git clone https://github.com/PhuThuan323/Hermosa.git
cd Hermosa
cd hermosa_backend
```

## Cài đặt Node.js bằng NVM

### Cài NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

### Load NVM

```bash
\. "$HOME/.nvm/nvm.sh"
```

### Cài Node.js

```bash
nvm install 24
```

## Cấu hình biến môi trường (.env)

```bash
sudo nano .env
```

```env
PORT=8000

# Facebook OAuth
FACEBOOK_APP_ID=1218203776996728
FACEBOOK_APP_SECRET=dd6ee0f91053b9e0b4469ca834d8e73a
FACEBOOK_CALLBACK_URL=http://localhost:8000/user/facebook/callback

# Google OAuth
GOOGLE_CLIENT_ID=626790934393-5rl9pf1ncsncgvn1a51bmlnc7bl8s8nm.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://localhost:8000/user/google/callback

# MongoDB
MONGOOSE_DB_URL=mongodb+srv://23521554_db_user:Y8lyyWKpTyoGcEeL@cluster0.0hqz4b8.mongodb.net/?appName=Cluster0

# Cloudinary
CLOUD_NAME=dmjq5dtyz
CLOUD_API_KEY=775138766327538
CLOUD_API_SECRET=ed-kuOolghiBu1UsoF38TYvP_qk

# VNPAY
VNP_TMN_CODE=AYQEYV1O
VNP_HASH_SECRET=D5OQDZQ1KR0Q33AJT5YHEFSVPEJ7ZGA0
VNP_RETURN_URL=http://<your_server_public_ip>/payment-vnpay/callback

# MOMO
MOMO_REDIRECT_URL=http://<your_server_public_ip>/momo/confirm
MOMO_IPN_URL=http://<your_server_public_ip>/momo/momo-notify
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz
MOMO_ACCESS_KEY=F8BBA842ECF85

# Email
EMAIL_USER=23521554@gm.uit.edu.vn
EMAIL_PASS=vxvt uccv qcto zbgb

# Mapbox
MAPBOX_ACCESS_TOKEN=sk.eyJ1Ijoibmh1dHJhbmduZyIsImEiOiJjbWlkNDRtZW8wMmRqMmxzYjZueWZsZ2F5In0._DV-fH37NHdfnpiAm7ME

# GHN
GHN_TOKEN=a7f26326-ce64-11f0-9ca3-9e851f00bd99
GHN_SHOP_ID=6140776
GHN_FROM_DISTRICT_ID=1463
GHN_FROM_WARD_CODE=21809

# Python Service
PYTHON_SERVICE_URl=http://localhost:8001/
```

## Firebase Admin SDK

```bash
sudo nano hermosacoffee-f0a0a-firebase-adminsdk-fbsvc-d019cb125e.json
```

> Dán nội dung file JSON Firebase Admin SDK vào đây.


## Cài đặt Dependencies

```bash
sudo apt install firebase-admin
npm install pm2 -g
npm install
```

## Cấu hình Nginx

### Cài Nginx

```bash
sudo apt install nginx
```

### Tạo file cấu hình

```bash
sudo nano /etc/nginx/sites-available/hermosa.conf
```

```nginx
server {
    listen 80;
    server_name <your_public_ip_address>;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable site

```bash
sudo ln -s /etc/nginx/sites-available/hermosa.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Chạy Backend với PM2

```bash
pm2 start server.js --name "hermosa"
```

## Truy cập hệ thống

```
http://<your_public_ip_address>
```

## Notes

* Backend chạy tại **port 8000**
* Nginx đóng vai trò reverse proxy
* PM2 giúp backend chạy nền và tự restart


# Hermosa Web Admin #
## Prerequisites (Yêu cầu hệ thống)

Để chạy được ứng dụng này, bạn cần:

* **VS Code:** Phiên bản mới nhất.
* **Internet:** Bắt buộc (để kết nối với Server Online).


## Server Information (Thông tin Server)

Backend đã được deploy và đang chạy online, **không cần cài đặt local**.

* **Base URL:** `http://34.151.64.207/`
* **Status:** Online (Active)


## Quick start (local)

### Clone Project

```bash
git clone -b webadmin https://github.com/PhuThuan323/Hermosa.git
```

### Cài đặt & chạy project

Chuyển đến mục Hermosa
```bash
cd Hermosa
```

Cài công cụ quản lý thư viện npm
```bash
npm install
```

Chạy
```bash
npm run dev
```

### Mở giao diện (Nhấn F5 chạy)

Sau khi chạy `npm run dev`, terminal sẽ hiển thị link dạng:

```
http://localhost:8080/
```

👉 Cách chạy:

1. Mở trình duyệt và truy cập link trên
2. **Nhấn F5** để reload trang khi cần


## Pages

* `/login`
* `/dashboard`
* `/orders`
* `/customers`
* `/products`

---

