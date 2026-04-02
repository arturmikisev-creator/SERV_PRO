// ServicePro PRO - Қазақша нұсқасы (Толық жұмыс істейтін)
class ServiceProPRO {
    constructor() {
        this.services = JSON.parse(localStorage.getItem('services')) || this.getDefaultServices();
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.reviews = JSON.parse(localStorage.getItem('reviews')) || [];
        this.promocodes = JSON.parse(localStorage.getItem('promocodes')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.currentRating = 0;
        this.selectedPromo = null;
        this.currentFilter = 'all';
        
        this.init();
    }

    getDefaultServices() {
        return [
            {id: 1, title: 'Техника жөндеу', desc: 'Кез келген күрделіліктің тұрмыстық жөндеуі', price: 5000, category: 'repair', duration: 60, rating: 4.9},
            {id: 2, title: 'Жалпы тазалау', desc: 'Пәтер/үйдің толық тазалауы', price: 8000, category: 'cleaning', duration: 120, rating: 4.8},
            {id: 3, title: 'Курьерлік жеткізу', desc: 'Ақтөбе бойынша 30 мин-ден жеткізу', price: 1500, category: 'delivery', duration: 30, rating: 4.7},
            {id: 4, title: 'Сантехника', desc: 'Тұтқандарды жөндеу және ауыстыру', price: 6000, category: 'repair', duration: 90, rating: 4.9},
            {id: 5, title: 'Электр', desc: 'Сымдарды орнату/жөндеу', price: 7000, category: 'repair', duration: 120, rating: 4.8}
        ];
    }

    init() {
        this.updateStats();
        this.bindEvents();
        this.renderAll();
        setInterval(() => this.nextSlide(), 5000);
    }

    bindEvents() {
        // Навигация
        document.querySelector('.hamburger').onclick = () => {
            document.querySelector('.nav-menu').classList.toggle('active');
        };
        
        // Поиск
        document.getElementById('searchBtn').onclick = () => this.searchServices();
        document.getElementById('searchInput').onkeypress = (e) => {
            if (e.key === 'Enter') this.searchServices();
        };
        
        // Авторизация
        document.getElementById('loginBtn').onclick = () => this.showAuthModal('login');
        document.getElementById('registerBtn').onclick = () => this.showAuthModal('register');
        document.getElementById('showRegister').onclick = (e) => {
            e.preventDefault();
            this.showRegisterForm();
        };
        document.getElementById('showLogin').onclick = (e) => {
            e.preventDefault();
            this.showLoginForm();
        };
        
        // Фильтры
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.onclick = (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentFilter = e.currentTarget.dataset.filter;
                this.renderServices();
            };
        });
        
