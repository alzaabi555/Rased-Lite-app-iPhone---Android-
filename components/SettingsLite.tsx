import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Save, Upload, Trash2, AlertTriangle, CheckCircle2, FileJson } from 'lucide-react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

const SettingsLite: React.FC = () => {
  const { students, setStudents, teacherInfo, setTeacherInfo, schedule, setSchedule } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. تصدير نسخة احتياطية (Backup)
  const handleBackup = async () => {
    try {
      const data = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        teacherInfo,
        schedule,
        students
      };

      const fileName = `Rased_Backup_${new Date().toISOString().split('T')[0]}.json`;
      const jsonString = JSON.stringify(data, null, 2);

      if (Capacitor.isNativePlatform()) {
        const result = await Filesystem.writeFile({
          path: fileName,
          data: jsonString,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        
        await Share.share({
          title: 'نسخة احتياطية - راصد',
          url: result.uri,
          dialogTitle: 'حفظ ملف النسخة الاحتياطية'
        });
      } else {
        // للويب (الكمبيوتر)
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
      }
      alert('✅ تم إنشاء النسخة الاحتياطية بنجاح!');
    } catch (error) {
      console.error(error);
      alert('❌ حدث خطأ أثناء النسخ الاحتياطي');
    }
  };

  // 2. استعادة نسخة (Restore)
  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("⚠️ تنبيه هام:\nاستعادة البيانات ستحذف البيانات الحالية وتستبدلها بالنسخة الجديدة.\nهل أنت متأكد؟")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.students && json.teacherInfo) {
          setStudents(json.students);
          setTeacherInfo(json.teacherInfo);
          if (json.schedule) setSchedule(json.schedule);
          alert('✅ تم استعادة البيانات بنجاح!');
        } else {
          alert('❌ الملف غير صالح أو تالف');
        }
      } catch (err) {
        alert('❌ خطأ في قراءة الملف');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // تصفير الإدخال
  };

  // 3. تصفير البيانات (Reset)
  const handleReset = () => {
    const code = prompt("لحذف جميع الطلاب والبيانات نهائياً، اكتب (حذف) للتأكيد:");
    if (code === "حذف") {
      setStudents([]);
      alert("تم حذف جميع البيانات وتصفير التطبيق.");
    }
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 pt-10">
      
      {/* رأس الصفحة */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-slate-800">الإعدادات والأمان</h1>
        <p className="text-slate-500 text-sm mt-1">تحكم ببياناتك وحافظ عليها</p>
      </div>

      {/* قسم النسخ الاحتياطي */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-700 flex items-center gap-2">
          <Save className="w-5 h-5 text-indigo-500" /> إدارة البيانات
        </h2>
        
        <button onClick={handleBackup} className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-4 rounded-2xl flex items-center justify-between transition-all group">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full shadow-sm"><FileJson className="w-5 h-5 text-indigo-600"/></div>
            <div className="text-right">
              <span className="block font-bold text-sm">نسخة احتياطية</span>
              <span className="block text-[10px] text-indigo-400">حفظ كل الطلاب والدرجات</span>
            </div>
          </div>
          <CheckCircle2 className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <button onClick={() => fileInputRef.current?.click()} className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-4 rounded-2xl flex items-center justify-between transition-all group">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full shadow-sm"><Upload className="w-5 h-5 text-emerald-600"/></div>
            <div className="text-right">
              <span className="block font-bold text-sm">استعادة البيانات</span>
              <span className="block text-[10px] text-emerald-500">من ملف محفوظ سابقاً</span>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleRestore} accept=".json" className="hidden" />
        </button>
      </div>

      {/* منطقة الخطر */}
      <div className="bg-rose-50 p-5 rounded-3xl border border-rose-100 space-y-4">
        <h2 className="font-bold text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> منطقة الخطر
        </h2>
        <button onClick={handleReset} className="w-full bg-white text-rose-600 border border-rose-200 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-rose-600 hover:text-white transition-all shadow-sm">
          <Trash2 className="w-5 h-5" />
          تصفير جميع البيانات
        </button>
      </div>

      <div className="text-center text-xs text-slate-400 mt-10">
        الإصدار Lite 1.0.0
      </div>
    </div>
  );
};

export default SettingsLite;