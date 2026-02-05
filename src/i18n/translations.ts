 export type Language = 'pt-BR' | 'en' | 'es' | 'zh' | 'ar';
 
 export const LANGUAGES: { code: Language; name: string; nativeName: string; rtl?: boolean }[] = [
   { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (BR)' },
   { code: 'en', name: 'English', nativeName: 'English' },
   { code: 'es', name: 'Spanish', nativeName: 'Español' },
   { code: 'zh', name: 'Chinese', nativeName: '中文' },
   { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
 ];
 
 export type TranslationKey = keyof typeof translations['pt-BR'];
 
 export const translations = {
   'pt-BR': {
     // Navigation
     'nav.tracking': 'Rastreamento',
     'nav.analytics': 'IA Analytics',
     'nav.billing': 'Financeiro',
     'nav.users': 'Usuários',
     'nav.settings': 'Configurações',
     'nav.newDevice': 'Novo Dispositivo',
     'nav.collapse': 'Recolher',
     
     // Status
     'status.moving': 'Em movimento',
     'status.idle': 'Parado ligado',
     'status.offline': 'Offline',
     'status.unknown': 'Desconhecido',
     
     // Vehicle Card
     'vehicle.speed': 'Velocidade',
     'vehicle.lastUpdate': 'Última atualização',
     'vehicle.viewDetails': 'Ver detalhes',
     'vehicle.viewTrail': 'Ver trajeto',
     
     // Settings
     'settings.title': 'Configurações',
     'settings.subtitle': 'Preferências e configurações do sistema',
     'settings.notifications': 'Notificações',
     'settings.notifications.desc': 'Configurar alertas e notificações',
     'settings.security': 'Segurança',
     'settings.security.desc': 'Senhas, autenticação e acessos',
     'settings.appearance': 'Aparência',
     'settings.appearance.desc': 'Tema, cores e personalização (White Label)',
     'settings.locale': 'Idioma e Região',
     'settings.locale.desc': 'Fuso horário e formatos',
     'settings.integrations': 'API & Integrações',
     'settings.integrations.desc': 'Conexões com sistemas externos',
     'settings.back': 'Voltar',
     'settings.save': 'Salvar',
     'settings.saved': 'Salvo!',
     'settings.cancel': 'Cancelar',
     
     // Notifications Panel
     'notifications.title': 'Notificações',
     'notifications.subtitle': 'Configure os alertas do sistema',
     'notifications.ignition': 'Alerta de Ignição',
     'notifications.ignition.desc': 'Receber alerta quando veículo ligar/desligar',
     'notifications.speed': 'Excesso de Velocidade',
     'notifications.speed.desc': 'Alerta quando veículo ultrapassar limite',
     'notifications.geofence': 'Cerca Virtual',
     'notifications.geofence.desc': 'Alerta de entrada/saída de áreas',
     'notifications.maintenance': 'Manutenção',
     'notifications.maintenance.desc': 'Lembretes de revisão e manutenção',
     
     // Security Panel
     'security.title': 'Segurança',
     'security.subtitle': 'Gerencie a segurança da sua conta',
     'security.changePassword': 'Alterar Senha',
     'security.changePassword.desc': 'Atualize sua senha de acesso',
     'security.currentPassword': 'Senha Atual',
     'security.newPassword': 'Nova Senha',
     'security.confirmPassword': 'Confirmar Nova Senha',
     'security.2fa': 'Autenticação de Dois Fatores',
     'security.2fa.desc': 'Adicione uma camada extra de segurança',
     'security.2fa.enabled': '2FA está ativado',
     'security.2fa.disabled': '2FA está desativado',
     
     // Integrations Panel
     'integrations.title': 'API & Integrações',
     'integrations.subtitle': 'Conecte sistemas externos',
     'integrations.asaas': 'Token Asaas',
     'integrations.asaas.desc': 'Integração com gateway de pagamentos',
     'integrations.asaas.placeholder': 'Cole seu token de API do Asaas',
     'integrations.webhook': 'Webhook URL',
     'integrations.webhook.desc': 'URL para receber eventos do sistema',
     'integrations.webhook.placeholder': 'https://seuservidor.com/webhook',
     'integrations.test': 'Testar Conexão',
     
     // Locale Panel
     'locale.title': 'Idioma e Região',
     'locale.subtitle': 'Configure idioma e fuso horário',
     'locale.language': 'Idioma da Interface',
     'locale.timezone': 'Fuso Horário',
     'locale.dateFormat': 'Formato de Data',
     
     // Common
     'common.enabled': 'Ativado',
     'common.disabled': 'Desativado',
     'common.loading': 'Carregando...',
     'common.error': 'Erro',
     'common.success': 'Sucesso',
     'common.confirm': 'Confirmar',
     'common.close': 'Fechar',
     
     // Footer
     'footer.version': 'FleetAI Pro Platform v1.0.0 • © 2025 Todos os direitos reservados',
   },
   
   'en': {
     // Navigation
     'nav.tracking': 'Tracking',
     'nav.analytics': 'AI Analytics',
     'nav.billing': 'Billing',
     'nav.users': 'Users',
     'nav.settings': 'Settings',
     'nav.newDevice': 'New Device',
     'nav.collapse': 'Collapse',
     
     // Status
     'status.moving': 'Moving',
     'status.idle': 'Idle',
     'status.offline': 'Offline',
     'status.unknown': 'Unknown',
     
     // Vehicle Card
     'vehicle.speed': 'Speed',
     'vehicle.lastUpdate': 'Last update',
     'vehicle.viewDetails': 'View details',
     'vehicle.viewTrail': 'View trail',
     
     // Settings
     'settings.title': 'Settings',
     'settings.subtitle': 'System preferences and settings',
     'settings.notifications': 'Notifications',
     'settings.notifications.desc': 'Configure alerts and notifications',
     'settings.security': 'Security',
     'settings.security.desc': 'Passwords, authentication and access',
     'settings.appearance': 'Appearance',
     'settings.appearance.desc': 'Theme, colors and customization (White Label)',
     'settings.locale': 'Language & Region',
     'settings.locale.desc': 'Timezone and formats',
     'settings.integrations': 'API & Integrations',
     'settings.integrations.desc': 'External system connections',
     'settings.back': 'Back',
     'settings.save': 'Save',
     'settings.saved': 'Saved!',
     'settings.cancel': 'Cancel',
     
     // Notifications Panel
     'notifications.title': 'Notifications',
     'notifications.subtitle': 'Configure system alerts',
     'notifications.ignition': 'Ignition Alert',
     'notifications.ignition.desc': 'Get alert when vehicle turns on/off',
     'notifications.speed': 'Speed Limit',
     'notifications.speed.desc': 'Alert when vehicle exceeds limit',
     'notifications.geofence': 'Geofence',
     'notifications.geofence.desc': 'Entry/exit area alerts',
     'notifications.maintenance': 'Maintenance',
     'notifications.maintenance.desc': 'Service and maintenance reminders',
     
     // Security Panel
     'security.title': 'Security',
     'security.subtitle': 'Manage your account security',
     'security.changePassword': 'Change Password',
     'security.changePassword.desc': 'Update your access password',
     'security.currentPassword': 'Current Password',
     'security.newPassword': 'New Password',
     'security.confirmPassword': 'Confirm New Password',
     'security.2fa': 'Two-Factor Authentication',
     'security.2fa.desc': 'Add an extra layer of security',
     'security.2fa.enabled': '2FA is enabled',
     'security.2fa.disabled': '2FA is disabled',
     
     // Integrations Panel
     'integrations.title': 'API & Integrations',
     'integrations.subtitle': 'Connect external systems',
     'integrations.asaas': 'Asaas Token',
     'integrations.asaas.desc': 'Payment gateway integration',
     'integrations.asaas.placeholder': 'Paste your Asaas API token',
     'integrations.webhook': 'Webhook URL',
     'integrations.webhook.desc': 'URL to receive system events',
     'integrations.webhook.placeholder': 'https://yourserver.com/webhook',
     'integrations.test': 'Test Connection',
     
     // Locale Panel
     'locale.title': 'Language & Region',
     'locale.subtitle': 'Configure language and timezone',
     'locale.language': 'Interface Language',
     'locale.timezone': 'Timezone',
     'locale.dateFormat': 'Date Format',
     
     // Common
     'common.enabled': 'Enabled',
     'common.disabled': 'Disabled',
     'common.loading': 'Loading...',
     'common.error': 'Error',
     'common.success': 'Success',
     'common.confirm': 'Confirm',
     'common.close': 'Close',
     
     // Footer
     'footer.version': 'FleetAI Pro Platform v1.0.0 • © 2025 All rights reserved',
   },
   
   'es': {
     // Navigation
     'nav.tracking': 'Rastreo',
     'nav.analytics': 'IA Analytics',
     'nav.billing': 'Finanzas',
     'nav.users': 'Usuarios',
     'nav.settings': 'Configuración',
     'nav.newDevice': 'Nuevo Dispositivo',
     'nav.collapse': 'Colapsar',
     
     // Status
     'status.moving': 'En movimiento',
     'status.idle': 'Detenido encendido',
     'status.offline': 'Sin conexión',
     'status.unknown': 'Desconocido',
     
     // Vehicle Card
     'vehicle.speed': 'Velocidad',
     'vehicle.lastUpdate': 'Última actualización',
     'vehicle.viewDetails': 'Ver detalles',
     'vehicle.viewTrail': 'Ver ruta',
     
     // Settings
     'settings.title': 'Configuración',
     'settings.subtitle': 'Preferencias y configuraciones del sistema',
     'settings.notifications': 'Notificaciones',
     'settings.notifications.desc': 'Configurar alertas y notificaciones',
     'settings.security': 'Seguridad',
     'settings.security.desc': 'Contraseñas, autenticación y accesos',
     'settings.appearance': 'Apariencia',
     'settings.appearance.desc': 'Tema, colores y personalización (White Label)',
     'settings.locale': 'Idioma y Región',
     'settings.locale.desc': 'Zona horaria y formatos',
     'settings.integrations': 'API e Integraciones',
     'settings.integrations.desc': 'Conexiones con sistemas externos',
     'settings.back': 'Volver',
     'settings.save': 'Guardar',
     'settings.saved': '¡Guardado!',
     'settings.cancel': 'Cancelar',
     
     // Notifications Panel
     'notifications.title': 'Notificaciones',
     'notifications.subtitle': 'Configure las alertas del sistema',
     'notifications.ignition': 'Alerta de Encendido',
     'notifications.ignition.desc': 'Recibir alerta cuando el vehículo enciende/apaga',
     'notifications.speed': 'Exceso de Velocidad',
     'notifications.speed.desc': 'Alerta cuando el vehículo exceda el límite',
     'notifications.geofence': 'Geocerca',
     'notifications.geofence.desc': 'Alertas de entrada/salida de áreas',
     'notifications.maintenance': 'Mantenimiento',
     'notifications.maintenance.desc': 'Recordatorios de revisión y mantenimiento',
     
     // Security Panel
     'security.title': 'Seguridad',
     'security.subtitle': 'Gestione la seguridad de su cuenta',
     'security.changePassword': 'Cambiar Contraseña',
     'security.changePassword.desc': 'Actualice su contraseña de acceso',
     'security.currentPassword': 'Contraseña Actual',
     'security.newPassword': 'Nueva Contraseña',
     'security.confirmPassword': 'Confirmar Nueva Contraseña',
     'security.2fa': 'Autenticación de Dos Factores',
     'security.2fa.desc': 'Añada una capa extra de seguridad',
     'security.2fa.enabled': '2FA está activado',
     'security.2fa.disabled': '2FA está desactivado',
     
     // Integrations Panel
     'integrations.title': 'API e Integraciones',
     'integrations.subtitle': 'Conecte sistemas externos',
     'integrations.asaas': 'Token Asaas',
     'integrations.asaas.desc': 'Integración con pasarela de pagos',
     'integrations.asaas.placeholder': 'Pegue su token de API de Asaas',
     'integrations.webhook': 'Webhook URL',
     'integrations.webhook.desc': 'URL para recibir eventos del sistema',
     'integrations.webhook.placeholder': 'https://suservidor.com/webhook',
     'integrations.test': 'Probar Conexión',
     
     // Locale Panel
     'locale.title': 'Idioma y Región',
     'locale.subtitle': 'Configure idioma y zona horaria',
     'locale.language': 'Idioma de la Interfaz',
     'locale.timezone': 'Zona Horaria',
     'locale.dateFormat': 'Formato de Fecha',
     
     // Common
     'common.enabled': 'Activado',
     'common.disabled': 'Desactivado',
     'common.loading': 'Cargando...',
     'common.error': 'Error',
     'common.success': 'Éxito',
     'common.confirm': 'Confirmar',
     'common.close': 'Cerrar',
     
     // Footer
     'footer.version': 'FleetAI Pro Platform v1.0.0 • © 2025 Todos los derechos reservados',
   },
   
   'zh': {
     // Navigation
     'nav.tracking': '追踪',
     'nav.analytics': 'AI 分析',
     'nav.billing': '财务',
     'nav.users': '用户',
     'nav.settings': '设置',
     'nav.newDevice': '新设备',
     'nav.collapse': '折叠',
     
     // Status
     'status.moving': '行驶中',
     'status.idle': '已停止',
     'status.offline': '离线',
     'status.unknown': '未知',
     
     // Vehicle Card
     'vehicle.speed': '速度',
     'vehicle.lastUpdate': '最后更新',
     'vehicle.viewDetails': '查看详情',
     'vehicle.viewTrail': '查看轨迹',
     
     // Settings
     'settings.title': '设置',
     'settings.subtitle': '系统偏好和设置',
     'settings.notifications': '通知',
     'settings.notifications.desc': '配置警报和通知',
     'settings.security': '安全',
     'settings.security.desc': '密码、身份验证和访问',
     'settings.appearance': '外观',
     'settings.appearance.desc': '主题、颜色和定制（白标）',
     'settings.locale': '语言和地区',
     'settings.locale.desc': '时区和格式',
     'settings.integrations': 'API 和集成',
     'settings.integrations.desc': '外部系统连接',
     'settings.back': '返回',
     'settings.save': '保存',
     'settings.saved': '已保存！',
     'settings.cancel': '取消',
     
     // Notifications Panel
     'notifications.title': '通知',
     'notifications.subtitle': '配置系统警报',
     'notifications.ignition': '点火警报',
     'notifications.ignition.desc': '车辆开启/关闭时收到警报',
     'notifications.speed': '超速',
     'notifications.speed.desc': '车辆超速时警报',
     'notifications.geofence': '地理围栏',
     'notifications.geofence.desc': '进入/离开区域警报',
     'notifications.maintenance': '维护',
     'notifications.maintenance.desc': '服务和维护提醒',
     
     // Security Panel
     'security.title': '安全',
     'security.subtitle': '管理您的帐户安全',
     'security.changePassword': '更改密码',
     'security.changePassword.desc': '更新您的访问密码',
     'security.currentPassword': '当前密码',
     'security.newPassword': '新密码',
     'security.confirmPassword': '确认新密码',
     'security.2fa': '双因素身份验证',
     'security.2fa.desc': '添加额外的安全层',
     'security.2fa.enabled': '2FA 已启用',
     'security.2fa.disabled': '2FA 已禁用',
     
     // Integrations Panel
     'integrations.title': 'API 和集成',
     'integrations.subtitle': '连接外部系统',
     'integrations.asaas': 'Asaas 令牌',
     'integrations.asaas.desc': '支付网关集成',
     'integrations.asaas.placeholder': '粘贴您的 Asaas API 令牌',
     'integrations.webhook': 'Webhook URL',
     'integrations.webhook.desc': '接收系统事件的 URL',
     'integrations.webhook.placeholder': 'https://yourserver.com/webhook',
     'integrations.test': '测试连接',
     
     // Locale Panel
     'locale.title': '语言和地区',
     'locale.subtitle': '配置语言和时区',
     'locale.language': '界面语言',
     'locale.timezone': '时区',
     'locale.dateFormat': '日期格式',
     
     // Common
     'common.enabled': '已启用',
     'common.disabled': '已禁用',
     'common.loading': '加载中...',
     'common.error': '错误',
     'common.success': '成功',
     'common.confirm': '确认',
     'common.close': '关闭',
     
     // Footer
     'footer.version': 'FleetAI Pro Platform v1.0.0 • © 2025 版权所有',
   },
   
   'ar': {
     // Navigation
     'nav.tracking': 'التتبع',
     'nav.analytics': 'تحليلات الذكاء الاصطناعي',
     'nav.billing': 'المالية',
     'nav.users': 'المستخدمين',
     'nav.settings': 'الإعدادات',
     'nav.newDevice': 'جهاز جديد',
     'nav.collapse': 'طي',
     
     // Status
     'status.moving': 'متحرك',
     'status.idle': 'متوقف مشغل',
     'status.offline': 'غير متصل',
     'status.unknown': 'غير معروف',
     
     // Vehicle Card
     'vehicle.speed': 'السرعة',
     'vehicle.lastUpdate': 'آخر تحديث',
     'vehicle.viewDetails': 'عرض التفاصيل',
     'vehicle.viewTrail': 'عرض المسار',
     
     // Settings
     'settings.title': 'الإعدادات',
     'settings.subtitle': 'تفضيلات وإعدادات النظام',
     'settings.notifications': 'الإشعارات',
     'settings.notifications.desc': 'تكوين التنبيهات والإشعارات',
     'settings.security': 'الأمان',
     'settings.security.desc': 'كلمات المرور والمصادقة والوصول',
     'settings.appearance': 'المظهر',
     'settings.appearance.desc': 'السمة والألوان والتخصيص',
     'settings.locale': 'اللغة والمنطقة',
     'settings.locale.desc': 'المنطقة الزمنية والتنسيقات',
     'settings.integrations': 'واجهة برمجة التطبيقات والتكاملات',
     'settings.integrations.desc': 'اتصالات الأنظمة الخارجية',
     'settings.back': 'رجوع',
     'settings.save': 'حفظ',
     'settings.saved': 'تم الحفظ!',
     'settings.cancel': 'إلغاء',
     
     // Notifications Panel
     'notifications.title': 'الإشعارات',
     'notifications.subtitle': 'تكوين تنبيهات النظام',
     'notifications.ignition': 'تنبيه التشغيل',
     'notifications.ignition.desc': 'تلقي تنبيه عند تشغيل/إيقاف السيارة',
     'notifications.speed': 'تجاوز السرعة',
     'notifications.speed.desc': 'تنبيه عند تجاوز السيارة للحد',
     'notifications.geofence': 'السياج الجغرافي',
     'notifications.geofence.desc': 'تنبيهات الدخول/الخروج من المناطق',
     'notifications.maintenance': 'الصيانة',
     'notifications.maintenance.desc': 'تذكيرات الخدمة والصيانة',
     
     // Security Panel
     'security.title': 'الأمان',
     'security.subtitle': 'إدارة أمان حسابك',
     'security.changePassword': 'تغيير كلمة المرور',
     'security.changePassword.desc': 'تحديث كلمة مرور الوصول',
     'security.currentPassword': 'كلمة المرور الحالية',
     'security.newPassword': 'كلمة المرور الجديدة',
     'security.confirmPassword': 'تأكيد كلمة المرور الجديدة',
     'security.2fa': 'المصادقة الثنائية',
     'security.2fa.desc': 'إضافة طبقة أمان إضافية',
     'security.2fa.enabled': 'المصادقة الثنائية مفعلة',
     'security.2fa.disabled': 'المصادقة الثنائية معطلة',
     
     // Integrations Panel
     'integrations.title': 'واجهة برمجة التطبيقات والتكاملات',
     'integrations.subtitle': 'ربط الأنظمة الخارجية',
     'integrations.asaas': 'رمز Asaas',
     'integrations.asaas.desc': 'تكامل بوابة الدفع',
     'integrations.asaas.placeholder': 'الصق رمز API الخاص بـ Asaas',
     'integrations.webhook': 'رابط Webhook',
     'integrations.webhook.desc': 'رابط لاستقبال أحداث النظام',
     'integrations.webhook.placeholder': 'https://yourserver.com/webhook',
     'integrations.test': 'اختبار الاتصال',
     
     // Locale Panel
     'locale.title': 'اللغة والمنطقة',
     'locale.subtitle': 'تكوين اللغة والمنطقة الزمنية',
     'locale.language': 'لغة الواجهة',
     'locale.timezone': 'المنطقة الزمنية',
     'locale.dateFormat': 'تنسيق التاريخ',
     
     // Common
     'common.enabled': 'مفعل',
     'common.disabled': 'معطل',
     'common.loading': 'جاري التحميل...',
     'common.error': 'خطأ',
     'common.success': 'نجاح',
     'common.confirm': 'تأكيد',
     'common.close': 'إغلاق',
     
     // Footer
     'footer.version': 'FleetAI Pro Platform v1.0.0 • © 2025 جميع الحقوق محفوظة',
   },
 } as const;