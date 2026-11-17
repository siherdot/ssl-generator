const $ = (id) => document.getElementById(id);
let mode = 'form';
let orderId = null;
let timer = null;

async function api(url, options = {}) {
  const r = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  let data = {};
  try { data = await r.json(); } catch {}
  if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
  return data;
}

async function unduhBlob(url, options, nama) {
  const r = await fetch(url, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...options });
  if (!r.ok) {
    let d = {};
    try { d = await r.json(); } catch {}
    throw new Error(d.error || `HTTP ${r.status}`);
  }
  const u = URL.createObjectURL(await r.blob());
  const a = document.createElement('a');
  a.href = u;
  a.download = nama;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}

function pesan(teks) {
  const t = $('toast');
  t.textContent = teks;
  t.hidden = false;
  clearTimeout(pesan._t);
  pesan._t = setTimeout(() => { t.hidden = true; }, 2600);
}

function isiLog(entries) {
  const el = $('log');
  el.replaceChildren();
  for (const e of entries) {
    const li = document.createElement('li');
    li.textContent = `${new Date(e.waktu).toLocaleTimeString('id-ID')} · ${e.pesan}`;
    el.appendChild(li);
  }
  el.scrollTop = el.scrollHeight;
}

function tampilHasil(h) {
  $('hasil').hidden = false;
  $('status').textContent = h.status;
  $('status').className = 'badge ' + (h.status === 'selesai' || h.status === 'gagal' ? h.status : '');
  $('ringkasan').textContent = `${h.domains.join(' · ')} — HTTP-01${h.staging ? ' — STAGING' : ''}`;
  $('hasil-error').textContent = h.error || '';

  const v = $('validasi');
  v.replaceChildren();
  if (h.validasi && h.validasi.length && h.challenge === 'http') {
    const kotak = document.createElement('div');
    kotak.className = 'validasi';
    const p = document.createElement('p');
    p.textContent = 'Pasang file ini di setiap domain (ACME akan mengecek lewat HTTP):';
    kotak.appendChild(p);
    for (const item of h.validasi) {
      const label = document.createElement('p');
      label.textContent = item.domain;
      const kode = document.createElement('code');
      kode.textContent = `${item.path}\n${item.isi}`;
      kotak.append(label, kode);
    }
    v.appendChild(kotak);
  } else if (h.validasi && h.validasi.length) {
    const kotak = document.createElement('div');
    kotak.className = 'validasi';
    const p = document.createElement('p');
    p.textContent = 'Record DNS yang dibuat (dihapus otomatis setelah validasi):';
    kotak.appendChild(p);
    for (const item of h.validasi) {
      const kode = document.createElement('code');
      kode.textContent = `${item.domain}: ${item.isi}`;
      kotak.appendChild(kode);
    }
    v.appendChild(kotak);
  }

  if (h.punyaZip) {
    $('unduh').hidden = false;
    $('zip').href = `/api/order/${h.id}/zip`;
    $('alat').hidden = false;
    $('pfx').disabled = !h.punyaKunci;
    $('pfx').title = h.punyaKunci ? '' : 'Mode CSR tidak menyimpan private key';
    $('laporan').hidden = true;
    const daftar = $('berkas');
    daftar.replaceChildren();
    for (const nama of ['fullchain.pem', 'cert.pem', 'chain.pem', ...(h.punyaKunci ? ['privkey.pem'] : [])]) {
      const a = document.createElement('a');
      a.href = `/api/order/${h.id}/file/${nama}`;
      a.textContent = nama;
      a.download = nama;
      daftar.appendChild(a);
    }
  }
  isiLog(h.log || []);
  $('kirim').disabled = false;
  $('kirim').textContent = 'Buat sertifikat';
}

async function pantau(id) {
  orderId = id;
  const cek = async () => {
    try {
      const h = await api(`/api/order/${id}`);
      tampilHasil(h);
      if (h.status === 'selesai') {
        pesan('Sertifikat siap diunduh.');
        clearInterval(timer); timer = null;
      } else if (h.status === 'gagal') {
        clearInterval(timer); timer = null;
      }
    } catch (e) {
      $('form-error').textContent = e.message;
      clearInterval(timer); timer = null;
    }
  };
  await cek();
  timer = setInterval(cek, 2500);
}

function tampilApp() {
  $('login').hidden = true;
  $('login').style.display = 'none';
  $('app').hidden = false;
  $('app').style.display = '';
}

function tampilLogin() {
  $('app').hidden = true;
  $('app').style.display = 'none';
  $('login').hidden = false;
  $('login').style.display = '';
}

$('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('login-error').textContent = '';
  try {
    await api('/api/login', { method: 'POST', body: JSON.stringify({ password: $('sandi').value }) });
    tampilApp();
    $('sandi').value = '';
  } catch (err) {
    $('login-error').textContent = err.message;
  }
});

$('keluar').addEventListener('click', async () => {
  await api('/api/logout', { method: 'POST', body: '{}' }).catch(() => {});
  location.reload();
});

