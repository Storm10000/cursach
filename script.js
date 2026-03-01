//МАССИВ ИГР 
const GAMES = [
  {
    id: 1, title: "Cyberpunk 2077", genre: "RPG", platform: "PC",
    price: 1299, oldPrice: 1999, badge: "sale",
    img: "https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg",
    desc: "Футуристический мегаполис Night City, где ты — наёмник Ви. Открытый мир, десятки концовок, захватывающий сюжет от CD Projekt RED."
  },
  {
    id: 2, title: "Elden Ring", genre: "RPG", platform: "PC",
    price: 2499, oldPrice: null, badge: "hot",
    img: "https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg",
    desc: "Эпическая RPG-действие в огромном тёмном фэнтезийном мире. Разработана FromSoftware совместно с Джорджем Мартином."
  },
  {
    id: 3, title: "Age of Empires IV", genre: "Стратегия", platform: "PC",
    price: 999, oldPrice: null, badge: "new",
    img: "https://cdn.akamai.steamstatic.com/steam/apps/1466860/header.jpg",
    desc: "Легендарная серия стратегий возвращается. Стройте города, командуйте армиями и завоёвывайте мир в 8 исторических кампаниях."
  },
  {
    id: 4, title: "Destiny 2", genre: "Экшн", platform: "PC",
    price: 0, oldPrice: null, badge: "free",
    img: "https://cdn.akamai.steamstatic.com/steam/apps/1085660/header.jpg",
    desc: "Бесплатный многопользовательский шутер от первого лица в фантастическом мире. Сотни часов контента и регулярные обновления."
  },
  {
    id: 5, title: "Forza Horizon 5", genre: "Симулятор", platform: "Xbox",
    price: 1999, oldPrice: 2499, badge: "sale",
    img: "https://cdn.akamai.steamstatic.com/steam/apps/1551360/header.jpg",
    desc: "Лучший гоночный симулятор 2021 года. Открытый мир в Мексике, более 500 автомобилей и невероятная графика."
  },
  {
    id: 6, title: "Cities: Skylines", genre: "Симулятор", platform: "PC",
    price: 499, oldPrice: null, badge: "hot",
    img: "https://cdn.akamai.steamstatic.com/steam/apps/255710/header.jpg",
    desc: "Градостроительный симулятор нового поколения. Стройте метро, управляйте транспортом и создавайте идеальный город мечты."
  }
];

//LOCALSTORAGE 
const lsGet = (key, def) => JSON.parse(localStorage.getItem(key) || JSON.stringify(def));
const lsSet = (key, val) => localStorage.setItem(key, JSON.stringify(val));

const getUser = () => JSON.parse(localStorage.getItem("user") || "null");
const getCart = () => lsGet("cart", []);

//АВТОРИЗАЦИЯ
function register() {
  const login = document.getElementById("reg-login").value.trim();
  const pass  = document.getElementById("reg-pass").value;
  const err   = document.getElementById("reg-err");

  if (!login || !pass) return showErr(err, "Заполните все поля");
  if (pass.length < 4)  return showErr(err, "Пароль минимум 4 символа");

  const users = lsGet("users", []);
  if (users.find(u => u.login === login)) return showErr(err, "Логин уже занят");

  const user = { login, password: pass };
  users.push(user);
  lsSet("users", users);
  localStorage.setItem("user", JSON.stringify(user));
  closeModal();
  renderHeader();
}

function loginUser() {
  const login = document.getElementById("log-login").value.trim();
  const pass  = document.getElementById("log-pass").value;
  const err   = document.getElementById("log-err");

  const user = lsGet("users", []).find(u => u.login === login && u.password === pass);
  if (!user) return showErr(err, "Неверный логин или пароль");

  localStorage.setItem("user", JSON.stringify(user));
  closeModal();
  renderHeader();
}

function logout() {
  localStorage.removeItem("user");
  renderHeader();
}

function showErr(el, msg) {
  el.style.display = "block";
  el.innerText = msg;
}

//КОРЗИНА 
function addToCart(gameId) {
  if (!getUser()) { openLogin(); return; }

  const cart = getCart();
  if (cart.find(i => i.id === gameId)) {
    alert("Эта игра уже в корзине");
    return;
  }
  const game = GAMES.find(g => g.id === gameId);
  cart.push(game);
  lsSet("cart", cart);
  renderHeader();
  renderGames();
  closeModal();
  alert("✅ " + game.title + " добавлена в корзину!");
}

function removeFromCart(gameId) {
  lsSet("cart", getCart().filter(i => i.id !== gameId));
  renderHeader();
  renderGames();
  openCart();
}

function checkout() {
  lsSet("cart", []);
  closeModal();
  renderHeader();
  renderGames();
  alert("🎉 Заказ оформлен! Ключи отправлены на email.");
}

