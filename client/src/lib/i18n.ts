// Sistema de internacionalización simple
export const translations = {
  es: {
    // Header
    header: {
      secureConnection: "Conexión Segura",
    },
    // Notifications
    notifications: {
      noNotifications: "No hay notificaciones",
      viewAll: "Ver todas las notificaciones",
    },
    // Navegación
    nav: {
      dashboard: "Panel Principal",
      elections: "Elecciones",
      users: "Usuarios",
      results: "Resultados",
      audit: "Auditoría",
      support: "Soporte",
      profile: "Mi Perfil",
      settings: "Configuración",
      logout: "Cerrar Sesión",
    },
    // Descripciones del menú
    menuDescriptions: {
      dashboard: "Vista general del sistema",
      elections: "Gestionar procesos electorales",
      users: "Administrar usuarios del sistema",
      results: "Ver resultados electorales",
      audit: "Revisar actividad del sistema",
      support: "Ayuda y soporte técnico",
      profile: "Gestionar tu perfil",
      settings: "Configurar tu cuenta",
    },
    // Roles
    roles: {
      student: "Estudiante",
      teacher: "Docente",
      administrator: "Administrador",
      authority: "Autoridad",
    },
    // Dashboard
    dashboard: {
      welcome: "Bienvenido al Sistema de Votación",
      subtitle: "Gestiona elecciones de forma segura y transparente",
      activeElections: "Elecciones Activas",
      processesInProgress: "procesos en curso",
      votesToday: "Votos Emitidos Hoy",
      activeParticipation: "participación activa",
      onlineUsers: "Usuarios Conectados",
      realTime: "en tiempo real",
      security: "Seguridad",
      protectedSystems: "sistemas protegidos",
      quickActions: "Acciones Rápidas",
      newElection: "Nueva Elección",
      createElectoralProcess: "Crear proceso electoral",
      registerUser: "Registrar Usuario",
      addNewParticipant: "Agregar nuevo participante",
      viewResults: "Ver Resultados",
      analyzeVotingData: "Analizar datos de votación",
      noActiveElections: "No hay elecciones activas",
      seeAll: "Ver todas",
    },
    // Common
    common: {
      loading: "Cargando...",
      save: "Guardar",
      cancel: "Cancelar",
      delete: "Eliminar",
      edit: "Editar",
      create: "Crear",
      search: "Buscar",
      filter: "Filtrar",
      export: "Exportar",
      yes: "Sí",
      no: "No",
      confirm: "Confirmar",
      back: "Volver",
      next: "Siguiente",
      previous: "Anterior",
      close: "Cerrar",
      submit: "Enviar",
      reset: "Restablecer",
      online: "En línea",
      offline: "Desconectado",
    },
    // Settings
    settings: {
      title: "Configuración",
      description: "Gestiona tus preferencias del sistema",
      notifications: {
        title: "Notificaciones",
        description: "Configurar cómo quieres recibir notificaciones",
        email: "Notificaciones por correo",
        emailDesc: "Recibir notificaciones por correo electrónico",
        browser: "Notificaciones del navegador",
        browserDesc: "Mostrar notificaciones en el navegador",
        elections: "Alertas de elecciones",
        electionsDesc: "Notificar sobre nuevas elecciones y cambios",
        results: "Resultados de votación",
        resultsDesc: "Notificar cuando estén disponibles los resultados",
      },
      language: {
        title: "Idioma",
        description: "Seleccionar idioma de la interfaz",
        spanish: "Español",
        english: "English",
      },
      security: {
        title: "Seguridad",
        description: "Configurar opciones de seguridad de tu cuenta",
        twoFactor: "Autenticación de dos factores",
        twoFactorDesc: "Agregar capa extra de seguridad a tu cuenta",
        sessionTimeout: "Tiempo límite de sesión",
        sessionTimeoutDesc: "Cerrar sesión automáticamente por inactividad",
      },
      saved: "Configuración guardada",
      notificationsSaved: "Las preferencias de notificaciones han sido actualizadas",
      languageSaved: "El idioma ha sido cambiado",
    },
    // Elections
    elections: {
      title: "Elecciones",
      description: "Gestionar procesos electorales",
      newElection: "Nueva Elección",
      createElection: "Crear Elección",
      electionName: "Nombre de la Elección",
      electionDescription: "Descripción",
      startDate: "Fecha de Inicio",
      endDate: "Fecha de Fin",
      candidates: "Candidatos",
      addCandidate: "Agregar Candidato",
      candidateName: "Nombre del Candidato",
      candidateDescription: "Descripción del Candidato",
      noElections: "No hay elecciones disponibles",
      active: "Activa",
      completed: "Completada",
      pending: "Pendiente",
      vote: "Votar",
      results: "Resultados",
    },
    // Profile
    profile: {
      title: "Mi Perfil",
      description: "Gestiona la información de tu cuenta",
      personalInfo: "Información Personal",
      accountSecurity: "Seguridad de la Cuenta",
      firstName: "Nombre",
      lastName: "Apellido",
      email: "Correo Electrónico",
      role: "Rol",
      joinedDate: "Fecha de Registro",
      editProfile: "Editar Perfil",
      changePassword: "Cambiar Contraseña",
      accountStatus: "Estado de la Cuenta",
      verified: "Verificado",
    },
    // Users (Admin)
    users: {
      title: "Gestión de Usuarios",
      description: "Administrar usuarios del sistema",
      addUser: "Agregar Usuario",
      editUser: "Editar Usuario",
      deleteUser: "Eliminar Usuario",
      userDetails: "Detalles del Usuario",
      totalUsers: "Total de Usuarios",
      activeUsers: "Usuarios Activos",
      search: "Buscar usuarios...",
      filter: "Filtrar por rol",
      all: "Todos",
    },
    // Results
    results: {
      title: "Resultados Electorales",
      description: "Ver resultados de votación y estadísticas",
      electionResults: "Resultados de la Elección",
      totalVotes: "Total de Votos",
      participation: "Participación",
      winner: "Ganador",
      votes: "votos",
      percentage: "Porcentaje",
      noResults: "No hay resultados disponibles",
      exportResults: "Exportar Resultados",
    },
    // Audit
    audit: {
      title: "Auditoría",
      description: "Actividad del sistema y registros de seguridad",
      activityLog: "Registro de Actividad",
      securityEvents: "Eventos de Seguridad",
      userActions: "Acciones del Usuario",
      systemEvents: "Eventos del Sistema",
      timestamp: "Marca de Tiempo",
      user: "Usuario",
      action: "Acción",
      details: "Detalles",
      exportLogs: "Exportar Registros",
    },
    // Support
    support: {
      title: "Soporte",
      description: "Obtener ayuda y soporte técnico",
      contactForm: "Formulario de Contacto",
      helpDesk: "Mesa de Ayuda",
      faq: "Preguntas Frecuentes",
      subject: "Asunto",
      category: "Categoría",
      priority: "Prioridad",
      message: "Mensaje",
      submitTicket: "Enviar Ticket",
      myTickets: "Mis Tickets",
      ticketStatus: "Estado del Ticket",
      open: "Abierto",
      inProgress: "En Progreso",
      resolved: "Resuelto",
      closed: "Cerrado",
    },
  },
  en: {
    // Navigation
    nav: {
      dashboard: "Dashboard",
      elections: "Elections",
      users: "Users",
      results: "Results",
      audit: "Audit",
      support: "Support",
      profile: "My Profile",
      settings: "Settings",
      logout: "Logout",
    },
    // Menu descriptions
    menuDescriptions: {
      dashboard: "System overview",
      elections: "Manage electoral processes",
      users: "Manage system users",
      results: "View election results",
      audit: "Review system activity",
      support: "Help and technical support",
      profile: "Manage your profile",
      settings: "Configure your account",
    },
    // Roles
    roles: {
      student: "Student",
      teacher: "Teacher",
      administrator: "Administrator",
      authority: "Authority",
    },
    // Dashboard
    dashboard: {
      welcome: "Welcome to the Voting System",
      subtitle: "Manage elections securely and transparently",
      activeElections: "Active Elections",
      processesInProgress: "processes in progress",
      votesToday: "Votes Cast Today",
      activeParticipation: "active participation",
      onlineUsers: "Connected Users",
      realTime: "real time",
      security: "Security",
      protectedSystems: "protected systems",
      quickActions: "Quick Actions",
      newElection: "New Election",
      createElectoralProcess: "Create electoral process",
      registerUser: "Register User",
      addNewParticipant: "Add new participant",
      viewResults: "View Results",
      analyzeVotingData: "Analyze voting data",
      noActiveElections: "No active elections",
      seeAll: "See all",
    },
    // Common
    common: {
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      search: "Search",
      filter: "Filter",
      export: "Export",
      yes: "Yes",
      no: "No",
      confirm: "Confirm",
      back: "Back",
      next: "Next",
      previous: "Previous",
      close: "Close",
      submit: "Submit",
      reset: "Reset",
      online: "Online",
      offline: "Offline",
    },
    // Settings
    settings: {
      title: "Settings",
      description: "Manage your system preferences",
      notifications: {
        title: "Notifications",
        description: "Configure how you want to receive notifications",
        email: "Email notifications",
        emailDesc: "Receive notifications via email",
        browser: "Browser notifications",
        browserDesc: "Show notifications in browser",
        elections: "Election alerts",
        electionsDesc: "Notify about new elections and changes",
        results: "Voting results",
        resultsDesc: "Notify when results are available",
      },
      language: {
        title: "Language",
        description: "Select interface language",
        spanish: "Español",
        english: "English",
        portuguese: "Português",
      },
      security: {
        title: "Security",
        description: "Configure your account security options",
        twoFactor: "Two-factor authentication",
        twoFactorDesc: "Add extra security layer to your account",
        sessionTimeout: "Session timeout",
        sessionTimeoutDesc: "Automatically log out due to inactivity",
      },
      saved: "Settings saved",
      notificationsSaved: "Notification preferences have been updated",
      languageSaved: "Language has been changed",
    },
    // Elections
    elections: {
      title: "Elections",
      description: "Manage electoral processes",
      newElection: "New Election",
      createElection: "Create Election",
      electionName: "Election Name",
      electionDescription: "Description",
      startDate: "Start Date",
      endDate: "End Date",
      candidates: "Candidates",
      addCandidate: "Add Candidate",
      candidateName: "Candidate Name",
      candidateDescription: "Candidate Description",
      noElections: "No elections available",
      active: "Active",
      completed: "Completed",
      pending: "Pending",
      vote: "Vote",
      results: "Results",
    },
    // Profile
    profile: {
      title: "My Profile",
      description: "Manage your account information",
      personalInfo: "Personal Information",
      accountSecurity: "Account Security",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      role: "Role",
      joinedDate: "Joined Date",
      editProfile: "Edit Profile",
      changePassword: "Change Password",
      accountStatus: "Account Status",
      verified: "Verified",
    },
    // Users (Admin)
    users: {
      title: "User Management",
      description: "Manage system users",
      addUser: "Add User",
      editUser: "Edit User",
      deleteUser: "Delete User",
      userDetails: "User Details",
      totalUsers: "Total Users",
      activeUsers: "Active Users",
      search: "Search users...",
      filter: "Filter by role",
      all: "All",
    },
    // Results
    results: {
      title: "Election Results",
      description: "View voting results and statistics",
      electionResults: "Election Results",
      totalVotes: "Total Votes",
      participation: "Participation",
      winner: "Winner",
      votes: "votes",
      percentage: "Percentage",
      noResults: "No results available",
      exportResults: "Export Results",
    },
    // Audit
    audit: {
      title: "Audit Trail",
      description: "System activity and security logs",
      activityLog: "Activity Log",
      securityEvents: "Security Events",
      userActions: "User Actions",
      systemEvents: "System Events",
      timestamp: "Timestamp",
      user: "User",
      action: "Action",
      details: "Details",
      exportLogs: "Export Logs",
    },
    // Support
    support: {
      title: "Support",
      description: "Get help and technical support",
      contactForm: "Contact Form",
      helpDesk: "Help Desk",
      faq: "Frequently Asked Questions",
      subject: "Subject",
      category: "Category",
      priority: "Priority",
      message: "Message",
      submitTicket: "Submit Ticket",
      myTickets: "My Tickets",
      ticketStatus: "Ticket Status",
      open: "Open",
      inProgress: "In Progress", 
      resolved: "Resolved",
      closed: "Closed",
    },
  },
  pt: {
    // Header
    header: {
      secureConnection: "Conexão Segura",
    },
    // Notifications
    notifications: {
      noNotifications: "Nenhuma notificação",
      viewAll: "Ver todas as notificações",
    },
    // Navegação
    nav: {
      dashboard: "Painel Principal",
      elections: "Eleições",
      users: "Usuários",
      results: "Resultados",
      audit: "Auditoria",
      support: "Suporte",
      profile: "Meu Perfil",
      settings: "Configurações",
      logout: "Sair",
    },
    // Descrições do menu
    menuDescriptions: {
      dashboard: "Visão geral do sistema",
      elections: "Gerenciar processos eleitorais",
      users: "Gerenciar usuários do sistema",
      results: "Ver resultados eleitorais",
      audit: "Revisar atividade do sistema",
      support: "Ajuda e suporte técnico",
      profile: "Gerenciar seu perfil",
      settings: "Configurar sua conta",
    },
    // Papéis
    roles: {
      student: "Estudante",
      teacher: "Professor",
      administrator: "Administrador",
      authority: "Autoridade",
    },
    // Dashboard
    dashboard: {
      welcome: "Bem-vindo ao Sistema de Votação",
      subtitle: "Gerencie eleições de forma segura e transparente",
      activeElections: "Eleições Ativas",
      processesInProgress: "processos em andamento",
      votesToday: "Votos Emitidos Hoje",
      activeParticipation: "participação ativa",
      onlineUsers: "Usuários Conectados",
      realTime: "tempo real",
      security: "Segurança",
      protectedSystems: "sistemas protegidos",
      quickActions: "Ações Rápidas",
      newElection: "Nova Eleição",
      createElectoralProcess: "Criar processo eleitoral",
      registerUser: "Registrar Usuário",
      addNewParticipant: "Adicionar novo participante",
      viewResults: "Ver Resultados",
      analyzeVotingData: "Analisar dados de votação",
      noActiveElections: "Não há eleições ativas",
      seeAll: "Ver todas",
    },
    // Comum
    common: {
      loading: "Carregando...",
      save: "Salvar",
      cancel: "Cancelar",
      delete: "Excluir",
      edit: "Editar",
      create: "Criar",
      search: "Buscar",
      filter: "Filtrar",
      export: "Exportar",
      yes: "Sim",
      no: "Não",
      confirm: "Confirmar",
      back: "Voltar",
      next: "Próximo",
      previous: "Anterior",
      close: "Fechar",
      submit: "Enviar",
      reset: "Redefinir",
      online: "Online",
      offline: "Desconectado",
    },
    // Configurações
    settings: {
      title: "Configurações",
      description: "Gerencie suas preferências do sistema",
      notifications: {
        title: "Notificações",
        description: "Configure como você quer receber notificações",
        email: "Notificações por email",
        emailDesc: "Receber notificações por email",
        browser: "Notificações do navegador",
        browserDesc: "Mostrar notificações no navegador",
        elections: "Alertas de eleições",
        electionsDesc: "Notificar sobre novas eleições e mudanças",
        results: "Resultados de votação",
        resultsDesc: "Notificar quando os resultados estiverem disponíveis",
      },
      language: {
        title: "Idioma",
        description: "Selecionar idioma da interface",
        spanish: "Español",
        english: "English",
        portuguese: "Português",
      },
      security: {
        title: "Segurança",
        description: "Configurar opções de segurança da sua conta",
        twoFactor: "Autenticação de dois fatores",
        twoFactorDesc: "Adicionar camada extra de segurança à sua conta",
        sessionTimeout: "Tempo limite da sessão",
        sessionTimeoutDesc: "Fazer logout automaticamente por inatividade",
      },
      saved: "Configurações salvas",
      notificationsSaved: "As preferências de notificação foram atualizadas",
      languageSaved: "O idioma foi alterado",
    },
    // Eleições
    elections: {
      title: "Eleições",
      description: "Gerenciar processos eleitorais",
      newElection: "Nova Eleição",
      createElection: "Criar Eleição",
      electionName: "Nome da Eleição",
      electionDescription: "Descrição",
      startDate: "Data de Início",
      endDate: "Data de Término",
      candidates: "Candidatos",
      addCandidate: "Adicionar Candidato",
      candidateName: "Nome do Candidato",
      candidateDescription: "Descrição do Candidato",
      noElections: "Nenhuma eleição disponível",
      active: "Ativa",
      completed: "Concluída",
      pending: "Pendente",
      vote: "Votar",
      results: "Resultados",
    },
    // Perfil
    profile: {
      title: "Meu Perfil",
      description: "Gerencie as informações da sua conta",
      personalInfo: "Informações Pessoais",
      accountSecurity: "Segurança da Conta",
      firstName: "Nome",
      lastName: "Sobrenome",
      email: "Email",
      role: "Função",
      joinedDate: "Data de Ingresso",
      editProfile: "Editar Perfil",
      changePassword: "Alterar Senha",
      accountStatus: "Status da Conta",
      verified: "Verificado",
    },
    // Usuários (Admin)
    users: {
      title: "Gerenciamento de Usuários",
      description: "Gerenciar usuários do sistema",
      addUser: "Adicionar Usuário",
      editUser: "Editar Usuário",
      deleteUser: "Excluir Usuário",
      userDetails: "Detalhes do Usuário",
      totalUsers: "Total de Usuários",
      activeUsers: "Usuários Ativos",
      search: "Buscar usuários...",
      filter: "Filtrar por função",
      all: "Todos",
    },
    // Resultados
    results: {
      title: "Resultados das Eleições",
      description: "Ver resultados de votação e estatísticas",
      electionResults: "Resultados da Eleição",
      totalVotes: "Total de Votos",
      participation: "Participação",
      winner: "Vencedor",
      votes: "votos",
      percentage: "Porcentagem",
      noResults: "Nenhum resultado disponível",
      exportResults: "Exportar Resultados",
    },
    // Auditoria
    audit: {
      title: "Trilha de Auditoria",
      description: "Atividade do sistema e logs de segurança",
      activityLog: "Log de Atividade",
      securityEvents: "Eventos de Segurança",
      userActions: "Ações do Usuário",
      systemEvents: "Eventos do Sistema",
      timestamp: "Timestamp",
      user: "Usuário",
      action: "Ação",
      details: "Detalhes",
      exportLogs: "Exportar Logs",
    },
    // Suporte
    support: {
      title: "Suporte",
      description: "Obter ajuda e suporte técnico",
      contactForm: "Formulário de Contato",
      helpDesk: "Central de Ajuda",
      faq: "Perguntas Frequentes",
      subject: "Assunto",
      category: "Categoria",
      priority: "Prioridade",
      message: "Mensagem",
      submitTicket: "Enviar Ticket",
      myTickets: "Meus Tickets",
      ticketStatus: "Status do Ticket",
      open: "Aberto",
      inProgress: "Em Andamento",
      resolved: "Resolvido",
      closed: "Fechado",
    },
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.es;

export function getTranslation(lang: Language = 'es') {
  return translations[lang] || translations.es;
}

// Hook para usar traducciones
import { useEffect, useState } from 'react';

export function useTranslation() {
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    // Cargar idioma guardado
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setLanguageState(settings.language || 'es');
    }

    const handleLanguageChange = () => {
      const savedSettings = localStorage.getItem('settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setLanguageState(settings.language || 'es');
      }
    };

    // Escuchar cambios de idioma
    window.addEventListener('storage', handleLanguageChange);
    return () => window.removeEventListener('storage', handleLanguageChange);
  }, []);

  const setLanguage = (newLanguage: Language) => {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    settings.language = newLanguage;
    localStorage.setItem('settings', JSON.stringify(settings));
    setLanguageState(newLanguage);
    document.documentElement.lang = newLanguage;
    
    // Trigger storage event para notificar otros componentes
    window.dispatchEvent(new Event('storage'));
  };

  const t = getTranslation(language);

  return { t, language, setLanguage };
}