document.querySelectorAll('.tab button').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.tab button').forEach((x) => x.classList.remove('tab-aktif'));
    b.classList.add('tab-aktif');
    mode = b.dataset.mode;
    $('panel-form').hidden = mode !== 'form';
    $('panel-csr').hidden = mode !== 'csr';
  });
});

$('kirim').addEventListener('click', async () => {
  $('form-error').textContent = '';
  $('hasil-error').textContent = '';
  $('unduh').hidden = true;
  $('alat').hidden = true;
  const body = {
    mode,
    challenge: 'http',
    staging: $('staging').checked
  };
  if (mode === 'csr') {
    body.csr = $('csr').value;
  } else {
    body.domains = $('domains').value;
    body.cn = $('cn').value;
    for (const k of ['country', 'state', 'city', 'org', 'unit', 'email', 'keySize']) body[k] = $(k).value;
  }
  $('kirim').disabled = true;
  $('kirim').textContent = 'Memproses…';
  try {
    const r = await api('/api/order', { method: 'POST', body: JSON.stringify(body) });
    $('hasil').hidden = false;
    $('status').textContent = 'antrean';
    $('ringkasan').textContent = 'Menyiapkan pesanan…';
    await pantau(r.id);
  } catch (err) {
    $('form-error').textContent = err.message;
    $('kirim').disabled = false;
    $('kirim').textContent = 'Buat sertifikat';
  }
});

$('verifikasi').addEventListener('click', async () => {
  if (!orderId) return;
  const tombol = $('verifikasi');
  tombol.disabled = true;
  tombol.textContent = 'Mengecek…';
  try {
    const r = await api(`/api/order/${orderId}/verify`, { method: 'POST', body: '{}' });
    const baris = r.domains.map((d) => {
      if (!d.https) return `✗ ${d.domain} — ${d.error}`;
      return `${d.cocok ? '✓' : '✗'} ${d.domain} — ${d.cocok ? 'sertifikat cocok' : 'sertifikat lain'}\n  penerbit: ${d.penerbit || '-'}\n  berlaku: ${d.berlakuSampai}\n  sidik: ${d.sidik}\n  server: ${d.server || '-'}`;
    });
    const saran = r.domains.find((d) => d.disarankan && d.disarankan !== 'umum');
    if (saran) $('format').value = saran.disarankan;
    $('laporan').textContent = baris.join('\n\n') + (saran ? `\n\nFormat disarankan: ${saran.disarankan}` : '');
    $('laporan').hidden = false;
  } catch (err) {
    $('laporan').textContent = err.message;
    $('laporan').hidden = false;
  } finally {
    tombol.disabled = false;
    tombol.textContent = 'Verifikasi pemasangan';
  }
});

$('bundle').addEventListener('click', async () => {
  if (!orderId) return;
  const f = $('format').value;
  try {
    await unduhBlob(`/api/order/${orderId}/bundle?format=${encodeURIComponent(f)}`, {}, `ssl-${f}.zip`);
    pesan(`Bundle ${f} diunduh`);
  } catch (err) {
    pesan(err.message);
  }
});

$('pfx').addEventListener('click', async () => {
  if (!orderId) return;
  try {
    await unduhBlob(`/api/order/${orderId}/pfx`, {
      method: 'POST',
      body: JSON.stringify({ kataSandi: $('pfx-sandi').value })
    }, 'sertifikat.pfx');
    pesan('PFX diunduh');
  } catch (err) {
    pesan(err.message);
  }
});

$('conv-pfx').addEventListener('click', async () => {
  const tombol = $('conv-pfx');
  tombol.disabled = true;
  try {
    await unduhBlob('/api/alat/pfx', {
      method: 'POST',
      body: JSON.stringify({
        cert: $('conv-cert').value,
        chain: $('conv-chain').value,
        key: $('conv-key').value,
        kataSandi: $('conv-sandi').value
      })
    }, 'konversi.pfx');
    pesan('PFX berhasil dibuat');
  } catch (err) {
    pesan(err.message);
  } finally {
    tombol.disabled = false;
  }
});

$('cek-domain-btn').addEventListener('click', async () => {
  const tombol = $('cek-domain-btn');
  tombol.disabled = true;
  try {
    const r = await api('/api/alat/verify', {
      method: 'POST',
      body: JSON.stringify({ domain: $('cek-domain').value, cert: $('cek-cert').value })
    });
    const teks = r.https
      ? `${r.domain}\n${r.cocok === null ? '—' : r.cocok ? '✓' : '✗'} sertifikat${r.cocok === null ? ' tidak dibandingkan' : r.cocok ? ' cocok' : ' berbeda'}\nPenerbit: ${r.penerbit || '-'}\nBerlaku: ${r.berlakuSampai}\nSidik: ${r.sidik}\nServer: ${r.server || '-'}`
      : `${r.domain}\n✗ HTTPS tidak dapat dihubungi: ${r.error}`;
    $('alat-laporan').textContent = teks;
    $('alat-laporan').hidden = false;
  } catch (err) {
    $('alat-laporan').textContent = err.message;
    $('alat-laporan').hidden = false;
  } finally {
    tombol.disabled = false;
  }
});

(async () => {
  try {
    await api('/api/sesi');
    tampilApp();
  } catch {
    tampilLogin();
  }
})();
