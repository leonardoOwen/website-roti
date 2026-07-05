/* ==========================================================================
   KONFIGURASI TOKO
   Ganti angka di bawah ini dengan nomor WhatsApp toko (format internasional,
   tanpa tanda + atau spasi). Semua tombol checkout memakai nomor ini.
   ========================================================================== */
const STORE_WHATSAPP_NUMBER = '6281292449473' // contoh: '6281234567890'

/* ==========================================================================
   DATA PRODUK
   Ini "sumber kebenaran" tokonya. Untuk menambah, mengubah harga, atau
   menyembunyikan roti, cukup ubah array di bawah — tampilan menu, filter
   kategori, pencarian, dan keranjang otomatis mengikuti.
   badge  : teks kecil di pojok kartu, kosongkan '' kalau tidak perlu
   stock  : false = roti otomatis ditandai habis dan tidak bisa ditambah
   ========================================================================== */
const PRODUCTS = [
    { id: 'p1', name: 'Roti Bulat Klasik', category: 'Roti Manis', price: 15000, img: 'assets/img/bread-1.png', desc: 'Dimasak dengan panas yang rata, empuk sampai lapisan dalam.', badge: '', stock: true },
    { id: 'p2', name: 'Baguette Prancis', category: 'Roti Tawar', price: 22000, img: 'assets/img/bread-2.png', desc: 'Kulit renyah khas Prancis, cocok untuk saus atau olesan.', badge: 'Baru', stock: true },
    { id: 'p3', name: 'Roti Cookies Lumer', category: 'Pastry', price: 18000, img: 'assets/img/bread-3.png', desc: 'Campuran cookies kecil yang lumer di setiap gigitan.', badge: '', stock: true },
    { id: 'p4', name: 'Sourdough Panggang', category: 'Roti Tawar', price: 28000, img: 'assets/img/bread-4.png', desc: 'Fermentasi alami 18 jam, tekstur kenyal dan sedikit asam.', badge: '', stock: true },
    { id: 'p5', name: 'Roti Kismis Gulung', category: 'Roti Manis', price: 16000, img: 'assets/img/new-bread-1.png', desc: 'Gulungan manis dengan kismis pilihan di setiap lapis.', badge: 'Baru', stock: true },
    { id: 'p6', name: 'Croissant Mentega', category: 'Pastry', price: 20000, img: 'assets/img/new-bread-2.png', desc: 'Berlapis mentega asli, dipanggang sampai keemasan.', badge: '', stock: true },
    { id: 'p7', name: 'Roti Coklat Keju', category: 'Roti Manis', price: 17000, img: 'assets/img/new-bread-3.png', desc: 'Isian coklat leleh dan keju parut di atasnya.', badge: '', stock: true },
    { id: 'p8', name: 'Roti Tawar Gandum', category: 'Roti Tawar', price: 19000, img: 'assets/img/home-bread.png', desc: 'Gandum utuh, cocok untuk sarapan sehat sehari-hari.', badge: '', stock: true },
    { id: 'p9', name: 'Bolu Panggang Lembut', category: 'Kue', price: 25000, img: 'assets/img/about-bread.png', desc: 'Tekstur lembut dengan aroma vanila yang ringan.', badge: 'Promo', stock: true },
]

const FAVORITES = [
    { id: 'f1', name: 'Roti Sobek Coklat', subtitle: 'Best seller mingguan', price: 20000, rating: 4.9, img: 'assets/img/favorite-bread-1.png' },
    { id: 'f2', name: 'Baguette Klasik', subtitle: 'Favorit pelanggan lama', price: 22000, rating: 4.8, img: 'assets/img/favorite-bread-2.png' },
    { id: 'f3', name: 'Croissant Almond', subtitle: 'Stok terbatas tiap hari', price: 24000, rating: 4.9, img: 'assets/img/favorite-bread-3.png' },
    { id: 'f4', name: 'Roti Kacang Merah', subtitle: 'Manis pas, tidak eneg', price: 18000, rating: 4.7, img: 'assets/img/favorite-bread-4.png' },
    { id: 'f5', name: 'Donat Gula Halus', subtitle: 'Favorit anak-anak', price: 12000, rating: 4.8, img: 'assets/img/favorite-bread-5.png' },
    { id: 'f6', name: 'Roti Pisang Keju', subtitle: 'Paling laris sore hari', price: 19000, rating: 4.9, img: 'assets/img/favorite-bread-6.png' },
]

