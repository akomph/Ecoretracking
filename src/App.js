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
    //deleteDoc, 
    setDoc, 
    getDoc,
    updateDoc,
    where,
    getDocs
} from 'firebase/firestore';
//import { Bar, Doughnut } from 'react-chartjs-2';
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
// <<! สำคัญ: เมื่อนำไปใช้งานจริง ให้แทนที่ Block นี้ทั้งหมดด้วย !>>
// <<! firebaseConfig จากโปรเจกต์ของคุณเองใน Firebase !>>
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD7lJNxZ1EZCjtWwO6Vu9Owr68rQZStgbc",
    authDomain: "englishtracking-7aa69.firebaseapp.com",
    projectId: "englishtracking-7aa69",
    storageBucket: "englishtracking-7aa69.firebasestorage.app",
    messagingSenderId: "643772647805",
    appId: "1:643772647805:web:a5b57076e20fed5aede414",
    measurementId: "G-JSEHN1DLPP"
    };
    // <<! ------------------------------------------------------------------ !>>
    
// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Collections ---
const dataCollectionName = `exam_results_v4`;
const configCollectionName = `config_v4`;
const usersCollectionName = `users_v4`;

// --- Helper Components ---
const Spinner = ({ size = 'w-6 h-6', color = 'border-white' }) => (
    <div className={`${size} border-4 ${color} border-t-transparent rounded-full animate-spin`}></div>
);

const Modal = ({ children, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex justify-center items-center backdrop-blur-sm p-4" onClick={onClose}>
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
    const [studentId, setStudentId] = useState('');
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
                if (!studentId) throw new Error("กรุณากรอกรหัสนักศึกษา");
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await setDoc(doc(db, usersCollectionName, user.uid), {
                    uid: user.uid,
                    email: user.email,
                    studentId: studentId,
                    createdAt: serverTimestamp()
                });
            }
        } catch (err) {
            setError(err.message.replace('Firebase: Error ', '').replace(/\(auth\/.*\)\.?/, ''));
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">{isLogin ? 'เข้าสู่ระบบ' : 'ลงทะเบียน'}</h2>
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="auth-student-id">รหัสนักศึกษา</label>
                            <input type="text" id="auth-student-id" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">อีเมล</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:bg-indigo-300 flex justify-center items-center h-10">
                        {loading ? <Spinner /> : (isLogin ? 'เข้าสู่ระบบ' : 'ลงทะเบียน')}
                    </button>
                </form>
                <p className="text-center text-gray-600 text-sm mt-6">
                    {isLogin ? 'ยังไม่มีบัญชี?' : 'มีบัญชีอยู่แล้ว?'}
                    <button onClick={toggleMode} className="text-indigo-600 hover:underline ml-1 font-semibold">
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
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const roleDocRef = doc(db, 'roles', currentUser.email);
                const userDocRef = doc(db, usersCollectionName, currentUser.uid);
                const [roleDocSnap, userDocSnap] = await Promise.all([getDoc(roleDocRef), getDoc(userDocRef)]);
                const isAdminUser = roleDocSnap.exists() && roleDocSnap.data().isAdmin === true;
                setUser(currentUser);
                setIsAdmin(isAdminUser);
                setUserProfile(userDocSnap.exists() ? userDocSnap.data() : null);
            } else {
                setUser(null);
                setIsAdmin(false);
                setUserProfile(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><Spinner color="border-indigo-600" size="w-12 h-12" /></div>;
    }

    return user ? <Dashboard user={user} isAdmin={isAdmin} userProfile={userProfile} /> : <AuthPage />;
}

