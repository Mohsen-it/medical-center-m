# تخطيط مشروع إدارة المجمع الطبي الاحترافي

## نظرة عامة
مشروع إدارة مجمع طبي متكامل باستخدام أحدث التقنيات:
- Laravel 12.9.0 (Backend)
- Inertia.js 2.0.10 (Bridge)
- React 19.2.0 (Frontend)
- Tailwind CSS 4.1.16 (Styling)
- MySQL 8.0 (Database)

## الأدوار والصلاحيات

### 1. المدير العام (Admin)
- إدارة جميع المستخدمين
- إدارة الأقسام والعيادات
- إدارة المواعيد والجداول
- عرض التقارير والإحصائيات
- إدارة النظام والاعدادات

### 2. الطبيب (Doctor)
- عرض المواعيد الخاصة به
- إدارة سجلات المرضى
- كتابة الوصفات الطبية
- إدارة الفحوصات والنتائج
- التواصل مع المرضى

### 3. موظف الاستقبال (Receptionist)
- حجز المواعيد
- تسجيل المرضى الجدد
- إدارة الحضور والانصراف
- استقبال المكالمات
- تنظيم قوائم الانتظار

## قاعدة البيانات - التصميم الشامل

### الجداول الرئيسية:

#### 1. users (المستخدمون)
```sql
- id (PK)
- name (اسم المستخدم)
- email (البريد الإلكتروني)
- password (كلمة المرور)
- phone (رقم الهاتف)
- role_type (enum: admin, doctor, receptionist)
- status (enum: active, inactive, suspended)
- email_verified_at
- created_at
- updated_at
```

#### 2. doctors (الأطباء)
```sql
- id (PK)
- user_id (FK to users)
- specialization_id (FK)
- license_number (رقم الترخيص)
- experience_years (سنوات الخبرة)
- consultation_fee (رسوم الاستشارة)
- available_days (أيام العمل المتاحة)
- available_time_from (وقت البدء)
- available_time_to (وقت الانتهاء)
- bio (السيرة الذاتية)
- created_at
- updated_at
```

#### 3. specializations (التخصصات)
```sql
- id (PK)
- name (اسم التخصص)
- description (الوصف)
- icon (أيقونة التخصص)
- created_at
- updated_at
```

#### 4. patients (المرضى)
```sql
- id (PK)
- name (اسم المريض)
- email (البريد الإلكتروني)
- phone (رقم الهاتف)
- date_of_birth (تاريخ الميلاد)
- gender (الجنس)
- blood_type (فصيلة الدم)
- address (العنوان)
- emergency_contact (رقم الطوارئ)
- medical_history (التاريخ الطبي)
- allergies (الحساسية)
- created_at
- updated_at
```

#### 5. appointments (المواعيد)
```sql
- id (PK)
- patient_id (FK)
- doctor_id (FK)
- specialization_id (FK)
- appointment_date (تاريخ الموعد)
- appointment_time (وقت الموعد)
- status (enum: scheduled, confirmed, completed, cancelled, no_show)
- type (enum: consultation, follow_up, emergency)
- notes (ملاحظات)
- created_at
- updated_at
```

#### 6. medical_records (السجلات الطبية)
```sql
- id (PK)
- patient_id (FK)
- doctor_id (FK)
- appointment_id (FK)
- diagnosis (التشخيص)
- symptoms (الأعراض)
- treatment (العلاج)
- prescription (الوصفة الطبية)
- notes (ملاحظات إضافية)
- created_at
- updated_at
```

#### 7. prescriptions (الوصفات الطبية)
```sql
- id (PK)
- medical_record_id (FK)
- patient_id (FK)
- doctor_id (FK)
- medications (الأدوية - JSON)
- dosage (الجرعة)
- instructions (التعليمات)
- issued_date (تاريخ الإصدار)
- valid_until (صالح حتى)
- created_at
- updated_at
```

#### 8. departments (الأقسام)
```sql
- id (PK)
- name (اسم القسم)
- description (الوصف)
- head_doctor_id (FK)
- floor (الطابق)
- room_number (رقم الغرفة)
- capacity (السعة)
- created_at
- updated_at
```

#### 9. clinics (العيادات)
```sql
- id (PK)
- department_id (FK)
- name (اسم العيادة)
- room_number (رقم الغرفة)
- equipment (المعدات - JSON)
- status (enum: active, maintenance, inactive)
- created_at
- updated_at
```

#### 10. schedules (جداول العمل)
```sql
- id (PK)
- doctor_id (FK)
- clinic_id (FK)
- day_of_week (يوم الأسبوع)
- start_time (وقت البدء)
- end_time (وقت الانتهاء)
- max_patients (الحد الأقصى للمرضى)
- is_available (متاح)
- created_at
- updated_at
```

## تصميم الواجهات (UI/UX)

### نظام الألوان الاحترافي:
- **الألوان الرئيسية:**
  - Primary: #0EA5E9 (Sky Blue)
  - Secondary: #6366F1 (Indigo)
  - Success: #10B981 (Emerald)
  - Warning: #F59E0B (Amber)
  - Danger: #EF4444 (Red)
  - Dark: #1F2937 (Gray)
  - Light: #F9FAFB (Gray)

