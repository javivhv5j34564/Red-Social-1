document.addEventListener('DOMContentLoaded', () => {
  // --- Theme Logic ---
  const savedTheme = localStorage.getItem('fitTribe_theme') || 'dark';
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  
  window.toggleTheme = function () {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const newTheme = isLight ? 'dark' : 'light';
    
    let layer = document.getElementById('theme-transition-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'theme-transition-layer';
      layer.className = 'theme-transition-layer';
      document.body.appendChild(layer);
    }
    
    layer.classList.remove('slide-in');
    void layer.offsetWidth; // trigger reflow
    layer.classList.add('slide-in');
    
    setTimeout(() => {
      if (newTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      
      const sidebarThemeToggle = document.getElementById('sidebar-theme-toggle');
      if (sidebarThemeToggle) {
        sidebarThemeToggle.innerHTML = newTheme === 'light' 
          ? '<i data-lucide="moon"></i><span>Modo Oscuro</span>'
          : '<i data-lucide="sun"></i><span>Modo Claro</span>';
      }
      const themeToggleContainer = document.getElementById('theme-toggle-container');
      if (themeToggleContainer) {
        themeToggleContainer.innerHTML = newTheme === 'light' 
          ? '<i data-lucide="moon" color="var(--text-secondary)"></i>' 
          : '<i data-lucide="sun" color="var(--text-secondary)"></i>';
      }
      lucide.createIcons();
      localStorage.setItem('fitTribe_theme', newTheme);
    }, 400);
  };
  
  // Update icons initial state
  setTimeout(() => {
    if (savedTheme === 'light') {
      const sidebarThemeToggle = document.getElementById('sidebar-theme-toggle');
      if (sidebarThemeToggle) {
        sidebarThemeToggle.innerHTML = '<i data-lucide="moon"></i><span>Modo Oscuro</span>';
      }
      const themeToggleContainer = document.getElementById('theme-toggle-container');
      if (themeToggleContainer) {
        themeToggleContainer.innerHTML = '<i data-lucide="moon" color="var(--text-secondary)"></i>';
      }
      lucide.createIcons();
    }
  }, 0);

  // Initialize Lucide icons
  lucide.createIcons();
  // --- Elements ---
  const views = document.querySelectorAll('.view');
  const navItems = document.querySelectorAll('.nav-item');
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const loginForm = document.getElementById('login-form');
  const topHeader = document.getElementById('top-header');
  const bottomNav = document.getElementById('bottom-nav');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const openSidebarBtn = document.getElementById('open-sidebar');
  const closeSidebarBtn = document.getElementById('close-sidebar');
  const logoutBtn = document.getElementById('logout-btn');

  // --- View Logic ---
  let mapInitialized = false;

  window.showView = function (targetId) {
    views.forEach(view => view.classList.remove('active'));
    document.getElementById(targetId).classList.add('active');

    // Update Nav Active State
    navItems.forEach(item => {
      if (item.getAttribute('data-target') === targetId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (targetId === 'view-login') {
      topHeader.style.display = 'none';
      bottomNav.style.display = 'none';
    } else {
      topHeader.style.display = 'flex';
      bottomNav.style.display = 'flex';
    }

    // Initialize map on first visit to quedadas
    if (targetId === 'view-quedadas' && !mapInitialized && window.L) {
      setTimeout(() => {
        const map = L.map('leaflet-map').setView([40.4168, -3.7038], 13); // Madrid
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        window.leafletMap = map;
        window.leafletMarkers = L.layerGroup().addTo(map);

        map.on('click', function(e) {
          if (window.isSelectingLocation) {
            window.selectedLatLng = e.latlng;
            if (window.tempMarker) {
              map.removeLayer(window.tempMarker);
            }
            window.tempMarker = L.marker(e.latlng).addTo(map);
            document.getElementById('activity-location').value = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
            window.isSelectingLocation = false;
            window.openActivityModal();
            const toast = document.getElementById('location-toast');
            if (toast) toast.style.display = 'none';
          }
        });

        window.renderMeetups();
        mapInitialized = true;
      }, 100);
    }

    // Render inbox if needed
    if (targetId === 'view-inbox') {
      window.renderInbox();
    }

    closeSidebar();

    // Refresh Icons inside views when switching
    lucide.createIcons();
  }

  const showView = window.showView;

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-target');
      if (target === 'view-perfil') {
        window.openProfile('current');
      } else {
        showView(target);
      }
    });
  });

  sidebarItems.forEach(item => {
    if (item.hasAttribute('data-target')) {
      item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        if (target === 'view-perfil') {
          window.openProfile('current');
        } else if (target === 'view-config') {
          configName.value = CURRENT_USER.name;
          configAvatar.value = CURRENT_USER.avatar;
          configDesc.value = CURRENT_USER.description;
          showView(target);
        } else {
          showView(target);
        }
      });
    }
  });

  // --- Login Logic ---
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.querySelector('.password-group input');
    const loginBtn = document.querySelector('.login-btn');

    if (!usernameInput || usernameInput.value.trim() === '') return;
    
    const nombre = usernameInput.value.trim();
    const password = passwordInput ? passwordInput.value : '1234';

    // UI Feedback
    const originalBtnText = loginBtn.textContent;
    loginBtn.textContent = 'CONECTANDO...';
    loginBtn.style.opacity = '0.7';
    loginBtn.disabled = true;

    try {
        // 1. Obtener usuarios del backend para simular el Login
        const allUsers = await apiGet(`${API}/usuarios/all`);
        let userFound = null;
        
        if (allUsers) {
            userFound = allUsers.find(u => u.nombre === nombre);
        }

        if (userFound) {
            // Usuario existe: Login exitoso
            CURRENT_USER.id = userFound.id ? userFound.id.toString() : 'u' + Date.now();
            CURRENT_USER.name = userFound.nombre;
            CURRENT_USER.description = userFound.descripcion || '';
            CURRENT_USER.avatar = userFound.fotoPerfil || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80';
            console.log("✅ Usuario encontrado y logueado desde MongoDB (msUsuario)");
        } else {
            // Usuario no existe: Registro automático
            console.log("Usuario no encontrado, creando cuenta nueva en backend...");
            const newUser = {
                nombre: nombre,
                password: password,
                descripcion: 'Nuevo atleta en FitTribe',
                telefono: '',
                fotoPerfil: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
            };
            const created = await apiPost(`${API}/usuarios`, newUser);
            if (created) {
                CURRENT_USER.id = created.id ? created.id.toString() : 'u' + Date.now();
                CURRENT_USER.name = created.nombre;
                CURRENT_USER.description = created.descripcion || '';
                console.log("✅ Usuario registrado con éxito en MongoDB (msUsuario)");
            } else {
                CURRENT_USER.name = nombre; // Fallback si algo falló silenciosamente
                CURRENT_USER.id = 'u' + Date.now();
            }
        }
    } catch(err) {
        // Fallback local para que la UI no se rompa si el backend está apagado
        console.warn("⚠️ Backend no disponible. Haciendo login de prueba en local.", err);
        CURRENT_USER.id = 'local_' + nombre.toLowerCase().replace(/\s+/g, '');
        CURRENT_USER.name = nombre;
    }
    
    saveData('fitTribe_user', CURRENT_USER);

    loginBtn.textContent = originalBtnText;
    loginBtn.style.opacity = '1';
    loginBtn.disabled = false;

    // Preparar y mostrar pantalla de configuración inicial
    window.isInitialSetup = true;
    configName.value = CURRENT_USER.name;
    configAvatar.value = CURRENT_USER.avatar;
    configDesc.value = CURRENT_USER.description || '';

    showView('view-config');
  });

  logoutBtn.addEventListener('click', () => {
    CURRENT_USER = {
        id: 'current',
        name: '',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
        description: '',
        logros: [],
        joinedActivities: [],
        savedPosts: []
    };
    localStorage.removeItem('fitTribe_user');
    document.getElementById('login-username').value = '';
    showView('view-login');
  });


  const togglePasswordBtn = document.querySelector('.toggle-password');
  const passwordInput = document.querySelector('.password-group input');
  togglePasswordBtn.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      togglePasswordBtn.innerHTML = '<i data-lucide="eye-off"></i>';
    } else {
      passwordInput.type = 'password';
      togglePasswordBtn.innerHTML = '<i data-lucide="eye"></i>';
    }
    lucide.createIcons();
  });

  // --- Sidebar Logic ---
  function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('open');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
  }

  openSidebarBtn.addEventListener('click', openSidebar);
  closeSidebarBtn.addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);


  // --- Render Mock Data ---

  // --- Data Persistence ---
  function loadData(key, defaultData) {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultData;
  }
  function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  let CURRENT_USER = loadData('fitTribe_user', {
    id: 'current',
    name: 'Alex Runner',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    description: 'Amante del deporte y la vida sana. Siempre buscando nuevos retos y aventuras.',
    logros: [
      { title: 'Primeros 5km', icon: 'medal' },
      { title: '1 Mes Constante', icon: 'flame' }
    ],
    joinedActivities: [],
    savedPosts: []
  });

  let CHATS = loadData('fitTribe_chats', {});
  window.followedUsers = loadData('fitTribe_follows', []);

  setTimeout(() => {
    const createPostAvatar = document.getElementById('create-post-avatar');
    if (createPostAvatar) createPostAvatar.src = CURRENT_USER.avatar;
  }, 100);

  const configForm = document.getElementById('config-form');
  const configName = document.getElementById('config-name');
  const configAvatar = document.getElementById('config-avatar');
  const configAvatarFile = document.getElementById('config-avatar-file');
  const configDesc = document.getElementById('config-desc');

  if (configForm) {
    configForm.addEventListener('submit', (e) => {
      e.preventDefault();
      CURRENT_USER.name = configName.value;
      CURRENT_USER.description = configDesc.value;

      const file = configAvatarFile && configAvatarFile.files && configAvatarFile.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (evt) {
          CURRENT_USER.avatar = evt.target.result;
          if (configAvatar) configAvatar.value = CURRENT_USER.avatar;
          finishConfigUpdate();
        };
        reader.readAsDataURL(file);
      } else {
        if (configAvatar && configAvatar.value) {
          CURRENT_USER.avatar = configAvatar.value;
        }
        finishConfigUpdate();
      }

      async function finishConfigUpdate() {
        try {
          const updateData = {
              nombre: CURRENT_USER.name,
              descripcion: CURRENT_USER.description,
              fotoPerfil: CURRENT_USER.avatar
          };
          const response = await apiPut(`${API}/usuarios/${CURRENT_USER.id}`, updateData);
          console.log("✅ Perfil actualizado en backend:", response);
        } catch (e) {
          console.warn("⚠️ Fallback local para actualizar perfil", e);
        }

        // Update sidebar UI
        const sidebarName = document.querySelector('.sidebar-user-info h3');
        const sidebarImg = document.querySelector('.sidebar-user img');
        if (sidebarName) sidebarName.textContent = CURRENT_USER.name;
        if (sidebarImg) sidebarImg.src = CURRENT_USER.avatar;

        // Update header avatar
        const headerAvatar = document.getElementById('header-avatar');
        if (headerAvatar) headerAvatar.src = CURRENT_USER.avatar;

        const createPostAvatar = document.getElementById('create-post-avatar');
        if (createPostAvatar) createPostAvatar.src = CURRENT_USER.avatar;

        saveData('fitTribe_user', CURRENT_USER);
        
        // 🔄 Refresh personas and feed to show updated profile across the app
        if (typeof window.renderPersonas === 'function') {
          setTimeout(() => window.renderPersonas(), 50);
        }
        if (typeof window.renderFeed === 'function') {
          setTimeout(() => window.renderFeed(), 100);
        }

        // Update existing posts and comments to reflect new profile details
        let postsChanged = false;
        MOCK_POSTS.forEach(post => {
          if (post.user.id === CURRENT_USER.id || post.user.name === CURRENT_USER.name) {
            post.user.name = CURRENT_USER.name;
            post.user.avatar = CURRENT_USER.avatar;
            post.user.description = CURRENT_USER.description;
            postsChanged = true;
          }
          if (post.commentsArray) {
            post.commentsArray.forEach(c => {
              if (c.userId === CURRENT_USER.id || c.author === CURRENT_USER.name) {
                c.author = CURRENT_USER.name;
                c.avatar = CURRENT_USER.avatar;
                c.userId = CURRENT_USER.id;
                postsChanged = true;
              }
            });
          }
        });

        if (postsChanged) {
          saveData('fitTribe_posts', MOCK_POSTS);
        }

        alert('Configuración guardada correctamente.');

        if (window.isInitialSetup) {
          window.isInitialSetup = false;
          showView('view-home');
        } else {
          window.openProfile('current');
        }
      }
    });
  }

  window.followedUsers = [];

  window.openProfile = function (userId) {
    let userToView = null;
    if (userId === 'current' || userId === CURRENT_USER.id) {
      userToView = CURRENT_USER;
    } else {
      const allPosts = window.currentRenderedPosts || MOCK_POSTS;
      const post = allPosts.find(p => p.user.id.toString() === userId.toString());
      if (post) {
        userToView = post.user;
      } else {
        const ALL_STORIES = loadData('fitTribe_all_stories', []);
        const story = ALL_STORIES.find(s => s.userId.toString() === userId.toString());
        if (story) {
          userToView = { id: story.userId, name: story.name, avatar: story.avatar, description: 'Atleta en FitTribe' };
        } else {
          // As a last resort, create a dummy profile object so the view doesn't break
          userToView = { id: userId, name: 'Atleta', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', description: 'Atleta en FitTribe' };
        }
      }
    }

    if (userToView) {
      document.getElementById('perfil-name').textContent = userToView.name;
      document.getElementById('perfil-avatar').src = userToView.avatar;
      document.getElementById('perfil-description').textContent = userToView.description || 'Sin descripción';

      const followBtn = document.getElementById('perfil-follow-btn');
      const msgBtn = document.getElementById('perfil-message-btn');
      const addLogroContainer = document.getElementById('add-logro-container');

      if (userToView.id === CURRENT_USER.id) {
        followBtn.style.display = 'none';
        if (msgBtn) msgBtn.style.display = 'none';
        if (addLogroContainer) addLogroContainer.style.display = 'block';
      } else {
        followBtn.style.display = 'flex';
        if (msgBtn) {
          msgBtn.style.display = 'flex';
          msgBtn.onclick = () => window.openChat(userToView);
        }
        if (addLogroContainer) addLogroContainer.style.display = 'none';
        const isFollowing = window.followedUsers.includes(userToView.id);
        document.getElementById('perfil-follow-text').textContent = isFollowing ? 'Siguiendo' : 'Seguir';
        followBtn.setAttribute('data-userid', userToView.id);
      }

      // Initialize mock stats if they don't exist to keep them stable
      if (userToView.followers === undefined) userToView.followers = Math.floor(Math.random() * 500) + 50;
      if (userToView.following === undefined) userToView.following = Math.floor(Math.random() * 300) + 20;

      // Ensure our own following count is accurate based on array
      if (userToView.id === CURRENT_USER.id) {
        userToView.following = window.followedUsers.length;
      }

      const allPostsForCount = window.currentRenderedPosts || MOCK_POSTS;
      const userPostsCount = allPostsForCount.filter(p => p.user.id.toString() === userToView.id.toString()).length;
      document.getElementById('perfil-stat-actividades').textContent = userPostsCount;
      document.getElementById('perfil-stat-seguidores').textContent = userToView.followers;
      document.getElementById('perfil-stat-seguidos').textContent = userToView.following;

      window.renderLogros(userToView);
      window.renderJoinedActivities(userToView);
      window.renderProfileGrid(userToView);
      window.renderChallenges(userToView);

      const tabGuardadosBtn = document.getElementById('tab-guardados-btn');
      if (tabGuardadosBtn) {
        if (userToView.id === CURRENT_USER.id) {
          tabGuardadosBtn.style.display = 'block';
          window.renderSavedPosts();
        } else {
          tabGuardadosBtn.style.display = 'none';
        }
      }

      showView('view-perfil');
    }
  };

  document.getElementById('perfil-follow-btn').addEventListener('click', async function () {
    const userId = this.getAttribute('data-userid');
    if (!userId) return;

    const post = MOCK_POSTS.find(p => p.user.id === userId);
    let targetUser = post ? post.user : null;

    if (window.followedUsers.includes(userId)) {
      window.followedUsers = window.followedUsers.filter(id => id !== userId);
      document.getElementById('perfil-follow-text').textContent = 'Seguir';
      if (targetUser && targetUser.followers > 0) {
        targetUser.followers--;
        document.getElementById('perfil-stat-seguidores').textContent = targetUser.followers;
      }
    } else {
      window.followedUsers.push(userId);
      document.getElementById('perfil-follow-text').textContent = 'Siguiendo';
      if (targetUser) {
        if (targetUser.followers === undefined) targetUser.followers = Math.floor(Math.random() * 500) + 50;
        targetUser.followers++;
        document.getElementById('perfil-stat-seguidores').textContent = targetUser.followers;
      }
      
      try {
        await apiPost(`${API}/usuarios/${CURRENT_USER.id}/seguir/${userId}`, {});
        console.log("Usuario seguido en backend");
      } catch (e) {
        console.warn("Fallback local para seguir usuario", e);
      }
    }
    saveData('fitTribe_follows', window.followedUsers);
  });

  window.renderLogros = function (user) {
    const container = document.getElementById('logros-container');
    if (!container) return;
    container.innerHTML = '';
    const logros = user.logros || [];
    if (logros.length === 0) {
      container.innerHTML = '<p class="text-secondary" style="grid-column: 1 / -1; text-align: center;">No hay logros todavía.</p>';
      return;
    }
    logros.forEach(logro => {
      container.innerHTML += `
        <div style="background: var(--surface-color-light); padding: 16px; border-radius: 12px; text-align: center; border: 1px solid var(--surface-border); display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100px;">
          <i data-lucide="${logro.icon || 'award'}" color="var(--primary-color)" style="width: 32px; height: 32px; margin-bottom: 8px;"></i>
          <div style="font-size: 14px; font-weight: bold; color: var(--text-primary);">${logro.title}</div>
        </div>
      `;
    });
    lucide.createIcons();
  };

  window.renderChallenges = function (user) {
    const container = document.getElementById('retos-list');
    if (!container) return;
    container.innerHTML = '<p class="text-secondary" style="font-size: 13px; text-align: center; padding: 10px;">No hay retos activos.</p>';
  };

  window.addLogro = function () {
    const input = document.getElementById('logro-title');
    const title = input.value.trim();
    if (title) {
      if (!CURRENT_USER.logros) CURRENT_USER.logros = [];
      const icons = ['award', 'star', 'medal', 'trophy', 'flame', 'zap'];
      const randomIcon = icons[Math.floor(Math.random() * icons.length)];
      CURRENT_USER.logros.push({ title: title, icon: randomIcon });
      input.value = '';
      saveData('fitTribe_user', CURRENT_USER);
      window.renderLogros(CURRENT_USER);
    }
  };

  window.renderJoinedActivities = function (user) {
    const container = document.getElementById('joined-activities-container');
    const msg = document.getElementById('no-activities-msg');
    if (!container || !msg) return;

    const activities = user.joinedActivities || [];
    if (activities.length === 0) {
      msg.style.display = 'block';
      container.innerHTML = '';
    } else {
      msg.style.display = 'none';
      container.innerHTML = activities.map(act => `
        <div class="meetup-item" style="cursor: pointer;" onclick="alert('Abriendo actividad: ${act.title}')">
          <div class="meetup-info">
            <h3 class="meetup-title" style="color: var(--primary-color);">${act.title} - ${act.time}</h3>
            <div class="meetup-members">
              ${act.members.map(avatar => `<img src="${avatar}" class="member-avatar">`).join('')}
            </div>
          </div>
          <i data-lucide="chevron-right" color="var(--text-secondary)"></i>
        </div>
      `).join('');
      lucide.createIcons();
    }
  };

  window.joinActivity = async function (btn, meetupId) {
    if (btn.textContent === 'Joined') return;
    btn.textContent = 'Joined';
    btn.classList.add('joined-btn');

    const meetup = MOCK_MEETUPS.find(m => m.id === meetupId);
    if (meetup) {
      if (!CURRENT_USER.joinedActivities) CURRENT_USER.joinedActivities = [];
      if (!CURRENT_USER.joinedActivities.find(a => a.id === meetup.id)) {
        CURRENT_USER.joinedActivities.push(meetup);
        saveData('fitTribe_user', CURRENT_USER);
        window.renderJoinedActivities(CURRENT_USER);
        
        try {
          const actividadDTO = {
            idUsuario: CURRENT_USER.id.toString(),
            tipo: "UNIR_MEETUP",
            referenciaId: meetupId.toString()
          };
          await apiPost(`${API}/api/actividades`, actividadDTO);
          console.log("Unión a actividad registrada en backend");
        } catch (e) {
          console.warn("Fallback local para unirse a actividad", e);
        }
      }
    }
  };

  window.toggleLike = async function (btn) {
    btn.classList.toggle('active-action');
    const icon = btn.querySelector('i');

    // Extract current likes count from the dedicated span
    const postId = btn.id.split('-').pop();
    const likesCountSpan = document.getElementById('likes-count-' + postId);
    if (!likesCountSpan) return;

    let currentLikes = parseInt(likesCountSpan.textContent) || 0;

    if (btn.classList.contains('active-action')) {
      icon.setAttribute('fill', 'var(--primary-color)');
      icon.setAttribute('color', 'var(--primary-color)');
      currentLikes += 1;
      
      try {
        const reaccionDTO = {
            idUsuario: CURRENT_USER.id.toString(),
            idPublicacion: postId.toString(),
            tipo: "LIKE"
        };
        await apiPost(`${API}/api/reacciones`, reaccionDTO);
      } catch (e) {
        console.warn("Fallback local reaction", e);
      }
    } else {
      icon.setAttribute('fill', 'none');
      icon.setAttribute('color', 'currentColor');
      currentLikes -= 1;
      // In a full implementation we would call apiDelete for the specific reaction id here
    }
    likesCountSpan.textContent = currentLikes;
  };

  let currentCommentPostId = null;

  window.toggleComments = function (postId) {
    currentCommentPostId = postId;
    const post = MOCK_POSTS.find(p => p.id === postId);
    if (!post) return;

    const sheet = document.getElementById('comments-sheet');
    const overlay = document.getElementById('comments-overlay');
    const list = document.getElementById('sheet-comments-list');

    document.getElementById('sheet-comment-avatar').src = CURRENT_USER.avatar;
    document.getElementById('sheet-comment-input').value = '';

    list.innerHTML = (post.commentsArray || []).map(c => `
      <div class="comment-item" style="display: flex; gap: 12px;">
        <img src="${c.avatar}" class="avatar" style="width: 36px; height: 36px;">
        <div class="comment-bubble" style="flex: 1; background: var(--surface-color-light); padding: 12px; border-radius: 12px;">
          <div class="comment-author" style="font-weight: bold; font-size: 13px; margin-bottom: 4px;">${c.author}</div>
          <div class="comment-text" style="font-size: 14px; color: var(--text-primary);">${c.text}</div>
        </div>
      </div>
    `).join('');

    document.getElementById('sheet-comment-send').onclick = () => window.sheetAddComment(postId);

    overlay.style.display = 'block';
    setTimeout(() => {
      overlay.style.opacity = '1';
      sheet.style.bottom = '0';
    }, 10);
  };

  window.closeCommentsSheet = function () {
    currentCommentPostId = null;
    const sheet = document.getElementById('comments-sheet');
    const overlay = document.getElementById('comments-overlay');

    sheet.style.bottom = '-100%';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 300);
  };

  window.sheetAddComment = async function (postId) {
    const input = document.getElementById('sheet-comment-input');
    const text = input.value.trim();
    if (text) {
      const list = document.getElementById('sheet-comments-list');
      list.innerHTML += `
        <div class="comment-item" style="display: flex; gap: 12px;">
          <img src="${CURRENT_USER.avatar}" class="avatar" style="width: 36px; height: 36px;">
          <div class="comment-bubble" style="flex: 1; background: var(--surface-color-light); padding: 12px; border-radius: 12px;">
            <div class="comment-author" style="font-weight: bold; font-size: 13px; margin-bottom: 4px;">${CURRENT_USER.name}</div>
            <div class="comment-text" style="font-size: 14px; color: var(--text-primary);">${text}</div>
          </div>
        </div>
      `;
      input.value = '';

      try {
        const commentData = {
          idUsuario: CURRENT_USER.id.toString(),
          idPublicacion: postId.toString(),
          texto: text
        };
        await apiPost(`${API}/api/comentarios`, commentData);
        console.log("Comentario guardado en el backend");
      } catch (e) {
        console.warn("Fallback: Guardando comentario en local", e);
      }

      const post = MOCK_POSTS.find(p => p.id === postId);
      if (post) {
        if (!post.commentsArray) post.commentsArray = [];
        post.commentsArray.push({ author: CURRENT_USER.name, text: text, avatar: CURRENT_USER.avatar, userId: CURRENT_USER.id });
        post.comments = post.commentsArray.length;
        saveData('fitTribe_posts', MOCK_POSTS);
      }
      list.scrollTop = list.scrollHeight;
    }
  };

  window.sharePost = function (postId) {
    const url = window.location.origin + window.location.pathname + '?post=' + postId;
    navigator.clipboard.writeText(url).then(() => {
      alert('¡Enlace copiado al portapapeles!\n' + url);
    }).catch(err => {
      alert('¡Enlace para compartir!\n' + url);
    });
  };

  // 1. Home Feed
  let defaultPosts = [
    {
      id: 1, user: { id: 'u1', name: 'John', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', description: 'Corredor aficionado, explorando rutas nuevas todos los fines de semana.', logros: [{ title: 'Maratón Madrid', icon: 'award' }] }, action: 'ran 10km at 5:15 pace.', stats: { distance: '10 km', time: '52:30' }, media: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', likes: 110, comments: 1, tags: ['Martorell'], likedByMe: false, commentsArray: [
        { author: 'Carlos', text: '¡Buen trabajo, a seguir así! 💪', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80' }
      ]
    },
    { id: 2, user: { id: 'u2', name: 'Ana', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', description: 'Entusiasta del ciclismo, subiendo puertos por diversión.', logros: [{ title: '100km Bici', icon: 'zap' }] }, action: 'completed a cycling route.', stats: { distance: '45 km', time: '2:15:00' }, media: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', isVideo: true, likes: 342, comments: 0, tags: ['Bici'], likedByMe: true, commentsArray: [] },
    { id: 998, user: { id: 'u_muelas', name: 'Muelas', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Muelas', description: 'Entrenando duro todos los días.' }, action: 'ha subido una nueva rutina de entrenamiento.', stats: { distance: 'Gimnasio', time: '1:30:00' }, media: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', isVideo: false, likes: 245, comments: 12, tags: ['Fuerza', 'Rutina'], likedByMe: false, commentsArray: [] },
    { id: 999, user: { id: 'u_marcos', name: 'Marcos Broncano', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MarcosB', description: 'Amante de la montaña y el trail running.' }, action: 'corriendo por la sierra de Madrid.', stats: { distance: '15 km', time: '1:45:00' }, media: 'https://images.unsplash.com/photo-1526506114805-4e2058c45b91?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', isVideo: false, likes: 532, comments: 34, tags: ['Trail', 'Montaña'], likedByMe: false, commentsArray: [] }
  ];

  let MOCK_POSTS = loadData('fitTribe_posts', defaultPosts);

  let shouldSaveMock = false;
  defaultPosts.forEach(dp => {
      if (!MOCK_POSTS.find(p => p.id === dp.id)) {
          MOCK_POSTS.push(dp);
          shouldSaveMock = true;
      }
  });
  if (shouldSaveMock) {
      saveData('fitTribe_posts', MOCK_POSTS);
  }

  let ALL_STORIES = loadData('fitTribe_all_stories', []);

  window.renderStories = async function () {
    const container = document.getElementById('stories-container');
    if (!container) return;

    let allUsersBackend = [];
    try {
        allUsersBackend = await apiGet(`${API}/usuarios/all`) || [];
    } catch(e) {}

    ALL_STORIES = loadData('fitTribe_all_stories', []);
    
    let myStoryData = ALL_STORIES.find(s => s.userId === CURRENT_USER.id);
    
    const myStoryRender = {
      id: CURRENT_USER.id,
      name: 'Tu historia',
      avatar: CURRENT_USER.avatar,
      isMe: true,
      hasUnseen: myStoryData ? myStoryData.hasUnseen : false,
      media: myStoryData ? myStoryData.media : null,
      isVideo: myStoryData ? myStoryData.isVideo : false
    };

    const otherStoriesRender = ALL_STORIES.filter(s => s.userId !== CURRENT_USER.id).map(s => {
      let finalAvatar = s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`;
      let finalName = s.name;
      
      return {
          id: s.userId,
          name: finalName,
          avatar: finalAvatar,
          isMe: false,
          hasUnseen: s.hasUnseen,
          media: s.media,
          isVideo: s.isVideo
      };
    });

    window.currentRenderedStories = [myStoryRender, ...otherStoriesRender];

    container.innerHTML = window.currentRenderedStories.map((story, index) => `
      <div class="story-item" style="display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; min-width: 72px;" onclick="${story.isMe && !story.media ? "window.handleAddStory()" : `window.openStory(${index})`}">
        <div style="position: relative; width: 68px; height: 68px; border-radius: 50%; padding: 3px; background: ${story.hasUnseen ? 'linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)' : 'transparent'}; box-shadow: ${story.hasUnseen ? 'none' : '0 0 0 1px var(--surface-border)'};">
          <img src="${story.avatar}" style="width: 100%; height: 100%; border-radius: 50%; border: 2px solid var(--surface-color); object-fit: cover;">
          ${story.isMe && !story.media ? '<div style="position: absolute; bottom: 0; right: 0; background: var(--primary-color); border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border: 3px solid var(--surface-color); box-shadow: 0 2px 5px rgba(0,0,0,0.3); transition: transform 0.2s;" onmouseover="this.style.transform=\'scale(1.15)\'" onmouseout="this.style.transform=\'scale(1)\'"><i data-lucide="plus" color="#fff" style="width: 14px; height: 14px;"></i></div>' : ''}
        </div>
        <span style="font-size: 11px; color: var(--text-primary); text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 68px; text-align: center; margin-top: 4px; font-weight: ${story.hasUnseen ? 'bold' : 'normal'};">${story.name}</span>
      </div>
    `).join('');
    lucide.createIcons();
  };

  window.handleAddStory = function () {
    document.getElementById('story-upload-input').click();
  };

  window.handleStoryUpload = function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      const isVideo = file.type.startsWith('video/');
      reader.onload = function (e) {
        ALL_STORIES = loadData('fitTribe_all_stories', []);
        let myStoryIndex = ALL_STORIES.findIndex(s => s.userId === CURRENT_USER.id);
        
        const newStoryData = {
          userId: CURRENT_USER.id,
          name: CURRENT_USER.name,
          avatar: CURRENT_USER.avatar,
          media: e.target.result,
          isVideo: isVideo,
          hasUnseen: true,
          timestamp: Date.now()
        };

        if (myStoryIndex >= 0) {
          ALL_STORIES[myStoryIndex] = newStoryData;
        } else {
          ALL_STORIES.push(newStoryData);
        }
        saveData('fitTribe_all_stories', ALL_STORIES);

        window.renderStories();
        if (window.addNotification) window.addNotification('Has subido una nueva historia.', CURRENT_USER.avatar);
        alert('¡Historia subida con éxito!');
      };
      reader.readAsDataURL(file);
    }
  };

  window.handleDoubleTapLike = function (postId, containerElement) {
    const likeBtn = document.getElementById('like-btn-' + postId);
    if (likeBtn && !likeBtn.classList.contains('active-action')) {
      window.toggleLike(likeBtn);
    }

    // Heart animation
    const heartIcon = containerElement.querySelector('.double-tap-heart');
    if (heartIcon) {
      heartIcon.style.opacity = '1';
      heartIcon.style.transform = 'translate(-50%, -50%) scale(1.2)';
      setTimeout(() => {
        heartIcon.style.transform = 'translate(-50%, -50%) scale(0)';
        heartIcon.style.opacity = '0';
      }, 800);
    }
  };

  window.currentFeedFilter = 'Todo';

  window.filterFeed = function (filter, btnElement) {
    window.currentFeedFilter = filter;

    const chips = btnElement.parentElement.querySelectorAll('.search-chip');
    chips.forEach(c => c.classList.remove('active'));
    btnElement.classList.add('active');

    window.renderFeed();
  };

  window.renderFeed = async function () {
    const feedContainer = document.getElementById('feed-container');
    if (!feedContainer) return;
    feedContainer.innerHTML = '<p class="text-secondary" style="text-align: center; padding: 20px;">Conectando con el backend...</p>';

    let postsToRender = MOCK_POSTS;

    try {
        const backendData = await apiGet(`${API}/api/publicaciones`);
        if (backendData && backendData.length > 0) {
            let allUsersBackend = [];
            try {
               allUsersBackend = await apiGet(`${API}/usuarios/all`) || [];
            } catch(e) {}
            
            let ALL_STORIES = loadData('fitTribe_all_stories', []);

            // Transformar el modelo del backend al diseño visual del frontend
            postsToRender = await Promise.all(backendData.map(async bp => {
                let mediaUrl = (bp.multimedia && bp.multimedia.length > 0) ? bp.multimedia[0] : '';
                
                const postId = bp.id || bp.idPublicaciones;
                const userId = bp.idUsuario || CURRENT_USER.id;
                let finalName = 'Usuario ' + (bp.idUsuario || 'Fit');
                let finalAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
                
                if (userId.toString() === CURRENT_USER.id.toString()) {
                    finalName = CURRENT_USER.name;
                    finalAvatar = CURRENT_USER.avatar;
                } else {
                    const foundUser = allUsersBackend.find(u => u.id && u.id.toString() === userId.toString());
                    if (foundUser) {
                        finalName = foundUser.nombre;
                        if (foundUser.fotoPerfil && foundUser.fotoPerfil !== 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80') {
                            finalAvatar = foundUser.fotoPerfil;
                        } else {
                            finalAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${foundUser.nombre}`;
                        }
                    } else {
                        // Fallback to local mocks if user not found in backend
                        const storyData = ALL_STORIES.find(s => s.userId === userId);
                        if (storyData) {
                            finalName = storyData.name || finalName;
                            finalAvatar = storyData.avatar || finalAvatar;
                        } else {
                            const mockP = MOCK_POSTS.find(p => p.user.id === userId);
                            if (mockP) {
                                finalName = mockP.user.name || finalName;
                                finalAvatar = mockP.user.avatar || finalAvatar;
                            }
                        }
                    }
                }

                // Fetch comments
                let commentsArray = [];
                try {
                    const beComments = await apiGet(`${API}/api/comentarios/publicacion/${postId}`);
                    if (beComments) {
                        commentsArray = beComments.map(c => {
                            let cName = 'Usuario ' + c.idUsuario;
                            let cAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.idUsuario}`;
                            if (c.idUsuario === CURRENT_USER.id.toString()) {
                                cName = CURRENT_USER.name;
                                cAvatar = CURRENT_USER.avatar;
                            } else {
                                const cUser = allUsersBackend.find(u => u.id && u.id.toString() === c.idUsuario);
                                if (cUser) {
                                    cName = cUser.nombre;
                                    if (cUser.fotoPerfil && cUser.fotoPerfil !== 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80') {
                                        cAvatar = cUser.fotoPerfil;
                                    } else {
                                        cAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${cUser.nombre}`;
                                    }
                                }
                            }
                            return {
                              author: cName,
                              text: c.texto,
                              avatar: cAvatar,
                              userId: c.idUsuario
                            };
                        });
                    }
                } catch(e) {}

                // Fetch reactions
                let likesCount = 0;
                let likedByMe = false;
                try {
                    const beReacciones = await apiGet(`${API}/api/reacciones/publicacion/${postId}`);
                    if (beReacciones) {
                        const likes = beReacciones.filter(r => r.tipo === 'LIKE');
                        likesCount = likes.length;
                        likedByMe = likes.some(r => r.idUsuario === CURRENT_USER.id.toString());
                    }
                } catch(e) {}

                // Combine with local mock posts if exists for fallback
                const localPost = MOCK_POSTS.find(p => p.id.toString() === postId.toString());
                if (localPost) {
                     if (commentsArray.length === 0 && localPost.commentsArray) commentsArray = localPost.commentsArray;
                     if (likesCount === 0 && localPost.likes > 0) likesCount = localPost.likes;
                     if (!likedByMe && localPost.likedByMe) likedByMe = true;
                }

                return {
                    id: postId,
                    user: { 
                        id: userId, 
                        name: finalName, 
                        avatar: finalAvatar,
                        description: 'Entusiasta del deporte'
                    },
                    action: bp.texto || bp.contenido,
                    stats: { distance: 'Backend', time: 'Justo ahora' },
                    media: mediaUrl,
                    isVideo: mediaUrl.includes('video'),
                    likes: likesCount,
                    comments: commentsArray.length,
                    tags: [],
                    likedByMe: likedByMe,
                    commentsArray: commentsArray
                };
            }));
            
            postsToRender.reverse(); // Mostrar los más nuevos arriba
        }
    } catch(e) {
        console.warn("El backend no está disponible o no tiene publicaciones. Usando diseño de prueba local.", e);
    }

    window.currentRenderedPosts = postsToRender;

    feedContainer.innerHTML = '';

    const filteredPosts = postsToRender.filter(post => {
      if (window.currentFeedFilter === 'Todo') return true;
      const t = window.currentFeedFilter.toLowerCase();
      const inAction = (post.action || '').toLowerCase().includes(t);
      const inTags = (post.tags || []).some(tag => tag.toLowerCase().includes(t));
      return inAction || inTags;
    });

    if (filteredPosts.length === 0) {
      feedContainer.innerHTML = '<p class="text-secondary" style="text-align: center; padding: 20px;">No hay publicaciones en esta categoría.</p>';
      return;
    }

    filteredPosts.forEach(post => {
      const commentsHtml = (post.commentsArray || []).map(c => `
        <div class="comment-item">
          <img src="${c.avatar}" class="avatar">
          <div class="comment-bubble">
            <div class="comment-author">${c.author}</div>
            <div class="comment-text">${c.text}</div>
          </div>
        </div>
      `).join('');

      feedContainer.innerHTML += `
        <div class="post-card">
          <div class="post-header">
            <img src="${post.user.avatar}" alt="${post.user.name}" class="post-avatar" onclick="window.openProfile('${post.user.id}')" style="cursor: pointer;">
            <div class="post-user-info" onclick="window.openProfile('${post.user.id}')" style="cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span class="post-user-name">${post.user.name}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary);">
                <span class="post-action">${post.action}</span>
                <span>•</span>
                <i data-lucide="clock" style="width:12px; height:12px;"></i>
                <span>Hace poco</span>
              </div>
            </div>
            ${post.user.id === CURRENT_USER.id
          ? `<i data-lucide="trash-2" class="post-more" style="cursor: pointer; color: #ef4444;" onclick="window.deletePost(${post.id})"></i>`
          : `<i data-lucide="more-vertical" class="post-more" style="cursor: pointer; color: var(--text-secondary);"></i>`}
          </div>
          <div class="post-stats-preview">
            <div class="stat-item"><i data-lucide="activity" style="width:16px; color:var(--primary-color);"></i><span>${post.stats.distance}</span></div>
            <div class="stat-item"><i data-lucide="map-pin" style="width:16px; color:var(--primary-color);"></i><span>${post.stats.time}</span></div>
          </div>
          <div class="post-media-container" style="${!post.media ? 'display:none;' : ''} position: relative; user-select: none;" ondblclick="${post.isVideo ? '' : `window.handleDoubleTapLike(${post.id}, this)`}">
            ${post.isVideo
          ? `<video src="${post.media}" class="post-media" controls playsinline style="max-height: 500px; width: 100%; object-fit: contain; background: #000;"></video>`
          : `<img src="${post.media}" alt="Post content" class="post-media">`
        }
            <div class="double-tap-heart" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0); opacity: 0; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); pointer-events: none; z-index: 10;">
              <i data-lucide="heart" fill="var(--primary-color)" color="var(--primary-color)" style="width: 100px; height: 100px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));"></i>
            </div>
            <div class="post-tags">
              ${(post.tags || []).map(tag => `<span class="post-tag">${tag}</span>`).join('')}
            </div>
          </div>
          <div class="post-actions" style="justify-content: space-between; display: flex;">
            <div style="display: flex; gap: 8px;">
              <button id="like-btn-${post.id}" class="action-btn ${post.likedByMe ? 'active-action' : ''}" onclick="window.toggleLike(this)" style="min-width: unset; width: 40px; height: 40px; border-radius: 50%; justify-content: center; padding: 0;">
                <i data-lucide="heart" ${post.likedByMe ? 'fill="var(--primary-color)" color="var(--primary-color)"' : ''}></i>
              </button>
              <button class="action-btn" onclick="window.toggleComments(${post.id})" style="min-width: unset; width: 40px; height: 40px; border-radius: 50%; justify-content: center; padding: 0;">
                <i data-lucide="message-circle"></i>
              </button>
              <button class="action-btn" onclick="window.sharePost(${post.id})" style="min-width: unset; width: 40px; height: 40px; border-radius: 50%; justify-content: center; padding: 0;">
                <i data-lucide="send"></i>
              </button>
            </div>
            <button class="action-btn ${CURRENT_USER.savedPosts && CURRENT_USER.savedPosts.includes(post.id) ? 'active-action' : ''}" onclick="window.toggleSavePost(${post.id}, this)" style="min-width: unset; width: 40px; height: 40px; border-radius: 50%; justify-content: center; padding: 0;">
              <i data-lucide="bookmark" ${CURRENT_USER.savedPosts && CURRENT_USER.savedPosts.includes(post.id) ? 'fill="var(--primary-color)" color="var(--primary-color)"' : ''}></i>
            </button>
          </div>
          <div style="padding: 0 16px; margin-bottom: 8px; font-weight: bold; font-size: 14px;">
            <span id="likes-count-${post.id}">${post.likes}</span> Me gusta
          </div>
          <div style="padding: 0 16px; margin-bottom: 16px; color: var(--text-secondary); font-size: 14px; cursor: pointer;" onclick="window.toggleComments(${post.id})">
            Ver los ${post.comments} comentarios
          </div>
        </div>
      `;
    });
    lucide.createIcons();
  };

  window.createPost = function () {
    const textInput = document.getElementById('create-post-text');
    const distanceInput = document.getElementById('create-post-distance');
    const timeInput = document.getElementById('create-post-time');
    const mediaInput = document.getElementById('create-post-media');

    const text = textInput.value.trim();
    if (!text) {
      alert("Por favor, escribe algo sobre tu entrenamiento.");
      return;
    }

    let mediaUrl = '';
    let isVideo = false;

    async function finalizePost() {
      try {
        // Enviar publicación al backend real a través de la API Gateway
        const publicacionDTO = {
            idUsuario: CURRENT_USER.id.toString(),
            texto: text,
            multimedia: mediaUrl ? [mediaUrl] : []
        };
        await apiPost(`${API}/api/publicaciones`, publicacionDTO);
        console.log("Guardado en la base de datos MongoDB del microservicio de Contenido");
      } catch(e) {
        // Si el backend falla, guardamos en local para que el frontend siga luciendo genial
        console.warn("Fallback: Guardando publicación en el mock local", e);
        const newPost = {
          id: Date.now(),
          user: CURRENT_USER,
          action: text,
          stats: {
            distance: distanceInput.value.trim() || '0 km',
            time: timeInput.value.trim() || '0:00'
          },
          media: mediaUrl,
          isVideo: isVideo,
          likes: 0,
          comments: 0,
          tags: [],
          likedByMe: false,
          commentsArray: []
        };
        MOCK_POSTS.unshift(newPost);
        saveData('fitTribe_posts', MOCK_POSTS);
      }

      textInput.value = '';
      distanceInput.value = '';
      timeInput.value = '';
      mediaInput.value = '';
      document.getElementById('create-post-media-name').textContent = '';

      await window.renderFeed();
      if (window.addNotification) window.addNotification('Has publicado un nuevo post.', CURRENT_USER.avatar);
      alert("¡Publicación creada exitosamente!");
    }

    if (mediaInput.files && mediaInput.files[0]) {
      isVideo = mediaInput.files[0].type.startsWith('video/');
      const reader = new FileReader();
      reader.onload = function (e) {
        mediaUrl = e.target.result;
        finalizePost();
      };
      reader.readAsDataURL(mediaInput.files[0]);
    } else {
      finalizePost();
    }
  };

  window.deletePost = async function (postId) {
    if (confirm("¿Seguro que quieres eliminar esta publicación?")) {
      try {
        await apiDelete(`${API}/api/publicaciones/${postId}`);
        console.log("Eliminado en backend.");
      } catch (e) {
        console.warn("Fallback: Eliminando en local", e);
      }
      
      MOCK_POSTS = MOCK_POSTS.filter(p => p.id !== postId);
      saveData('fitTribe_posts', MOCK_POSTS);
      await window.renderFeed();
      // If currently on profile, re-render profile grid
      if (document.getElementById('view-perfil').classList.contains('active')) {
        window.openProfile('current');
      }
    }
  };

  // Initial render
  window.renderStories();
  window.renderFeed();

  // 2. Meetups 
  let MOCK_MEETUPS = loadData('fitTribe_meetups', [
    { id: 1, title: 'Running Group', time: 'Hoy 19:00', lat: 40.4168, lng: -3.7038, sport: 'Running', members: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'] },
    { id: 2, title: 'Yoga en el parque', time: 'Mañana 10:00', lat: 40.4268, lng: -3.6938, sport: 'Yoga', members: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'] }
  ]);

  window.currentMeetupFilter = 'Todos';

  window.filterMeetups = function (filter, btnElement) {
    window.currentMeetupFilter = filter;

    if (btnElement) {
      const chips = btnElement.parentElement.querySelectorAll('.search-chip');
      chips.forEach(c => c.classList.remove('active'));
      btnElement.classList.add('active');
    }

    window.renderMeetups();
  };

  window.renderMeetups = function () {
    const meetupsContainer = document.getElementById('meetups-container');
    if (meetupsContainer) {
      meetupsContainer.innerHTML = '';

      let filtered = MOCK_MEETUPS;
      if (window.currentMeetupFilter && window.currentMeetupFilter !== 'Todos') {
        const f = window.currentMeetupFilter.toLowerCase();
        filtered = MOCK_MEETUPS.filter(m => {
          if (f === 'hoy') return (m.time || '').toLowerCase().includes('hoy');
          if (f === 'cerca de mí') return true; // Show all for nearby for now
          return (m.sport || '').toLowerCase() === f || (m.title || '').toLowerCase().includes(f);
        });
      }

      if (filtered.length === 0) {
        meetupsContainer.innerHTML = '<p class="text-secondary" style="text-align: center; padding: 20px;">No hay actividades para este filtro.</p>';
      } else {
        filtered.forEach(meetup => {
          meetupsContainer.innerHTML += `
            <div class="meetup-item">
              <div class="meetup-info">
                <h3 class="meetup-title">${meetup.title} - ${meetup.time}</h3>
                <div class="meetup-members">
                  ${meetup.members.map(avatar => `<img src="${avatar}" class="member-avatar">`).join('')}
                </div>
              </div>
              <button class="btn btn-outline" onclick="window.joinActivity(this, ${meetup.id})">Unirse</button>
            </div>
          `;
        });
      }
    }

    if (window.leafletMap && window.leafletMarkers) {
      window.leafletMarkers.clearLayers();
      let filtered = MOCK_MEETUPS;
      if (window.currentMeetupFilter && window.currentMeetupFilter !== 'Todos') {
        const f = window.currentMeetupFilter.toLowerCase();
        filtered = MOCK_MEETUPS.filter(m => {
          if (f === 'hoy') return (m.time || '').toLowerCase().includes('hoy');
          if (f === 'cerca de mí') return true;
          return (m.sport || '').toLowerCase() === f || (m.title || '').toLowerCase().includes(f);
        });
      }
      filtered.forEach(m => {
        if (m.lat && m.lng) {
          L.marker([m.lat, m.lng]).addTo(window.leafletMarkers)
            .bindPopup(`${m.title}<br>${m.time}`);
        }
      });
    }
  };

  // 3. Busqueda - Zonas Populares y Vídeos
  let ZONAS = loadData('fitTribe_zonas', [
    { id: 1, name: 'El Retiro - Running', address: 'Parque de El Retiro, Madrid', image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', user: { id: 'u1', name: 'FitTribe', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80' } },
    { id: 2, name: 'Local Gym - Yoga', address: 'Gimnasio', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80', user: { id: 'u1', name: 'FitTribe', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80' } }
  ]);

  window.renderZonas = function() {
    const zonasContainer = document.getElementById('zonas-container');
    if (!zonasContainer) return;
    zonasContainer.innerHTML = '';
    ZONAS.forEach(zona => {
      zonasContainer.innerHTML += `
        <div class="zona-card" style="position:relative;">
          <img src="${zona.image}" alt="${zona.name}" onclick="window.openGoogleMaps('${zona.address}')" style="cursor:pointer;">
          <div class="zona-label" onclick="window.openGoogleMaps('${zona.address}')" style="cursor:pointer;">${zona.name}</div>
          <div style="position:absolute; top:8px; left:8px; display:flex; align-items:center; gap:6px; background:rgba(0,0,0,0.6); padding:4px 8px; border-radius:20px; cursor:pointer;" onclick="window.openProfile('${zona.user.id}')">
             <img src="${zona.user.avatar}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;">
             <span style="color:#fff; font-size:12px;">${zona.user.name}</span>
          </div>
        </div>
      `;
    });
  };

  window.openGoogleMaps = function(address) {
    if (!address) return;
    const url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address);
    window.open(url, '_blank');
  };

  let VIDEOS = loadData('fitTribe_videos_v2', [
    { id: 1, title: 'Ejercicios de Gimnasio - Rutina Completa', isYoutube: true, youtubeUrl: 'https://www.youtube.com/watch?v=UItWltVZZmE', image: '', user: { id: 'app', name: 'Aplicación FitTribe', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80' } },
    { id: 2, title: 'Deportes en General - Mejores Momentos', isYoutube: true, youtubeUrl: 'https://www.youtube.com/watch?v=cbKkAALRXhw', image: '', user: { id: 'app', name: 'Aplicación FitTribe', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80' } }
  ]);

  function extractVideoID(url) {
      if(!url) return '';
      let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      let match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
  }

  window.renderVideos = function() {
    const videosContainer = document.getElementById('videos-container');
    if (!videosContainer) return;
    videosContainer.innerHTML = '';
    VIDEOS.forEach((video, index) => {
      let thumbnail = video.image;
      if (video.isYoutube && video.youtubeUrl) {
          const ytId = extractVideoID(video.youtubeUrl);
          if (ytId) thumbnail = 'https://img.youtube.com/vi/' + ytId + '/hqdefault.jpg';
      }
      
      videosContainer.innerHTML += `
        <div class="zona-card video-card" onclick="window.openReels(${index})" style="position:relative; cursor:pointer;">
          <img src="${thumbnail}" alt="${video.title}">
          <div class="zona-label">${video.title}</div>
          <div class="video-play-overlay" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);"><i data-lucide="play" fill="#fff" color="#fff" style="width:40px;height:40px;"></i></div>
          <div style="position:absolute; top:8px; left:8px; display:flex; align-items:center; gap:6px; background:rgba(0,0,0,0.6); padding:4px 8px; border-radius:20px; cursor:pointer;" onclick="event.stopPropagation(); window.openProfile('${video.user.id}')">
             <img src="${video.user.avatar}" style="width:24px; height:24px; border-radius:50%; object-fit:cover;">
             <span style="color:#fff; font-size:12px;">${video.user.name}</span>
          </div>
        </div>
      `;
    });
    lucide.createIcons();
  };
  
  // Initialize calls
  window.renderZonas();
  window.renderVideos();

  window.renderPersonas = async function() {
    const personasContainer = document.getElementById('personas-container');
    if (!personasContainer) return;
    
    let allUsers = [];
    try {
        allUsers = await apiGet(`${API}/usuarios/all`) || [];
        console.log('✅ Usuarios obtenidos del backend:', allUsers.length, allUsers);
    } catch(e) {
        console.warn('⚠️ Error obteniendo usuarios del backend:', e);
    }
    
    let ALL_STORIES = loadData('fitTribe_all_stories', []);
    
    // Crear mapa de usuarios con datos frescos del backend como prioridad
    const userMap = new Map();
    
    // 1. Agregar usuarios del backend (prioridad máxima)
    allUsers.forEach(u => {
        if (u && u.id) {
            userMap.set(u.id.toString(), {
                id: u.id,
                nombre: u.nombre,
                fotoPerfil: u.fotoPerfil,
                descripcion: u.descripcion,
                source: 'backend'
            });
        }
    });
    
    // 2. Agregar usuarios de MOCK_POSTS solo si no están en backend
    MOCK_POSTS.forEach(p => {
        if (p.user && p.user.id && !userMap.has(p.user.id.toString())) {
            userMap.set(p.user.id.toString(), {
                id: p.user.id,
                nombre: p.user.name,
                fotoPerfil: p.user.avatar,
                descripcion: p.user.description,
                source: 'mock'
            });
        }
    });
    
    // 3. Agregar usuario actual si no está
    if (CURRENT_USER && CURRENT_USER.id && !userMap.has(CURRENT_USER.id.toString())) {
        userMap.set(CURRENT_USER.id.toString(), {
            id: CURRENT_USER.id,
            nombre: CURRENT_USER.name,
            fotoPerfil: CURRENT_USER.avatar,
            descripcion: CURRENT_USER.description,
            source: 'current'
        });
    }
    
    // Filtrar usuarios (sin mostrar al usuario actual)
    const filteredUsers = Array.from(userMap.values())
        .filter(u => u.id.toString() !== CURRENT_USER.id.toString());
    
    if (filteredUsers.length === 0) {
        personasContainer.innerHTML = '<p class="text-secondary" style="text-align: center; padding: 20px; grid-column: 1 / -1;">No hay otros usuarios todavía.</p>';
        return;
    }

    personasContainer.innerHTML = filteredUsers.map(persona => {
      // Usar fotoPerfil del backend con fallback a dicebear
      let avatarUrl = persona.fotoPerfil;
      
      if (!avatarUrl || avatarUrl.includes('unsplash.com')) {
         avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(persona.nombre || persona.id)}`;
      }
      
      return `
        <div class="zona-card persona-card" onclick="window.openProfile('${persona.id}')" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; background-color:var(--surface-color-light); padding:20px; border-radius: 12px;">
          <img src="${avatarUrl}" alt="${persona.nombre}" style="width:80px; height:80px; border-radius:50%; object-fit:cover; margin-bottom:10px; transition: transform 0.3s ease;" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(persona.nombre || persona.id)}'">
          <div style="font-weight:bold; color:var(--text-primary); text-align:center; font-size: 14px; word-break: break-word;">${persona.nombre}</div>
          ${persona.descripcion ? `<div style="font-size:12px; color:var(--text-secondary); text-align:center; margin-top:4px; max-width: 100%;">${persona.descripcion}</div>` : ''}
        </div>
      `;
    }).join('');
  };
  
  // Call it immediately and also we can re-call it if needed
  window.renderPersonas();

  const perfilActivities = document.getElementById('perfil-activities-container');
  if (perfilActivities) {
    perfilActivities.style.display = 'grid';
    perfilActivities.style.gridTemplateColumns = 'repeat(3, 1fr)';
    perfilActivities.style.gap = '2px';
  }

  window.renderProfileGrid = function (user) {
    if (!perfilActivities) return;
    perfilActivities.innerHTML = '';
    
    const allPosts = window.currentRenderedPosts || MOCK_POSTS;
    const userPosts = allPosts.filter(p => p.user.id.toString() === user.id.toString());

    if (userPosts.length === 0) {
      perfilActivities.style.display = 'block';
      perfilActivities.innerHTML = '<p class="text-secondary" style="text-align: center; padding: 40px 20px;">No hay publicaciones todavía.</p>';
      return;
    }

    perfilActivities.style.display = 'grid';
    userPosts.forEach(post => {
      perfilActivities.innerHTML += `
        <div style="aspect-ratio: 1/1; position: relative; cursor: pointer; overflow: hidden; background: var(--surface-color-light);" onclick="alert('Viendo publicación')">
          ${post.media ? `<img src="${post.media}" style="width: 100%; height: 100%; object-fit: cover;">` : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 8px; text-align: center; font-size: 10px; color: var(--text-secondary);">${post.action}</div>`}
          ${post.isVideo ? '<i data-lucide="play" fill="#fff" color="#fff" style="position: absolute; top: 8px; right: 8px; width: 16px; height: 16px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"></i>' : ''}
        </div>
      `;
    });
    lucide.createIcons();
  };

  window.toggleSavePost = async function (postId, btnElement) {
    if (!CURRENT_USER.savedPosts) CURRENT_USER.savedPosts = [];

    const icon = btnElement.querySelector('i');

    if (CURRENT_USER.savedPosts.includes(postId)) {
      CURRENT_USER.savedPosts = CURRENT_USER.savedPosts.filter(id => id !== postId);
      icon.setAttribute('fill', 'none');
      icon.setAttribute('color', 'currentColor');
      btnElement.classList.remove('active-action');
    } else {
      CURRENT_USER.savedPosts.push(postId);
      icon.setAttribute('fill', 'var(--primary-color)');
      icon.setAttribute('color', 'var(--primary-color)');
      btnElement.classList.add('active-action');
      
      try {
        const reaccionDTO = {
            idUsuario: CURRENT_USER.id.toString(),
            idPublicacion: postId.toString(),
            tipo: "GUARDAR"
        };
        await apiPost(`${API}/api/reacciones`, reaccionDTO);
        console.log("Publicación guardada registrada en backend");
      } catch (e) {
        console.warn("Fallback local para guardar publicación", e);
      }
    }
    saveData('fitTribe_user', CURRENT_USER);
    if (document.getElementById('view-perfil').classList.contains('active')) {
      window.renderSavedPosts();
    }
  };

  window.renderSavedPosts = function () {
    const container = document.getElementById('saved-activities-container');
    const msg = document.getElementById('no-saved-msg');
    if (!container || !msg) return;

    const saved = CURRENT_USER.savedPosts || [];
    if (saved.length === 0) {
      msg.style.display = 'block';
      container.style.display = 'none';
      container.innerHTML = '';
    } else {
      msg.style.display = 'none';
      container.style.display = 'grid';
      container.style.gridTemplateColumns = 'repeat(3, 1fr)';
      container.style.gap = '2px';

      const savedPostsData = MOCK_POSTS.filter(p => saved.includes(p.id));
      container.innerHTML = savedPostsData.map(post => `
        <div style="aspect-ratio: 1/1; position: relative; cursor: pointer; overflow: hidden; background: var(--surface-color-light);" onclick="alert('Viendo publicación guardada')">
          ${post.media ? `<img src="${post.media}" style="width: 100%; height: 100%; object-fit: cover;">` : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 8px; text-align: center; font-size: 10px; color: var(--text-secondary);">${post.action}</div>`}
          ${post.isVideo ? '<i data-lucide="play" fill="#fff" color="#fff" style="position: absolute; top: 8px; right: 8px; width: 16px; height: 16px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"></i>' : ''}
        </div>
      `).join('');
      lucide.createIcons();
    }
  };

  // Tab switching in Busqueda and Perfil
  const searchChips = document.querySelectorAll('.search-categories .search-chip');
  searchChips.forEach(chip => {
    chip.addEventListener('click', () => {
      searchChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const text = chip.textContent.trim().toLowerCase();

      const secZonas = document.getElementById('section-zonas');
      const secVideos = document.getElementById('section-videos');
      const secPersonas = document.getElementById('section-personas');
      const secRanking = document.getElementById('section-ranking');

      if (text === 'todo') {
        if (secZonas) secZonas.style.display = 'block';
        if (secVideos) secVideos.style.display = 'block';
        if (secPersonas) secPersonas.style.display = 'block';
        if (secRanking) secRanking.style.display = 'none';
      } else if (text === 'zonas') {
        if (secZonas) secZonas.style.display = 'block';
        if (secVideos) secVideos.style.display = 'none';
        if (secPersonas) secPersonas.style.display = 'none';
        if (secRanking) secRanking.style.display = 'none';
      } else if (text === 'vídeos' || text === 'videos') {
        if (secZonas) secZonas.style.display = 'none';
        if (secVideos) secVideos.style.display = 'block';
        if (secPersonas) secPersonas.style.display = 'none';
        if (secRanking) secRanking.style.display = 'none';
      } else if (text === 'personas') {
        if (secZonas) secZonas.style.display = 'none';
        if (secVideos) secVideos.style.display = 'none';
        if (secPersonas) secPersonas.style.display = 'block';
        if (secRanking) secRanking.style.display = 'none';
      } else if (text === 'ranking') {
        if (secZonas) secZonas.style.display = 'none';
        if (secVideos) secVideos.style.display = 'none';
        if (secPersonas) secPersonas.style.display = 'none';
        if (secRanking) {
          secRanking.style.display = 'block';
          window.renderRanking();
        }
      }
    });
  });

  window.renderRanking = async function () {
    const container = document.getElementById('ranking-container');
    if (!container) return;

    let allUsers = [];
    try {
        allUsers = await apiGet(`${API}/usuarios/all`) || [];
    } catch(e) {}
    
    if (allUsers.length === 0) {
        // Fallback local
        allUsers = [
            { id: CURRENT_USER.id, nombre: CURRENT_USER.name, avatar: CURRENT_USER.avatar },
            { id: 'u2', nombre: 'Ana', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80' },
            { id: 'u3', nombre: 'John', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80' },
            { id: 'u4', nombre: 'Carlos', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80' }
        ];
    } else {
        // Ensure current user is in the list with up to date avatar
        const cuIndex = allUsers.findIndex(u => u.id.toString() === CURRENT_USER.id.toString());
        if(cuIndex >= 0) {
             allUsers[cuIndex].avatar = CURRENT_USER.avatar;
             allUsers[cuIndex].nombre = CURRENT_USER.name;
        } else {
             allUsers.push({ id: CURRENT_USER.id, nombre: CURRENT_USER.name, avatar: CURRENT_USER.avatar });
        }
    }

    const users = allUsers.map(u => {
      // Calculate points based on mock posts or backend (mocking here)
      let pts = 50;
      const userPosts = MOCK_POSTS.filter(p => p.user.id.toString() === u.id.toString());
      if (userPosts.length > 0) {
         pts = userPosts.reduce((acc, p) => acc + 10 + (parseFloat((p.stats || {}).distance) || 0) * 5, 0);
      } else if (u.id.toString() !== CURRENT_USER.id.toString()) {
         // mock random points for others if no posts
         pts = Math.floor(Math.random() * 300) + 50;
      }
      return { 
          id: u.id,
          name: u.nombre || u.name, 
          avatar: u.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', 
          pts: Math.round(pts) 
      };
    }).sort((a, b) => b.pts - a.pts);

    container.innerHTML = users.map((u, i) => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--surface-color); border-radius: 12px; box-shadow: var(--shadow-sm); ${u.id.toString() === CURRENT_USER.id.toString() ? 'border: 2px solid var(--primary-color);' : ''}">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-weight: bold; font-size: 18px; color: ${i === 0 ? '#fbbf24' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : 'var(--text-secondary)'}; width: 24px; text-align: center;">${i + 1}</div>
          <img src="${u.avatar}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" onclick="window.openProfile('${u.id}')" style="cursor: pointer;">
          <div style="font-weight: bold; color: var(--text-primary); cursor: pointer;" onclick="window.openProfile('${u.id}')">${u.name} ${u.id.toString() === CURRENT_USER.id.toString() ? '(Tú)' : ''}</div>
        </div>
        <div style="font-weight: bold; color: var(--primary-color);">${u.pts} pts</div>
      </div>
    `).join('');
  };

  // Buscador dinámico
  const searchInputs = document.querySelectorAll('.search-input');
  searchInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();

      // Filtrar zonas, personas, videos
      const cards = document.querySelectorAll('.zona-card');
      cards.forEach(card => {
        if (card.textContent.toLowerCase().includes(q)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });

      // Filtrar meetups si estamos en Quedadas
      const meetups = document.querySelectorAll('.meetup-item');
      meetups.forEach(meetup => {
        if (meetup.textContent.toLowerCase().includes(q)) {
          meetup.style.display = '';
        } else {
          meetup.style.display = 'none';
        }
      });
    });
  });

  const perfilTabs = document.querySelectorAll('.perfil-tab');
  perfilTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      perfilTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const tabId = tab.getAttribute('data-tab');
      document.querySelectorAll('.perfil-tab-content').forEach(content => {
        content.style.display = 'none';
      });

      const targetContent = document.getElementById('tab-' + tabId);
      if (targetContent) {
        targetContent.style.display = 'block';
      }
    });
  });

  // --- Chat Logic ---
  window.currentChatUser = null;

  window.openChat = function (userOrId, name, avatar) {
    let user = userOrId;
    if (typeof userOrId === 'string') {
      user = { id: userOrId, name: name, avatar: avatar };
    }
    window.currentChatUser = user;
    document.getElementById('chat-name').textContent = user.name;
    document.getElementById('chat-avatar').src = user.avatar;

    document.getElementById('top-header').style.display = 'none';
    document.getElementById('bottom-nav').style.display = 'none';

    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.getElementById('view-chat').classList.add('active');

    window.renderChatMessages();
    lucide.createIcons();
  };

  window.closeChat = function () {
    window.currentChatUser = null;

    document.getElementById('top-header').style.display = 'flex';
    document.getElementById('bottom-nav').style.display = 'flex';

    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.getElementById('view-perfil').classList.add('active');
  };

  window.renderChatMessages = function () {
    const container = document.getElementById('chat-messages-container');
    container.innerHTML = '';

    if (!window.currentChatUser) return;

    const chatId = window.currentChatUser.id;
    const messages = CHATS[chatId] || [];

    messages.forEach(msg => {
      const isMe = msg.senderId === CURRENT_USER.id;
      container.innerHTML += `
        <div class="chat-bubble ${isMe ? 'sent' : 'received'}">
          ${msg.text}
        </div>
      `;
    });

    container.scrollTop = container.scrollHeight;
  };

  window.sendMessage = function () {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || !window.currentChatUser) return;

    const chatId = window.currentChatUser.id;
    if (!CHATS[chatId]) CHATS[chatId] = [];

    CHATS[chatId].push({
      senderId: CURRENT_USER.id,
      text: text,
      timestamp: new Date().toISOString()
    });

    saveData('fitTribe_chats', CHATS);
    input.value = '';
    window.renderChatMessages();
  };

  window.renderInbox = function () {
    const container = document.getElementById('inbox-list');
    if (!container) return;

    // Create mock inbox users from CHATS or mock data
    const inboxUsers = [
      { id: 'u1', name: 'John', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', lastMsg: '¡Nos vemos en el retiro a las 19:00!', unread: true },
      { id: 'u2', name: 'Ana', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', lastMsg: 'Gracias por la rutina de ayer 💪', unread: false },
      { id: 'u3', name: 'Carlos', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', lastMsg: '¿Te vienes a la pachanga del sábado?', unread: false }
    ];

    container.innerHTML = inboxUsers.map(u => `
      <div style="display: flex; align-items: center; gap: 16px; padding: 12px; border-radius: 12px; background: var(--surface-color); cursor: pointer; transition: background 0.3s;" onclick="window.openChat('${u.id}', '${u.name}', '${u.avatar}')">
        <div style="position: relative;">
          <img src="${u.avatar}" class="avatar" style="width: 56px; height: 56px;">
          ${u.unread ? '<div style="position: absolute; top: 0; right: 0; width: 14px; height: 14px; background: var(--primary-color); border: 2px solid var(--surface-color); border-radius: 50%;"></div>' : ''}
        </div>
        <div style="flex: 1;">
          <div style="font-weight: bold; font-size: 16px; color: var(--text-primary); margin-bottom: 4px;">${u.name}</div>
          <div style="font-size: 14px; color: ${u.unread ? 'var(--text-primary)' : 'var(--text-secondary)'}; font-weight: ${u.unread ? 'bold' : 'normal'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">${u.lastMsg}</div>
        </div>
        <i data-lucide="camera" color="var(--text-secondary)"></i>
      </div>
    `).join('');
    lucide.createIcons();
  };

  let storyTimer = null;
  window.openStory = function (index) {
    const story = window.currentRenderedStories ? window.currentRenderedStories[index] : null;
    if (!story) return;
    const viewer = document.getElementById('stories-viewer');
    document.getElementById('story-name').textContent = story.name;
    document.getElementById('story-avatar').src = story.avatar;
    
    const imgElement = document.getElementById('story-image');
    const vidElement = document.getElementById('story-video');

    if (story.isVideo) {
      imgElement.style.display = 'none';
      vidElement.src = story.media || '';
      vidElement.style.display = 'block';
    } else {
      vidElement.style.display = 'none';
      vidElement.pause();
      imgElement.src = story.media || story.avatar;
      imgElement.style.display = 'block';
    }

    viewer.style.display = 'flex';
    const progress = document.getElementById('story-progress');
    progress.style.width = '0%';

    setTimeout(() => {
      progress.style.transition = 'width 5s linear';
      progress.style.width = '100%';
    }, 50);

    clearTimeout(storyTimer);
    storyTimer = setTimeout(() => {
      window.closeStory();
    }, 5000);

    if (story.hasUnseen) {
      ALL_STORIES = loadData('fitTribe_all_stories', []);
      let storyInAll = ALL_STORIES.find(s => s.userId === story.id);
      if (storyInAll) {
        storyInAll.hasUnseen = false;
        saveData('fitTribe_all_stories', ALL_STORIES);
      }
      setTimeout(() => window.renderStories(), 5000); // Re-render after story closes
    }
  };

  window.closeStory = function () {
    clearTimeout(storyTimer);
    document.getElementById('stories-viewer').style.display = 'none';
    const progress = document.getElementById('story-progress');
    progress.style.transition = 'none';
    progress.style.width = '0%';
  };

  window.openReels = function (index) {
    const video = VIDEOS[index];
    if(!video) return;
    
    const viewer = document.getElementById('reels-viewer');
    const ytElement = document.getElementById('reels-youtube');
    const vidElement = document.getElementById('reels-video');
    const imgElement = document.getElementById('reels-image');
    const playIcon = document.getElementById('reels-play-icon');
    
    document.getElementById('reels-title').textContent = video.title;
    document.getElementById('reels-user-name').textContent = video.user.name;
    document.getElementById('reels-user-avatar').src = video.user.avatar;
    document.getElementById('reels-user-info').onclick = function(e) {
        e.stopPropagation();
        window.openProfile(video.user.id);
        window.closeReels();
    };

    ytElement.style.display = 'none';
    vidElement.style.display = 'none';
    imgElement.style.display = 'none';
    playIcon.style.display = 'none';
    ytElement.src = '';
    vidElement.pause();

    if (video.isYoutube && video.youtubeUrl) {
        const ytId = extractVideoID(video.youtubeUrl);
        if (ytId) {
            ytElement.src = 'https://www.youtube.com/embed/' + ytId + '?autoplay=1';
            ytElement.style.display = 'block';
        }
    } else {
        vidElement.src = video.image || '';
        vidElement.style.display = 'block';
        vidElement.play().catch(e => console.log('Autoplay prevented', e));
    }

    viewer.style.display = 'flex';
  };

  window.closeReels = function () {
    document.getElementById('reels-viewer').style.display = 'none';
    document.getElementById('reels-youtube').src = '';
    document.getElementById('reels-video').pause();
  };

  // --- ZONAS & VIDEOS UPLOAD ---
  window.openAddZonaModal = function() {
    document.getElementById('add-zona-modal').style.display = 'flex';
    document.getElementById('zona-name-input').value = '';
    document.getElementById('zona-address-input').value = '';
    document.getElementById('zona-media-preview').style.display = 'none';
    document.getElementById('zona-media-preview').innerHTML = '';
    window.tempZonaImage = null;
  };

  window.handleZonaMediaSelect = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      window.tempZonaImage = e.target.result;
      const preview = document.getElementById('zona-media-preview');
      preview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: auto; border-radius: 8px;">`;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  };

  window.submitZona = function() {
    const name = document.getElementById('zona-name-input').value.trim();
    const address = document.getElementById('zona-address-input').value.trim();
    if (!name || !address || !window.tempZonaImage) {
        alert("Por favor, rellena el nombre, la dirección y añade una foto.");
        return;
    }
    const newZona = {
        id: Date.now(),
        name: name,
        address: address,
        image: window.tempZonaImage,
        user: { id: CURRENT_USER.id, name: CURRENT_USER.name, avatar: CURRENT_USER.avatar }
    };
    ZONAS.unshift(newZona);
    saveData('fitTribe_zonas', ZONAS);
    window.renderZonas();
    document.getElementById('add-zona-modal').style.display = 'none';
  };

  window.openAddVideoModal = function() {
    document.getElementById('add-video-modal').style.display = 'flex';
    document.getElementById('video-title-input').value = '';
    document.getElementById('video-youtube-input').value = '';
    document.getElementById('video-media-preview').style.display = 'none';
    document.getElementById('video-media-preview').innerHTML = '';
    window.tempVideoFile = null;
  };

  window.handleVideoMediaSelect = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      window.tempVideoFile = e.target.result;
      const preview = document.getElementById('video-media-preview');
      preview.innerHTML = `<video src="${e.target.result}" style="width: 100%; height: auto; border-radius: 8px;" controls></video>`;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  };

  window.submitVideo = function() {
    const title = document.getElementById('video-title-input').value.trim();
    const youtubeUrl = document.getElementById('video-youtube-input').value.trim();
    
    if (!title) {
        alert("Por favor, añade un título.");
        return;
    }
    if (!youtubeUrl && !window.tempVideoFile) {
        alert("Por favor, añade un enlace de YouTube o sube un vídeo.");
        return;
    }

    const newVideo = {
        id: Date.now(),
        title: title,
        isYoutube: !!youtubeUrl,
        youtubeUrl: youtubeUrl || null,
        image: window.tempVideoFile || null,
        user: { id: CURRENT_USER.id, name: CURRENT_USER.name, avatar: CURRENT_USER.avatar }
    };
    
    VIDEOS.unshift(newVideo);
    saveData('fitTribe_videos_v2', VIDEOS);
    window.renderVideos();
    document.getElementById('add-video-modal').style.display = 'none';
  };

  window.openActivityModal = function () {
    document.getElementById('activity-modal-overlay').style.display = 'block';
    document.getElementById('activity-modal').style.display = 'flex';
    setTimeout(() => {
      document.getElementById('activity-modal-overlay').style.opacity = '1';
      document.getElementById('activity-modal').style.opacity = '1';
    }, 10);
  };

  window.closeActivityModal = function () {
    document.getElementById('activity-modal-overlay').style.opacity = '0';
    document.getElementById('activity-modal').style.opacity = '0';
    setTimeout(() => {
      document.getElementById('activity-modal-overlay').style.display = 'none';
      document.getElementById('activity-modal').style.display = 'none';
    }, 300);
  };

  window.startLocationSelection = function() {
    window.closeActivityModal();
    window.isSelectingLocation = true;
    let toast = document.getElementById('location-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'location-toast';
      toast.style.position = 'fixed';
      toast.style.bottom = '80px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.background = 'var(--gradient-primary)';
      toast.style.color = 'white';
      toast.style.padding = '12px 24px';
      toast.style.borderRadius = '24px';
      toast.style.zIndex = '3000';
      toast.style.boxShadow = 'var(--shadow-md)';
      toast.style.fontWeight = 'bold';
      toast.innerHTML = '<i data-lucide="map-pin" style="display:inline-block; vertical-align:middle; margin-right:8px; width:20px; height:20px;"></i> Toca en el mapa para elegir ubicación';
      document.body.appendChild(toast);
      lucide.createIcons();
    }
    toast.style.display = 'block';
  };

  window.submitActivity = function () {
    const title = document.getElementById('activity-title').value.trim();
    const sport = document.getElementById('activity-sport').value;
    const time = document.getElementById('activity-time').value;

    if (!title || !time) {
      alert("Por favor, rellena el título y la fecha.");
      return;
    }

    const lat = window.selectedLatLng ? window.selectedLatLng.lat : 40.4168 + (Math.random() - 0.5) * 0.05;
    const lng = window.selectedLatLng ? window.selectedLatLng.lng : -3.7038 + (Math.random() - 0.5) * 0.05;

    const newMeetup = {
      id: Date.now(),
      title: title,
      sport: sport,
      time: new Date(time).toLocaleString('es-ES', { weekday: 'short', hour: '2-digit', minute: '2-digit' }),
      members: [CURRENT_USER.avatar],
      lat: lat,
      lng: lng
    };

    MOCK_MEETUPS.unshift(newMeetup);
    saveData('fitTribe_meetups', MOCK_MEETUPS);

    document.getElementById('activity-title').value = '';
    document.getElementById('activity-time').value = '';
    document.getElementById('activity-location').value = '';
    window.selectedLatLng = null;
    if (window.tempMarker) {
      window.leafletMap.removeLayer(window.tempMarker);
      window.tempMarker = null;
    }

    window.renderMeetups();
    if (window.addNotification) window.addNotification(`Has creado la quedada: ${title}`, CURRENT_USER.avatar);
    alert("Quedada creada correctamente en el mapa.");
    window.closeActivityModal();
  };

  // Pull to refresh logic
  const homeContainer = document.querySelector('.home-container');
  const spinner = document.getElementById('ptr-spinner');
  let startY = 0;
  let isPulling = false;

  if (homeContainer) {
    homeContainer.addEventListener('touchstart', (e) => {
      if (homeContainer.scrollTop === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    }, { passive: true });

    homeContainer.addEventListener('touchmove', (e) => {
      if (!isPulling) return;
      const y = e.touches[0].clientY;
      const dy = y - startY;

      if (dy > 0 && dy < 150) {
        spinner.style.transform = `translateX(-50%) translateY(${dy}px) rotate(${dy * 2}deg)`;
        spinner.style.opacity = dy / 100;
        e.preventDefault();
      }
    }, { passive: false });

    homeContainer.addEventListener('touchend', (e) => {
      if (!isPulling) return;
      isPulling = false;
      const dy = e.changedTouches[0].clientY - startY;

      if (dy > 80) {
        // Trigger refresh
        spinner.style.transform = `translateX(-50%) translateY(50px)`;
        spinner.innerHTML = '<i data-lucide="loader" style="animation: spin 1s linear infinite; color: var(--primary-color);"></i>';
        lucide.createIcons();

        setTimeout(() => {
          spinner.style.transform = `translateX(-50%) translateY(0)`;
          spinner.style.opacity = '0';
          window.renderFeed(); // Re-render mock feed to simulate refresh
        }, 1500);
      } else {
        spinner.style.transform = `translateX(-50%) translateY(0)`;
        spinner.style.opacity = '0';
      }
    });
  }

  // Notificaciones funcionales
  let MOCK_NOTIFICATIONS = loadData('fitTribe_notifs', []);

  window.renderNotifications = function () {
    const list = document.getElementById('notifications-list');
    const badge = document.getElementById('notifications-badge');
    if (!list) return;

    if (MOCK_NOTIFICATIONS.length === 0) {
      list.innerHTML = '<div style="padding: 16px; color: var(--text-secondary); text-align: center;">No hay notificaciones recientes.</div>';
      if (badge) badge.style.display = 'none';
      return;
    }

    if (badge) badge.style.display = 'block';

    list.innerHTML = MOCK_NOTIFICATIONS.map(n => `
      <div style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--surface-border); cursor: pointer;" onclick="this.style.opacity='0.5'">
        <img src="${n.avatar || CURRENT_USER.avatar}" class="avatar" style="width: 32px; height: 32px;">
        <div style="font-size: 13px; color: var(--text-primary);">${n.text} <br><span style="color: var(--text-secondary); font-size: 11px;">Hace un momento</span></div>
      </div>
    `).join('');
  };

  window.addNotification = function (text, avatar) {
    MOCK_NOTIFICATIONS.unshift({ text, avatar: avatar || CURRENT_USER.avatar, id: Date.now() });
    if (MOCK_NOTIFICATIONS.length > 20) MOCK_NOTIFICATIONS.pop();
    saveData('fitTribe_notifs', MOCK_NOTIFICATIONS);
    window.renderNotifications();
  };

  window.joinActivity = function (btn, meetupId) {
    const meetup = MOCK_MEETUPS.find(m => m.id === meetupId);
    if (!meetup) return;

    if (btn.classList.contains('joined')) {
      btn.classList.remove('joined');
      btn.textContent = 'Unirse';
      btn.style.background = 'transparent';
      btn.style.color = 'var(--primary-color)';
      meetup.members = meetup.members.filter(avatar => avatar !== CURRENT_USER.avatar);
    } else {
      btn.classList.add('joined');
      btn.textContent = 'Unido';
      btn.style.background = 'var(--primary-color)';
      btn.style.color = '#fff';

      if (!meetup.members.includes(CURRENT_USER.avatar)) {
        meetup.members.push(CURRENT_USER.avatar);
        if (window.addNotification) window.addNotification(`Te has unido a: ${meetup.title}`, CURRENT_USER.avatar);
      }
    }
    saveData('fitTribe_meetups', MOCK_MEETUPS);
    setTimeout(() => window.renderMeetups(), 500);
  };

  // Final icons initialization
  lucide.createIcons();

  // Update initial renders
  window.renderNotifications();

});
