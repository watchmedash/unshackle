// ─── Sidebar ──────────────────────────────────────────────────────────────────
const adminSidebar = document.getElementById('adminSidebar');
const burgerAdmin  = document.getElementById('burgerAdmin');
const sidebarClose = document.getElementById('sidebarClose');
const overlay = document.createElement('div');
overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:499;display:none;';
document.body.appendChild(overlay);

function openSidebar()  { adminSidebar && adminSidebar.classList.add('open');    overlay.style.display = 'block'; }
function closeSidebar() { adminSidebar && adminSidebar.classList.remove('open'); overlay.style.display = 'none';  }
burgerAdmin  && burgerAdmin.addEventListener('click', openSidebar);
sidebarClose && sidebarClose.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

// Active sidebar link highlight
document.querySelectorAll('.sidebar-link').forEach(link => {
  if (link.href && link.href === window.location.href) link.classList.add('active');
});

// ─── Helper: fetch with credentials (sends session cookie) ────────────────────
function apiFetch(url, opts) {
  return fetch(url, Object.assign({ credentials: 'same-origin' }, opts));
}

// ─── Properties ───────────────────────────────────────────────────────────────
function deleteProperty(id) {
  if (!confirm('Delete this property? This cannot be undone.')) return;
  apiFetch('/admin/properties/delete/' + id, { method: 'POST' })
    .then(r => r.json())
    .then(d => { if (d.ok) location.reload(); })
    .catch(() => alert('Failed to delete.'));
}

// ─── Media upload preview ─────────────────────────────────────────────────────
function removeMedia(type, filename, itemId) {
  const field = document.getElementById(type === 'image' ? 'removedImages' : 'removedVideos');
  if (field) {
    const cur = field.value ? field.value.split(',').filter(Boolean) : [];
    if (!cur.includes(filename)) cur.push(filename);
    field.value = cur.join(',');
  }
  const item = document.getElementById(itemId);
  if (item) { item.style.opacity = '0.25'; item.style.pointerEvents = 'none'; }
}

function setupUploadZone(zoneId, inputId, previewId, type) {
  const zone    = document.getElementById(zoneId);
  const input   = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!zone || !input || !preview) return;

  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', ()  => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('dragover');
    addPreviews(e.dataTransfer.files);
  });
  input.addEventListener('change', () => addPreviews(input.files));
  zone.addEventListener('click', e => { if (e.target !== input) input.click(); });

  function addPreviews(files) {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const wrap = document.createElement('div');
        wrap.className = 'preview-item';
        wrap.innerHTML = type === 'image'
          ? '<img src="' + ev.target.result + '" alt="preview">'
          : '<video src="' + ev.target.result + '" muted></video>';
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'preview-remove';
        btn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        btn.addEventListener('click', () => wrap.remove());
        wrap.appendChild(btn);
        preview.appendChild(wrap);
      };
      reader.readAsDataURL(file);
    });
  }
}
setupUploadZone('imageDropZone', 'imageInput', 'imagePreview', 'image');
setupUploadZone('videoDropZone', 'videoInput', 'videoPreview', 'video');

// ─── Enquiries — event delegation ─────────────────────────────────────────────
document.addEventListener('click', function(e) {
  const readBtn = e.target.closest('.eq-btn-read');
  if (readBtn) {
    const id = readBtn.dataset.id;
    if (!id) return;
    readBtn.disabled = true;
    readBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    apiFetch('/admin/enquiries/read/' + id, { method: 'POST' })
      .then(r => r.json())
      .then(d => { if (d.ok) location.reload(); })
      .catch(() => { readBtn.disabled = false; readBtn.innerHTML = '<i class="fa-solid fa-check-double"></i> Mark Read'; });
    return;
  }

  const delBtn = e.target.closest('.eq-btn-delete');
  if (delBtn) {
    const id = delBtn.dataset.id;
    if (!id) return;
    if (!confirm('Delete this enquiry permanently?')) return;
    delBtn.disabled = true;
    apiFetch('/admin/enquiries/delete/' + id, { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        if (d.ok) {
          const card = document.getElementById('eq_' + id);
          if (card) {
            card.style.transition = 'opacity 0.25s, transform 0.25s';
            card.style.opacity = '0'; card.style.transform = 'translateX(12px)';
            setTimeout(() => card.remove(), 280);
          } else location.reload();
        }
      })
      .catch(() => { delBtn.disabled = false; });
  }
});

// ─── Unread badge in sidebar ──────────────────────────────────────────────────
apiFetch('/admin/enquiries/count')
  .then(r => r.json())
  .then(d => {
    const badge = document.getElementById('unreadBadge');
    if (badge && d.count > 0) { badge.textContent = d.count; badge.style.display = 'inline-flex'; }
  }).catch(() => {});