//РЕНДЕР ШАПКИ 
function renderHeader() {
  const user = getUser();
  const count = getCart().length;
  const el = document.getElementById("header-actions");
  const regBtn = document.getElementById("register-btn");

  if (user) {
    el.innerHTML = `
      <span class="user-greeting">Привет, <b>${user.login}</b>${user.isAdmin ? ' <span style="color:#f59e0b;font-size:0.75rem">[ADMIN]</span>' : ''}</span>
      <button class="btn btn-outline" onclick="openCart()">🛒 Корзина (${count})</button>
      ${user.isAdmin ? '<button class="btn btn-primary" onclick="openAdminPanel()">Админ-панель</button>' : ''}
      <button class="btn btn-light" style="color:#fff;background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.3)" onclick="logout()">Выйти</button>
    `;
    if (regBtn) regBtn.style.display = "none";
  } else {
    el.innerHTML = `
      <button class="btn btn-outline" onclick="openLogin()">Войти</button>
      <button class="btn btn-primary" onclick="openRegister()">Регистрация</button>
    `;
    if (regBtn) regBtn.style.display = "";
  }
}

//РЕНДЕР КАТАЛОГА
function renderGames() {
  const q = document.getElementById("search").value.toLowerCase();
  const g = document.getElementById("genre").value;
  const cart = getCart();

  const list = GAMES.filter(game =>
    game.title.toLowerCase().includes(q) && (!g || game.genre === g)
  );

  const badges = { sale:"badge-sale", new:"badge-new", hot:"badge-hot", free:"badge-free" };
  const badgeLabels = { sale:"Скидка", new:"Новинка", hot:"Хит", free:"Бесплатно" };

  document.getElementById("games-container").innerHTML = list.map(game => {
    const inCart = cart.find(i => i.id === game.id);
    const priceHtml = game.price === 0
      ? `<span class="price free">Бесплатно</span>`
      : `${game.oldPrice ? `<span class="old-price">${game.oldPrice} ₽</span>` : ""}<span class="price">${game.price} ₽</span>`;

    return `
      <div class="card" onclick="openGameModal(${game.id})">
        <img class="card-img" src="${game.img}" alt="${game.title}">
        <div class="card-body">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span class="card-genre">${game.genre}</span>
            <span class="badge ${badges[game.badge]}">${badgeLabels[game.badge]}</span>
          </div>
          <div class="card-title">${game.title}</div>
          <div class="card-platform">📱 ${game.platform}</div>
          <div class="card-footer">
            ${priceHtml}
            <button class="btn ${inCart ? "btn-light" : "btn-primary"}" style="font-size:0.82rem;padding:7px 12px" onclick="event.stopPropagation(); addToCart(${game.id})">
              ${inCart ? "✅ В корзине" : "+ В корзину"}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

//МОДАЛЬНЫЕ ОКНА 
function openModal(title, html, large = false) {
  document.getElementById("modal-title").innerText = title;
  document.getElementById("modal-body").innerHTML = html;
  document.getElementById("modal-box").className = large ? "modal large" : "modal";
  document.getElementById("modal-overlay").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal-overlay").style.display = "none";
}

function closeModalOutside(e) {
  if (e.target.id === "modal-overlay") closeModal();
}

function openLogin() {
  openModal("Вход в аккаунт", `
    <div class="label">Логин</div>
    <input type="text" id="log-login" placeholder="Ваш логин">
    <div class="label">Пароль</div>
    <input type="password" id="log-pass" placeholder="••••••••">
    <div class="error" id="log-err"></div>
    <button class="btn btn-primary" style="width:100%" onclick="loginUser()">Войти</button>
    <p style="text-align:center;margin-top:14px;font-size:0.85rem;color:#64748b">
      Нет аккаунта? <a href="#" onclick="openRegister()" style="color:#2563eb">Зарегистрироваться</a>
    </p>
  `);
}

function openRegister() {
  openModal("Регистрация", `
    <div class="label">Логин</div>
    <input type="text" id="reg-login" placeholder="Придумайте логин">
    <div class="label">Пароль</div>
    <input type="password" id="reg-pass" placeholder="Минимум 4 символа">
    <div class="error" id="reg-err"></div>
    <button class="btn btn-primary" style="width:100%" onclick="register()">Создать аккаунт</button>
    <p style="text-align:center;margin-top:14px;font-size:0.85rem;color:#64748b">
      Уже есть аккаунт? <a href="#" onclick="openLogin()" style="color:#2563eb">Войти</a>
    </p>
  `);
}

function openCart() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.price, 0);
  const items = cart.length === 0
    ? `<p style="color:#64748b;text-align:center;padding:20px 0">Корзина пуста 😔</p>`
    : cart.map(item => `
        <div class="cart-item">
          <img src="${item.img}" style="width:60px;height:40px;object-fit:cover;border-radius:6px;flex-shrink:0">
          <div class="cart-item-info">
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-genre">${item.genre}</div>
          </div>
          <span style="font-weight:bold;white-space:nowrap">${item.price === 0 ? "Бесплатно" : item.price + " ₽"}</span>
          <button class="btn btn-danger" style="padding:4px 8px;font-size:0.8rem" onclick="removeFromCart(${item.id})">✕</button>
        </div>
      `).join("") + `
        <div class="cart-total-row"><span>Итого (${cart.length} товаров):</span><span>${total} ₽</span></div>
        <button class="btn btn-primary" style="width:100%" onclick="checkout()">Оформить заказ</button>
      `;

  openModal("🛒 Корзина", items, true);
}

function openGameModal(id) {
  const game = GAMES.find(g => g.id === id);
  const inCart = getCart().find(i => i.id === id);
  const priceHtml = game.price === 0
    ? `<span class="game-price-big free">Бесплатно</span>`
    : `${game.oldPrice ? `<span class="old-price" style="font-size:1rem">${game.oldPrice} ₽</span>` : ""}<span class="game-price-big">${game.price} ₽</span>`;

  openModal(game.title, `
    <img class="game-modal-img" src="${game.img}" alt="${game.title}">
    <div class="game-meta">
      <span class="tag">🎮 ${game.genre}</span>
      <span class="tag">💻 ${game.platform}</span>
    </div>
    <p class="game-desc">${game.desc}</p>
    <div class="game-price-row">
      <div>${priceHtml}</div>
    </div>
    <button class="btn ${inCart ? "btn-light" : "btn-primary"}" style="width:100%" onclick="addToCart(${game.id})">
      ${inCart ? "✅ Уже в корзине" : "🛒 Добавить в корзину"}
    </button>
  `);
}

//ЗАПУСК
initAdmin();
renderHeader();
renderGames();


// ═══════════════════════════════════════════════
//  ADMIN
// ═══════════════════════════════════════════════

function initAdmin() {
  const users = lsGet("users", []);
  if (!users.find(u => u.login === "admin")) {
    users.push({ login: "admin", password: "admin1234", isAdmin: true });
    lsSet("users", users);
  }
}

function isAdmin() {
  const user = getUser();
  return user && user.isAdmin === true;
}

// Открыть панель с вкладкой (users | games)
function openAdminPanel(tab) {
  tab = tab || "users";
  const overlay = document.getElementById("modal-overlay");
  const modalEl  = document.getElementById("modal-box");
  modalEl.classList.add("large");

  const tabsHtml = `
    <div class="admin-tabs">
      <button class="admin-tab ${tab==="users"?"active":""}" onclick="openAdminPanel('users')">Пользователи</button>
      <button class="admin-tab ${tab==="games"?"active":""}" onclick="openAdminPanel('games')">Игры</button>
    </div>`;

  let bodyHtml = "";

  if (tab === "users") {
    const users = lsGet("users", []).filter(u => !u.isAdmin);
    const rows = users.length === 0
      ? "<tr><td colspan='2' style='text-align:center;color:#64748b'>Нет зарегистрированных пользователей</td></tr>"
      : users.map(u => `
          <tr>
            <td>${u.login}</td>
            <td><button class="btn btn-danger" style="padding:4px 10px;font-size:0.8rem" onclick="adminDeleteUser('${u.login}')">Удалить</button></td>
          </tr>`).join("");
    bodyHtml = `
      <h3 style="margin-bottom:12px">Список пользователей (${users.length})</h3>
      <table class="admin-table">
        <thead><tr><th>Логин</th><th>Действие</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  if (tab === "games") {
    const rows = GAMES.map(g => `
      <tr>
        <td><img src="${g.img}" style="width:60px;height:36px;object-fit:cover;border-radius:4px"></td>
        <td>${g.title}</td>
        <td>${g.genre}</td>
        <td>${g.price === 0 ? "Бесплатно" : g.price + " ₽"}</td>
        <td>
          <button class="btn btn-light" style="padding:4px 10px;font-size:0.8rem" onclick="adminEditGame(${g.id})">Изменить цену</button>
        </td>
      </tr>`).join("");
    bodyHtml = `
      <h3 style="margin-bottom:12px">Каталог игр (${GAMES.length})</h3>
      <table class="admin-table">
        <thead><tr><th>Обл.</th><th>Название</th><th>Жанр</th><th>Цена</th><th>Действие</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  document.getElementById("modal-title").innerText = "Админ-панель";
  document.getElementById("modal-body").innerHTML = tabsHtml + bodyHtml;
  overlay.style.display = "flex";
}

function adminDeleteUser(login) {
  if (!confirm("Удалить пользователя " + login + "?")) return;
  const users = lsGet("users", []).filter(u => u.login !== login);
  lsSet("users", users);
  // если удалили текущего — разлогинить
  const cur = getUser();
  if (cur && cur.login === login) { localStorage.removeItem("user"); renderHeader(); }
  openAdminPanel("users");
}

function adminEditGame(id) {
  const game = GAMES.find(g => g.id === id);
  if (!game) return;
  const newPrice = prompt("Новая цена для «" + game.title + "» (текущая: " + game.price + " ₽):");
  if (newPrice === null) return;
  const val = parseInt(newPrice);
  if (isNaN(val) || val < 0) { alert("Некорректная цена"); return; }
  game.price = val;
  renderGames();
  openAdminPanel("games");
}
