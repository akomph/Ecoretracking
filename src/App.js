import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut 
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    serverTimestamp, 
    orderBy, 
    doc, 
    deleteDoc, 
    setDoc, 
    getDoc, 
    updateDoc 
} from 'firebase/firestore';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// --- Firebase Configuration ---
// <<! ------------------------------------------------------------------ !>>
// <<! สำคัญ: เมื่อนำไปใช้งานจริง ให้แทนที่ Block นี้ทั้งหมดด้วย          !>>
// <<! firebaseConfig จากโปรเจกต์ของคุณเองใน Firebase                    !>>
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
// <<! ------------------------------------------------------------------ !>>

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Collections ---
const dataCollectionName = `exam_results_รุ่น30`;
const configCollectionName = `config_รุ่น30`;

// --- Helper Components ---

const Spinner = () => (
    <div className="flex justify-center items-center p-4">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
);

const Modal = ({ children, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

// --- Authentication Components ---

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                // For registration, you might want to add more fields
                // and logic to store user info in Firestore.
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    {isLogin ? 'เข้าสู่ระบบ' : 'ลงทะเบียน'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            อีเมล
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            รหัสผ่าน
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:bg-gray-400"
                    >
                        {loading ? 'กำลังดำเนินการ...' : (isLogin ? 'เข้าสู่ระบบ' : 'ลงทะเบียน')}
                    </button>
                </form>
                <p className="text-center text-gray-600 text-sm mt-6">
                    {isLogin ? 'ยังไม่มีบัญชี?' : 'มีบัญชีอยู่แล้ว?'}
                    <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline ml-1 font-semibold">
                        {isLogin ? 'ลงทะเบียนที่นี่' : 'เข้าสู่ระบบที่นี่'}
                    </button>
                </p>
            </div>
        </div>
    );
};


// --- Main App ---
export default function App() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const idTokenResult = await currentUser.getIdTokenResult();
                setUser(currentUser);
                setIsAdmin(!!idTokenResult.claims.admin);
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
    }

    return user ? <Dashboard user={user} isAdmin={isAdmin} /> : <AuthPage />;
}

