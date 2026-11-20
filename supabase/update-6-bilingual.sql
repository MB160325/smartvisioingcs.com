-- شغّل مرة واحدة في Supabase → SQL Editor (بعد الملفات السابقة)
-- يضيف حقولاً عربية للأخبار والمشاريع والشركاء والفريق، ويضع الترجمة العربية للمحتوى الأصلي المستورد.
alter table news add column if not exists title_ar text, add column if not exists category_ar text, add column if not exists body_ar text;
alter table projects add column if not exists title_ar text, add column if not exists description_ar text;
alter table partners add column if not exists name_ar text;
alter table team add column if not exists name_ar text, add column if not exists role_ar text, add column if not exists bio_ar text;

update news set title_ar=$v$وصول سمارت فيجن إلى نهائيات جائزة Impact Leadership$v$, category_ar=$v$تقدير الصناعة$v$, body_ar=$v$وصلت سمارت فيجن بفخر إلى المرحلة النهائية من جائزة Impact Leadership لعام 2026، منافسةً أكبر المؤسسات الهندسية في مصر.
وتواصل الشركة وضع معايير جديدة في الابتكار والتميز.$v$ where legacy and created_at::date = date '2026-02-02';
update news set title_ar=$v$وصول سمارت فيجن إلى نهائيات جائزة Impact Leadership 2025$v$, category_ar=$v$شراكة مؤسسية$v$, body_ar=$v$وصلت سمارت فيجن بفخر إلى المرحلة النهائية من جائزة Impact Leadership لعام 2025، منافسةً أكبر المؤسسات الهندسية في مصر.
وتواصل الشركة وضع معايير جديدة في الابتكار والتميز.$v$ where legacy and created_at::date = date '2025-09-15';
update news set title_ar=$v$سمارت فيجن تصل إلى نهائيات جائزة Impact Leadership في Big 5 Egypt$v$, category_ar=$v$إنجاز مشروع$v$, body_ar=$v$حققت سمارت فيجن للاستشارات الهندسية إنجازاً لافتاً بوصولها إلى نهائيات جائزة Impact Leadership المرموقة في Big 5 Egypt 2025، أحد أبرز الفعاليات الإقليمية في قطاعي التشييد والهندسة. وبمنافسة أسماء صناعية كبرى مثل المقاولون العرب والمجموعة المصرية للاستشاريين، تبرز سمارت فيجن كشركة نامية ذات رؤية استراتيجية قوية وأثر ملموس.
وعقب هذا التقدير، اختيرت الشركة لتمثيل مصر في Big 5 Global بدبي في نوفمبر 2025، في خطوة مهمة نحو التوسع الدولي وتعزيز مكانتها بين أبرز اللاعبين في التشييد المستدام والهندسة المتقدمة.
وصرّح م. محمد أسامة حسان، رئيس مجلس إدارة سمارت فيجن: «رحلتنا إلى النهائيات وتأهلنا إلى Big 5 Global يعكسان إيماننا بأن الشركات الصغيرة تستطيع تحقيق إنجازات كبيرة حين تجمع بين الرؤية والجودة والالتزام تجاه عملائها.»$v$ where legacy and created_at::date = date '2025-10-24';

update team set name_ar=$v$د.م. محمد أسامة حسان$v$, role_ar=$v$المؤسس ورئيس مجلس الإدارة والرئيس التنفيذي$v$, bio_ar=$v$كان قوة دافعة وراء نمو سمارت فيجن. يشغل منصب رئيس مجلس الإدارة والرئيس التنفيذي، وقاد الشركة منذ أولى مشاريعها عام 2004 لتصبح من الاستشاريين الرائدين في مصر. عُرف بين زملائه منذ سن مبكرة بحسه التجاري القوي، وهو مؤسس ورئيس شركة O Consult للاستشارات العامة. وإلى جانب دوره المؤسسي، يعمل مرشداً لكثير من المهنيين الصاعدين، ويسهم في المبادرات المجتمعية، وكثيراً ما يُكلَّف بتأليف كتب في تطوير الذات والقيادة.$v$ where legacy and sort = 0;
update team set name_ar=$v$م. أحمد أمين$v$, role_ar=$v$شريك مؤسس والمدير المالي$v$, bio_ar=$v$بصفته المدير المالي، قاد الشركة منذ أولى مشاريعها عام 2004 لتصبح من الاستشاريين الرائدين في مصر. شغل مناصب إدارية في مشاريع سكنية وتجارية متنوعة. حاصل على بكالوريوس العمارة من كلية الفنون الجميلة ودبلوم إدارة من جامعة عين شمس.$v$ where legacy and sort = 1;
update team set name_ar=$v$ميشيل منير$v$, role_ar=$v$رئيس قسم MEP$v$, bio_ar=$v$يقود مشاريع الميكانيكا والكهرباء والسباكة في سمارت فيجن بدقة وابتكار.$v$ where legacy and sort = 2;
update team set name_ar=$v$هبة عبد الحميد$v$, role_ar=$v$رئيس مراقبة التكاليف$v$, bio_ar=$v$تدفع ربحية مشاريع سمارت فيجن عبر الميزانيات الاستراتيجية وتحسين التكاليف.$v$ where legacy and sort = 3;
update team set name_ar=$v$إسلام فارس$v$, role_ar=$v$قائد الفريق الإنشائي$v$, bio_ar=$v$يقود الفريق الإنشائي في سمارت فيجن لتقديم تصاميم مبتكرة ومطابقة للكود وعالية الأثر بدقة وروح تعاون.$v$ where legacy and sort = 4;
update team set name_ar=$v$ملك إبراهيم$v$, role_ar=$v$منسق المشاريع$v$, bio_ar=$v$تنسّق أعمال جميع التخصصات بين أعضاء الفريق في مشاريع سمارت فيجن.$v$ where legacy and sort = 5;
update team set name_ar=$v$أحمد أيمن$v$, role_ar=$v$مهندس إشراف على التنفيذ$v$, bio_ar=$v$مسؤول عن الجودة والإشراف على التنفيذ في الموقع.$v$ where legacy and sort = 6;

update partners set name_ar=$v$بالم هيلز للتطوير$v$ where legacy and sort = 1;
update partners set name_ar=$v$أوراسكوم للتنمية$v$ where legacy and sort = 2;
update partners set name_ar=$v$مجرى$v$ where legacy and sort = 3;
update partners set name_ar=$v$جيرد كونسلت$v$ where legacy and sort = 4;
update partners set name_ar=$v$ذا ثري كورنرز$v$ where legacy and sort = 5;
update partners set name_ar=$v$فانتج$v$ where legacy and sort = 6;
update partners set name_ar=$v$كانتري هومز$v$ where legacy and sort = 7;
update partners set name_ar=$v$UECC$v$ where legacy and sort = 8;
update partners set name_ar=$v$زارو$v$ where legacy and sort = 9;
update partners set name_ar=$v$سنتشري سيتي$v$ where legacy and sort = 10;