/* Gabungan semua item yang bisa dibeli, dipakai untuk cari data by id */
const CATALOG_BY_ID = {}
PRODUCTS.forEach(p => CATALOG_BY_ID[p.id] = p)
FAVORITES.forEach(p => CATALOG_BY_ID[p.id] = { ...p, category: 'Favorit' })

/* Keranjang disimpan di memori selama sesi berjalan (bukan localStorage) */
const cart = new Map() // id -> qty

function formatRupiah(n) {
    return 'Rp' + n.toLocaleString('id-ID')
}

/* ==========================================================================
   Promo bar
   ========================================================================== */
const promo = document.getElementById('promo')
const promoClose = document.getElementById('promo-close')

if (promoClose) {
    promoClose.addEventListener('click', () => {
        promo.classList.add('hide-promo')
        document.documentElement.style.setProperty('--promo-height', '0px')
    })
}

/* ==========================================================================
   Menu mobile
   ========================================================================== */
const navMenu = document.getElementById('nav-menu')
const navToggle = document.getElementById('nav-toggle')
const navClose = document.getElementById('nav-close')

if (navToggle) {
    navToggle.addEventListener('click', () => navMenu.classList.add('show-menu'))
}
if (navClose) {
    navClose.addEventListener('click', () => navMenu.classList.remove('show-menu'))
}
document.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => navMenu.classList.remove('show-menu'))
})

/* Blur header saat scroll */
const header = document.getElementById('header')
window.addEventListener('scroll', () => {
    window.scrollY >= 50 ? header.classList.add('blur-header') : header.classList.remove('blur-header')
})

/* ==========================================================================
   Render Katalog
   ========================================================================== */
const catalogGrid = document.getElementById('catalog-grid')
const catalogEmpty = document.getElementById('catalog-empty')
const catalogTabs = document.getElementById('catalog-tabs')
const catalogSearch = document.getElementById('catalog-search')

let activeCategory = 'Semua'
let searchTerm = ''

function productCardHTML(product) {
    const qty = cart.get(product.id) || 0

    const badge = product.badge
        ? `<span class="catalog__badge">${product.badge}</span>`
        : ''

    const control = qty > 0
        ? `<div class="catalog__qty">
                <button type="button" data-action="decrease" data-id="${product.id}" aria-label="Kurangi jumlah"><i class="ri-subtract-line"></i></button>
                <span>${qty}</span>
                <button type="button" data-action="increase" data-id="${product.id}" aria-label="Tambah jumlah"><i class="ri-add-line"></i></button>
           </div>`
        : `<button type="button" class="catalog__add" data-action="add" data-id="${product.id}" aria-label="Tambah ${product.name} ke keranjang">
                <i class="ri-add-line"></i>
           </button>`

    return `
        <article class="catalog__card">
            ${badge}
            <span class="catalog__category">${product.category}</span>
            <img src="${product.img}" alt="${product.name}" class="catalog__img" loading="lazy">
            <h3 class="catalog__title">${product.name}</h3>
            <p class="catalog__desc">${product.desc}</p>
            <div class="catalog__footer">
                <span class="catalog__price">${formatRupiah(product.price)}</span>
                ${control}
            </div>
        </article>
    `
}

function renderCatalog() {
    const term = searchTerm.trim().toLowerCase()

    const filtered = PRODUCTS.filter(p => {
        const matchCategory = activeCategory === 'Semua' || p.category === activeCategory
        const matchSearch = !term || p.name.toLowerCase().includes(term)
        return matchCategory && matchSearch
    })

    catalogGrid.innerHTML = filtered.map(productCardHTML).join('')
    catalogEmpty.hidden = filtered.length !== 0
}

