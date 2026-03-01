import React, { useState, useMemo } from 'react';
import { 
  Users, Wallet, TrendingUp, TrendingDown, 
  Plus, History, Home, DollarSign, FileText, 
  ArrowRightLeft, AlertCircle
} from 'lucide-react';

export default function App() {
  // State Management
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data dikosongkan untuk memulai dari awal
  const [members, setMembers] = useState([]);

  const [transactions, setTransactions] = useState([]);

  // Modal States
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState(null); // Menyimpan info anggota & periode yang diklik

  // Form States
  const [memberForm, setMemberForm] = useState({ name: '', section: 'Brass' });
  const [paymentForm, setPaymentForm] = useState({ amount: '', description: '' });
  const [expenseForm, setExpenseForm] = useState({ amount: '', description: '', category: 'Peralatan' });

  // Calculations
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  // Helper: Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const formatShortRupiah = (number) => {
    return new Intl.NumberFormat('id-ID').format(number);
  };

  // Generator Periode (Bulan & Minggu)
  const months = ['Februari', 'Maret', 'April', 'Mei'];
  const periods = useMemo(() => {
    const p = [];
    months.forEach(month => {
      for(let i=1; i<=4; i++) {
        p.push({ id: `${month.toLowerCase()}-${i}`, month, week: i, label: `M${i}` });
      }
    });
    return p;
  }, []);

  // Helper: Get total paid by a specific member
  const getMemberTotalPaid = (memberId) => {
    return transactions
      .filter(t => t.type === 'income' && t.category === 'Kas Anggota' && t.memberId === memberId)
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  // Handlers
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!memberForm.name) return;
    setMembers([...members, { id: Date.now(), ...memberForm }]);
    setMemberForm({ name: '', section: 'Brass' });
    setIsMemberModalOpen(false);
  };

  const openPaymentModal = (member, period) => {
    setPaymentTarget({ member, period });
    setPaymentForm({
      amount: '',
      description: `Kas ${period.month} M${period.week}`
    });
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!paymentForm.amount || !paymentTarget) return;
    const newTx = {
      id: Date.now(),
      type: 'income',
      amount: parseInt(paymentForm.amount),
      date: new Date().toISOString().split('T')[0],
      description: paymentForm.description,
      category: 'Kas Anggota',
      memberId: paymentTarget.member.id,
      periodId: paymentTarget.period.id
    };
    setTransactions([newTx, ...transactions]);
    setPaymentForm({ amount: '', description: '' });
    setIsPaymentModalOpen(false);
  };

  const handleRecordExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.amount || !expenseForm.description) return;
    const newTx = {
      id: Date.now(),
      type: 'expense',
      amount: parseInt(expenseForm.amount),
      date: new Date().toISOString().split('T')[0],
      description: expenseForm.description,
      category: expenseForm.category,
      memberId: null
    };
    setTransactions([newTx, ...transactions]);
    setExpenseForm({ amount: '', description: '', category: 'Peralatan' });
    setIsExpenseModalOpen(false);
  };

  // Views
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-indigo-100 font-medium">Saldo Kas Saat Ini</h3>
            <Wallet className="w-8 h-8 text-indigo-300 opacity-80" />
          </div>
          <p className="text-3xl font-bold">{formatRupiah(balance)}</p>
        </div>
        
        <div className="bg-emerald-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-emerald-100 font-medium">Total Pemasukan</h3>
            <TrendingUp className="w-8 h-8 text-emerald-200 opacity-80" />
          </div>
          <p className="text-2xl font-bold">{formatRupiah(totalIncome)}</p>
        </div>

        <div className="bg-rose-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-rose-100 font-medium">Total Pengeluaran</h3>
            <TrendingDown className="w-8 h-8 text-rose-200 opacity-80" />
          </div>
          <p className="text-2xl font-bold">{formatRupiah(totalExpense)}</p>
        </div>
      </div>

      {/* Quick Actions & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Transaksi Terakhir</h3>
            <button onClick={() => setActiveTab('transactions')} className="text-indigo-600 text-sm font-medium hover:underline">Lihat Semua</button>
          </div>
          <div className="space-y-4">
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-50">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {tx.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{tx.description}</p>
                    <p className="text-xs text-gray-500">{tx.date} • {tx.category}</p>
                  </div>
                </div>
                <p className={`font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                </p>
              </div>
            ))}
            {transactions.length === 0 && <p className="text-center text-gray-500 py-4">Belum ada transaksi</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Aksi Cepat</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setIsExpenseModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 p-3 rounded-lg font-medium transition-colors border border-rose-200"
            >
              <TrendingDown size={20} /> Catat Pengeluaran
            </button>
            <button 
              onClick={() => setActiveTab('members')}
              className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 p-3 rounded-lg font-medium transition-colors border border-indigo-200"
            >
              <Users size={20} /> Bayar Kas Anggota
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMembers = () => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Buku Kas Anggota (Absensi Mingguan)</h2>
          <p className="text-sm text-gray-500">Klik ikon (+) pada kolom minggu untuk mencatat pembayaran kas.</p>
        </div>
        <button 
          onClick={() => setIsMemberModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shrink-0"
        >
          <Plus size={18} /> Tambah Anggota
        </button>
      </div>
      <div className="overflow-x-auto pb-4">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm">
              <th rowSpan={2} className="p-4 border-b border-r sticky left-0 bg-gray-50 z-10 shadow-[1px_0_0_#f3f4f6]">Nama Anggota</th>
              <th rowSpan={2} className="p-4 border-b border-r">Bagian</th>
              {months.map(m => (
                <th colSpan={4} key={m} className="p-2 border-b border-r text-center font-bold bg-indigo-50/50 text-indigo-800">{m}</th>
              ))}
              <th rowSpan={2} className="p-4 border-b border-l-2 border-l-indigo-100 text-right sticky right-0 bg-gray-50 z-10 shadow-[-1px_0_0_#f3f4f6]">Total Terbayar</th>
            </tr>
            <tr className="bg-gray-50 text-gray-500 text-xs">
              {periods.map(p => (
                <th key={p.id} className="p-2 border-b border-r text-center min-w-[60px]">{p.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id} className="hover:bg-indigo-50/30 transition-colors group">
                <td className="p-4 border-b border-r font-medium text-gray-800 sticky left-0 bg-white group-hover:bg-indigo-50/10 z-10 shadow-[1px_0_0_#f3f4f6]">{member.name}</td>
                <td className="p-4 border-b border-r text-gray-600">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs whitespace-nowrap">{member.section}</span>
                </td>
                {periods.map(p => {
                  const tx = transactions.find(t => t.memberId === member.id && t.periodId === p.id);
                  return (
                    <td key={p.id} className="p-2 border-b border-r text-center align-middle">
                      {tx ? (
                        <span 
                          className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded cursor-help"
                          title={`${tx.description} - ${tx.date}`}
                        >
                          {formatShortRupiah(tx.amount)}
                        </span>
                      ) : (
                        <button 
                          onClick={() => openPaymentModal(member, p)}
                          className="w-7 h-7 rounded flex items-center justify-center bg-gray-100 text-gray-400 hover:bg-emerald-100 hover:text-emerald-600 transition-colors mx-auto"
                          title={`Bayar Kas ${p.month} ${p.label}`}
                        >
                          <Plus size={14} />
                        </button>
                      )}
                    </td>
                  )
                })}
                <td className="p-4 border-b border-l-2 border-l-indigo-100 text-right font-bold text-emerald-600 sticky right-0 bg-white group-hover:bg-indigo-50/10 z-10 shadow-[-1px_0_0_#f3f4f6]">
                  {formatRupiah(getMemberTotalPaid(member.id))}
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={periods.length + 3} className="p-8 text-center text-gray-500">Belum ada data anggota. Tambahkan anggota pertama Anda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Buku Kas (Semua Transaksi)</h2>
          <p className="text-sm text-gray-500">Daftar seluruh riwayat pemasukan dan pengeluaran.</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm">
              <th className="p-4 border-b">Tanggal</th>
              <th className="p-4 border-b">Keterangan</th>
              <th className="p-4 border-b">Kategori</th>
              <th className="p-4 border-b text-right">Pemasukan</th>
              <th className="p-4 border-b text-right">Pengeluaran</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50 transition-colors text-sm">
                <td className="p-4 border-b text-gray-600">{tx.date}</td>
                <td className="p-4 border-b">
                  <span className="font-medium text-gray-800">{tx.description}</span>
                  {tx.memberId && members.find(m => m.id === tx.memberId) && (
                    <span className="ml-2 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                      ({members.find(m => m.id === tx.memberId)?.name})
                    </span>
                  )}
                </td>
                <td className="p-4 border-b text-gray-500">{tx.category}</td>
                <td className="p-4 border-b text-right text-emerald-600 font-medium">
                  {tx.type === 'income' ? formatRupiah(tx.amount) : '-'}
                </td>
                <td className="p-4 border-b text-right text-rose-600 font-medium">
                  {tx.type === 'expense' ? formatRupiah(tx.amount) : '-'}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">Belum ada riwayat transaksi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar / Top Nav area */}
      <header className="bg-slate-900 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-none tracking-wide">DWIGARDA VANGUARD</h1>
                <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">Sistem Keuangan DVC</p>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-1">
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}`}
              >
                <Home size={18} /> Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('members')} 
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'members' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}`}
              >
                <Users size={18} /> Anggota & Kas
              </button>
              <button 
                onClick={() => setActiveTab('transactions')} 
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'transactions' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}`}
              >
                <History size={18} /> Riwayat Transaksi
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="md:hidden bg-white border-b border-gray-200 flex overflow-x-auto">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`flex-1 min-w-[120px] py-3 text-sm font-medium flex justify-center items-center gap-2 border-b-2 ${activeTab === 'dashboard' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}
        >
          <Home size={16} /> Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('members')} 
          className={`flex-1 min-w-[120px] py-3 text-sm font-medium flex justify-center items-center gap-2 border-b-2 ${activeTab === 'members' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}
        >
          <Users size={16} /> Anggota
        </button>
        <button 
          onClick={() => setActiveTab('transactions')} 
          className={`flex-1 min-w-[120px] py-3 text-sm font-medium flex justify-center items-center gap-2 border-b-2 ${activeTab === 'transactions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}
        >
          <History size={16} /> Riwayat
        </button>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'members' && renderMembers()}
        {activeTab === 'transactions' && renderTransactions()}
      </main>

      {/* MODALS */}
      
      {/* Modal Tambah Anggota */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">Tambah Anggota Baru</h3>
              <button onClick={() => setIsMemberModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={memberForm.name}
                  onChange={e => setMemberForm({...memberForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bagian (Section)</label>
                <select 
                  value={memberForm.section}
                  onChange={e => setMemberForm({...memberForm, section: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Brass">Brass</option>
                  <option value="Percussion">Percussion (Battery/Pit)</option>
                  <option value="Color Guard">Color Guard</option>
                  <option value="Woodwind">Woodwind</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsMemberModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Simpan Anggota</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Bayar Kas */}
      {isPaymentModalOpen && paymentTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-emerald-50">
              <h3 className="font-bold text-lg text-emerald-800">Input Pembayaran Kas</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-emerald-500 hover:text-emerald-700 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Anggota</p>
                  <p className="font-bold text-gray-800 text-lg">{paymentTarget.member.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Periode</p>
                  <p className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded text-sm">
                    {paymentTarget.period.month} - {paymentTarget.period.label}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Contoh: 10000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Catatan</label>
                <input 
                  type="text" 
                  required
                  value={paymentForm.description}
                  onChange={e => setPaymentForm({...paymentForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">Simpan Kas</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pengeluaran */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-rose-50">
              <h3 className="font-bold text-lg text-rose-800">Catat Pengeluaran</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-rose-500 hover:text-rose-700 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleRecordExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Contoh: 50000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Pengeluaran</label>
                <select 
                  value={expenseForm.category}
                  onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Peralatan">Peralatan / Alat Musik</option>
                  <option value="Konsumsi">Konsumsi</option>
                  <option value="Transportasi">Transportasi</option>
                  <option value="Seragam">Seragam / Kostum</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Rincian</label>
                <input 
                  type="text" 
                  required
                  value={expenseForm.description}
                  onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Contoh: Beli air mineral untuk latihan"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700">Simpan Pengeluaran</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}