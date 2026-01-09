
import React, { useState, useMemo } from 'react';
import { ClothingBreakdown, PeriodData, DailyReport } from './types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- 子组件定义移出 App，防止因重新渲染导致失去焦点 ---

const ClothingInputGrid = ({ 
  period, 
  group, 
  data, 
  onUpdate 
}: { 
  period: 'morning' | 'afternoon', 
  group: 'student' | 'staff', 
  data: ClothingBreakdown,
  onUpdate: (field: keyof ClothingBreakdown, value: string) => void
}) => {
  const label = group === 'student' ? '学生' : '教职工';
  const total = data.clothes + data.shoes + data.bedding;
  
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 mb-4 shadow-sm">
      <h4 className="font-bold text-slate-900 mb-4 flex justify-between border-b border-slate-100 pb-2">
        <span className="flex items-center gap-2">
          <span className={`w-1 h-4 rounded ${group === 'student' ? 'bg-blue-600' : 'bg-indigo-600'}`}></span>
          {label}收衣详情
        </span>
        <span className="text-blue-700 font-black">小计: {total}</span>
      </h4>
      <div className="grid grid-cols-3 gap-4">
        {(['clothes', 'shoes', 'bedding'] as const).map(f => (
          <div key={f}>
            <label className="text-sm font-black text-slate-700 block mb-1.5">
              {f === 'clothes' ? '衣物' : f === 'shoes' ? '鞋靴' : '床上用品'}
            </label>
            <input
              type="number"
              value={data[f] || ''}
              onChange={e => onUpdate(f, e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-slate-100 rounded-xl text-lg font-bold text-slate-900 focus:border-blue-500 focus:ring-0 outline-none transition-all bg-slate-50/50"
              placeholder="0"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const PeriodForm = ({ 
  period, 
  data, 
  onUpdateField, 
  onUpdateBreakdown 
}: { 
  period: 'morning' | 'afternoon', 
  data: PeriodData,
  onUpdateField: (section: string, field: string, value: any) => void,
  onUpdateBreakdown: (group: 'student' | 'staff', field: keyof ClothingBreakdown, value: string) => void
}) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div className="bg-white p-5 rounded-3xl border-2 border-slate-50 shadow-sm">
      <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2 border-l-4 border-blue-600 pl-3 leading-none">
        一、衣物收发与数量统计
      </h3>
      <ClothingInputGrid 
        period={period} 
        group="student" 
        data={data.in.student} 
        onUpdate={(f, v) => onUpdateBreakdown('student', f, v)} 
      />
      <ClothingInputGrid 
        period={period} 
        group="staff" 
        data={data.in.staff} 
        onUpdate={(f, v) => onUpdateBreakdown('staff', f, v)} 
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
        <div>
          <label className="text-sm font-black text-slate-900 block mb-2">发衣数量 - 学生 (件)</label>
          <input
            type="number"
            value={data.out.student || ''}
            onChange={e => onUpdateField('out', 'student', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 border-2 border-white rounded-xl shadow-sm text-lg font-black text-slate-900 outline-none focus:border-blue-400 bg-white"
          />
        </div>
        <div>
          <label className="text-sm font-black text-slate-900 block mb-2">发衣数量 - 教职工 (件)</label>
          <input
            type="number"
            value={data.out.staff || ''}
            onChange={e => onUpdateField('out', 'staff', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 border-2 border-white rounded-xl shadow-sm text-lg font-black text-slate-900 outline-none focus:border-blue-400 bg-white"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-black text-slate-900 block mb-2">未成功发放衣物说明</label>
          <input
            type="text"
            value={data.out.failedReason}
            onChange={e => onUpdateField('out', 'failedReason', e.target.value)}
            className="w-full px-4 py-3 border-2 border-white rounded-xl shadow-sm text-slate-900 outline-none focus:border-blue-400 bg-white"
            placeholder="例如：3件外套因重污渍需重洗"
          />
        </div>
      </div>
    </div>

    <div className="bg-white p-5 rounded-3xl border-2 border-slate-50 shadow-sm">
      <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2 border-l-4 border-emerald-600 pl-3 leading-none">
        二、学生/教职工反馈与沟通
      </h3>
      <div className="space-y-5">
        <div>
          <label className="text-sm font-black text-slate-900 mb-2 block">正面反馈 (满意度/表扬)</label>
          <textarea
            className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl outline-none focus:bg-white focus:border-emerald-400 transition-all text-slate-900 font-medium"
            rows={2}
            value={data.feedback.positive}
            onChange={e => onUpdateField('feedback', 'positive', e.target.value)}
            placeholder="例：对洗涤质量满意、服务态度好..."
          />
        </div>
        <div>
          <label className="text-sm font-black text-slate-900 mb-2 block">问题与建议</label>
          <textarea
            className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl outline-none focus:bg-white focus:border-emerald-400 transition-all text-slate-900 font-medium"
            rows={2}
            value={data.feedback.issues}
            onChange={e => onUpdateField('feedback', 'issues', e.target.value)}
            placeholder="例：衣物有污渍、希望增加收衣频次..."
          />
        </div>
        <div>
          <label className="text-sm font-black text-slate-900 mb-2 block">处理情况及结果</label>
          <textarea
            className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl outline-none focus:bg-white focus:border-emerald-400 transition-all text-slate-900 font-medium"
            rows={2}
            value={data.feedback.results}
            onChange={e => onUpdateField('feedback', 'results', e.target.value)}
            placeholder="已采取的沟通 or 补救措施..."
          />
        </div>
      </div>
    </div>

    <div className="bg-white p-5 rounded-3xl border-2 border-slate-50 shadow-sm">
      <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2 border-l-4 border-amber-500 pl-3 leading-none">
        三、工作内容简述
      </h3>
      <textarea
        className="w-full p-4 border-2 border-slate-100 bg-slate-50 rounded-2xl outline-none focus:bg-white focus:border-amber-400 transition-all text-slate-900 font-medium"
        rows={3}
        value={data.tasks}
        onChange={e => onUpdateField('', 'tasks', e.target.value)}
        placeholder="记录分拣、洗涤、烘干等具体流程..."
      />
    </div>

    <div className="bg-white p-5 rounded-3xl border-2 border-rose-100 shadow-sm">
      <h3 className="text-2xl font-black text-rose-900 mb-6 flex items-center gap-2 border-l-4 border-rose-500 pl-3 leading-none">
        四、遇到的问题及处理
      </h3>
      <textarea
        className="w-full p-4 border-2 border-rose-50 bg-rose-50 rounded-2xl outline-none focus:bg-white focus:border-rose-400 transition-all text-slate-900 font-medium"
        rows={4}
        value={data.problems}
        onChange={e => onUpdateField('', 'problems', e.target.value)}
        placeholder="请记录设备故障、沟通障碍、待办事项等..."
      />
    </div>
  </div>
);

// --- 辅助函数 ---

const initialPeriod = (): PeriodData => ({
  in: {
    student: { clothes: 0, shoes: 0, bedding: 0 },
    staff: { clothes: 0, shoes: 0, bedding: 0 }
  },
  out: {
    student: 0,
    staff: 0,
    failedReason: ''
  },
  feedback: {
    positive: '',
    issues: '',
    results: ''
  },
  tasks: '',
  problems: ''
});

// --- 主组件 ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'morning' | 'afternoon' | 'summary'>('morning');
  const [report, setReport] = useState<DailyReport>({
    date: new Date().toISOString().split('T')[0],
    employeeName: '',
    morning: initialPeriod(),
    afternoon: initialPeriod(),
    summary: { tomorrowPlan: '' }
  });

  const calculateSum = (b: ClothingBreakdown) => b.clothes + b.shoes + b.bedding;

  const totals = useMemo(() => {
    const mIn = calculateSum(report.morning.in.student) + calculateSum(report.morning.in.staff);
    const mOut = report.morning.out.student + report.morning.out.staff;
    const aIn = calculateSum(report.afternoon.in.student) + calculateSum(report.afternoon.in.staff);
    const aOut = report.afternoon.out.student + report.afternoon.out.staff;

    return {
      totalIn: mIn + aIn,
      totalOut: mOut + aOut,
      studentIn: calculateSum(report.morning.in.student) + calculateSum(report.afternoon.in.student),
      staffIn: calculateSum(report.morning.in.staff) + calculateSum(report.afternoon.in.staff),
      studentOut: report.morning.out.student + report.afternoon.out.student,
      staffOut: report.morning.out.staff + report.afternoon.out.staff,
    };
  }, [report]);

  const updateBreakdown = (period: 'morning' | 'afternoon', group: 'student' | 'staff', field: keyof ClothingBreakdown, value: string) => {
    const num = parseInt(value) || 0;
    setReport(prev => ({
      ...prev,
      [period]: {
        ...prev[period],
        in: {
          ...prev[period].in,
          [group]: { ...prev[period].in[group], [field]: num }
        }
      }
    }));
  };

  const updatePeriodField = (period: 'morning' | 'afternoon', section: string, field: string, value: any) => {
    setReport(prev => {
      const currentPeriod = prev[period];
      if (section) {
        return {
          ...prev,
          [period]: {
            ...currentPeriod,
            [section]: { ...(currentPeriod as any)[section], [field]: value }
          }
        };
      } else {
        return {
          ...prev,
          [period]: {
            ...currentPeriod,
            [field]: value
          }
        };
      }
    });
  };

  const exportPDF = async () => {
    const element = document.getElementById('report-paper');
    if (!element) return;
    
    element.style.display = 'block';
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`校园洗涤日报_${report.employeeName}_${report.date}.pdf`);
    element.style.display = 'none';
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Header */}
      <div className="bg-white border-b-2 border-slate-200 sticky top-0 z-20 no-print shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">👕</span>
              校园洗涤报表系统
            </h1>
            <button
              onClick={exportPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              导出报表PDF
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-200">
            <div>
              <label className="text-xs font-black text-slate-400 block uppercase mb-1">填表日期</label>
              <input
                type="date"
                value={report.date}
                onChange={e => setReport(prev => ({ ...prev, date: e.target.value }))}
                className="bg-transparent font-black text-slate-900 outline-none w-full text-lg"
              />
            </div>
            <div className="border-l-2 border-slate-200 pl-4">
              <label className="text-xs font-black text-slate-400 block uppercase mb-1">员工姓名</label>
              <input
                type="text"
                placeholder="请输入姓名"
                value={report.employeeName}
                onChange={e => setReport(prev => ({ ...prev, employeeName: e.target.value }))}
                className="bg-transparent font-black text-slate-900 outline-none w-full text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 no-print">
        <div className="flex gap-2 mb-8 bg-slate-200/50 p-1.5 rounded-3xl border border-white/50 backdrop-blur-sm shadow-inner">
          <button
            onClick={() => setActiveTab('morning')}
            className={`flex-1 py-4 rounded-2xl font-black transition-all ${activeTab === 'morning' ? 'bg-white text-blue-600 shadow-lg scale-100' : 'text-slate-500 hover:text-slate-700'}`}
          >
            ☀️ 上午时段
          </button>
          <button
            onClick={() => setActiveTab('afternoon')}
            className={`flex-1 py-4 rounded-2xl font-black transition-all ${activeTab === 'afternoon' ? 'bg-white text-orange-600 shadow-lg scale-100' : 'text-slate-500 hover:text-slate-700'}`}
          >
            🌙 下午时段
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-4 rounded-2xl font-black transition-all ${activeTab === 'summary' ? 'bg-white text-indigo-600 shadow-lg scale-100' : 'text-slate-500 hover:text-slate-700'}`}
          >
            📊 今日总结
          </button>
        </div>

        {activeTab === 'morning' && (
          <PeriodForm 
            period="morning" 
            data={report.morning} 
            onUpdateField={(s, f, v) => updatePeriodField('morning', s, f, v)}
            onUpdateBreakdown={(g, f, v) => updateBreakdown('morning', g, f, v)}
          />
        )}
        {activeTab === 'afternoon' && (
          <PeriodForm 
            period="afternoon" 
            data={report.afternoon} 
            onUpdateField={(s, f, v) => updatePeriodField('afternoon', s, f, v)}
            onUpdateBreakdown={(g, f, v) => updateBreakdown('afternoon', g, f, v)}
          />
        )}
        {activeTab === 'summary' && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-[40px] border-2 border-slate-50 shadow-xl">
              <h3 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <span className="w-2.5 h-10 bg-indigo-600 rounded-full"></span>
                今日数据汇总
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-indigo-50/50 p-7 rounded-[32px] border-2 border-indigo-100/50">
                  <div className="text-xs font-black text-indigo-900 mb-3 uppercase tracking-[0.2em]">全日总收衣量</div>
                  <div className="text-6xl font-black text-indigo-600 mb-6 tabular-nums">{totals.totalIn} <span className="text-xl font-bold text-indigo-400">件</span></div>
                  <div className="space-y-2.5 text-sm font-black text-indigo-800 border-t border-indigo-100 pt-5">
                    <div className="flex justify-between items-center">
                      <span className="opacity-60 text-indigo-900">学生收衣总额</span> 
                      <span className="bg-white px-3 py-1 rounded-full border border-indigo-100 text-indigo-900">{totals.studentIn} 件</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="opacity-60 text-indigo-900">职工收衣总额</span> 
                      <span className="bg-white px-3 py-1 rounded-full border border-indigo-100 text-indigo-900">{totals.staffIn} 件</span>
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-50/50 p-7 rounded-[32px] border-2 border-emerald-100/50">
                  <div className="text-xs font-black text-emerald-900 mb-3 uppercase tracking-[0.2em]">全日总发衣量</div>
                  <div className="text-6xl font-black text-emerald-600 mb-6 tabular-nums">{totals.totalOut} <span className="text-xl font-bold text-emerald-400">件</span></div>
                  <div className="space-y-2.5 text-sm font-black text-emerald-800 border-t border-emerald-100 pt-5">
                    <div className="flex justify-between items-center">
                      <span className="opacity-60 text-emerald-900">学生发衣总额</span> 
                      <span className="bg-white px-3 py-1 rounded-full border border-emerald-100 text-emerald-900">{totals.studentOut} 件</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="opacity-60 text-emerald-900">职工发衣总额</span> 
                      <span className="bg-white px-3 py-1 rounded-full border border-emerald-100 text-emerald-900">{totals.staffOut} 件</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-xl font-black text-slate-900 block border-l-4 border-indigo-600 pl-3 leading-none mb-4">明日工作计划 / 建议</label>
                <textarea
                  className="w-full p-6 border-2 border-slate-100 bg-slate-50 rounded-3xl outline-none focus:bg-white focus:border-indigo-400 transition-all font-bold text-slate-900 shadow-inner"
                  rows={6}
                  value={report.summary.tomorrowPlan}
                  onChange={e => setReport(prev => ({ ...prev, summary: { ...prev.summary, tomorrowPlan: e.target.value } }))}
                  placeholder="请输入明日具体工作重点、人员安排或改善建议..."
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Hidden PDF Template - Optimized for Alignment */}
      <div id="report-paper" className="hidden fixed left-[-9999px] top-0 bg-white text-black p-12 leading-relaxed" style={{ width: '210mm', minHeight: '297mm', fontSize: '13px', fontFamily: 'SimSun, "STSong", serif' }}>
        <h1 className="text-3xl font-bold text-center mb-8 pb-4 border-b-4 border-double border-black">校园洗涤服务员工日报表</h1>
        
        <div className="flex justify-between mb-8 pb-2 font-bold text-lg border-b border-black">
          <div style={{ width: '50%' }}>日期：{report.date}</div>
          <div style={{ width: '50%', textAlign: 'right' }}>员工姓名：{report.employeeName || '___________'}</div>
        </div>

        {/* Morning Section in PDF */}
        <div className="mb-8 border border-black rounded-lg overflow-hidden">
          <h2 className="text-xl font-bold bg-gray-100 px-4 py-2 border-b border-black">上午时段 (Morning)</h2>
          <div className="p-4 space-y-4">
            <div>
              <h3 className="font-bold underline mb-1">一、衣物收发与统计</h3>
              <p className="pl-4">学生收衣: 衣物({report.morning.in.student.clothes}), 鞋靴({report.morning.in.student.shoes}), 床上用品({report.morning.in.student.bedding}) - 共 <span className="font-bold">{calculateSum(report.morning.in.student)}</span> 件</p>
              <p className="pl-4">职工收衣: 衣物({report.morning.in.staff.clothes}), 鞋靴({report.morning.in.staff.shoes}), 床上用品({report.morning.in.staff.bedding}) - 共 <span className="font-bold">{calculateSum(report.morning.in.staff)}</span> 件</p>
              <p className="pl-4">发衣统计: 学生 <span className="font-bold">{report.morning.out.student}</span> 件 / 职工 <span className="font-bold">{report.morning.out.staff}</span> 件 (异常说明: {report.morning.out.failedReason || '无'})</p>
            </div>
            <div>
              <h3 className="font-bold underline mb-1">二、工作及反馈</h3>
              <p className="pl-4">任务内容: {report.morning.tasks || '无'}</p>
              <p className="pl-4">正面反馈: {report.morning.feedback.positive || '无'}</p>
              <p className="pl-4">问题建议: {report.morning.feedback.issues || '无'}</p>
            </div>
            <div>
              <h3 className="font-bold underline mb-1">三、遇到问题及处理</h3>
              <p className="pl-4 whitespace-pre-wrap">{report.morning.problems || '无'}</p>
            </div>
          </div>
        </div>

        {/* Afternoon Section in PDF */}
        <div className="mb-8 border border-black rounded-lg overflow-hidden">
          <h2 className="text-xl font-bold bg-gray-100 px-4 py-2 border-b border-black">下午时段 (Afternoon)</h2>
          <div className="p-4 space-y-4">
            <p className="font-bold">下午收衣量: {calculateSum(report.afternoon.in.student) + calculateSum(report.afternoon.in.staff)} 件 / 发衣量: {report.afternoon.out.student + report.afternoon.out.staff} 件</p>
            <div>
              <h3 className="font-bold underline mb-1">工作内容及反馈</h3>
              <p className="pl-4 whitespace-pre-wrap">{report.afternoon.tasks || '无'}</p>
              <p className="pl-4 italic">遇到问题: {report.afternoon.problems || '无'}</p>
            </div>
          </div>
        </div>

        {/* Final Summary in PDF */}
        <div className="mt-8 pt-6">
          <h2 className="text-2xl font-bold mb-4 border-l-4 border-black pl-3">全日汇总总结</h2>
          <div className="flex border border-black mb-6 bg-gray-50">
            <div className="flex-1 p-4 border-r border-black"><span className="font-bold">全日收衣总数:</span> <span className="text-lg underline">{totals.totalIn}</span> 件</div>
            <div className="flex-1 p-4"><span className="font-bold">全日发衣总数:</span> <span className="text-lg underline">{totals.totalOut}</span> 件</div>
          </div>
          <h3 className="font-bold text-lg mb-2 underline">明日工作计划 / 改进建议：</h3>
          <div className="min-h-[120px] border border-gray-300 p-4 whitespace-pre-wrap leading-relaxed rounded">
            {report.summary.tomorrowPlan || '按计划进行常规服务。'}
          </div>
        </div>

        <div className="mt-16 flex justify-between italic text-sm border-t border-gray-400 pt-4 opacity-75">
          <span>系统生成报表 - 校园洗涤服务管理系统</span>
          <span>生成日期：{new Date().toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default App;
