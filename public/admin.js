
function openTab(evt, tabName) {
  // ocultar todos los tabcontent (aquí usamos las tab-pane existentes)
  const tabcontents = document.querySelectorAll('.tab-pane');
  tabcontents.forEach(tc => {
    tc.style.display = 'none';
    tc.classList.remove('show', 'active');
  });

  // quitar active de todos los tablinks
  const tablinks = document.querySelectorAll('.tablinks');
  tablinks.forEach(tl => {
    tl.classList.remove('active');
  });

  // mostrar el tab seleccionado
  const pane = document.getElementById(tabName);
  if (pane) {
    pane.style.display = 'block';
    pane.classList.add('show', 'active');
  }

  // marcar el botón como activo
  if (evt && evt.currentTarget) {
    evt.currentTarget.classList.add('active');
  }
}

// Inicializar: simular click en el tab por defecto cuando DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  const defaultBtn = document.getElementById('defaultOpen');
  if (defaultBtn) {
    defaultBtn.click();
  } else {
    // si no existe defaultOpen, activar el primer tablink
    const first = document.querySelector('.tablinks');
    if (first) first.click();
  }
});

 (function () {
        // Util: robust fetch + parse list
        async function fetchList(path, page, limit, search) {
            const params = new URLSearchParams();
            params.set('page', page);
            params.set('limit', limit);
            if (search) params.set('q', search);
            const res = await fetch(path + '?' + params.toString(), { credentials: 'same-origin' });
            if (!res.ok) throw new Error('Fetch error ' + res.status);
            return res.json();
        }

        function toArrayResponse(data) {
            // soporta { items, total, page, limit } o array directo
            if (Array.isArray(data)) return { items: data, total: data.length };
            if (data && data.items) return { items: data.items, total: data.total ?? data.items.length, page: data.page ?? 1, limit: data.limit ?? data.items.length };
            return { items: [], total: 0 };
        }

        // Render helpers para cada sección:
        function renderUsers(items) {
            const tbody = document.getElementById('users-tbody');
            tbody.innerHTML = '';
            for (const u of items) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${u.id_user ?? ''}</td>
                    <td>${u.name ?? ''}</td>
                    <td>${u.email ?? ''}</td>
                    <td>${u.role ?? ''}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-secondary">Editar</button>
                        <button class="btn btn-sm btn-outline-danger">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            }
        }

        function renderAbsences(items) {
            const tbody = document.getElementById('absences-tbody');
            tbody.innerHTML = '';
            for (const a of items) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${a.id_absence ?? ''}</td>
                    <td>${a.user.name + ' ' + a.user.surname ?? ''}</td>
                    <td>${new Date(a.date_absence).toLocaleString() ?? ''}</td>
                    <td>${a.subject}</td>
                    <td>${a.location ?? ''}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-secondary">Editar</button>
                        <button class="btn btn-sm btn-outline-danger">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            }
        }

        function renderEvents(items) {
            const tbody = document.getElementById('events-tbody');
            tbody.innerHTML = '';
            for (const e of items) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${e.id_event ?? ''}</td>
                    <td>${e.subject ?? ''}</td>
                    <td>${new Date(e.start).toLocaleString() ?? ''}</td>
                    <td>${new Date(e.end).toLocaleString() ?? ''}</td>
                    <td>${e.user.name + ' ' + e.user.surname ?? ''}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-secondary">Editar</button>
                        <button class="btn btn-sm btn-outline-danger">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            }
        }

        // Generic pager controller factory
        function setupPager(options) {
            const { basePath, searchEl, limitEl, prevBtn, nextBtn, infoEl, render } = options;
            let page = 1;
            async function load() {
                const limit = parseInt(limitEl.value, 10) || 10;
                const search = (searchEl && searchEl.value) ? searchEl.value.trim() : '';
                try {
                    const data = await fetchList(basePath, page, limit, search);
                    const parsed = toArrayResponse(data);
                    render(parsed.items || []);
                    infoEl.textContent = `Pàgina ${page} · Mostrant ${parsed.items.length} de ${parsed.total ?? '?'} elements`;
                } catch (err) {
                    infoEl.textContent = 'Error carregant dades';
                    console.error(err);
                }
            }
            prevBtn.addEventListener('click', () => {
                if (page > 1) { page -= 1; load(); }
            });
            nextBtn.addEventListener('click', () => {
                page += 1; load();
            });
            limitEl.addEventListener('change', () => { page = 1; load(); });
            if (searchEl) {
                let to = 0;
                searchEl.addEventListener('input', () => {
                    clearTimeout(to);
                    to = setTimeout(() => { page = 1; load(); }, 300);
                });
            }
            // initial load
            load();
        }

        // Setup all pagers
        document.addEventListener('DOMContentLoaded', () => {
            setupPager({
                basePath: '/users',
                searchEl: document.getElementById('users-search'),
                limitEl: document.getElementById('users-limit'),
                prevBtn: document.getElementById('users-prev'),
                nextBtn: document.getElementById('users-next'),
                infoEl: document.getElementById('users-info'),
                render: renderUsers,
            });

            setupPager({
                basePath: '/absence',
                searchEl: document.getElementById('absences-search'),
                limitEl: document.getElementById('absences-limit'),
                prevBtn: document.getElementById('absences-prev'),
                nextBtn: document.getElementById('absences-next'),
                infoEl: document.getElementById('absences-info'),
                render: renderAbsences,
            });

            setupPager({
                basePath: '/calendarevent',
                searchEl: document.getElementById('events-search'),
                limitEl: document.getElementById('events-limit'),
                prevBtn: document.getElementById('events-prev'),
                nextBtn: document.getElementById('events-next'),
                infoEl: document.getElementById('events-info'),
                render: renderEvents,
            });
        });
    })();