// --- Dashboard Component ---
function Dashboard({ user, isAdmin }) {
    const [allRecords, setAllRecords] = useState([]);
    const [config, setConfig] = useState({ totalTarget: 150 });
    
    // States for modals
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    
    // States for data to be acted upon
    const [recordToEdit, setRecordToEdit] = useState(null);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [profileStudentId, setProfileStudentId] = useState(null);

    useEffect(() => {
        // Listen for exam results
        const q = query(collection(db, dataCollectionName), orderBy("timestamp", "desc"));
        const unsubscribeRecords = onSnapshot(q, (snapshot) => {
            const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllRecords(records);
        });

        // Listen for config
        const configDocRef = doc(db, configCollectionName, "settings");
        const unsubscribeConfig = onSnapshot(configDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setConfig(docSnap.data());
            } else {
                setDoc(configDocRef, { totalTarget: 150 }); // Create if not exists
            }
        });

        return () => {
            unsubscribeRecords();
            unsubscribeConfig();
        };
    }, []);

    const { passedCount, remainingCount, sortedChallengers, sortedPassedStudents } = useMemo(() => {
        const passedStudentsSet = new Set();
        allRecords.forEach(record => {
            if (record.status === 'ผ่าน') {
                passedStudentsSet.add(record.studentId);
            }
        });

        const passedCount = passedStudentsSet.size;
        const remainingCount = Math.max(0, config.totalTarget - passedCount);

        const allStudentsMap = new Map();
        allRecords.forEach(record => {
            if (!allStudentsMap.has(record.studentId)) {
                allStudentsMap.set(record.studentId, record);
            }
        });

        const challengers = Array.from(allStudentsMap.values()).filter(s => !passedStudentsSet.has(s.studentId));
        const sortedChallengers = challengers.sort((a, b) => a.studentId.localeCompare(b.studentId));
        
        const passed = Array.from(allStudentsMap.values()).filter(s => passedStudentsSet.has(s.studentId));
        const sortedPassedStudents = passed.sort((a, b) => a.studentId.localeCompare(b.studentId));

        return { passedCount, remainingCount, sortedChallengers, sortedPassedStudents };
    }, [allRecords, config.totalTarget]);

    const handleOpenAddModal = () => {
        setRecordToEdit(null);
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = (record) => {
        setRecordToEdit(record);
        setIsAddEditModalOpen(true);
    };

    const handleOpenDeleteModal = (record) => {
        setRecordToDelete(record);
        setIsDeleteModalOpen(true);
    };
    
    const handleOpenProfileModal = (studentId) => {
        setProfileStudentId(studentId);
        setIsProfileModalOpen(true);
    };
    
    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="text-center mb-8 relative">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Dashboard ติดตามผลการสอบภาษาอังกฤษ</h1>
                <div className="absolute top-0 right-0 flex items-center gap-4">
                    <span className="text-sm text-gray-600">{user.email} {isAdmin && <span className="font-bold text-purple-600">(Admin)</span>}</span>
                    <button onClick={() => signOut(auth)} className="text-sm bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600">
                        ออกจากระบบ
                    </button>
                </div>
            </header>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MetricCard title="เป้าหมายทั้งหมด (คน)" value={config.totalTarget} color="text-blue-600">
                    {isAdmin && <AdminTargetSetter currentTarget={config.totalTarget} />}
                </MetricCard>
                <MetricCard title="สอบผ่านแล้ว (คน)" value={passedCount} color="text-green-600" />
                <MetricCard title="เหลืออีก (คน)" value={remainingCount} color="text-red-600" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                <div className="lg:col-span-2 card">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">ภาพรวมความสำเร็จ</h3>
                    <div className="h-64 md:h-72 flex items-center justify-center">
                        <Doughnut data={{
                            labels: ['สอบผ่านแล้ว', 'เหลืออีก'],
                            datasets: [{
                                data: [passedCount, remainingCount > 0 ? remainingCount : 0],
                                backgroundColor: ['#10B981', '#EF4444'],
                                hoverBackgroundColor: ['#059669', '#DC2626'],
                                borderColor: '#ffffff',
                                borderWidth: 4
                            }]
                        }} options={{ responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                </div>
                <div className="lg:col-span-3 card">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">การกระจายของคะแนน (สอบตรง)</h3>
                    <div className="h-64 md:h-72 flex items-center justify-center">
                        <ScoreDistributionChart records={allRecords} />
                    </div>
                </div>
            </div>

            {/* Search and Add Button */}
            <div className="flex justify-end items-center mb-6">
                 <button onClick={handleOpenAddModal} className="btn-primary">
                    เพิ่มผลการสอบ
                </button>
            </div>
            
            {/* Student Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <StudentList 
                    title="รายชื่อผู้ที่ต้องสอบครั้งถัดไป" 
                    students={sortedChallengers} 
                    isAdmin={isAdmin}
                    onProfileClick={handleOpenProfileModal}
                    listType="challenger"
                />
                <StudentList 
                    title="รายชื่อผู้ที่สอบผ่านแล้ว" 
                    students={sortedPassedStudents} 
                    isAdmin={isAdmin}
                    onProfileClick={handleOpenProfileModal}
                    listType="passed"
                />
            </div>

            {/* Modals */}
            <AddEditRecordModal 
                isOpen={isAddEditModalOpen}
                onClose={() => setIsAddEditModalOpen(false)}
                recordToEdit={recordToEdit}
                isAdmin={isAdmin}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                recordToDelete={recordToDelete}
            />
            <StudentProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                studentId={profileStudentId}
                allRecords={allRecords}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                isAdmin={isAdmin}
            />

        </div>
    );
}

// --- Child Components ---

const MetricCard = ({ title, value, color, children }) => (
    <div className="card text-center">
        <h2 className="text-lg font-semibold text-gray-500">{title}</h2>
        <p className={`text-4xl font-bold ${color} mt-2`}>{value}</p>
        {children}
    </div>
);

const AdminTargetSetter = ({ currentTarget }) => {
    const [target, setTarget] = useState(currentTarget);

    useEffect(() => {
        setTarget(currentTarget);
    }, [currentTarget]);

    const handleTargetChange = async (e) => {
        const newTarget = parseInt(e.target.value, 10);
        setTarget(newTarget);
        if (!isNaN(newTarget) && newTarget >= 0) {
            const configDocRef = doc(db, configCollectionName, "settings");
            await setDoc(configDocRef, { totalTarget: newTarget });
        }
    };

    return (
        <div className="mt-2">
            <label className="text-sm text-gray-600">ตั้งค่าเป้าหมาย:</label>
            <input 
                type="number" 
                value={target}
                onChange={handleTargetChange}
                className="mt-1 w-24 text-center border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
        </div>
    );
};

const ScoreDistributionChart = ({ records }) => {
    const data = useMemo(() => {
        const scoreRanges = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
        const directExamRecords = records.filter(r => (r.examType || 'สอบตรง') === 'สอบตรง');
        directExamRecords.forEach(record => {
            const score = record.score;
            if (score <= 20) scoreRanges['0-20']++;
            else if (score <= 40) scoreRanges['21-40']++;
            else if (score <= 60) scoreRanges['41-60']++;
            else if (score <= 80) scoreRanges['61-80']++;
            else scoreRanges['81-100']++;
        });
        return {
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
    }, [records]);

    return <Bar data={data} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }, plugins: { legend: { display: false } } }} />;
};

