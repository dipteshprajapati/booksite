// ── DATA ──
const categories = ['cse','innovation','discipline','mindset','philosophy'];

const sampleTitles = [
  "Clean Code","Atomic Habits","Deep Work","Zero to One","Mindset",
  "The Alchemist","Ikigai","Meditations","The Pragmatic Programmer","Design Patterns",
  "Code Complete","Refactoring","Think and Grow Rich","Rich Dad Poor Dad","Start With Why",
  "Hooked","The Lean Startup","Grit","Outliers","The Power of Now",
  "Man's Search for Meaning","The 7 Habits","Can't Hurt Me","Make Time","Do Epic Shit",
  "Rework","The Psychology of Money","Ego is the Enemy","Flow","Digital Minimalism"
];

const sampleAuthors = [
  "Robert Martin","James Clear","Cal Newport","Peter Thiel","Carol Dweck",
  "Paulo Coelho","Héctor García","Marcus Aurelius","Andrew Hunt","Erich Gamma",
  "Steve McConnell","Martin Fowler","Napoleon Hill","Robert Kiyosaki","Simon Sinek"
];

const BOOKS = Array.from({ length: 30 }, (_, i) => {
  return {
    id: i + 1,
    cat: categories[i % categories.length],
    title: sampleTitles[i],
    author: sampleAuthors[i % sampleAuthors.length],
    price: 199 + (i * 20),
    img: `images/book${i + 1}.jpeg`,
    rating: '⭐⭐⭐⭐⭐',
    badge: i % 5 === 0 ? 'bestseller' : (i % 7 === 0 ? 'new' : ''),
    tags: ['Popular','Must Read']
  };
});
const CAT_NAMES = { all:'All Books', cse:'CS & Engineering', innovation:'Innovation & Tech', discipline:'Discipline & Focus', mindset:'Mindset & Motivation', philosophy:'Life & Philosophy' };

// ── STATE ──
let cart = [];
let wishlist = new Set();
let currentCat = 'all';
let searchQ = '';
let sortBy = 'default';
let currentUser = '';

// ── UTILS ──
function fmt(p) { return '₹' + p.toLocaleString('en-IN'); }
function toast(msg, icon='✅') {
  $('#toast').html(icon + ' ' + msg).addClass('show');
  clearTimeout(window._toastT);
  window._toastT = setTimeout(() => $('#toast').removeClass('show'), 2800);
}
function showPage(id) {
  $('.page').removeClass('active').hide();
  $('#' + id).addClass('active').show();
}
function bumpCartBadge() {
  const $c = $('#cart-count');
  $c.addClass('bump');
  setTimeout(() => $c.removeClass('bump'), 400);
}
function generateOrderId() { return '#PT-' + Math.floor(100000 + Math.random() * 900000); }

// ── LOGIN ──
$('#login-btn').on('click', function() {
  const name = $('#l-name').val().trim();
  const email = $('#l-email').val().trim();
  const pass = $('#l-pass').val().trim();
  if (!name || !email || !pass) { $('#login-err').fadeIn(); return; }
  $('#login-err').hide();
  currentUser = name;
  $(this).text('Opening your store…').prop('disabled', true).css('opacity', 0.7);
  setTimeout(() => {
    $('#user-name-lbl').text(name.split(' ')[0]);
    $('#user-av').text(name.charAt(0).toUpperCase());
    // Pre-fill checkout name
    $('#c-fname').val(name.split(' ')[0] || '');
    $('#c-lname').val(name.split(' ').slice(1).join(' ') || '');
    $('#c-email').val(email);
    showPage('pg-store');
    renderBooks();
    buildStrip();
  }, 600);
});
$('#l-pass').on('keydown', e => { if(e.key==='Enter') $('#login-btn').click(); });

// ── LOGOUT ──
$('#logout-btn').on('click', () => {
  cart = []; wishlist.clear(); currentCat='all'; searchQ=''; sortBy='default';
  $('#l-name,#l-email,#l-pass').val('');
  $('#login-btn').text('Sign In & Shop →').prop('disabled',false).css('opacity',1);
  showPage('pg-login');
});

