export const LANGS = ["en"];
export const DEFAULT_LANG = "en";

export const CATEGORY_ORDER = ["prayer", "meditation", "teaching", "tool"];
export const TYPE_ORDER = ["video", "audio", "file", "link"];

const DICT = {
  en: {
    brand: "The Aramaic Code",
    tagline: "Members Library",
    nav: { home: "Home", library: "Library", admin: "Admin", profile: "Profile" },
    common: {
      loading: "Unlocking sacred knowledge…",
      retry: "Try Again",
      close: "Close",
      back: "Back",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      all: "All",
      optional: "Optional"
    },
    auth: {
      enter: "Enter the Portal",
      createAccount: "Create your account",
      subtitle: "Sacred wisdom, ancient language, modern heart.",
      signupSubtitle: "Create an account to access the lessons.",
      email: "Email",
      emailPlaceholder: "you@example.com",
      password: "Password",
      passwordPlaceholder: "••••••••",
      submit: "Enter the Portal",
      signupSubmit: "Create account",
      switchToSignup: "Create a new account",
      switchToLogin: "Already have an account? Sign in",
      welcome: "Welcome to the Portal.",
      accountExists: "An account with this email already exists. Sign in instead.",
      wrongCreds: "The gates remain closed. Check your credentials and try again.",
      genericError: "Something went wrong. Please try again.",
      invalidEmail: "Enter a valid email address.",
      required: "This field is required.",
      signupText: "Not a member yet?",
      signupLink: "Join the Community"
    },
    home: {
      greeting: "Welcome",
      hero: "The Aramaic Code",
      sub: "Sacred wisdom, ancient language, modern heart.",
      featured: "Featured",
      recent: "Recently Added",
      explore: "Explore the Library",
      viewAll: "View all",
      quick: "Browse by path"
    },
    library: {
      title: "The Library",
      sub: "Videos, sound, texts and sacred links — all in one place.",
      typeFilter: "Kind",
      categoryFilter: "Path",
      emptyTitle: "No content found",
      emptyText: "Nothing matches these filters. Loosen the sacred chains and try again.",
      emptyLibraryTitle: "The Library is silent",
      emptyLibraryText: "The keeper has not added content yet. The scrolls await."
    },
    areas: {
      title: "My Modules",
      sub: "The modules included in your access. Open one to continue your journey.",
      emptyTitle: "No modules yet",
      emptyText: "You do not have access to any module yet. Contact support to unlock your content.",
      course: "Module",
      pieces: "lessons"
    },
    area: {
      back: "All modules",
      emptyTitle: "This module is empty",
      emptyText: "No lessons have been added to this module yet."
    },
    types: { video: "Video", audio: "Audio", file: "File", link: "Link" },
    categories: {
      prayer: "Prayers",
      meditation: "Meditations",
      teaching: "Teachings",
      tool: "Tools & Activations"
    },
    detail: {
      notFound: "This piece was not found.",
      notFoundSub: "It may have been removed by the keeper.",
      description: "Description",
      category: "Path",
      tags: "Tags",
      published: "Published",
      duration: "Duration",
      playVideo: "Play Video",
      listenAudio: "Listen",
      downloadFile: "Download",
      openLink: "Open Link",
      openExternal: "Open on provider",
      minutes: "min"
    },
    admin: {
      title: "Keeper's Sanctum",
      sub: "Tend the sacred content of the realm.",
      add: "Add Content",
      editTitle: "Edit Content",
      newTitle: "New Content",
      emptyTitle: "The shelves are empty",
      emptyText: "Add the first scroll of sacred knowledge.",
      fieldTitle: "Title",
      fieldType: "Kind",
      fieldUrl: "URL",
      fieldDescription: "Description",
      fieldCategory: "Path",
      fieldThumbnail: "Thumbnail URL",
      thumbnailOptional: "Optional — leave empty for a generated cover",
      placeholderTitle: "The Forgiveness Frequency",
      placeholderUrl: "https://…",
      placeholderDescription: "A short description of this piece…",
      validationRequired: "This field is required.",
      validationUrl: "Enter a valid URL (https://…).",
      saveSuccess: "Content saved.",
      deleteSuccess: "Content removed.",
      deleteError: "Something went wrong while saving.",
      deleteConfirmTitle: "Remove this piece?",
      deleteConfirmText: "This cannot be undone.",
      confirmDelete: "Remove",
      editAction: "Edit",
      deleteAction: "Delete",
      created: "Added",
      list: "Content list",
      tabAreas: "Modules",
      tabContent: "Content",
      tabMembers: "Members",
      areasTitle: "Modules",
      areasSub: "Create modules and set their covers.",
      addArea: "New Module",
      editAreaTitle: "Edit Module",
      newAreaTitle: "New Module",
      areaEmptyTitle: "No modules yet",
      areaEmptyText: "Create the first module.",
      areaList: "Module list",
      fieldArea: "Module",
      fieldAreaTitle: "Title",
      fieldAreaDescription: "Description",
      fieldAreaCover: "Cover image URL",
      coverOptional: "Optional — leave empty for a generated cover",
      areaPlaceholderTitle: "The Aramaic Code",
      areaPlaceholderDesc: "A short description of this module…",
      areaSaveSuccess: "Module saved.",
      areaDeleteSuccess: "Module removed.",
      areaDeleteConfirmTitle: "Remove this module?",
      areaDeleteConfirmText: "Its content stays but becomes unassigned. You can assign it to another module later.",
      noArea: "No module",
      contentNoAreas: "Create a module in the Modules section first so content can be placed.",
      fieldAreaRequired: "Pick a module for this content.",
      contentFilter: "Module",
      contentAdd: "Add Content",
      membersTitle: "Members & Access",
      membersSub: "Grant or revoke each member's access to the courses.",
      membersList: "Member list",
      membersEmpty: "No members yet",
      membersEmptyText: "Add the first member of the realm.",
      addMember: "Add Member",
      newMemberTitle: "New Member",
      editMemberTitle: "Edit Member",
      memberAccess: "Module access",
      fieldEmail: "Email",
      fieldFirstName: "First name",
      fieldLastName: "Last name",
      fieldLanguage: "Language",
      fieldPassword: "Password",
      memberPlaceholderEmail: "you@example.com",
      memberPlaceholderName: "Aram",
      memberSaveSuccess: "Member saved.",
      memberDeleteSuccess: "Member removed.",
      memberDeleteConfirmTitle: "Remove this member?",
      memberDeleteConfirmText: "Their access is revoked and they can no longer enter the portal.",
      cannotDeleteSelf: "You cannot remove the account you are signed in with.",
      memberExists: "A member with this email already exists.",
      accessGranted: "Access granted",
      accessRevoked: "Access revoked"
    },
    profile: {
      title: "Profile",
      sub: "Your sacred identity and preferences.",
      role: "Role",
      member: "Member",
      owner: "Keeper",
      email: "Email",
      memberSince: "Member since",
      lastLogin: "Last login",
      language: "Language",
      languageSub: "Choose your sacred tongue.",
      logout: "Sign Out",
      logoutConfirmTitle: "Leave the Portal?",
      logoutConfirmText: "You will need to enter again to return.",
      confirmLogout: "Sign Out",
      avatarAlt: "Avatar of"
    },
    states: {
      loading: "Unlocking sacred knowledge…",
      error: "Something went wrong",
      empty: "Nothing here yet",
      retry: "Try Again"
    },
    pwa: {
      install: {
        title: "Install The Aramaic Code",
        subtitle: "Add The Aramaic Code to your home screen for one-tap access to the lessons.",
        install: "Install",
        later: "Later",
        iosInstructions: 'Tap {share} then "Add to Home Screen" to bring The Aramaic Code to your home screen.',
        chip: "Install The Aramaic Code"
      }
    }
  },

  pt: {
    brand: "Members Ceramic",
    tagline: "Portal de Membros",
    nav: { home: "Início", library: "Biblioteca", admin: "Admin", profile: "Perfil" },
    common: {
      loading: "Desvendando o conhecimento sagrado…",
      retry: "Tentar Novamente",
      close: "Fechar",
      back: "Voltar",
      cancel: "Cancelar",
      save: "Salvar",
      delete: "Excluir",
      edit: "Editar",
      add: "Adicionar",
      all: "Todos",
      optional: "Opcional"
    },
    auth: {
      enter: "Entrar no Portal",
      subtitle: "Sabedoria sagrada, língua antiga, coração moderno.",
      email: "E-mail",
      emailPlaceholder: "voce@exemplo.com",
      password: "Senha",
      passwordPlaceholder: "••••••••",
      submit: "Entrar no Portal",
      wrongCreds: "Os portões permanecem fechados. Verifique suas credenciais e tente novamente.",
      genericError: "Algo deu errado. Tente novamente.",
      invalidEmail: "Digite um e-mail válido.",
      required: "Este campo é obrigatório.",
      signupText: "Ainda não é membro?",
      signupLink: "Junte-se à Comunidade"
    },
    home: {
      greeting: "Bem-vindo",
      hero: "Members Ceramic",
      sub: "Sabedoria sagrada, língua antiga, coração moderno.",
      featured: "Em Destaque",
      recent: "Adicionados Recentemente",
      explore: "Explorar a Biblioteca",
      viewAll: "Ver todos",
      quick: "Navegar pelo caminho"
    },
    library: {
      title: "A Biblioteca",
      sub: "Vídeos, sons, textos e links sagrados — tudo em um só lugar.",
      typeFilter: "Tipo",
      categoryFilter: "Caminho",
      emptyTitle: "Nenhum conteúdo encontrado",
      emptyText: "Nada corresponde a esses filtros. Afrouxe as correntes sagradas e tente novamente.",
      emptyLibraryTitle: "A Biblioteca está em silêncio",
      emptyLibraryText: "O guardião ainda não adicionou conteúdo. Os pergaminhos aguardam."
    },
    areas: {
      title: "Meus Cursos",
      sub: "Os caminhos sagrados aos quais você tem acesso. Abra um curso para trilhá-lo.",
      emptyTitle: "Nenhum curso ainda",
      emptyText: "Você ainda não tem acesso a nenhum curso — verifique sua compra ou entre em contato com o suporte para desbloquear seu caminho sagrado.",
      course: "Curso",
      pieces: "peças"
    },
    area: {
      back: "Todos os cursos",
      emptyTitle: "Este curso está em silêncio",
      emptyText: "O guardião ainda não adicionou lições a este curso. Os pergaminhos aguardam."
    },
    types: { video: "Vídeo", audio: "Áudio", file: "Arquivo", link: "Link" },
    categories: {
      prayer: "Orações",
      meditation: "Meditações",
      teaching: "Ensinamentos",
      tool: "Ferramentas & Ativações"
    },
    detail: {
      notFound: "Esta peça não foi encontrada.",
      notFoundSub: "Ela pode ter sido removida pelo guardião.",
      description: "Descrição",
      category: "Caminho",
      tags: "Tags",
      published: "Publicado",
      duration: "Duração",
      playVideo: "Assistir",
      listenAudio: "Ouvir",
      downloadFile: "Baixar",
      openLink: "Abrir Link",
      openExternal: "Abrir no provedor",
      minutes: "min"
    },
    admin: {
      title: "Santuário do Guardião",
      sub: "Cuide do conteúdo sagrado do reino.",
      add: "Adicionar Conteúdo",
      editTitle: "Editar Conteúdo",
      newTitle: "Novo Conteúdo",
      emptyTitle: "As prateleiras estão vazias",
      emptyText: "Adicione o primeiro pergaminho do conhecimento sagrado.",
      fieldTitle: "Título",
      fieldType: "Tipo",
      fieldUrl: "URL",
      fieldDescription: "Descrição",
      fieldCategory: "Caminho",
      fieldThumbnail: "URL da Miniatura",
      thumbnailOptional: "Opcional — deixe vazio para uma capa gerada",
      placeholderTitle: "A Frequência do Perdão",
      placeholderUrl: "https://…",
      placeholderDescription: "Uma breve descrição desta peça…",
      validationRequired: "Este campo é obrigatório.",
      validationUrl: "Digite uma URL válida (https://…).",
      saveSuccess: "Conteúdo salvo.",
      deleteSuccess: "Conteúdo removido.",
      deleteError: "Algo deu errado ao salvar.",
      deleteConfirmTitle: "Remover esta peça?",
      deleteConfirmText: "Esta ação não pode ser desfeita.",
      confirmDelete: "Remover",
      editAction: "Editar",
      deleteAction: "Excluir",
      created: "Adicionado",
      list: "Lista de conteúdo",
      tabAreas: "Áreas",
      tabContent: "Conteúdo",
      tabMembers: "Membros",
      areasTitle: "Cursos e Áreas",
      areasSub: "Crie os cursos sagrados do reino e defina suas capas.",
      addArea: "Novo Curso",
      editAreaTitle: "Editar Curso",
      newAreaTitle: "Novo Curso",
      areaEmptyTitle: "Nenhum curso ainda",
      areaEmptyText: "Crie o primeiro curso do conhecimento sagrado.",
      areaList: "Lista de cursos",
      fieldArea: "Curso",
      fieldAreaTitle: "Título",
      fieldAreaDescription: "Descrição",
      fieldAreaCover: "URL da Imagem de Capa",
      coverOptional: "Opcional — deixe vazio para uma capa gerada",
      areaPlaceholderTitle: "A Escola de Mistérios do Galileu",
      areaPlaceholderDesc: "Uma breve descrição deste curso…",
      areaSaveSuccess: "Curso salvo.",
      areaDeleteSuccess: "Curso removido.",
      areaDeleteConfirmTitle: "Remover este curso?",
      areaDeleteConfirmText: "O conteúdo permanece, mas fica sem curso. Você poderá atribuí-lo a um curso depois.",
      noArea: "Sem curso",
      contentNoAreas: "Crie um curso na seção Áreas primeiro para poder alocar conteúdo.",
      fieldAreaRequired: "Escolha um curso para este conteúdo.",
      contentFilter: "Curso",
      contentAdd: "Adicionar Conteúdo",
      membersTitle: "Membros e Acessos",
      membersSub: "Conceda ou revogue o acesso de cada membro aos cursos.",
      membersList: "Lista de membros",
      membersEmpty: "Nenhum membro ainda",
      membersEmptyText: "Adicione o primeiro membro do reino.",
      addMember: "Adicionar Membro",
      newMemberTitle: "Novo Membro",
      editMemberTitle: "Editar Membro",
      memberAccess: "Acesso aos cursos",
      fieldEmail: "E-mail",
      fieldFirstName: "Nome",
      fieldLastName: "Sobrenome",
      fieldLanguage: "Idioma",
      fieldPassword: "Senha",
      memberPlaceholderEmail: "voce@exemplo.com",
      memberPlaceholderName: "Aram",
      memberSaveSuccess: "Membro salvo.",
      memberDeleteSuccess: "Membro removido.",
      memberDeleteConfirmTitle: "Remover este membro?",
      memberDeleteConfirmText: "O acesso dele é revogado e ele não poderá mais entrar no portal.",
      cannotDeleteSelf: "Você não pode remover a conta com a qual está conectado.",
      memberExists: "Já existe um membro com este e-mail.",
      accessGranted: "Acesso concedido",
      accessRevoked: "Acesso revogado"
    },
    profile: {
      title: "Perfil",
      sub: "Sua identidade sagrada e preferências.",
      role: "Função",
      member: "Membro",
      owner: "Guardião",
      email: "E-mail",
      memberSince: "Membro desde",
      lastLogin: "Último acesso",
      language: "Idioma",
      languageSub: "Escolha sua língua sagrada.",
      logout: "Sair",
      logoutConfirmTitle: "Sair do Portal?",
      logoutConfirmText: "Você precisará entrar novamente para voltar.",
      confirmLogout: "Sair",
      avatarAlt: "Avatar de"
    },
    states: {
      loading: "Desvendando o conhecimento sagrado…",
      error: "Algo deu errado",
      empty: "Nada por aqui ainda",
      retry: "Tentar Novamente"
    },
    pwa: {
      install: {
        title: "Instalar Members Ceramic",
        subtitle: "Adicione Members Ceramic à tela inicial para acessar a biblioteca sagrada com um toque.",
        install: "Instalar",
        later: "Agora não",
        iosInstructions: 'Toque em {share} e depois em "Adicionar à Tela de Início" para levar Members Ceramic à sua tela inicial.',
        chip: "Instalar Members Ceramic"
      }
    }
  },

  es: {
    brand: "Members Ceramic",
    tagline: "Portal de Miembros",
    nav: { home: "Inicio", library: "Biblioteca", admin: "Admin", profile: "Perfil" },
    common: {
      loading: "Desvelando el conocimiento sagrado…",
      retry: "Intentar de Nuevo",
      close: "Cerrar",
      back: "Volver",
      cancel: "Cancelar",
      save: "Guardar",
      delete: "Eliminar",
      edit: "Editar",
      add: "Añadir",
      all: "Todos",
      optional: "Opcional"
    },
    auth: {
      enter: "Entrar al Portal",
      subtitle: "Sabiduría sagrada, lengua antigua, corazón moderno.",
      email: "Correo",
      emailPlaceholder: "tu@ejemplo.com",
      password: "Contraseña",
      passwordPlaceholder: "••••••••",
      submit: "Entrar al Portal",
      wrongCreds: "Los portales permanecen cerrados. Revisa tus credenciales e inténtalo de nuevo.",
      genericError: "Algo salió mal. Inténtalo de nuevo.",
      invalidEmail: "Introduce un correo válido.",
      required: "Este campo es obligatorio.",
      signupText: "¿Aún no eres miembro?",
      signupLink: "Únete a la Comunidad"
    },
    home: {
      greeting: "Bienvenido",
      hero: "Members Ceramic",
      sub: "Sabiduría sagrada, lengua antigua, corazón moderno.",
      featured: "Destacado",
      recent: "Añadido Recientemente",
      explore: "Explorar la Biblioteca",
      viewAll: "Ver todo",
      quick: "Explorar por camino"
    },
    library: {
      title: "La Biblioteca",
      sub: "Videos, sonidos, textos y enlaces sagrados — todo en un solo lugar.",
      typeFilter: "Tipo",
      categoryFilter: "Camino",
      emptyTitle: "Sin contenido",
      emptyText: "Nada coincide con estos filtros. Afloja las cadenas sagradas e inténtalo de nuevo.",
      emptyLibraryTitle: "La Biblioteca está en silencio",
      emptyLibraryText: "El guardián aún no ha añadido contenido. Los pergaminos aguardan."
    },
    areas: {
      title: "Mis Cursos",
      sub: "Los caminos sagrados a los que tienes acceso. Abre un curso para recorrerlo.",
      emptyTitle: "Aún no hay cursos",
      emptyText: "Aún no tienes acceso a ningún curso — revisa tu compra o contacta con soporte para desbloquear tu camino sagrado.",
      course: "Curso",
      pieces: "piezas"
    },
    area: {
      back: "Todos los cursos",
      emptyTitle: "Este curso está en silencio",
      emptyText: "El guardián aún no ha añadido lecciones a este curso. Los pergaminos aguardan."
    },
    types: { video: "Video", audio: "Audio", file: "Archivo", link: "Enlace" },
    categories: {
      prayer: "Oraciones",
      meditation: "Meditaciones",
      teaching: "Enseñanzas",
      tool: "Herramientas & Activaciones"
    },
    detail: {
      notFound: "Esta pieza no fue encontrada.",
      notFoundSub: "Puede que el guardián la haya retirado.",
      description: "Descripción",
      category: "Camino",
      tags: "Etiquetas",
      published: "Publicado",
      duration: "Duración",
      playVideo: "Reproducir",
      listenAudio: "Escuchar",
      downloadFile: "Descargar",
      openLink: "Abrir Enlace",
      openExternal: "Abrir en el proveedor",
      minutes: "min"
    },
    admin: {
      title: "Santuario del Guardián",
      sub: "Atiende el contenido sagrado del reino.",
      add: "Añadir Contenido",
      editTitle: "Editar Contenido",
      newTitle: "Nuevo Contenido",
      emptyTitle: "Los estantes están vacíos",
      emptyText: "Añade el primer pergamino del conocimiento sagrado.",
      fieldTitle: "Título",
      fieldType: "Tipo",
      fieldUrl: "URL",
      fieldDescription: "Descripción",
      fieldCategory: "Camino",
      fieldThumbnail: "URL de la Miniatura",
      thumbnailOptional: "Opcional — déjalo vacío para una portada generada",
      placeholderTitle: "La Frecuencia del Perdón",
      placeholderUrl: "https://…",
      placeholderDescription: "Una breve descripción de esta pieza…",
      validationRequired: "Este campo es obligatorio.",
      validationUrl: "Introduce una URL válida (https://…).",
      saveSuccess: "Contenido guardado.",
      deleteSuccess: "Contenido eliminado.",
      deleteError: "Algo salió mal al guardar.",
      deleteConfirmTitle: "¿Eliminar esta pieza?",
      deleteConfirmText: "Esta acción no se puede deshacer.",
      confirmDelete: "Eliminar",
      editAction: "Editar",
      deleteAction: "Eliminar",
      created: "Añadido",
      list: "Lista de contenido",
      tabAreas: "Áreas",
      tabContent: "Contenido",
      tabMembers: "Miembros",
      areasTitle: "Cursos y Áreas",
      areasSub: "Crea los cursos sagrados del reino y define sus portadas.",
      addArea: "Nuevo Curso",
      editAreaTitle: "Editar Curso",
      newAreaTitle: "Nuevo Curso",
      areaEmptyTitle: "Aún no hay cursos",
      areaEmptyText: "Crea el primer curso del conocimiento sagrado.",
      areaList: "Lista de cursos",
      fieldArea: "Curso",
      fieldAreaTitle: "Título",
      fieldAreaDescription: "Descripción",
      fieldAreaCover: "URL de la Imagen de Portada",
      coverOptional: "Opcional — déjalo vacío para una portada generada",
      areaPlaceholderTitle: "La Escuela de Misterios del Galileo",
      areaPlaceholderDesc: "Una breve descripción de este curso…",
      areaSaveSuccess: "Curso guardado.",
      areaDeleteSuccess: "Curso eliminado.",
      areaDeleteConfirmTitle: "¿Eliminar este curso?",
      areaDeleteConfirmText: "Su contenido se conserva pero queda sin curso. Podrás asignarlo a un curso más tarde.",
      noArea: "Sin curso",
      contentNoAreas: "Crea primero un curso en la sección Áreas para poder ubicar contenido.",
      fieldAreaRequired: "Elige un curso para este contenido.",
      contentFilter: "Curso",
      contentAdd: "Añadir Contenido",
      membersTitle: "Miembros y Accesos",
      membersSub: "Concede o revoca el acceso de cada miembro a los cursos.",
      membersList: "Lista de miembros",
      membersEmpty: "Aún no hay miembros",
      membersEmptyText: "Añade al primer miembro del reino.",
      addMember: "Añadir Miembro",
      newMemberTitle: "Nuevo Miembro",
      editMemberTitle: "Editar Miembro",
      memberAccess: "Acceso a los cursos",
      fieldEmail: "Correo",
      fieldFirstName: "Nombre",
      fieldLastName: "Apellido",
      fieldLanguage: "Idioma",
      fieldPassword: "Contraseña",
      memberPlaceholderEmail: "tu@ejemplo.com",
      memberPlaceholderName: "Aram",
      memberSaveSuccess: "Miembro guardado.",
      memberDeleteSuccess: "Miembro eliminado.",
      memberDeleteConfirmTitle: "¿Eliminar este miembro?",
      memberDeleteConfirmText: "Se revoca su acceso y ya no podrá entrar al portal.",
      cannotDeleteSelf: "No puedes eliminar la cuenta con la que has iniciado sesión.",
      memberExists: "Ya existe un miembro con este correo.",
      accessGranted: "Acceso concedido",
      accessRevoked: "Acceso revocado"
    },
    profile: {
      title: "Perfil",
      sub: "Tu identidad sagrada y preferencias.",
      role: "Rol",
      member: "Miembro",
      owner: "Guardián",
      email: "Correo",
      memberSince: "Miembro desde",
      lastLogin: "Último acceso",
      language: "Idioma",
      languageSub: "Elige tu lengua sagrada.",
      logout: "Salir",
      logoutConfirmTitle: "¿Salir del Portal?",
      logoutConfirmText: "Tendrás que entrar de nuevo para volver.",
      confirmLogout: "Salir",
      avatarAlt: "Avatar de"
    },
    states: {
      loading: "Desvelando el conocimiento sagrado…",
      error: "Algo salió mal",
      empty: "Nada por aquí todavía",
      retry: "Intentar de Nuevo"
    },
    pwa: {
      install: {
        title: "Instalar Members Ceramic",
        subtitle: "Añade Members Ceramic a tu pantalla de inicio para acceder a la biblioteca sagrada con un toque.",
        install: "Instalar",
        later: "Ahora no",
        iosInstructions: 'Toca {share} y luego "Añadir a pantalla de inicio" para llevar Members Ceramic a tu pantalla de inicio.',
        chip: "Instalar Members Ceramic"
      }
    }
  }
};

