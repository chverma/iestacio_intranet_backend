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

        // helper para eliminar (pregunta confirmación y llama DELETE)
        async function deleteItem(entity, id) {
          if (!id) return;
          if (!confirm('Segur que vols eliminar aquest registre?')) return;
          try {
            const res = await fetch(`/${entity}/${id}`, {
              method: 'DELETE',
              credentials: 'same-origin',
            });
            if (!res.ok) {
              const text = await res.text().catch(()=>null);
              alert('Error al eliminar: ' + (text || res.status));
              return;
            }
            // Recargar la sección actual de forma simple
            location.reload();
          } catch (err) {
            console.error('Delete error', err);
            alert('Error al eliminar');
          }
        }

        // helper modal functions
        function openEditModal(entity, id, item) {
          try {
            const modal = document.getElementById('editModal');
            if (!modal) return;
            document.getElementById('edit-entity').textContent = entity;
            document.getElementById('edit-id').textContent = id;
            const ta = document.getElementById('edit-json');
            ta.value = JSON.stringify(item, null, 2);
            modal.style.display = 'flex';
            // focus/select textarea
            ta.focus();
            ta.select();
          } catch (err) {
            console.error('openEditModal', err);
          }
        }
        function closeEditModal() {
          const modal = document.getElementById('editModal');
          if (!modal) return;
          modal.style.display = 'none';
        }

        // submit edited JSON via PUT
        async function submitEdit() {
          const entity = document.getElementById('edit-entity').textContent;
          const id = document.getElementById('edit-id').textContent;
          const ta = document.getElementById('edit-json');
          let body;
          try {
            body = JSON.parse(ta.value);
          } catch (err) {
            alert('JSON inválido: ' + err.message);
            return;
          }
          try {
            const res = await fetch(`/${entity}/${id}`, {
              method: 'PUT',
              credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });
            if (!res.ok) {
              const text = await res.text().catch(()=>null);
              alert('Error al guardar: ' + (text || res.status));
              return;
            }
            closeEditModal();
            // recargar para ver cambios
            location.reload();
          } catch (err) {
            console.error('submitEdit', err);
            alert('Error al guardar');
          }
        }

        // wire modal buttons after DOM ready
        document.addEventListener('DOMContentLoaded', function () {
          const closeBtn = document.getElementById('edit-modal-close');
          const cancelBtn = document.getElementById('edit-modal-cancel');
          const saveBtn = document.getElementById('edit-modal-save');
          if (closeBtn) closeBtn.addEventListener('click', closeEditModal);
          if (cancelBtn) cancelBtn.addEventListener('click', closeEditModal);
          if (saveBtn) saveBtn.addEventListener('click', submitEdit);

          // click fuera del cuadro para cerrar
          const modal = document.getElementById('editModal');
          if (modal) modal.addEventListener('click', (e) => {
            if (e.target === modal) closeEditModal();
          });
        });

        // Render helpers para cada sección: añadir botón Edit y listener que abre modal
        function renderUsers(items) {
            const tbody = document.getElementById('users-tbody');
            tbody.innerHTML = '';
            for (const u of items) {
                const id = u.id_user ?? u.id ?? '';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${id}</td>
                    <td>${u.name ?? ''}</td>
                    <td>${u.email ?? ''}</td>
                    <td>${u.role ?? ''}</td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-secondary edit-btn">Editar</button>
                    </td>
                `;
                tbody.appendChild(tr);
                const edit = tr.querySelector('.edit-btn');
                if (edit) edit.addEventListener('click', () => openEditModal('users', id, u));
            }
        }

        function renderAbsences(items) {
            const tbody = document.getElementById('absences-tbody');
            tbody.innerHTML = '';
            for (const a of items) {
                const id = a.id_absence ?? a.id ?? '';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${id}</td>
                    <td>${(a.user?.name ?? '') + ' ' + (a.user?.surname ?? '')}</td>
                    <td>${a.start ? new Date(a.start).toLocaleString() : (a.date_absence ? new Date(a.date_absence).toLocaleString() : '')}</td>
                    <td>${a.location ?? ''}</td>
                    <td>${a.subject ?? ''}</td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-secondary edit-btn">Editar</button>
                      <button class="btn btn-sm btn-outline-danger delete-btn">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
                const edit = tr.querySelector('.edit-btn');
                if (edit) edit.addEventListener('click', () => openEditModal('absence', id, a));
                const del = tr.querySelector('.delete-btn');
                if (del) del.addEventListener('click', () => deleteItem('absence', id));
            }
        }

        function renderEvents(items) {
            const tbody = document.getElementById('events-tbody');
            tbody.innerHTML = '';
            for (const e of items) {
                const id = e.id_event ?? e.id ?? '';
                const tr = document.createElement('tr');
                if (e.deleted) {
                  tr.classList.add('tr-deleted');
                }
                tr.innerHTML = `
                    <td>${id}</td>
                    <td>${e.subject ?? e.title ?? ''}</td>
                    <td>${e.start ? new Date(e.start).toLocaleString() : ''}</td>
                    <td>${e.end ? new Date(e.end).toLocaleString() : ''}</td>
                    <td>${(e.user?.name ?? '') + ' ' + (e.user?.surname ?? '')}</td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-secondary edit-btn">Editar</button>
                      <button class="btn btn-sm btn-outline-danger delete-btn">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
                const edit = tr.querySelector('.edit-btn');
                if (edit) edit.addEventListener('click', () => openEditModal('calendarevent', id, e));
                const del = tr.querySelector('.delete-btn');
                if (del) del.addEventListener('click', () => deleteItem('calendarevent', id));
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