// --- Dashboard Component ---
function Dashboard({ user, isAdmin, userProfile }) {
    const [allRecords, setAllRecords] = useState([]);
    const [config, setConfig] = useState({ totalTarget: 150 });
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [recordToEdit, setRecordToEdit] = useState(null);

    useEffect(() => {
        const q = query(collection(db, dataCollectionName), orderBy("timestamp", "desc"));
        const unsubscribeRecords = onSnapshot(q, (snapshot) => {
            setAllRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const configDocRef = doc(db, configCollectionName, "settings");
        const unsubscribeConfig = onSnapshot(configDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setConfig(docSnap.data());
            } else {
                setDoc(configDocRef, { totalTarget: 150 });
            }
        });

        return () => {
            unsubscribeRecords();
            unsubscribeConfig();
        };
    }, []);

    const handleOpenAddModal = () => {
        const studentRecord = allRecords.find(r => r.studentId === userProfile?.studentId);
        const initialData = !isAdmin && userProfile ? studentRecord || { studentId: userProfile.studentId } : null;
        setRecordToEdit(initialData);
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = (record) => {
        setRecordToEdit(record);
        setIsAddEditModalOpen(true);
    };

    const { passedCount, remainingCount, sortedChallengers, sortedPassedStudents } = useMemo(() => {
        const passedStudentsSet = new Set();
        allRecords.forEach(record => {
            if (record.status === 'ผ่าน') passedStudentsSet.add(record.studentId);
        });
        const passedCount = passedStudentsSet.size;
        const remainingCount = Math.max(0, config.totalTarget - passedCount);
        const allStudentsMap = new Map();
        allRecords.forEach(record => {
            if (!allStudentsMap.has(record.studentId)) allStudentsMap.set(record.studentId, record);
        });
        const challengers = Array.from(allStudentsMap.values()).filter(s => !passedStudentsSet.has(s.studentId));
        const sortedChallengers = challengers.sort((a, b) => a.studentId.localeCompare(b.studentId));
        const passed = Array.from(allStudentsMap.values()).filter(s => passedStudentsSet.has(s.studentId));
        const sortedPassedStudents = passed.sort((a, b) => a.studentId.localeCompare(b.studentId));
        return { passedCount, remainingCount, sortedChallengers, sortedPassedStudents };
    }, [allRecords, config.totalTarget]);

    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="text-center mb-8 relative">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Dashboard ติดตามผลการสอบภาษาอังกฤษ</h1>
                <div className="absolute top-0 right-0 flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm text-gray-700 font-semibold">{user.email}</p>
                        <p className="text-xs text-gray-500">{isAdmin ? 'ผู้ดูแลระบบ' : `นักศึกษา: ${userProfile?.studentId || ''}`}</p>
                    </div>
                    <button onClick={() => signOut(auth)} className="btn btn-secondary text-sm">ออกจากระบบ</button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MetricCard title="เป้าหมายทั้งหมด (คน)" value={config.totalTarget} color="text-indigo-600">
                    {isAdmin && <AdminTargetSetter currentTarget={config.totalTarget} />}
                </MetricCard>
                <MetricCard title="สอบผ่านแล้ว (คน)" value={passedCount} color="text-green-600" />
                <MetricCard title="เหลืออีก (คน)" value={remainingCount} color="text-red-600" />
            </div>
            
            <div className="flex justify-end items-center mb-6">
                 <button onClick={handleOpenAddModal} className="btn btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    เพิ่ม/แก้ไข ผลการสอบ
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <StudentList title="รายชื่อผู้ที่ต้องสอบครั้งถัดไป" students={sortedChallengers} isAdmin={isAdmin} onEdit={handleOpenEditModal} listType="challenger" />
                <StudentList title="รายชื่อผู้ที่สอบผ่านแล้ว" students={sortedPassedStudents} isAdmin={isAdmin} onEdit={handleOpenEditModal} listType="passed" />
            </div>

            <AddEditRecordModal isOpen={isAddEditModalOpen} onClose={() => setIsAddEditModalOpen(false)} recordToEdit={recordToEdit} isAdmin={isAdmin} userProfile={userProfile} />
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
    useEffect(() => { setTarget(currentTarget); }, [currentTarget]);

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
            <input type="number" value={target} onChange={handleTargetChange} className="mt-1 w-24 text-center border-gray-300 rounded-md shadow-sm"/>
        </div>
    );
};

const StudentList = ({ title, students, isAdmin, onEdit, listType }) => {
    const cardClass = listType === 'challenger' ? "border-2 border-red-200 bg-red-50" : "border-2 border-green-200 bg-green-50";
    const titleClass = listType === 'challenger' ? "text-red-800" : "text-green-800";

    return (
        <div className={`card ${cardClass}`}>
            <h3 className={`text-xl font-bold ${titleClass} mb-4`}>{title}</h3>
            <div className="overflow-y-auto max-h-96">
                {students.length === 0 ? (
                    <p className="text-gray-500 text-center p-4">ไม่มีข้อมูล</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {students.map(student => (
                            <li key={student.id} className="p-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                                    <p className="text-sm text-gray-500">{student.studentId}</p>
                                </div>
                                {isAdmin && (
                                    <button onClick={() => onEdit(student)} className="p-1 text-blue-500 hover:text-blue-700" title="แก้ไข">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const AddEditRecordModal = ({ isOpen, onClose, recordToEdit, isAdmin, userProfile }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (recordToEdit) {
                setFormData(recordToEdit);
            } else {
                setFormData({
                    studentId: isAdmin ? '' : userProfile?.studentId || '',
                    firstName: '',
                    lastName: '',
                    examDate: new Date().toISOString().split('T')[0],
                    examType: 'สอบตรง',
                    status: 'ไม่ผ่าน',
                    score: ''
                });
            }
        }
    }, [recordToEdit, isOpen, isAdmin, userProfile]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const dataToSave = { ...formData, score: Number(formData.score), timestamp: serverTimestamp() };
        
        try {
            if (recordToEdit?.id) {
                const docRef = doc(db, dataCollectionName, recordToEdit.id);
                await updateDoc(docRef, dataToSave);
            } else {
                const q = query(collection(db, dataCollectionName), where("studentId", "==", dataToSave.studentId));
                const existingDocs = await getDocs(q);
                if (!existingDocs.empty) {
                    const docToUpdate = existingDocs.docs[0];
                    await updateDoc(docToUpdate.ref, dataToSave);
                } else {
                    await addDoc(collection(db, dataCollectionName), dataToSave);
                }
            }
            onClose();
        } catch (err) {
            console.error("Error saving record:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold mb-6">{recordToEdit ? 'แก้ไขผลการสอบ' : 'เพิ่ม/แก้ไข ผลการสอบ'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">รหัสนักศึกษา</label>
                    <input type="text" id="studentId" value={formData.studentId || ''} onChange={handleChange} required disabled={!isAdmin} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">ชื่อ</label>
                        <input type="text" id="firstName" value={formData.firstName || ''} onChange={handleChange} required disabled={!isAdmin} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">นามสกุล</label>
                        <input type="text" id="lastName" value={formData.lastName || ''} onChange={handleChange} required disabled={!isAdmin} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
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
                    <button type="button" onClick={onClose} className="btn btn-secondary">ยกเลิก</button>
                    <button type="submit" disabled={loading} className="btn btn-primary">
                        {loading ? <Spinner /> : 'บันทึกข้อมูล'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