export function t(key, lang) {
  const path = key.split(".");
  const fallback = resolvePath(DICT[DEFAULT_LANG], path);
  if (!lang || lang === DEFAULT_LANG) return fallback;
  const localized = DICT[lang] ? resolvePath(DICT[lang], path) : fallback;
  return localized !== undefined ? localized : fallback;
}

function resolvePath(obj, path) {
  let cur = obj;
  for (const part of path) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[part];
  }
  return cur;
}

export function langName(lang) {
  return { en: "English", pt: "Português", es: "Español" }[lang] || lang;
}

export function langFlag(lang) {
  return { en: "🇺🇸", pt: "🇧🇷", es: "🇪🇸" }[lang] || "🌐";
}

export function detectBrowserLang() {
  const candidates = [];
  if (typeof navigator !== "undefined") {
    if (Array.isArray(navigator.languages) && navigator.languages.length) {
      candidates.push(...navigator.languages);
    }
    if (navigator.language) candidates.push(navigator.language);
  }
  for (const raw of candidates) {
    const base = String(raw || "")
      .toLowerCase()
      .split("-")[0];
    if (LANGS.includes(base)) return base;
  }
  return DEFAULT_LANG;
}

export function catName(slug, lang) {
  return t(`categories.${slug}`, lang) || slug;
}

export function typeName(type, lang) {
  return t(`types.${type}`, lang) || type;
}