if (catalogTabs) {
    catalogTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.catalog__tab')
        if (!tab) return

        catalogTabs.querySelectorAll('.catalog__tab').forEach(t => t.classList.remove('catalog__tab--active'))
        tab.classList.add('catalog__tab--active')

        activeCategory = tab.dataset.category
        renderCatalog()
    })
}

if (catalogSearch) {
    catalogSearch.addEventListener('input', (e) => {
        searchTerm = e.target.value
        renderCatalog()
    })
}

/* ==========================================================================
   Render Favorit
   ========================================================================== */
const favoriteGrid = document.getElementById('favorite-grid')

function starRow(rating) {
    const full = Math.round(rating)
    let icons = ''
    for (let i = 1; i <= 5; i++) {
        icons += i <= full ? '<i class="ri-star-fill"></i>' : '<i class="ri-star-line"></i>'
    }
    return icons
}

function favoriteCardHTML(item) {
    const qty = cart.get(item.id) || 0

    const control = qty > 0
        ? `<div class="catalog__qty">
                <button type="button" data-action="decrease" data-id="${item.id}" aria-label="Kurangi jumlah"><i class="ri-subtract-line"></i></button>
                <span>${qty}</span>
                <button type="button" data-action="increase" data-id="${item.id}" aria-label="Tambah jumlah"><i class="ri-add-line"></i></button>
           </div>`
        : `<button type="button" class="catalog__add" data-action="add" data-id="${item.id}" aria-label="Tambah ${item.name} ke keranjang">
                <i class="ri-add-line"></i>
           </button>`

    return `
        <article class="favorite__card">
            <span class="favorite__ribbon">Terlaris</span>
            <img src="${item.img}" alt="${item.name}" class="favorite__img" loading="lazy">

            <div class="favorite__rating">
                ${starRow(item.rating)}
                <span>${item.rating.toFixed(1)}</span>
            </div>

            <h3 class="favorite__title">${item.name}</h3>
            <span class="favorite__subtitle">${item.subtitle}</span>

            <div class="favorite__data">
                <h3 class="favorite__price">${formatRupiah(item.price)}</h3>
                ${control}
            </div>
        </article>
    `
}

function renderFavorites() {
    favoriteGrid.innerHTML = FAVORITES.map(favoriteCardHTML).join('')
}

/* ==========================================================================
   Keranjang
   ========================================================================== */
const cartEl = document.getElementById('cart')
const cartOpenBtn = document.getElementById('cart-open')
const cartCloseBtn = document.getElementById('cart-close')
const cartOverlay = document.getElementById('cart-overlay')
const cartItemsEl = document.getElementById('cart-items')
const cartEmptyEl = document.getElementById('cart-empty')
const cartTotalEl = document.getElementById('cart-total')
const cartCountEl = document.getElementById('cart-count')
const cartCheckoutBtn = document.getElementById('cart-checkout')

function openCart() { cartEl.classList.add('show-cart') }
function closeCart() { cartEl.classList.remove('show-cart') }

if (cartOpenBtn) cartOpenBtn.addEventListener('click', openCart)
if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart)
if (cartOverlay) cartOverlay.addEventListener('click', closeCart)

function addToCart(id) {
    cart.set(id, (cart.get(id) || 0) + 1)
    showToast(`${CATALOG_BY_ID[id].name} ditambahkan ke keranjang`)
    syncUI()
}

function increaseQty(id) {
    cart.set(id, (cart.get(id) || 0) + 1)
    syncUI()
}

function decreaseQty(id) {
    const current = cart.get(id) || 0
    if (current <= 1) {
        cart.delete(id)
    } else {
        cart.set(id, current - 1)
    }
    syncUI()
}

function removeFromCart(id) {
    cart.delete(id)
    syncUI()
}