### التصميم العام:
- تصميم عصري ونظيف
- واجهة متجاوبة بالكامل
- دعم الوضع الليلي والنهاري
- أيقونات احترافية من Heroicons
- خطوط عصرية (Inter Font)

### صفحات المدير العام:
1. **لوحة التحكم الرئيسية**
   - إحصائيات عامة
   - رسوم بيانية تفاعلية
   - أحدث المواعيد
   - حالة النظام

2. **إدارة المستخدمين**
   - قائمة المستخدمين
   - إضافة/تعديل مستخدم
   - إدارة الصلاحيات
   - تفعيل/تعطيل الحسابات

3. **إدارة الأقسام والعيادات**
   - قائمة الأقسام
   - إدارة العيادات
   - توزيع الأطباء
   - المعدات والمستلزمات

4. **التقارير والإحصائيات**
   - تقارير المواعيد
   - تقارير المرضى
   - تقارير الأطباء
   - تقارير مالية

### صفحات الطبيب:
1. **لوحة التحكم**
   - مواعيد اليوم
   - المرضى المنتظرون
   - إشعارات هامة
   - سريع الإحصائيات

2. **المواعيد**
   - جدول المواعيد
   - تفاصيل الموعد
   - حالة المواعيد
   - إعادة جدولة

3. **المرضى**
   - قائمة المرضى
   - السجل الطبي
   - الوصفات الطبية
   - الفحوصات

4. **الوصفات الطبية**
   - كتابة وصفة جديدة
   - قائمة الوصفات
   - تعديل الوصفات
   - طباعة الوصفات

### صفحات موظف الاستقبال:
1. **لوحة التحكم**
   - مواعيد اليوم
   - المرضى في الانتظار
   - المكالمات الواردة
   - إشعارات سريعة

2. **حجز المواعيد**
   - حجز موعد جديد
   - البحث عن مواعيد
   - تعديل المواعيد
   - إلغاء المواعيد

3. **تسجيل المرضى**
   - إضافة مريض جديد
   - تعديل بيانات المريض
   - البحث عن مريض
   - السجل الطبي

4. **الانتظار**
   - قائمة الانتظار
   - إدارة الحضور
   - إشعارات المرضى
   - تنظيم الدور

## المنطق البرمجي والميزات

### الميزات الرئيسية:
1. **نظام مصادقة قوي**
2. **صلاحيات دقيقة**
3. **إشعارات فورية**
4. **بحث متقدم**
5. **تصدير التقارير**
6. **دعم متعدد اللغات**
7. **نسخ احتياطي تلقائي**
8. **سجل التغييرات**

### التقنيات الإضافية:
- **Real-time**: Socket.io للإشعارات الفورية
- **Charts**: Chart.js للرسوم البيانية
- **File Upload**: Laravel Media Library
- **Search**: Laravel Scout + Algolia
- **Cache**: Redis
- **Queue**: Redis Queue
- **Notifications**: Laravel Notifications
- **Validation**: Laravel Form Request
- **API**: Laravel Sanctum

## هيكل المجلدات

```
medical-center/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Requests/
│   │   └── Middleware/
│   ├── Models/
│   ├── Services/
│   ├── Jobs/
│   └── Notifications/
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
├── resources/
│   ├── js/
│   │   ├── Components/
│   │   ├── Pages/
│   │   ├── Layouts/
│   │   └── Hooks/
│   └── views/
├── routes/
├── tests/
└── storage/
```

## خطة التنفيذ

### المرحلة 1: الإعداد الأساسي
- تثبيت Laravel وإعداداته
- إعداد Inertia.js و React
- إعداد Tailwind CSS
- إعداد قاعدة البيانات

### المرحلة 2: قاعدة البيانات
- إنشاء الـ Migrations
- إنشاء الـ Models
- إنشاء الـ Relationships
- بيانات تجريبية (Seeders)

### المرحلة 3: المصادقة والصلاحيات
- نظام تسجيل الدخول
- إدارة الصلاحيات
- Middleware للتحقق
- Guards والأدوار

### المرحلة 4: الواجهات الخلفية
- Controllers كاملة
- API Routes
- Services Classes
- Validation Rules

### المرحلة 5: الواجهات الأمامية
- مكونات React أساسية
- صفحات المدير
- صفحات الطبيب
- صفحات موظف الاستقبال

### المرحلة 6: الميزات المتقدمة
- الإشعارات الفورية
- البحث المتقدم
- التقارير والرسوم البيانية
- تصدير البيانات

### المرحلة 7: الاختبار والتحسين
- اختبار الوحدات
- اختبار التكامل
- تحسين الأداء
- أمان التطبيق

## معايير الجودة
- كتابة تعليقات للكود
- اتباع PSR standards
- اختبارات شاملة
- تحسين SEO
- دعم الوصولية
- أداء عالي