// ── RUNNING STRIP ──
function buildStrip() {
  const items = BOOKS.filter(b => b.badge).slice(0,8);
  const html = [...items, ...items].map(b => `<span class="strip-item">${b.emoji} ${b.title} — ${fmt(b.price)}</span>`).join('');
  $('#strip-scroll').html(html);
}

// ── RENDER BOOKS ──
function filteredBooks() {
  let list = BOOKS.filter(b => {
    const mc = currentCat==='all' || b.cat===currentCat;
    const q = searchQ.toLowerCase();
    const ms = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.cat.includes(q) || b.tags.join(' ').toLowerCase().includes(q);
    return mc && ms;
  });
  if (sortBy==='price-asc') list.sort((a,b)=>a.price-b.price);
  else if (sortBy==='price-desc') list.sort((a,b)=>b.price-a.price);
  else if (sortBy==='name') list.sort((a,b)=>a.title.localeCompare(b.title));
  return list;
}

function renderBooks() {
  const list = filteredBooks();
  const grid = $('#book-grid');
  grid.empty();
  $('#grid-count').text('(' + list.length + ')');
  $('#grid-title').find('span').text('(' + list.length + ')');
  if (!list.length) { $('#empty-state').show(); return; }
  $('#empty-state').hide();
  list.forEach((b, i) => {
    const inCart = cart.some(c => c.id===b.id);
    const badgeHtml = b.badge ? `<div class="bk-badge badge-${b.badge}">${b.badge==='bestseller'?'🔥 Bestseller':b.badge==='new'?'✨ New':'📚 Classic'}</div>` : '';
    const wl = wishlist.has(b.id) ? 'wishlisted' : '';
    const wlIcon = wishlist.has(b.id) ? '❤️' : '🤍';
    const card = $(`
      <div class="bk-card" data-id="${b.id}" style="animation-delay:${Math.min(i*60,400)}ms">
        <div class="bk-cover cat-bg-${b.cat}">
          ${badgeHtml}
          <button class="bk-wishlist ${wl}" data-id="${b.id}">${wlIcon}</button>
          <img src="${b.img}" alt="${b.title}" class="bk-img">
          <div class="bk-cover-overlay">
            <button class="quick-btn view-detail" data-id="${b.id}">Quick View</button>
          </div>
        </div>
        <div class="bk-body">
          <div class="bk-cat">${CAT_NAMES[b.cat]}</div>
          <div class="bk-title">${b.title}</div>
          <div class="bk-author">${b.author}</div>
          <div class="bk-stars">${b.rating}</div>
        </div>
        <div class="bk-footer">
          <div class="bk-price">${fmt(b.price)}</div>
          <button class="add-btn ${inCart?'added':''}" data-id="${b.id}">${inCart?'✓ Added':'Add to Cart'}</button>
        </div>
      </div>
    `);
    grid.append(card);
  });
}

// ── ADD TO CART ──
$(document).on('click', '.add-btn', function(e) {
  e.stopPropagation();
  const id = parseInt($(this).data('id'));
  const book = BOOKS.find(b => b.id===id);
  if (!book) return;
  const existing = cart.find(c => c.id===id);
  if (existing) { existing.qty++; }
  else { cart.push({ ...book, qty: 1 }); }
  $(this).addClass('added').text('✓ Added');
  updateCartUI();
  bumpCartBadge();
  toast(`<strong>${book.title}</strong> added to cart!`, '🛒');
});

// ── WISHLIST ──
$(document).on('click', '.bk-wishlist', function(e) {
  e.stopPropagation();
  const id = parseInt($(this).data('id'));
  const book = BOOKS.find(b => b.id===id);
  if (wishlist.has(id)) {
    wishlist.delete(id);
    $(this).removeClass('wishlisted').text('🤍');
    toast(`Removed from wishlist`, '🤍');
  } else {
    wishlist.add(id);
    $(this).addClass('wishlisted').text('❤️');
    toast(`Added to wishlist`, '❤️');
  }
});

// ── QUICK VIEW MODAL ──
$(document).on('click', '.view-detail', function(e) {
  e.stopPropagation();
  const id = parseInt($(this).data('id'));
  openModal(id);
});
$(document).on('click', '.bk-card', function() {
  const id = parseInt($(this).data('id'));
  openModal(id);
});