const StudentList = ({ title, students, isAdmin, onProfileClick, listType }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 50;
    const totalPages = Math.ceil(students.length / PAGE_SIZE);
    const paginatedStudents = students.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    useEffect(() => {
        setCurrentPage(1); // Reset page when student list changes
    }, [students]);
    
    const cardClass = listType === 'challenger' 
        ? "border-2 border-red-200 bg-red-50" 
        : "border-2 border-green-200 bg-green-50";
    const titleClass = listType === 'challenger' ? "text-red-800" : "text-green-800";

    return (
        <div className={`card ${cardClass}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold ${titleClass}`}>{title}</h3>
                {/* Export button can be added here if needed */}
            </div>
            <div className="overflow-y-auto max-h-96">
                {students.length === 0 ? (
                    <p className="text-gray-500 text-center p-4">ไม่มีข้อมูล</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {paginatedStudents.map(student => (
                            <li key={student.id} onClick={() => onProfileClick(student.studentId)} className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100">
                                <div>
                                    <p className="font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                                    <p className="text-sm text-gray-500">{student.studentId}</p>
                                </div>
                                {listType === 'passed' && <span className="badge bg-purple-100 text-purple-800">{student.examType || 'สอบตรง'}</span>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {totalPages > 1 && (
                <div className="mt-4 flex justify-between items-center text-sm">
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="btn-pagination">ก่อนหน้า</button>
                    <span>หน้า {currentPage} จาก {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="btn-pagination">ถัดไป</button>
                </div>
            )}
        </div>
    );
};

const AddEditRecordModal = ({ isOpen, onClose, recordToEdit, isAdmin }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (recordToEdit) {
            setFormData(recordToEdit);
        } else {
            setFormData({
                studentId: '',
                firstName: '',
                lastName: '',
                examDate: new Date().toISOString().split('T')[0],
                examType: 'สอบตรง',
                status: 'ไม่ผ่าน',
                score: ''
            });
        }
    }, [recordToEdit, isOpen]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const dataToSave = { ...formData, score: Number(formData.score), timestamp: serverTimestamp() };
        
        try {
            if (recordToEdit) {
                const docRef = doc(db, dataCollectionName, recordToEdit.id);
                await updateDoc(docRef, dataToSave);
            } else {
                await addDoc(collection(db, dataCollectionName), dataToSave);
            }
            onClose();
        } catch (err) {
            console.error("Error saving record:", err);
            // You can add user-facing error message here
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold mb-6">{recordToEdit ? 'แก้ไขผลการสอบ' : 'เพิ่มผลการสอบ'}</h2>
            <form onSubmit={handleSubmit}>
                {/* Form fields here, similar to the previous HTML version */}
                <div className="mb-4">
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">รหัสนักศึกษา</label>
                    <input type="text" id="studentId" value={formData.studentId || ''} onChange={handleChange} required disabled={!!recordToEdit} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">ชื่อ</label>
                        <input type="text" id="firstName" value={formData.firstName || ''} onChange={handleChange} required disabled={!!recordToEdit && !isAdmin} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">นามสกุล</label>
                        <input type="text" id="lastName" value={formData.lastName || ''} onChange={handleChange} required disabled={!!recordToEdit && !isAdmin} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label htmlFor="examDate" className="block text-sm font-medium text-gray-700">วันที่สอบ</label>
                        <input type="date" id="examDate" value={formData.examDate || ''} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                     <div>
                        <label htmlFor="score" className="block text-sm font-medium text-gray-700">คะแนนที่ได้</label>
                        <input type="number" id="score" value={formData.score || ''} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label htmlFor="examType" className="block text-sm font-medium text-gray-700">ประเภทการสอบ</label>
                        <select id="examType" value={formData.examType || 'สอบตรง'} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                            <option>สอบตรง</option>
                            <option>TOEIC</option>
                            <option>TOEFL</option>
                            <option>CU-TEP</option>
                            <option>TU-GET</option>
                            <option>TOEFL ITP</option>
                            <option>อื่นๆ</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">สถานะการสอบ</label>
                        <select id="status" value={formData.status || 'ไม่ผ่าน'} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                            <option>ผ่าน</option>
                            <option>ไม่ผ่าน</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">ยกเลิก</button>
                    <button type="submit" disabled={loading} className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                        {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const DeleteConfirmationModal = ({ isOpen, onClose, recordToDelete }) => {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!recordToDelete) return;
        setLoading(true);
        try {
            await deleteDoc(doc(db, dataCollectionName, recordToDelete.id));
            onClose();
        } catch (err) {
            console.error("Error deleting record:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="text-center">
                <h2 className="text-2xl font-bold mt-4 mb-2">ยืนยันการลบข้อมูล</h2>
                <p className="text-gray-600 mb-6">คุณแน่ใจหรือไม่ว่าต้องการลบผลการสอบนี้? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onClose} disabled={loading} className="py-2 px-6 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">ยกเลิก</button>
                    <button onClick={handleDelete} disabled={loading} className="py-2 px-6 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400">
                        {loading ? 'กำลังลบ...' : 'ยืนยันการลบ'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const StudentProfileModal = ({ isOpen, onClose, studentId, allRecords, onEdit, onDelete, isAdmin }) => {
    const studentHistory = useMemo(() => {
        return allRecords
            .filter(r => r.studentId === studentId)
            .sort((a, b) => new Date(b.examDate) - new Date(a.examDate));
    }, [studentId, allRecords]);

    if (!isOpen) return null;
    
    const studentInfo = studentHistory[0] || {};

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold">{studentInfo.firstName} {studentInfo.lastName}</h2>
                    <p className="text-gray-600">{studentInfo.studentId}</p>
                </div>
                 <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">&times;</button>
            </div>
            <hr className="my-4" />
            <h3 className="font-semibold text-lg mb-2">ประวัติการสอบ</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
                {studentHistory.length > 0 ? studentHistory.map(record => (
                    <div key={record.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                        <div>
                            <p>
                                <span className="font-semibold">{new Date(record.examDate).toLocaleDateString('th-TH')}</span> - 
                                <span className={`font-bold ${record.status === 'ผ่าน' ? 'text-green-600' : 'text-red-600'}`}> {record.status}</span>
                            </p>
                            <p className="text-sm text-gray-600">ประเภท: {record.examType}, คะแนน: {record.score}</p>
                        </div>
                        {isAdmin && (
                            <div className="flex gap-2">
                                <button onClick={() => {onEdit(record); onClose();}} className="p-1 text-blue-500 hover:text-blue-700" title="แก้ไข"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                <button onClick={() => {onDelete(record); onClose();}} className="p-1 text-red-500 hover:text-red-700" title="ลบ"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
                            </div>
                        )}
                    </div>
                )) : <p className="text-gray-500">ไม่มีประวัติการสอบ</p>}
            </div>
        </Modal>
    );
}

