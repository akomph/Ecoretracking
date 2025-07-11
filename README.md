สวัสดีครับ เข้าใจปัญหาเลยครับ เป็นเรื่องที่เกิดขึ้นได้ปกติครับ

สาเหตุเกิดจากเวลาเราคัดลอกข้อความจากหน้าเว็บโดยตรง เราอาจจะได้ "ข้อความที่จัดรูปแบบแล้ว" (Formatted Text) มาแทนที่จะเป็น "โค้ดต้นฉบับ" (Raw Markdown) ครับ GitHub ต้องการโค้ดต้นฉบับเพื่อจะแสดงผลให้สวยงามเหมือนใน Canvas ครับ

**วิธีแก้ไขที่ถูกต้อง (ง่ายที่สุด):**

1.  **คัดลอกโค้ดต้นฉบับทั้งหมด:** ให้คัดลอกข้อความทั้งหมดในกรอบโค้ดด้านล่างนี้ไปใช้ครับ นี่คือโค้ด Markdown ต้นฉบับจริงๆ

    ````markdown
    # ระบบติดตามผลการสอบภาษาอังกฤษ (English Exam Tracking Dashboard)

    เว็บแอปพลิเคชันสำหรับติดตามและบริหารจัดการผลการสอบภาษาอังกฤษของนักศึกษา ออกแบบมาเพื่อเป็นเครื่องมือสำหรับอาจารย์และสถาบันในการติดตามความคืบหน้าของนักศึกษา, สร้างแรงกระตุ้น, และจัดการข้อมูลอย่างเป็นระบบและปลอดภัย

    ![ภาพหน้าจอของ Dashboard](https://placehold.co/800x450/6366f1/ffffff?text=Exam+Dashboard)

    ---

    ## ✨ คุณสมบัติหลัก (Key Features)

    * **Dashboard แบบเรียลไทม์:** กราฟและสถิติต่างๆ อัปเดตทันทีเมื่อมีการเปลี่ยนแปลงข้อมูล ทำให้เห็นภาพรวมความสำเร็จและจำนวนนักศึกษาที่ยังต้องสอบผ่าน
    * **ระบบ Login แยกบทบาท:**
        * **ผู้ดูแลระบบ (Admin):** มีสิทธิ์เต็มในการจัดการข้อมูลทั้งหมด, ตั้งค่าเป้าหมาย, และ Export ข้อมูล
        * **นักศึกษา (Student):** สามารถลงทะเบียน, เข้าสู่ระบบ, และแก้ไขผลสอบของตนเองได้
    * **การจัดการข้อมูลครบวงจร:**
        * เพิ่ม, แก้ไข, และลบข้อมูลผลสอบ (ตามสิทธิ์ที่กำหนด)
        * รองรับการบันทึกผลสอบจากหลายประเภท (สอบตรง, TOEIC, TOEFL, etc.)
    * **ผู้ช่วย AI (Gemini):** สร้างคำแนะนำและข้อความให้กำลังใจที่เป็นประโยชน์สำหรับนักศึกษาที่ยังสอบไม่ผ่าน
    * **Challenger & Passed Boards:** แสดงรายชื่อนักศึกษาที่ต้องสอบครั้งถัดไปและผู้ที่สอบผ่านแล้วอย่างชัดเจน พร้อมระบบแบ่งหน้า (Pagination) เพื่อการแสดงผลที่มีประสิทธิภาพ
    * **ประวัติการสอบรายบุคคล:** สามารถคลิกดูประวัติการสอบย้อนหลังของนักศึกษาแต่ละคนได้
    * **Export to Excel:** ผู้ดูแลระบบสามารถดาวน์โหลดรายชื่อนักศึกษาทั้งสองกลุ่มเป็นไฟล์ `.csv` ได้

    ---

    ## 🚀 เทคโนโลยีที่ใช้ (Tech Stack)

    * **Frontend:** [React.js](https://reactjs.org/)
    * **Backend & Database:** [Firebase](https://firebase.google.com/) (Authentication, Firestore, Hosting)
    * **Styling:** [Tailwind CSS](https://tailwindcss.com/)
    * **Charts:** [Chart.js](https://www.chartjs.org/)
    * **AI:** [Google Gemini API](https://ai.google.dev/)

    ---

    ## 🛠️ การติดตั้งและตั้งค่า (Setup & Installation)

    ทำตามขั้นตอนต่อไปนี้เพื่อติดตั้งและรันโปรเจกต์บนเครื่องของคุณ

    ### 1. สิ่งที่ต้องมี (Prerequisites)

    * [Node.js](https://nodejs.org/) (เวอร์ชัน LTS)
    * [Git](https://git-scm.com/)

    ### 2. Clone โปรเจกต์

    ```bash
    git clone [https://github.com/akomph/Ecoretracking.git](https://github.com/akomph/Ecoretracking.git)
    cd Ecoretracking
    ````

    ### 3\. ติดตั้ง Dependencies

    ```bash
    npm install
    ```

    ### 4\. ตั้งค่า Firebase

    1.  ไปที่ [Firebase Console](https://console.firebase.google.com/) และสร้างโปรเจกต์ใหม่

    2.  ในหน้า Project Overview, เพิ่มแอปพลิเคชันเว็บ (Web App) ใหม่ (ไอคอน `</>`)

    3.  ทำตามขั้นตอนและคัดลอกอ็อบเจกต์ `firebaseConfig` ที่ระบบสร้างให้

    4.  ในโปรเจกต์ของคุณ, สร้างไฟล์ใหม่ชื่อ `.env` ที่ root directory

    5.  นำ `firebaseConfig` ที่คัดลอกมาไปใส่ในไฟล์ `.env` ในรูปแบบต่อไปนี้:

        ```env
        REACT_APP_FIREBASE_API_KEY="YOUR_API_KEY"
        REACT_APP_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
        REACT_APP_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
        REACT_APP_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
        REACT_APP_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID"
        REACT_APP_FIREBASE_APP_ID="YOUR_APP_ID"
        ```

    6.  **เปิดใช้งานบริการต่างๆ ใน Firebase:**

          * **Authentication:** ไปที่เมนู Authentication \> Sign-in method แล้วเปิดใช้งาน **Email/Password**
          * **Firestore Database:** ไปที่เมนู Firestore Database แล้วกด **Create database** (แนะนำให้เริ่มในโหมด Test)

    7.  **เปิดใช้งาน AI:**

          * ไปที่ [Google Cloud Console](https://www.google.com/search?q=https://console.cloud.google.com/apis/library/vertexai.googleapis.com) (ตรวจสอบให้แน่ใจว่าเลือกโปรเจกต์ที่ถูกต้อง)
          * กด **Enable** ที่ Vertex AI API
          * ตรวจสอบให้แน่ใจว่าโปรเจกต์ของคุณได้ผูกกับ **Billing Account** แล้ว

    ### 5\. แก้ไขโค้ดเพื่อใช้ Environment Variables

    เปิดไฟล์ `src/App.js` แล้วแก้ไขส่วน `firebaseConfig` ให้ดึงค่ามาจากไฟล์ `.env`

    **แทนที่โค้ดส่วนนี้:**

    ```javascript
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        // ...
    };
    ```

    **ด้วยโค้ดนี้:**

    ```javascript
    const firebaseConfig = {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID
    };
    ```

    ### 6\. รันโปรเจกต์

    ```bash
    npm start
    ```

    แอปพลิเคชันจะเปิดขึ้นที่ `http://localhost:3000`

    -----

    ## 👑 การตั้งค่าผู้ดูแลระบบ (Admin Setup)

    ระบบนี้ใช้ **Firebase Custom Claims** เพื่อกำหนดสิทธิ์ผู้ดูแล ซึ่งเป็นวิธีที่ปลอดภัยและเป็นมาตรฐาน คุณต้องกำหนดสิทธิ์นี้ให้กับบัญชีผู้ใช้ที่ต้องการให้เป็น Admin ด้วยตนเองผ่าน **Cloud Functions**

    1.  ติดตั้ง Firebase CLI: `npm install -g firebase-tools`
    2.  Login: `firebase login`
    3.  เริ่มต้น Cloud Functions: `firebase init functions`
    4.  สร้างไฟล์ (เช่น `index.js`) ในโฟลเดอร์ `functions` แล้วใส่โค้ดสำหรับกำหนดสิทธิ์ Admin:
        ```javascript
        const functions = require("firebase-functions");
        const admin = require("firebase-admin");
        admin.initializeApp();

        exports.setAdminRole = functions.https.onCall((data, context) => {
          // ตรวจสอบว่าผู้เรียกใช้เป็น Admin อยู่แล้วหรือไม่ (เพื่อความปลอดภัย)
          if (context.auth.token.admin !== true) {
            return { error: "Only admins can add other admins." };
          }
          // กำหนด custom claim 'admin' ให้กับอีเมลที่ระบุ
          return admin.auth().getUserByEmail(data.email).then(user => {
            return admin.auth().setCustomUserClaims(user.uid, {
              admin: true
            });
          }).then(() => {
            return { message: `Success! ${data.email} has been made an admin.` };
          }).catch(err => {
            return err;
          });
        });
        ```
    5.  Deploy Function: `firebase deploy --only functions`
    6.  หลังจากนั้นคุณสามารถเรียกใช้ฟังก์ชันนี้เพื่อกำหนดสิทธิ์ให้กับอีเมลที่ต้องการได้

    -----

    ## ☁️ การนำไปใช้งานจริง (Deployment)

    แนะนำให้ใช้บริการ **Netlify** หรือ **Vercel** เพื่อความสะดวก

    1.  นำโปรเจกต์ของคุณขึ้น **GitHub**
    2.  ลงชื่อเข้าใช้ Netlify/Vercel แล้วเลือก **Import Project** จาก GitHub
    3.  เลือก Repository ของคุณ
    4.  **ตั้งค่า Environment Variables:** ในหน้าตั้งค่าของโปรเจกต์บน Netlify/Vercel ให้เพิ่มค่า `firebaseConfig` ทั้งหมดที่คุณตั้งไว้ในไฟล์ `.env`
    5.  กด **Deploy** ระบบจะทำการ Build และเผยแพร่เว็บไซต์ให้โดยอัตโนมัติ

    <!-- end list -->

    ```
    
    ```

2.  **นำไปวางใน GitHub:**

      * ไปที่หน้า Repository ของคุณใน GitHub
      * คลิกที่ไฟล์ `README.md`
      * คลิกที่ไอคอนรูปดินสอ (✏️) ที่มุมขวาเพื่อแก้ไขไฟล์
      * ลบเนื้อหาเก่าทิ้งทั้งหมด แล้ววางโค้ดใหม่ที่คุณคัดลอกมาลงไป
      * เลื่อนลงมาด้านล่างแล้วกดปุ่มสีเขียว **Commit changes**

เพียงเท่านี้ ไฟล์ `README.md` ของคุณบน GitHub ก็จะแสดงผลสวยงามเหมือนกับใน Canvas แล้วครับ\!
