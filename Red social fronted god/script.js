document.addEventListener('DOMContentLoaded', () => {
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
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('login-username');
    if (usernameInput && usernameInput.value.trim() !== '') {
      CURRENT_USER.name = usernameInput.value.trim();
    }

    // Preparar y mostrar pantalla de configuración inicial
    window.isInitialSetup = true;
    configName.value = CURRENT_USER.name;
    configAvatar.value = CURRENT_USER.avatar;
    configDesc.value = CURRENT_USER.description || '';

    showView('view-config');
  });

  logoutBtn.addEventListener('click', () => {
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

      function finishConfigUpdate() {
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
          if (typeof window.renderFeed === 'function') {
            window.renderFeed();
          }
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
    if (userId === CURRENT_USER.id) {
      userToView = CURRENT_USER;
    } else {
      const post = MOCK_POSTS.find(p => p.user.id === userId);
      if (post) userToView = post.user;
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

      const userPostsCount = MOCK_POSTS.filter(p => p.user.id === userToView.id).length;
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

  document.getElementById('perfil-follow-btn').addEventListener('click', function () {
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

  window.joinActivity = function (btn, meetupId) {
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
      }
    }
  };

  window.toggleLike = function (btn) {
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
    } else {
      icon.setAttribute('fill', 'none');
      icon.setAttribute('color', 'currentColor');
      currentLikes -= 1;
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

  window.sheetAddComment = function (postId) {
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
  let MOCK_POSTS = loadData('fitTribe_posts', [
    {
      id: 1, user: { id: 'u1', name: 'John', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', description: 'Corredor aficionado, explorando rutas nuevas todos los fines de semana.', logros: [{ title: 'Maratón Madrid', icon: 'award' }] }, action: 'ran 10km at 5:15 pace.', stats: { distance: '10 km', time: '52:30' }, media: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', likes: 110, comments: 1, tags: ['Martorell'], likedByMe: false, commentsArray: [
        { author: 'Carlos', text: '¡Buen trabajo, a seguir así! 💪', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80' }
      ]
    },
    { id: 2, user: { id: 'u2', name: 'Ana', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', description: 'Entusiasta del ciclismo, subiendo puertos por diversión.', logros: [{ title: '100km Bici', icon: 'zap' }] }, action: 'completed a cycling route.', stats: { distance: '45 km', time: '2:15:00' }, media: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', isVideo: true, likes: 342, comments: 0, tags: ['Bici'], likedByMe: true, commentsArray: [] }
  ]);

  let STORIES = loadData('fitTribe_stories', [
    { id: 'me', name: 'Tu historia', avatar: CURRENT_USER.avatar, isMe: true },
    { id: 'u1', name: 'John', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', hasUnseen: true },
    { id: 'u2', name: 'Ana', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', hasUnseen: true },
    { id: 'u3', name: 'Carlos', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', hasUnseen: false }
  ]);

  window.renderStories = function () {
    const container = document.getElementById('stories-container');
    if (!container) return;

    // Check if CURRENT_USER avatar changed
    const myStory = STORIES.find(s => s.id === 'me');
    if (myStory && myStory.avatar !== CURRENT_USER.avatar) {
      myStory.avatar = CURRENT_USER.avatar;
      saveData('fitTribe_stories', STORIES);
    }

    container.innerHTML = STORIES.map((story, index) => `
      <div class="story-item" style="display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; min-width: 72px;" onclick="${story.isMe && !story.hasUnseen ? "window.handleAddStory()" : `window.openStory(${index})`}">
        <div style="position: relative; width: 64px; height: 64px; border-radius: 50%; padding: 2px; background: ${story.hasUnseen ? 'linear-gradient(45deg, var(--primary-color) 0%, var(--primary-hover) 100%)' : '#ddd'};">
          <img src="${story.avatar}" style="width: 100%; height: 100%; border-radius: 50%; border: 2px solid var(--surface-color); object-fit: cover;">
          ${story.isMe && !story.hasUnseen ? '<div style="position: absolute; bottom: 0; right: 0; background: var(--primary-color); border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: 2px solid var(--surface-color);"><i data-lucide="plus" color="#fff" style="width: 12px; height: 12px;"></i></div>' : ''}
        </div>
        <span style="font-size: 11px; color: var(--text-primary); text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 64px; text-align: center;">${story.name}</span>
      </div>
    `).join('');
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
        const myStory = STORIES.find(s => s.id === 'me');
        if (myStory) {
          myStory.hasUnseen = true;
          myStory.media = e.target.result;
          myStory.isVideo = isVideo;
          saveData('fitTribe_stories', STORIES);
        }
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

  window.renderFeed = function () {
    const feedContainer = document.getElementById('feed-container');
    if (!feedContainer) return;
    feedContainer.innerHTML = '';

    const filteredPosts = MOCK_POSTS.filter(post => {
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

    function finalizePost() {
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

      textInput.value = '';
      distanceInput.value = '';
      timeInput.value = '';
      mediaInput.value = '';
      document.getElementById('create-post-media-name').textContent = '';

      window.renderFeed();
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

  window.deletePost = function (postId) {
    if (confirm("¿Seguro que quieres eliminar esta publicación?")) {
      MOCK_POSTS = MOCK_POSTS.filter(p => p.id !== postId);
      saveData('fitTribe_posts', MOCK_POSTS);
      window.renderFeed();
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

  // 3. Busqueda - Zonas Populares
  const ZONAS = [
    { id: 1, name: 'El Retiro - Running', image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
    { id: 2, name: 'Local Gym - Yoga', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' }
  ];

  const zonasContainer = document.getElementById('zonas-container');
  ZONAS.forEach(zona => {
    zonasContainer.innerHTML += `
      <div class="zona-card" onclick="alert('Explorando ${zona.name}')">
        <img src="${zona.image}" alt="${zona.name}">
        <div class="zona-label">${zona.name}</div>
      </div>
    `;
  });

  const VIDEOS = [
    { id: 1, title: 'Rutina de 15 min', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
    { id: 2, title: 'Técnica de carrera', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' }
  ];

  const videosContainer = document.getElementById('videos-container');
  if (videosContainer) {
    VIDEOS.forEach(video => {
      videosContainer.innerHTML += `
        <div class="zona-card video-card" onclick="window.openReels('${video.image}', '${video.title}')" style="position:relative; cursor:pointer;">
          <img src="${video.image}" alt="${video.title}">
          <div class="zona-label">${video.title}</div>
          <div class="video-play-overlay" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);"><i data-lucide="play" fill="#fff" color="#fff" style="width:40px;height:40px;"></i></div>
        </div>
      `;
    });
  }

  const PERSONAS = [
    { id: 'u1', name: 'John Doe', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
    { id: 'u2', name: 'Ana Smith', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' }
  ];

  const personasContainer = document.getElementById('personas-container');
  if (personasContainer) {
    PERSONAS.forEach(persona => {
      personasContainer.innerHTML += `
        <div class="zona-card persona-card" onclick="window.openProfile('${persona.id}')" style="cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; background-color:var(--surface-color-light); padding:20px;">
          <img src="${persona.image}" alt="${persona.name}" style="width:80px; height:80px; border-radius:50%; object-fit:cover; margin-bottom:10px; transition: transform 0.3s ease;">
          <div style="font-weight:bold; color:var(--text-primary);">${persona.name}</div>
        </div>
      `;
    });
  }

  const perfilActivities = document.getElementById('perfil-activities-container');
  if (perfilActivities) {
    perfilActivities.style.display = 'grid';
    perfilActivities.style.gridTemplateColumns = 'repeat(3, 1fr)';
    perfilActivities.style.gap = '2px';
  }

  window.renderProfileGrid = function (user) {
    if (!perfilActivities) return;
    perfilActivities.innerHTML = '';
    const userPosts = MOCK_POSTS.filter(p => p.user.id === user.id);

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

  window.toggleSavePost = function (postId, btnElement) {
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

  window.renderRanking = function () {
    const container = document.getElementById('ranking-container');
    if (!container) return;

    // Calcular puntos de forma mock: Cada post = 10 pts, cada kilómetro = 5 pts.
    let userPts = MOCK_POSTS.filter(p => p.user.id == CURRENT_USER.id).reduce((acc, p) => acc + 10 + (parseFloat((p.stats || {}).distance) || 0) * 5, 0);

    const users = [
      { name: CURRENT_USER.name, avatar: CURRENT_USER.avatar, pts: Math.round(userPts) || 50 },
      { name: 'Ana', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', pts: 320 },
      { name: 'John', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', pts: 215 },
      { name: 'Carlos', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', pts: 180 }
    ].sort((a, b) => b.pts - a.pts);

    container.innerHTML = users.map((u, i) => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--surface-color); border-radius: 12px; box-shadow: var(--shadow-sm); ${u.name === CURRENT_USER.name ? 'border: 2px solid var(--primary-color);' : ''}">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-weight: bold; font-size: 18px; color: ${i === 0 ? '#fbbf24' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : 'var(--text-secondary)'}; width: 24px; text-align: center;">${i + 1}</div>
          <img src="${u.avatar}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
          <div style="font-weight: bold; color: var(--text-primary);">${u.name} ${u.name === CURRENT_USER.name ? '(Tú)' : ''}</div>
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

  // -- Modal Logic --
  let storyTimer = null;
  window.openStory = function (index) {
    const story = STORIES[index];
    if (!story) return;
    const viewer = document.getElementById('stories-viewer');
    document.getElementById('story-name').textContent = story.name;
    document.getElementById('story-avatar').src = story.avatar;
    document.getElementById('story-image').src = story.media || story.avatar;

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
      story.hasUnseen = false;
      saveData('fitTribe_stories', STORIES);
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

  window.openReels = function (image, title) {
    const viewer = document.getElementById('reels-viewer');
    document.getElementById('reels-video').src = image;
    document.getElementById('reels-title').textContent = title;
    viewer.style.display = 'flex';
  };

  window.closeReels = function () {
    document.getElementById('reels-viewer').style.display = 'none';
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

  window.submitActivity = function () {
    const title = document.getElementById('activity-title').value.trim();
    const sport = document.getElementById('activity-sport').value;
    const time = document.getElementById('activity-time').value;

    if (!title || !time) {
      alert("Por favor, rellena el título y la fecha.");
      return;
    }

    const newMeetup = {
      id: Date.now(),
      title: title,
      sport: sport,
      time: new Date(time).toLocaleString('es-ES', { weekday: 'short', hour: '2-digit', minute: '2-digit' }),
      members: [CURRENT_USER.avatar],
      lat: 40.4168 + (Math.random() - 0.5) * 0.05,
      lng: -3.7038 + (Math.random() - 0.5) * 0.05
    };

    MOCK_MEETUPS.unshift(newMeetup);
    saveData('fitTribe_meetups', MOCK_MEETUPS);

    document.getElementById('activity-title').value = '';
    document.getElementById('activity-time').value = '';

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
