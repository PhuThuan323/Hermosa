# Hermosa Backend #

Hướng dẫn cài đặt và deploy **Hermosa Backend & Recommendation System** trên **Ubuntu Server**.

## Prerequisites (Yêu cầu hệ thống)

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
git checkout master
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

```hermosacoffee-f0a0a-firebase-adminsdk-fbsvc-d019cb125e.json
{
  "type": "service_account",
  "project_id": "hermosacoffee-f0a0a",
  "private_key_id": "d019cb125e4498936cefb3a90349cc954fa11c5d",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC+B+eejiMMXA1Q\nE+amksS6u/jAr6rI/JuIbh5DhRAZd0hrmwE3QYK3TMudmfk/uijT1/aeEKevP/o2\nX48B84jAhVt5vRRADWt6quxnPLBuf+8/qFu6vLXiv5vuEf9MfnjAP4dDXkK9gMaU\nbkPz6JBKno///5BrgyeaOlpOWZxDzgBdeaG8A4YfsqsJA21xFR6pEIkNk0vIRK4I\n1FhNt5tfOgjcrS58fe1U7CvHcsxS0+TbjDmjaVBr/EilsxMfBPa4Nm1AWGqPBGap\nbu1ju9ut8MW/s2/3fxhpyUi2T2ISXWR5g2F954rM1mUCTzM4x2/aCQPGrCNEsqsK\nnzxgdAWvAgMBAAECggEABDJ5f6uFA6de1edynzg7pyIyttLKc2D88HD6MySTu/RC\nAbptNvK39+N21dbKRgmPEErDVC9q/LhthtjqeDEQUqw/Xnt6IIYLWyy+RvN0tCQY\nPTAzQncbj1QLFiGIoYBjm19r1eWVlMjs2edrkc4Prc49wPo8jttZOxNR3kwlYuv2\nkWgW1miJlFlF+Og3SyJV2qfp4k1JPJSGa2AYMONIO8/9XeOO9FEhB9QAKqpaPiFh\n2fodqsZjgguRlLbtvYp1NBdFfV8SwO2C923eDCUShP3M+FWAzuiAOgiV9ujo0FVs\nIPhNpicee3k3vhaFJYo6hhQfwRYzA9y74M1J77pZkQKBgQD2ghoOzQ06eAdba+Ti\n4vnuNLXtGmB5WVlkNFNFjg0Fx+MBssR2dzGzpCx/naWsfKMBvaskRHzcFDCRuIVk\noOA9DdlB4whrXMtH/Vd8WJKnlG7+1PRNGTuuqP3tUz3kiV3mtXrVPPeBDUaqwFzr\n3iwdWkk+Kvgiy6SRy61Tkac6PwKBgQDFWRcySB61nLrn8Z+ccbKrSHI2ZWr3mMmv\nik90BeIYiWrN4jT4xbP6j2fdNi2HCRqEnJpQubrLz2z8SukoWjTdSyGN79O7owLB\nTWoJqzHtybAeynmbPB6aYfGllEG7kZ9Js1UbErsLrWXzgU2VbO721TuwhmZupMh2\niAuwNfH4kQKBgQD1jI9sYvFkZp/df1JWd4ZCtBrsfjPPbSNQX5b7WA68zWnhDTQK\nVZ0attTkoiKf+N9fIpHR5K8DgtEGtumZXW9BIgRiT0bZu2t64G8/G/OqHn+aNILO\nMe5zgz6+IwcqGXOCFxCuTLa2xIS6HjfxdDQ5YPBIjwDxmCzsVhjnf9U2fQKBgQCz\n87kjMIBQOsp0Fe/lSAgUB8udrn0LqVa/qu8obPTuSuAJPOvwrNag84NSQ8TgDX0Q\nz3wngDTFBC/tHqHdGeR6pbfDJZ18y/gHLAA1MNYmbnMaoKai1v9Q517iDX6i+va0\nzcIdHcdRrpv4nz+PsfV1PptfLC7bVYc2DngaBhbPAQKBgQCMfpzH+3bbwF1AqraO\nnxP+tYFt3xx0isiZz8EFeSG2y1I4dhg6CeD2OXoHoaEhYBYhJaA3rg6PflC0ALlL\nJjV94W69LuWQl0IflY0twP2T0E2pc3Y9txkOp+crNH4n2aT7FBF6QBtzUeo8LOyG\n2UPVavaSGglgwKHBCA7JomKMaQ==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@hermosacoffee-f0a0a.iam.gserviceaccount.com",
  "client_id": "105622209990551923884",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40hermosacoffee-f0a0a.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
```


## Cài đặt Dependencies

```bash
npm install firebase-admin
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

# Python Recommended System #
## Cài đặt môi trường ảo và activate môi trường python ảo 
```bash
git checkout suggestion
sudo apt update
sudo apt install python3 python3-pip python3-venv -y
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
```
## Cài đặt các thư viện cần thiết để chạy được chương trình
```environment
pip install pandas numpy scikit-learn fastapi uvicorn torch tqdm scipy
```
## Tải database từu github large file storage về
```bash
sudo apt install git-lfs -y
git lfs install
git lfs pull
```
## Train dựa trên dữ liệu và bắt đầu một microservice chạy python server
```bash
python recommend.py #Train dữ liệu ban đầu sau đó Ctrl+C để thoát ra và chạy service với pm2
pm2 start recommend.py --name recommend
```
## Note
* Suggestion Model chạy ở port 8001
* Khi viết api đã cho phía nodejs server tự loopback về cổng 8001 với những api liên quan nên không cần cấu hình thêm nginx nữa

---

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

Cách chạy:

1. Mở trình duyệt và truy cập link trên hoặc nhấn F5 trong VS Code
2. **Nhấn F5** để reload trang khi cần


## Pages

* `/login`
* `/dashboard`
* `/orders`
* `/customers`
* `/products`

---