function cartItemHTML(id, qty) {
    const item = CATALOG_BY_ID[id]
    if (!item) return ''

    return `
        <div class="cart__item">
            <img src="${item.img}" alt="${item.name}">
            <div>
                <p class="cart__item-name">${item.name}</p>
                <div class="catalog__qty">
                    <button type="button" data-action="decrease" data-id="${id}" aria-label="Kurangi jumlah"><i class="ri-subtract-line"></i></button>
                    <span>${qty}</span>
                    <button type="button" data-action="increase" data-id="${id}" aria-label="Tambah jumlah"><i class="ri-add-line"></i></button>
                </div>
            </div>
            <div style="text-align:right">
                <span class="cart__item-price">${formatRupiah(item.price * qty)}</span><br>
                <button type="button" class="cart__item-remove" data-action="remove" data-id="${id}" aria-label="Hapus ${item.name}">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
        </div>
    `
}

function renderCart() {
    if (cart.size === 0) {
        cartItemsEl.innerHTML = ''
        cartEmptyEl.hidden = false
    } else {
        cartEmptyEl.hidden = true
        cartItemsEl.innerHTML = Array.from(cart.entries()).map(([id, qty]) => cartItemHTML(id, qty)).join('')
    }

    let total = 0
    let count = 0
    cart.forEach((qty, id) => {
        const item = CATALOG_BY_ID[id]
        if (!item) return
        total += item.price * qty
        count += qty
    })

    cartTotalEl.textContent = formatRupiah(total)
    cartCountEl.textContent = count

    updateCheckoutLink(total)
}

function updateCheckoutLink(total) {
    if (cart.size === 0) {
        cartCheckoutBtn.href = `https://wa.me/${STORE_WHATSAPP_NUMBER}`
        return
    }

    const lines = ['Halo Kokiro, saya mau pesan:']
    cart.forEach((qty, id) => {
        const item = CATALOG_BY_ID[id]
        if (!item) return
        lines.push(`- ${item.name} x${qty} (${formatRupiah(item.price * qty)})`)
    })
    lines.push('')
    lines.push(`Total: ${formatRupiah(total)}`)
    lines.push('Mohon info untuk pengambilan/pengantarannya. Terima kasih!')

    const message = encodeURIComponent(lines.join('\n'))
    cartCheckoutBtn.href = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${message}`
}

/* Satu listener untuk semua tombol tambah/kurang/hapus di seluruh halaman */
document.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('[data-action]')
    if (!actionBtn) return

    const { action, id } = actionBtn.dataset

    if (action === 'add') addToCart(id)
    if (action === 'increase') increaseQty(id)
    if (action === 'decrease') decreaseQty(id)
    if (action === 'remove') removeFromCart(id)
})

function syncUI() {
    renderCatalog()
    renderFavorites()
    renderCart()
}

/* ==========================================================================
   Toast notifikasi
   ========================================================================== */
const toastEl = document.getElementById('toast')
let toastTimer = null

function showToast(text) {
    toastEl.innerHTML = `<i class="ri-checkbox-circle-line"></i> ${text}`
    toastEl.classList.add('show-toast')

    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => toastEl.classList.remove('show-toast'), 2200)
}

/* ==========================================================================
   Scroll up
   ========================================================================== */
const scrollUpBtn = document.getElementById('scroll-up')
window.addEventListener('scroll', () => {
    if (window.scrollY >= 400) {
        scrollUpBtn.classList.add('show-scroll')
    } else {
        scrollUpBtn.classList.remove('show-scroll')
    }
})

/* ==========================================================================
   Reveal saat scroll (halus, dihormati prefers-reduced-motion lewat CSS)
   ========================================================================== */
function initReveal() {
    const revealTargets = document.querySelectorAll(
        '.catalog__card, .favorite__card, .testimony__card, .about__img, .visit__card'
    )
    revealTargets.forEach(el => el.classList.add('reveal'))

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal--visible')
                observer.unobserve(entry.target)
            }
        })
    }, { threshold: 0.15 })

    revealTargets.forEach(el => observer.observe(el))
}

/* ==========================================================================
   Init
   ========================================================================== */
const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = new Date().getFullYear()

renderCatalog()
renderFavorites()
renderCart()

/* Reveal butuh DOM sudah terisi, jalankan setelah render pertama */
initReveal()