        // Категории
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-card')) {
                const category = e.target.closest('.category-card').dataset.category;
                document.querySelector(`[data-filter="${category}"]`).click();
                document.getElementById('services').scrollIntoView({behavior: 'smooth'});
            }
        });
        
        // Админ табы
        document.querySelectorAll('.admin-tab').forEach(btn => {
            btn.onclick = (e) => {
                document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
                document.getElementById(e.currentTarget.dataset.tab + 'Tab').style.display = 'block';
            };
        });
        
        // Заказы табы
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('orders-tab')) {
                document.querySelectorAll('.orders-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.renderOrders(e.target.dataset.tab);
            }
        });
        
        // Формы
        document.getElementById('loginForm').onsubmit = (e) => this.handleLogin(e);
        document.getElementById('registerForm').onsubmit = (e) => this.handleRegister(e);
        document.getElementById('addServiceForm').onsubmit = (e) => this.addService(e);
        document.getElementById('orderForm').onsubmit = (e) => this.createOrder(e);
        document.getElementById('addPromoForm').onsubmit = (e) => this.addPromocode(e);
        document.getElementById('reviewForm').onsubmit = (e) => this.addReview(e);
        
        // Промокоды
        document.getElementById('applyPromo').onclick = () => this.applyPromocode();
        
        // Звезды рейтинга
        document.getElementById('ratingStars').onclick = (e) => {
            if (e.target.dataset.rating) {
                this.currentRating = parseInt(e.target.dataset.rating);
                this.updateStars();
            }
        };
        
        // Модалки
        document.querySelectorAll('.close, #closeSuccess').forEach(close => {
            close.onclick = () => this.hideModals();
        });
        
        window.onclick = (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModals();
            }
        };
        
        // Service select
        document.getElementById('serviceSelect').onchange = (e) => {
            const service = this.services.find(s => s.id == e.target.value);
            if (service) {
                document.getElementById('serviceDurationInfo').textContent = `(${service.duration} мин)`;
                this.updateOrderPrice();
            }
        };
    }

    // === АВТОРИЗАЦИЯ ===
    showAuthModal(type) {
        document.getElementById('authModal').style.display = 'block';
        if (type === 'register') {
            this.showRegisterForm();
        } else {
            this.showLoginForm();
        }
    }

    showLoginForm() {
        document.getElementById('loginFormContainer').style.display = 'block';
        document.getElementById('registerFormContainer').style.display = 'none';
    }

    showRegisterForm() {
        document.getElementById('loginFormContainer').style.display = 'none';
        document.getElementById('registerFormContainer').style.display = 'block';
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.updateAuthUI();
            this.hideModals();
            this.notify('✅ Кіру сәтті өтті!');
            document.getElementById('loginForm').reset();
        } else {
            this.notify('❌ Дұрыс емес email немесе құпиясөз!');
            document.getElementById('loginForm').style.animation = 'shake 0.5s';
            setTimeout(() => {
                document.getElementById('loginForm').style.animation = '';
            }, 500);
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const phone = document.getElementById('regPhone').value;
        const password = document.getElementById('regPassword').value;
        
        if (this.users.find(u => u.email === email)) {
            this.notify('❌ Бұл email-мен пайдаланушы бар!');
            return;
        }
        
        if (password.length < 6) {
            this.notify('❌ Құпиясөз кемінде 6 таңбадан тұруы керек!');
            return;
        }
        
        const user = { 
            id: Date.now(), 
            name, 
            email, 
            phone, 
            password,
            balance: 0,
            discount: 20 // Бірінші жеңілдік
        };
        
        this.users.push(user);
        localStorage.setItem('users', JSON.stringify(this.users));
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.updateAuthUI();
        this.hideModals();
        this.notify('🎉 Тіркелу сәтті! Бірінші тапсырысқа +20% жеңілдік!');
        document.getElementById('registerForm').reset();
    }

    updateAuthUI() {
        const authMenu = document.querySelector('.auth-menu');
        if (this.currentUser) {
            authMenu.innerHTML = `
                <span>👋 ${this.currentUser.name}</span>
                <button id="logoutBtn" class="auth-btn logout-btn">Шығу</button>
            `;
            document.getElementById('adminPanel').style.display = 'block';
            document.getElementById('reviewForm').style.display = 'block';
            document.getElementById('logoutBtn').onclick = () => this.logout();
        } else {
            authMenu.innerHTML = `
                <button id="loginBtn" class="auth-btn login-btn">Кіру</button>
                <button id="registerBtn" class="auth-btn register-btn">Тіркелу</button>
            `;
            document.getElementById('adminPanel').style.display = 'none';
            document.getElementById('reviewForm').style.display = 'none';
        }
        this.bindEvents(); // Перепривязка событий
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateAuthUI();
        this.notify('👋 Қайда кеттіңіз!');
    }

    // === УСЛУГИ ===
    renderServices() {
        const grid = document.getElementById('servicesGrid');
        let filteredServices = this.services;
        
        if (this.currentFilter !== 'all') {
            filteredServices = filteredServices.filter(s => s.category === this.currentFilter);
        }
        
        grid.innerHTML = filteredServices.map(service => `
            <div class="service-card" data-id="${service.id}" data-category="${service.category}">
                <div class="service-image">
                    <i class="fas fa-${this.getServiceIcon(service.title)}"></i>
                </div>
                <h3>${service.title}</h3>
                <p>${service.desc}</p>
                <div class="rating">
                    ${'⭐'.repeat(Math.floor(service.rating))}${'☆'.repeat(5-Math.floor(service.rating))}
                </div>
                <div class="service-price">${service.price.toLocaleString()} ₸</div>
                <div>⏱ ${service.duration} мин</div>
                <button class="order-service-btn" onclick="app.selectService(${service.id})">
                    Қызмет тапсырыс беру
                </button>
            </div>
        `).join('');
    }

    renderCategories() {
        const categories = [...new Set(this.services.map(s => s.category))];
        const grid = document.getElementById('categoriesGrid');
        grid.innerHTML = categories.map(cat => `
            <div class="category-card" data-category="${cat}">
                <i class="fas fa-${this.getCategoryIcon(cat)}"></i>
                <h3>${this.getCategoryName(cat)}</h3>
            </div>
        `).join('');
    }

    addService(e) {
        e.preventDefault();
        const service = {
            id: Date.now(),
            title: document.getElementById('serviceTitle').value,
            desc: document.getElementById('serviceDesc').value,
            price: parseFloat(document.getElementById('servicePrice').value),
            category: document.getElementById('serviceCategory').value,
            duration: parseInt(document.getElementById('serviceDuration').value) || 60,
            rating: 5
        };
        
        this.services.unshift(service);
        localStorage.setItem('services', JSON.stringify(this.services));
        this.renderServices();
        this.renderCategories();
        this.loadServiceSelect();
        e.target.reset();
        this.notify('✅ Қызмет қосылды!');
    }

    // === ЗАКАЗЫ ===
    createOrder(e) {
        e.preventDefault();
        if (!this.currentUser) {
            this.showAuthModal('login');
            return;
        }
        
        const serviceId = parseInt(document.getElementById('serviceSelect').value);
        const service = this.services.find(s => s.id === serviceId);
        if (!service) {
            this.notify('❌ Қызмет таңдаңыз!');
            return;
        }
        
        const finalPrice = this.calculateFinalPrice(service.price);
        const order = {
            id: Date.now(),
            userId: this.currentUser.id,
            serviceId,
            serviceTitle: service.title,
            price: service.price,
            finalPrice,
            promo: this.selectedPromo ? this.selectedPromo.code : null,
            date: document.getElementById('orderDate').value,
            address: document.getElementById('orderAddress').value,
            phone: document.getElementById('orderPhone').value,
            status: 'new',
            createdAt: new Date().toISOString()
        };
        
        this.orders.unshift(order);
        localStorage.setItem('orders', JSON.stringify(this.orders));
        this.renderOrders();
        this.renderAdminOrders();
        e.target.reset();
        this.selectedPromo = null;
        document.getElementById('promoCodeInput').value = '';
        this.notify(`✅ Тапсырыс №${order.id} құрылды! Барлығы: ${finalPrice.toLocaleString()} ₸`);
    }

    calculateFinalPrice(basePrice) {
        let price = basePrice;
        if (this.currentUser?.discount) {
            price *= (1 - this.currentUser.discount / 100);
        }
        if (this.selectedPromo) {
            price *= (1 - this.selectedPromo.discount / 100);
        }
        return Math.round(price);
    }

    renderOrders(tab = 'active') {
        const container = document.getElementById('ordersList');
        let userOrders = this.orders.filter(o => o.userId === this.currentUser?.id);
        
        if (tab === 'completed') {
            userOrders = userOrders.filter(o => o.status === 'completed');
        } else {
            userOrders = userOrders.filter(o => o.status !== 'completed');
        }
        
        container.innerHTML = userOrders.length ? userOrders.map(order => `
            <div class="order-item status-${order.status}">
                <h4>Тапсырыс №${order.id}</h4>
                <p><strong>🛠 ${order.serviceTitle}</strong></p>
                <p><strong>💰 Барлығы:</strong> ${order.finalPrice.toLocaleString()} ₸ 
                   ${order.promo ? `(Промо: ${order.promo})` : ''}
                </p>
                <p><strong>📅</strong> ${new Date(order.date).toLocaleString('kk-KZ')}</p>
                <p><strong>📍</strong> ${order.address}</p>
                <p><strong>📞</strong> ${order.phone}</p>
                <p><strong>📊</strong> <span class="status-badge status-${order.status}">
                    ${this.getStatusText(order.status)}
                </span></p>
            </div>
        `).join('') : '<p style="text-align:center;color:#666;padding:2rem;font-size:1.2rem">📭 Сізде тапсырыс жоқ</p>';
    }

    // === ПРОМОКОДЫ ===
    applyPromocode() {
        const code = document.getElementById('promoCodeInput').value.toUpperCase().trim();
        const promo = this.promocodes.find(p => 
            p.code === code && new Date(p.expiry) > new Date()
        );
        
        if (promo) {
            this.selectedPromo = promo;
            this.notify(`✅ Промокод ${code} қосылды! -${promo.discount}%`);
            this.updateOrderPrice();
        } else {
            this.notify('❌ Дұрыс емес немесе мерзімі өткен промокод');
        }
    }

    addPromocode(e) {
        e.preventDefault();
        const promo = {
            id: Date.now(),
            code: document.getElementById('promoCode').value.toUpperCase(),
            discount: parseInt(document.getElementById('promoDiscount').value),
            expiry: document.getElementById('promoExpiry').value
        };
        
        this.promocodes.push(promo);
        localStorage.setItem('promocodes', JSON.stringify(this.promocodes));
        this.renderPromocodes();
        e.target.reset();
        this.notify('✅ Промокод құрылды!');
    }

    renderPromocodes() {
        const container = document.getElementById('promoList');
        container.innerHTML = this.promocodes.map(promo => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8f9fa; margin: 10px 0; border-radius: 10px;">
                <div>
                    <strong>${promo.code}</strong> -${promo.discount}% 
                    <br><small>Мерзімі: ${new Date(promo.expiry).toLocaleDateString('kk-KZ')}</small>
                </div>
                <button onclick="app.deletePromo(${promo.id})" style="background:#dc3545;color:white;border:none;padding:8px 15px;border-radius:5px;cursor:pointer;font-size:0.9rem;">
                    Жою
                </button>
            </div>
        `).join('') || '<p style="text-align:center;color:#666;padding:20px">Промокодтар жоқ</p>';
    }

    deletePromo(id) {
        this.promocodes = this.promocodes.filter(p => p.id !== id);
        localStorage.setItem('promocodes', JSON.stringify(this.promocodes));
        this.renderPromocodes();
        this.notify('✅ Промокод жойылды!');
    }

    // === ОТЗЫВЫ ===
    addReview(e) {
        e.preventDefault();
        if (!this.currentUser) {
            this.notify('❌ Пікір қалдыру үшін кіріңіз!');
            return;
        }
        
        if (this.currentRating === 0) {
            this.notify('❌ Рейтинг таңдаңыз!');
            return;
        }
        
        const review = {
            id: Date.now(),
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            rating: this.currentRating,
            text: document.getElementById('reviewText').value,
            date: new Date().toISOString()
        };
        
        this.reviews.unshift(review);
        localStorage.setItem('reviews', JSON.stringify(this.reviews));
        this.renderReviews();
        e.target.reset();
        this.currentRating = 0;
        this.updateStars();
        this.notify('✅ Пікір қосылды!');
    }

    renderReviews() {
        const container = document.getElementById('reviewsContainer');
        const recentReviews = this.reviews.slice(0, 6);
        container.innerHTML = recentReviews.length ? recentReviews.map(review => `
            <div class="review-card">
                <div class="review-stars">${'⭐'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
                <div class="review-author">${review.userName}</div>
                <p>"${review.text}"</p>
                <small>${new Date(review.date).toLocaleDateString('kk-KZ')}</small>
            </div>
        `).join('') : '<p style="grid-column:1/-1;text-align:center;color:#666;font-size:1.2rem;padding:3rem">Пікірлер әзірге жоқ</p>';
    }

    // === РЕНДЕРИНГ ===
    renderAll() {
        this.renderCategories();
        this.renderServices();
        this.renderOrders();
        this.renderReviews();
        this.renderAdminOrders();
        this.renderPromocodes();
        this.updateAuthUI();
        this.loadServiceSelect();
    }

    loadServiceSelect() {
        const select = document.getElementById('serviceSelect');
        select.innerHTML = '<option value="">Қызмет таңдаңыз</option>' + 
            this.services.map(s => 
                `<option value="${s.id}" data-price="${s.price}" data-duration="${s.duration}">
                    ${s.title} - ${s.price.toLocaleString()} ₸ (${s.duration} мин)
                </option>`
            ).join('');
    }

    renderAdminOrders() {
        const container = document.getElementById('allOrdersList');
        container.innerHTML = this.orders.map(order => {
            const user = this.users.find(u => u.id === order.userId);
            return `
                <div class="order-item status-${order.status}" style="margin-bottom: 15px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <h4>№${order.id} | ${order.serviceTitle}</h4>
                    <p>👤 ${user ? user.name : 'Қонақ'}</p>
                    <p>💰 ${order.finalPrice.toLocaleString()} ₸</p>
                    <p>📅 ${new Date(order.date).toLocaleString('kk-KZ')}</p>
                    <select onchange="app.updateOrderStatus(${order.id}, this.value)" style="padding: 8px; border-radius: 5px; border: 1px solid #ddd;">
                        <option value="new" ${order.status === 'new' ? 'selected' : ''}>Жаңа</option>
                        <option value="progress" ${order.status === 'progress' ? 'selected' : ''}>Жұмыс үстінде</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Аяқталды</option>
                    </select>
                </div>
            `;
        }).join('') || '<p style="text-align:center;color:#666;padding:20px">Тапсырыстар жоқ</p>';
    }

    updateOrderStatus(orderId, status) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            localStorage.setItem('orders', JSON.stringify(this.orders));
            this.renderOrders();
            this.renderAdminOrders();
            this.notify('✅ Тапсырыс мәртебесі жаңартылды!');
        }
    }

    // === УТИЛИТЫ ===
    notify(message) {
        const notif = document.getElementById('notification');
        notif.textContent = message;
        notif.classList.add('show');
        setTimeout(() => notif.classList.remove('show'), 4000);
    }

    updateStars() {
        document.querySelectorAll('#ratingStars i').forEach((star, index) => {
            if (index < this.currentRating) {
                star.className = 'fas fa-star active';
            } else {
                star.className = 'far fa-star';
            }
        });
    }

    getServiceIcon(title) {
        const icons = {
            'Жөндеу': 'wrench', 'Сантех': 'tint', 'Электр': 'bolt',
            'Тазалау': 'spray-can', 'Жалпы': 'broom',
            'Жеткізу': 'truck', 'Курьер': 'shipping-fast'
        };
        for (let key in icons) {
            if (title.includes(key)) return icons[key];
        }
        return 'cogs';
    }

    getCategoryIcon(category) {
        const icons = { repair: 'wrench', cleaning: 'spray-can', delivery: 'truck', other: 'cogs' };
        return icons[category] || 'cogs';
    }

    getCategoryName(category) {
        const names = { 
            repair: 'Жөндеу', 
            cleaning: 'Тазалау', 
            delivery: 'Жеткізу', 
            other: 'Басқа' 
        };
        return names[category] || category;
    }

    getStatusText(status) {
        const texts = { 
            new: '🆕 Жаңа', 
            progress: '⏳ Жұмыс үстінде', 
            completed: '✅ Аяқталды' 
        };
        return texts[status] || status;
    }

    updateStats() {
        document.getElementById('totalOrders').textContent = (this.orders.length + 5000) + '+';
        document.getElementById('totalMasters').textContent = (Math.floor(this.services.length * 2)) + '+';
    }

    nextSlide() {
        const slides = document.querySelectorAll('.slide');
        const activeSlide = document.querySelector('.slide.active');
        let nextSlide = activeSlide.nextElementSibling;
        
        if (!nextSlide) {
            nextSlide = slides[0];
        }
        
        activeSlide.classList.remove('active');
        nextSlide.classList.add('active');
    }

    quickOrder() {
        document.getElementById('orders').scrollIntoView({ behavior: 'smooth' });
        this.notify('📋 Тапсырыстарға өтіп келе жатырмыз!');
    }

    selectService(id) {
        const select = document.getElementById('serviceSelect');
        select.value = id;
        select.dispatchEvent(new Event('change'));
        document.getElementById('orders').scrollIntoView({ behavior: 'smooth' });
    }

    updateOrderPrice() {
        const select = document.getElementById('serviceSelect');
        if (select.value) {
            const service = this.services.find(s => s.id == select.value);
            if (service) {
                const price = this.calculateFinalPrice(service.price);
                document.getElementById('orderPrice').value = price.toLocaleString() + ' ₸';
            }
        }
    }

    searchServices() {
        const query = document.getElementById('searchInput').value.toLowerCase().trim();
        const filtered = this.services.filter(s => 
            s.title.toLowerCase().includes(query) || 
            s.desc.toLowerCase().includes(query)
        );
        
        const grid = document.getElementById('servicesGrid');
        grid.innerHTML = filtered.map(s => this.createServiceCard(s)).join('');
        this.notify(`${filtered.length} қызмет табылды`);
    }

    createServiceCard(service) {
        return `
            <div class="service-card" data-id="${service.id}">
                <div class="service-image">
                    <i class="fas fa-${this.getServiceIcon(service.title)}"></i>
                </div>
                <h3>${service.title}</h3>
                <p>${service.desc}</p>
                <div class="rating">
                    ${'⭐'.repeat(Math.floor(service.rating))}${'☆'.repeat(5-Math.floor(service.rating))}
                </div>
                <div class="service-price">${service.price.toLocaleString()} ₸</div>
                <div>⏱ ${service.duration} мин</div>
                <button class="order-service-btn" onclick="app.selectService(${service.id})">
                    Қызмет тапсырыс беру
                </button>
            </div>
        `;
    }

    showDiscountInfo() {
        this.notify('🎁 Жаңа клиенттерге 20% жеңілдік! Тіркеліңіз және пайдаланыңыз!');
    }

    hideModals() {
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('successModal').style.display = 'none';
    }
}

// Инициализация
const app = new ServiceProPRO();