function openModal(id) {
  const b = BOOKS.find(x => x.id===id);
  if (!b) return;
  const inCart = cart.some(c => c.id===id);
  const tagsHtml = b.tags.map(t => `<span class="modal-tag">${t}</span>`).join('');
  $('#modal-content').html(`
    <div class="modal-cover">${b.emoji}</div>
    <div class="modal-info">
      <div class="modal-cat">${CAT_NAMES[b.cat]}</div>
      <div class="modal-title">${b.title}</div>
      <div class="modal-author">${b.author}</div>
      <div class="modal-stars">${b.rating}</div>
      <p class="modal-desc">${b.desc}</p>
      <div class="modal-tags">${tagsHtml}</div>
      <div class="modal-price-row">
        <span class="modal-price">${fmt(b.price)}</span>
        <button class="modal-add-btn add-btn ${inCart?'added':''}" data-id="${id}">${inCart?'✓ Added':'🛒 Add to Cart'}</button>
      </div>
    </div>
  `);
  $('#modal-overlay').addClass('open');
}
$('#modal-close, #modal-overlay').on('click', function(e) {
  if (e.target===this || $(e.target).is('#modal-close')) $('#modal-overlay').removeClass('open');
});

// ── CART UI ──
function updateCartUI() {
  const total = cart.reduce((s,c) => s + c.price * c.qty, 0);
  const count = cart.reduce((s,c) => s + c.qty, 0);
  $('#cart-count').text(count);
  const delivery = total >= 499 ? 0 : 49;
  const disc = total >= 999 ? Math.round(total * 0.05) : 0;
  const grand = total + delivery - disc;

  // update cart-bottom
  if (cart.length) {
    $('#cart-bottom').show();
    $('.subtotal-val').text(fmt(total));
    $('#delivery-val').text(delivery === 0 ? '🎉 Free' : fmt(delivery));
    $('#disc-val').text(disc > 0 ? '-' + fmt(disc) : '—');
    $('.total-val').text(fmt(grand));
  } else {
    $('#cart-bottom').hide();
  }

  // render items
  const $items = $('#cart-items');
  $items.empty();
  if (!cart.length) {
    $items.html(`<div class="cart-empty"><span class="empty-icon">🛒</span><p>Your cart is empty.<br>Add some books to get started!</p><button class="browse-btn" id="browse-from-cart">Browse Books</button></div>`);
    return;
  }
  cart.forEach(c => {
    $items.append(`
      <div class="cart-item">
        <div class="cart-item-icon">${c.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-title">${c.title}</div>
          <div class="cart-item-author">${c.author}</div>
          <div class="cart-item-controls">
            <button class="qty-btn qty-minus" data-id="${c.id}">−</button>
            <span class="qty-val">${c.qty}</span>
            <button class="qty-btn qty-plus" data-id="${c.id}">+</button>
          </div>
        </div>
        <div>
          <div class="cart-item-price">${fmt(c.price * c.qty)}</div>
          <button class="cart-item-remove" data-id="${c.id}" title="Remove">✕</button>
        </div>
      </div>
    `);
  });

  // update checkout order summary
  updateCheckoutSummary(total, delivery, disc, grand);
}

function updateCheckoutSummary(total, delivery, disc, grand) {
  const $items = $('#order-items');
  $items.empty();
  cart.forEach(c => {
    $items.append(`
      <div class="order-item">
        <div class="order-item-icon">${c.emoji}</div>
        <div class="order-item-name">${c.title}<small>${c.author} · Qty: ${c.qty}</small></div>
        <div class="order-item-total">${fmt(c.price * c.qty)}</div>
      </div>
    `);
  });
  $('.co-sub').text(fmt(total));
  $('.co-del').text(delivery===0?'🎉 Free':fmt(delivery));
  $('.co-disc').text(disc>0?'-'+fmt(disc):'—');
  $('.co-total').text(fmt(grand));
}

