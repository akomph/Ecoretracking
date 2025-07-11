<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard ติดตามผลการสอบภาษาอังกฤษ</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: 'Sarabun', sans-serif; background-color: #f1f5f9; }
        .card { background-color: white; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); transition: all 0.3s ease; }
        .btn { padding: 0.6rem 1.5rem; border-radius: 0.5rem; font-weight: 600; transition: all 0.2s ease-in-out; display: inline-flex; align-items: center; justify-content: center; }
        .btn-primary { background-color: #4f46e5; color: white; }
        .btn-primary:hover { background-color: #4338ca; }
        .btn-primary:disabled { background-color: #a5b4fc; cursor: not-allowed; }
        .btn-secondary { background-color: #e2e8f0; color: #475569; }
        .btn-secondary:hover { background-color: #cbd5e1; }
        .modal-backdrop { position: fixed; inset: 0; background-color: rgba(15, 23, 42, 0.5); display: flex; justify-content: center; align-items: center; z-index: 50; -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
        .modal-content { background-color: white; padding: 2rem; border-radius: 0.75rem; width: 90%; max-width: 500px; }
        .loader { width: 24px; height: 24px; border: 4px solid #f3f3f3; border-top: 4px solid #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body class="antialiased">

    <!-- Loading Screen -->
    <div id="loading-screen" class="min-h-screen flex items-center justify-center bg-slate-100">
        <div class="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Auth Screen -->
    <div id="auth-screen" class="min-h-screen hidden items-center justify-center bg-slate-100 p-4">
        <div class="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
            <h2 id="auth-title" class="text-3xl font-bold text-center text-gray-800 mb-6">เข้าสู่ระบบ</h2>
            <form id="auth-form">
                <div id="student-id-field" class="mb-4 hidden">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="auth-student-id">รหัสนักศึกษา</label>
                    <input type="text" id="auth-student-id" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required/>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="auth-email">อีเมล</label>
                    <input type="email" id="auth-email" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required/>
                </div>
                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="auth-password">รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)</label>
                    <input type="password" id="auth-password" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required/>
                </div>
                <p id="auth-error" class="text-red-500 text-xs italic mb-4 hidden"></p>
                <button id="auth-submit-btn" type="submit" class="w-full btn btn-primary h-10">เข้าสู่ระบบ</button>
            </form>
            <p class="text-center text-gray-600 text-sm mt-6">
                <span id="auth-toggle-text">ยังไม่มีบัญชี?</span>
                <button id="auth-toggle-btn" class="text-indigo-600 hover:underline ml-1 font-semibold">ลงทะเบียนที่นี่</button>
            </p>
        </div>
    </div>

    <!-- Dashboard Screen -->
    <div id="dashboard-screen" class="hidden">
        <div class="container mx-auto p-4 md:p-8">
            <header class="text-center mb-8 relative">
                <h1 class="text-3xl md:text-4xl font-bold text-gray-800">Dashboard ติดตามผลการสอบภาษาอังกฤษ</h1>
                <div class="absolute top-0 right-0 flex items-center gap-4">
                    <div class="text-right">
                        <p id="user-email" class="text-sm text-gray-700 font-semibold"></p>
                        <p id="user-role" class="text-xs text-gray-500"></p>
                    </div>
                    <button id="logout-btn" class="btn btn-secondary text-sm">ออกจากระบบ</button>
                </div>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="card text-center"><h2 class="text-lg font-semibold text-gray-500">เป้าหมายทั้งหมด (คน)</h2><p id="total-target" class="text-4xl font-bold text-indigo-600 mt-2">0</p><div id="set-target-container" class="mt-2 hidden"><label for="set-target" class="text-sm text-gray-600">ตั้งค่าเป้าหมาย:</label><input type="number" id="set-target" class="mt-1 w-24 text-center border-gray-300 rounded-md shadow-sm"/></div></div>
                <div class="card text-center"><h2 class="text-lg font-semibold text-gray-500">สอบผ่านแล้ว (คน)</h2><p id="total-passed" class="text-4xl font-bold text-green-600 mt-2">0</p></div>
                <div class="card text-center"><h2 class="text-lg font-semibold text-gray-500">เหลืออีก (คน)</h2><p id="total-remaining" class="text-4xl font-bold text-red-600 mt-2">0</p></div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                <div class="lg:col-span-2 card"><h3 class="text-xl font-bold text-gray-800 mb-4 text-center">ภาพรวมความสำเร็จ</h3><div class="h-64 md:h-72 flex items-center justify-center"><canvas id="progress-chart"></canvas></div></div>
                <div class="lg:col-span-3 card"><h3 class="text-xl font-bold text-gray-800 mb-4 text-center">การกระจายของคะแนน (สอบตรง)</h3><div class="h-64 md:h-72 flex items-center justify-center"><canvas id="score-distribution-chart"></canvas></div></div>
            </div>
            
            <div class="flex justify-end items-center mb-6">
                 <button id="add-record-btn" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" /></svg>เพิ่ม/แก้ไข ผลการสอบ</button>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="card border-2 border-red-200 bg-red-50"><h3 class="text-xl font-bold text-red-800 mb-4">รายชื่อผู้ที่ต้องสอบครั้งถัดไป</h3><div id="challenger-list-container" class="overflow-y-auto max-h-96"></div></div>
                <div class="card border-2 border-green-200 bg-green-50"><h3 class="text-xl font-bold text-green-800 mb-4">รายชื่อผู้ที่สอบผ่านแล้ว</h3><div id="passed-list-container" class="overflow-y-auto max-h-96"></div></div>
            </div>
        </div>
    </div>
    
    <!-- Modals -->
    <div id="add-edit-modal" class="modal-backdrop hidden"></div>

    <script type="module">
        // --- Firebase Imports ---
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp, orderBy, doc, deleteDoc, setDoc, getDoc, updateDoc, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // --- Firebase Configuration ---
        const firebaseConfig = {
            apiKey: "AIzaSyD7lJNxZ1EZCjtWwO6Vu9Owr68rQZStgbc",
            authDomain: "englishtracking-7aa69.firebaseapp.com",
            projectId: "englishtracking-7aa69",
            storageBucket: "englishtracking-7aa69.firebasestorage.app",
            messagingSenderId: "643772647805",
            appId: "1:643772647805:web:a5b57076e20fed5aede414",
            
        };
        
        // --- Initialize Firebase ---
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        // --- Collections ---
        const dataCollectionName = `exam_results_v4`;
        const configCollectionName = `config_v4`;
        const usersCollectionName = `users_v4`;

        // --- Global State ---
        let allRecords = [];
        let config = { totalTarget: 150 };
        let currentUser = null;
        let isAdmin = false;
        let userProfile = null;
        let progressChart = null;
        let scoreDistributionChart = null;

        // --- DOM Elements ---
        const loadingScreen = document.getElementById('loading-screen');
        const authScreen = document.getElementById('auth-screen');
        const dashboardScreen = document.getElementById('dashboard-screen');
        
        // --- Main App Logic ---
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUser = user;
                const roleDocRef = doc(db, 'roles', user.email);
                const userDocRef = doc(db, usersCollectionName, user.uid);
                const [roleDocSnap, userDocSnap] = await Promise.all([getDoc(roleDocRef), getDoc(userDocRef)]);
                
                isAdmin = roleDocSnap.exists() && roleDocSnap.data().isAdmin === true;
                userProfile = userDocSnap.exists() ? userDocSnap.data() : null;

                document.getElementById('user-email').textContent = user.email;
                document.getElementById('user-role').textContent = isAdmin ? 'ผู้ดูแลระบบ' : `นักศึกษา: ${userProfile?.studentId || ''}`;
                
                authScreen.classList.add('hidden');
                dashboardScreen.classList.remove('hidden');
                loadingScreen.classList.add('hidden');
                
                initializeDashboard();
            } else {
                currentUser = null;
                isAdmin = false;
                userProfile = null;
                authScreen.classList.remove('hidden');
                dashboardScreen.classList.add('hidden');
                loadingScreen.classList.add('hidden');
                setupAuthEventListeners();
            }
        });

        function initializeDashboard() {
            listenForExamResults();
            listenForConfig();
            setupDashboardEventListeners();
        }

        // --- Data Listeners ---
        function listenForExamResults() {
            const q = query(collection(db, dataCollectionName), orderBy("timestamp", "desc"));
            onSnapshot(q, (snapshot) => {
                allRecords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderDashboard();
            });
        }

        function listenForConfig() {
            const configDocRef = doc(db, configCollectionName, "settings");
            onSnapshot(configDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    config = docSnap.data();
                } else {
                    setDoc(configDocRef, { totalTarget: 150 });
                }
                renderDashboard();
            });
        }

        // --- Rendering Logic ---
        function renderDashboard() {
            const passedStudentsSet = new Set();
            allRecords.forEach(record => {
                if (record.status === 'ผ่าน') passedStudentsSet.add(record.studentId);
            });
            const passedCount = passedStudentsSet.size;
            const remainingCount = Math.max(0, config.totalTarget - passedCount);

            document.getElementById('total-target').textContent = config.totalTarget;
            document.getElementById('set-target').value = config.totalTarget;
            document.getElementById('total-passed').textContent = passedCount;
            document.getElementById('total-remaining').textContent = remainingCount;

            const allStudentsMap = new Map();
            allRecords.forEach(record => {
                if (!allStudentsMap.has(record.studentId)) allStudentsMap.set(record.studentId, record);
            });
            const challengers = Array.from(allStudentsMap.values()).filter(s => !passedStudentsSet.has(s.studentId));
            const sortedChallengers = challengers.sort((a, b) => a.studentId.localeCompare(b.studentId));
            const passed = Array.from(allStudentsMap.values()).filter(s => passedStudentsSet.has(s.studentId));
            const sortedPassedStudents = passed.sort((a, b) => a.studentId.localeCompare(b.studentId));
            
            renderStudentList('challenger-list-container', sortedChallengers, 'challenger');
            renderStudentList('passed-list-container', sortedPassedStudents, 'passed');
            
            renderProgressChart(passedCount, remainingCount);
            renderScoreDistributionChart();

            document.getElementById('set-target-container').classList.toggle('hidden', !isAdmin);
        }

        function renderProgressChart(passed, remaining) {
            const ctx = document.getElementById('progress-chart').getContext('2d');
            const data = {
                labels: ['สอบผ่านแล้ว', 'เหลืออีก'],
                datasets: [{
                    data: [passed, remaining > 0 ? remaining : 0],
                    backgroundColor: ['#10B981', '#EF4444'],
                    hoverBackgroundColor: ['#059669', '#DC2626'],
                    borderColor: '#f1f5f9',
                    borderWidth: 4
                }]
            };
            if (progressChart) progressChart.destroy();
            progressChart = new Chart(ctx, { type: 'doughnut', data, options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' } } } });
        }

        function renderScoreDistributionChart() {
            const ctx = document.getElementById('score-distribution-chart').getContext('2d');
            const scoreRanges = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
            const directExamRecords = allRecords.filter(r => (r.examType || 'สอบตรง') === 'สอบตรง');
            directExamRecords.forEach(record => {
                const score = record.score;
                if (score <= 20) scoreRanges['0-20']++;
                else if (score <= 40) scoreRanges['21-40']++;
                else if (score <= 60) scoreRanges['41-60']++;
                else if (score <= 80) scoreRanges['61-80']++;
                else scoreRanges['81-100']++;
            });
            const data = {
                labels: Object.keys(scoreRanges),
                datasets: [{
                    label: 'จำนวนนักศึกษา',
                    data: Object.values(scoreRanges),
                    backgroundColor: 'rgba(99, 102, 241, 0.6)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 1,
                    borderRadius: 5
                }]
            };
            if (scoreDistributionChart) scoreDistributionChart.destroy();
            scoreDistributionChart = new Chart(ctx, { type: 'bar', data, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }, plugins: { legend: { display: false } } } });
        }
        
        function renderStudentList(containerId, students, type) {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            if (students.length === 0) {
                const message = type === 'challenger' ? 'ไม่มีนักศึกษาที่ต้องสอบ (ทุกคนผ่านหมดแล้ว!)' : 'ยังไม่มีนักศึกษาที่สอบผ่าน';
                container.innerHTML = `<p class="text-gray-500 text-center p-4">${message}</p>`;
                return;
            }
            const list = document.createElement('ul');
            list.className = 'divide-y divide-gray-200';
            students.forEach(student => {
                const li = document.createElement('li');
                li.className = 'p-3 flex justify-between items-center';
                const examType = student.examType || 'สอบตรง';
                const badgeColor = examType === 'สอบตรง' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
                li.innerHTML = `
                    <div>
                        <p class="font-medium text-gray-900">${student.firstName} ${student.lastName}</p>
                        <p class="text-sm text-gray-500">${student.studentId}</p>
                    </div>
                    ${type === 'passed' ? `<span class="text-xs font-semibold px-2 py-1 rounded-full ${badgeColor}">${examType}</span>` : ''}
                `;
                if (isAdmin) {
                    const editBtn = document.createElement('button');
                    editBtn.className = 'p-1 text-blue-500 hover:text-blue-700';
                    editBtn.title = 'แก้ไข';
                    editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>`;
                    editBtn.onclick = () => openAddEditModal(student);
                    li.appendChild(editBtn);
                }
                list.appendChild(li);
            });
            container.appendChild(list);
        }

        // --- Event Handlers ---
        function setupAuthEventListeners() {
            document.getElementById('auth-form').onsubmit = handleAuthSubmit;
            document.getElementById('auth-toggle-btn').onclick = toggleAuthMode;
        }

        function setupDashboardEventListeners() {
            document.getElementById('logout-btn').onclick = () => signOut(auth);
            document.getElementById('add-record-btn').onclick = openAddEditModal;
            document.getElementById('set-target').onchange = handleTargetChange;
        }

        async function handleAuthSubmit(e) {
            e.preventDefault();
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;
            const studentIdField = document.getElementById('student-id-field');
            const studentId = document.getElementById('auth-student-id').value;
            const errorEl = document.getElementById('auth-error');
            const submitBtn = document.getElementById('auth-submit-btn');

            submitBtn.disabled = true;
            submitBtn.innerHTML = `<div class="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>`;
            errorEl.classList.add('hidden');

            try {
                if (studentIdField.classList.contains('hidden')) { // Login mode
                    await signInWithEmailAndPassword(auth, email, password);
                } else { // Register mode
                    if (!studentId) throw new Error("กรุณากรอกรหัสนักศึกษา");
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    await setDoc(doc(db, usersCollectionName, userCredential.user.uid), {
                        uid: userCredential.user.uid,
                        email: userCredential.user.email,
                        studentId: studentId,
                        createdAt: serverTimestamp()
                    });
                }
            } catch (err) {
                errorEl.textContent = err.message.replace('Firebase: Error ', '').replace(/\(auth\/.*\)\.?/, '');
                errorEl.classList.remove('hidden');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = studentIdField.classList.contains('hidden') ? 'เข้าสู่ระบบ' : 'ลงทะเบียน';
            }
        }

        function toggleAuthMode() {
            const isLogin = document.getElementById('student-id-field').classList.toggle('hidden');
            document.getElementById('auth-title').textContent = isLogin ? 'เข้าสู่ระบบ' : 'ลงทะเบียน';
            document.getElementById('auth-submit-btn').textContent = isLogin ? 'เข้าสู่ระบบ' : 'ลงทะเบียน';
            document.getElementById('auth-toggle-text').textContent = isLogin ? 'ยังไม่มีบัญชี?' : 'มีบัญชีอยู่แล้ว?';
            document.getElementById('auth-toggle-btn').textContent = isLogin ? 'ลงทะเบียนที่นี่' : 'เข้าสู่ระบบที่นี่';
            document.getElementById('auth-error').classList.add('hidden');
        }

        async function handleTargetChange(e) {
            const newTarget = parseInt(e.target.value, 10);
            if (!isNaN(newTarget) && newTarget >= 0) {
                const configDocRef = doc(db, configCollectionName, "settings");
                await setDoc(configDocRef, { totalTarget: newTarget });
            }
        }
        
        function openAddEditModal(record = null) {
            const modalContainer = document.getElementById('add-edit-modal');
            const isEdit = !!record;
            
            const initialData = isEdit ? record : {
                studentId: isAdmin ? '' : userProfile?.studentId || '',
                firstName: '', lastName: '',
                examDate: new Date().toISOString().split('T')[0],
                examType: 'สอบตรง', status: 'ไม่ผ่าน', score: ''
            };

            modalContainer.innerHTML = `
                <div class="modal-content">
                    <h2 class="text-2xl font-bold mb-6">${isEdit ? 'แก้ไขผลการสอบ' : (isAdmin ? 'เพิ่มผลการสอบ' : 'เพิ่ม/แก้ไขผลการสอบ')}</h2>
                    <form id="record-form">
                        <div class="mb-4">
                            <label for="form-studentId" class="block text-sm font-medium text-gray-700">รหัสนักศึกษา</label>
                            <input type="text" id="form-studentId" value="${initialData.studentId || ''}" required ${!isAdmin ? 'disabled' : ''} class="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label for="form-firstName" class="block text-sm font-medium text-gray-700">ชื่อ</label>
                                <input type="text" id="form-firstName" value="${initialData.firstName || ''}" required ${!isAdmin} class="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
                            </div>
                            <div>
                                <label for="form-lastName" class="block text-sm font-medium text-gray-700">นามสกุล</label>
                                <input type="text" id="form-lastName" value="${initialData.lastName || ''}" required ${!isAdmin} class="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div><label for="form-examDate" class="block text-sm font-medium text-gray-700">วันที่สอบ</label><input type="date" id="form-examDate" value="${initialData.examDate || ''}" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/></div>
                            <div><label for="form-score" class="block text-sm font-medium text-gray-700">คะแนนที่ได้</label><input type="number" id="form-score" value="${initialData.score || ''}" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/></div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div><label for="form-examType" class="block text-sm font-medium text-gray-700">ประเภทการสอบ</label><select id="form-examType" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"><option>สอบตรง</option><option>TOEIC</option><option>TOEFL</option><option>CU-TEP</option><option>TU-GET</option><option>TOEFL ITP</option><option>อื่นๆ</option></select></div>
                            <div><label for="form-status" class="block text-sm font-medium text-gray-700">สถานะการสอบ</label><select id="form-status" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"><option>ผ่าน</option><option>ไม่ผ่าน</option></select></div>
                        </div>
                        <div class="flex justify-end gap-4">
                            <button type="button" id="form-cancel-btn" class="btn btn-secondary">ยกเลิก</button>
                            <button type="submit" id="form-submit-btn" class="btn btn-primary">บันทึกข้อมูล</button>
                        </div>
                    </form>
                </div>
            `;
            
            document.getElementById('form-examType').value = initialData.examType || 'สอบตรง';
            document.getElementById('form-status').value = initialData.status || 'ไม่ผ่าน';

            modalContainer.classList.remove('hidden');
            
            document.getElementById('form-cancel-btn').onclick = () => modalContainer.classList.add('hidden');
            document.getElementById('record-form').onsubmit = async (e) => {
                e.preventDefault();
                const submitBtn = document.getElementById('form-submit-btn');
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<div class="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>`;

                const formData = {
                    studentId: document.getElementById('form-studentId').value,
                    firstName: document.getElementById('form-firstName').value,
                    lastName: document.getElementById('form-lastName').value,
                    examDate: document.getElementById('form-examDate').value,
                    examType: document.getElementById('form-examType').value,
                    status: document.getElementById('form-status').value,
                    score: Number(document.getElementById('form-score').value),
                    timestamp: serverTimestamp()
                };

                try {
                    let docToUpdateRef;
                    if (isEdit) {
                        docToUpdateRef = doc(db, dataCollectionName, record.id);
                    } else {
                        const q = query(collection(db, dataCollectionName), where("studentId", "==", formData.studentId));
                        const existingDocs = await getDocs(q);
                        if (!existingDocs.empty) {
                            docToUpdateRef = existingDocs.docs[0].ref;
                        }
                    }

                    if (docToUpdateRef) {
                        await updateDoc(docToUpdateRef, formData);
                    } else {
                        await addDoc(collection(db, dataCollectionName), formData);
                    }
                } catch (err) {
                    console.error("Error saving record:", err);
                } finally {
                    modalContainer.classList.add('hidden');
                }
            };
        }
    </script>
</body>
</html>