// ── QTY CONTROLS ──
$(document).on('click', '.qty-plus', function() {
  const id = parseInt($(this).data('id'));
  const item = cart.find(c => c.id===id);
  if (item) { item.qty++; updateCartUI(); }
});
$(document).on('click', '.qty-minus', function() {
  const id = parseInt($(this).data('id'));
  const item = cart.find(c => c.id===id);
  if (item) { item.qty > 1 ? item.qty-- : cart.splice(cart.indexOf(item),1); updateCartUI(); renderBooks(); }
});
$(document).on('click', '.cart-item-remove', function() {
  const id = parseInt($(this).data('id'));
  cart = cart.filter(c => c.id!==id);
  updateCartUI();
  renderBooks();
  toast('Book removed from cart', '🗑️');
});

// ── CART OPEN/CLOSE ──
$('#open-cart').on('click', () => { $('#cart-drawer, #cart-overlay').addClass('open'); });
$('#close-cart, #cart-overlay').on('click', function() { $('#cart-drawer, #cart-overlay').removeClass('open'); });
$(document).on('click', '#browse-from-cart', () => { $('#cart-drawer, #cart-overlay').removeClass('open'); });

// ── FILTERS ──
$(document).on('click', '.filter-pill', function() {
  currentCat = $(this).data('cat');
  $('.filter-pill, .nav-btn').removeClass('active');
  $('[data-cat="'+currentCat+'"]').addClass('active');
  $('#grid-title').contents().first().replaceWith(CAT_NAMES[currentCat]+' ');
  renderBooks();
  $('html,body').animate({ scrollTop: $('#shop-anchor').offset().top - 80 }, 400);
});
$(document).on('click', '.nav-btn', function() {
  currentCat = $(this).data('cat');
  $('.filter-pill, .nav-btn').removeClass('active');
  $('[data-cat="'+currentCat+'"]').addClass('active');
  renderBooks();
  $('html,body').animate({ scrollTop: $('#shop-anchor').offset().top - 80 }, 500);
});

// ── SORT ──
$('#sort-sel').on('change', function() { sortBy=$(this).val(); renderBooks(); });

// ── SEARCH ──
let st;
$('#search-box').on('input', function() {
  clearTimeout(st);
  st = setTimeout(() => { searchQ=$(this).val(); renderBooks(); }, 220);
});

// ── HERO BUTTONS ──
$('#shop-now, #browse-btn').on('click', () => $('html,body').animate({ scrollTop:$('#shop-anchor').offset().top-80 },600));
$('#logo-home').on('click', () => $('html,body').animate({ scrollTop:0 },500));

// ── CHECKOUT FLOW ──
$('#go-checkout').on('click', () => {
  if (!cart.length) { toast('Your cart is empty!', '⚠️'); return; }
  $('#cart-drawer, #cart-overlay').removeClass('open');
  showPage('pg-checkout');
  window.scrollTo(0,0);
});

$('#back-to-shop').on('click', () => { showPage('pg-store'); window.scrollTo(0,0); });

// Card number formatting
$('#c-card').on('input', function() {
  let v = $(this).val().replace(/\D/g,'').slice(0,16);
  $(this).val(v.replace(/(.{4})/g,'$1 ').trim());
});
$('#c-exp').on('input', function() {
  let v = $(this).val().replace(/\D/g,'');
  if (v.length>=2) v = v.slice(0,2)+'/'+v.slice(2,4);
  $(this).val(v);
});

// ── PLACE ORDER ──
$('#place-order').on('click', function() {
  const fname = $('#c-fname').val().trim();
  const email = $('#c-email').val().trim();
  const addr = $('#c-addr').val().trim();
  const card = $('#c-card').val().trim();
  if (!fname || !email || !addr || !card) {
    toast('Please fill all required fields!', '⚠️');
    return;
  }
  const orderId = generateOrderId();
  $('#order-id-display').text(orderId);
  // Clear cart
  cart = [];
  updateCartUI();
  renderBooks();
  showPage('pg-confirm');
  window.scrollTo(0,0);
  setTimeout(() => toast('Order placed successfully! 🎉', '✅'), 500);
});

// ── BACK TO SHOPPING ──
$('#continue-shopping').on('click', () => { showPage('pg-store'); window.scrollTo(0,0); });

// ── INIT ──
updateCartUI();
