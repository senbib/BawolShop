// Application principale
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Bawol Shop démarré');
    initializeApp();
});

function initializeApp() {
    cartService.updateCartCount();
    setupEventListeners();
    loadProductsFromAPI();
    setupUserInterface();
}

function setupUserInterface() {
    // Gestion du menu utilisateur
    const userIcon = document.getElementById('userIcon');
    const userDropdown = document.getElementById('userDropdown');
    const logoutLink = document.getElementById('logoutLink');
    const adminLink = document.getElementById('adminLink');

    if (userIcon && userDropdown) {
        userIcon.addEventListener('click', function (e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });

        // Fermer le dropdown en cliquant ailleurs
        document.addEventListener('click', function () {
            userDropdown.classList.remove('active');
        });

        userDropdown.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', function (e) {
            e.preventDefault();
            authService.logout();
            showNotification('👋 Vous êtes déconnecté', 'success');
        });
    }

    if (adminLink) {
        adminLink.addEventListener('click', function (e) {
            e.preventDefault();
            if (authService.isAdmin()) {
                window.location.href = '/bawol/admin.html';
            } else {
                showNotification('❌ Accès réservé aux administrateurs', 'error');
            }
        });
    }
}

function setupEventListeners() {
    console.log('🔧 Configuration des événements');

    const cartIcon = document.querySelector('.cart-icon');
    const closeCart = document.querySelector('.close-cart');
    const overlay = document.querySelector('.overlay');
    const checkoutBtn = document.getElementById('proceed-checkout');

    if (cartIcon) cartIcon.addEventListener('click', toggleCart);
    if (closeCart) closeCart.addEventListener('click', toggleCart);
    if (overlay) overlay.addEventListener('click', toggleCart);
    if (checkoutBtn) checkoutBtn.addEventListener('click', proceedToCheckout);
}

// Fonction principale pour charger les produits
async function loadProductsFromAPI() {
    console.log('🔄 Chargement des produits depuis l API...');

    try {
        const products = await productService.getAllProducts();
        console.log('📦 Produits reçus de l API:', products);

        if (products && products.length > 0) {
            displayProducts(products);
        } else {
            console.log('ℹ Aucun produit dans l API, affichage des produits par défaut');
            displayDefaultProducts();
        }
    } catch (error) {
        console.error('❌ Erreur chargement API:', error);
        console.log('🔄 Utilisation des produits par défaut');
        displayDefaultProducts();
    }
}

// Afficher les produits de l API
function displayProducts(products) {
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) {
        console.error('❌ Container produits non trouvé');
        return;
    }

    console.log('🎨 Affichage de ' + products.length + ' produits');

    const productsHTML = products.map(product => {
        // Corriger l'URL d'image si nécessaire
        let imageUrl = product.imageUrl;
        if (imageUrl === 'string' || !imageUrl || imageUrl === '/images/default-product.jpg') {
            imageUrl = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop';
        }

        return `
        <div class="product-card">
            <img src="${imageUrl}" alt="${product.name}" class="product-image" onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop'">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">${formatPrice(product.price)} FCFA</div>
                <div class="product-description" style="color: #666; font-size: 0.9rem; margin-bottom: 10px; height: 40px; overflow: hidden;">
                    ${product.description || 'Produit de qualité'}
                </div>
                <div class="product-rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star-half-alt"></i>
                </div>
                <button class="add-to-cart" 
                        data-id="${product.id}"
                        data-name="${product.name}"
                        data-price="${product.price}"
                        data-image="${imageUrl}">
                    <i class="fas fa-cart-plus"></i> Ajouter au panier
                </button>
            </div>
        </div>
        `;
    }).join('');

    productsContainer.innerHTML = productsHTML;

    // Configurer les événements des boutons APRÈS l'ajout au DOM
    setupAddToCartButtons();

    console.log('✅ Produits affichés avec succès');
}

// Configurer les événements des boutons "Ajouter au panier"
function setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    console.log('🔧 Configuration de ' + addToCartButtons.length + ' boutons');

    addToCartButtons.forEach(button => {
        // Supprimer les anciens événements
        button.replaceWith(button.cloneNode(true));
    });

    // Re-sélectionner après clonage
    const newButtons = document.querySelectorAll('.add-to-cart');
    newButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            console.log('🎯 Bouton cliqué!');

            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            const productImage = this.getAttribute('data-image');

            console.log('📦 Données produit:', {
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage
            });

            // Créer l'objet produit
            const product = {
                id: productId,
                name: productName,
                price: productPrice,
                imageUrl: productImage
            };

            // Ajouter au panier
            cartService.addToCart(product);
            showNotification(`✅ "${productName}" ajouté au panier`, 'success');

            // Animation du bouton
            const originalHTML = this.innerHTML;
            const originalBg = this.style.backgroundColor;

            this.innerHTML = '<i class="fas fa-check"></i> Ajouté';
            this.style.backgroundColor = 'var(--tertiary-color)';
            this.disabled = true;

            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.backgroundColor = originalBg;
                button.disabled = false;
            }, 1500);
        });
    });
}

// Produits par défaut (si API échoue)
function displayDefaultProducts() {
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) return;

    console.log('🔄 Affichage des produits par défaut');

    const defaultProducts = [
        {
            id: 1,
            name: "Smartphone Android Haut de Gamme",
            price: 125000,
            imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "Smartphone Android performant avec écran HD et double caméra"
        },
        {
            id: 2,
            name: "Casque Audio Sans Fil",
            price: 45000,
            imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "Casque Bluetooth avec réduction de bruit active"
        },
        {
            id: 3,
            name: "Montre Connectée Sport",
            price: 75000,
            imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "Montre intelligente avec suivi d'activité et notifications"
        }
    ];

    // Utiliser displayProducts pour afficher les produits par défaut
    displayProducts(defaultProducts);
}

// Gestion du panier
function toggleCart() {
    console.log('🛒 Ouverture/fermeture panier');
    const cartModal = document.querySelector('.cart-modal');
    const overlay = document.querySelector('.overlay');

    if (cartModal && overlay) {
        cartModal.classList.toggle('active');
        overlay.classList.toggle('active');

        if (cartModal.classList.contains('active')) {
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cart-total-price');

    if (!cartItems || !cartTotal) return;

    const cart = cartService.getCart();

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart fa-3x" style="color: #6c757d; margin-bottom: 1rem;"></i>
                <p>Votre panier est vide</p>
                <p style="font-size: 0.9rem; color: #999;">Ajoutez des produits pour continuer</p>
            </div>
        `;
        cartTotal.textContent = '0';
        return;
    }

    const cartHTML = cart.map(item => {
        return `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${formatPrice(item.price)} FCFA</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="cartService.updateQuantity('${item.id}', ${item.quantity - 1}); updateCartDisplay();">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                           onchange="cartService.updateQuantity('${item.id}', parseInt(this.value)); updateCartDisplay();">
                    <button class="quantity-btn" onclick="cartService.updateQuantity('${item.id}', ${item.quantity + 1}); updateCartDisplay();">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="cartService.removeFromCart('${item.id}'); updateCartDisplay(); showNotification('🗑 Produit retiré du panier', 'warning');">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        `;
    }).join('');

    cartItems.innerHTML = cartHTML;
    cartTotal.textContent = formatPrice(cartService.getTotal());
}

// ✅ FONCTION PROCÉDER AU PAIEMENT AMÉLIORÉE
async function proceedToCheckout() {
    console.log('💰 Début du processus de commande');

    const cart = cartService.getCart();
    if (cart.length === 0) {
        showNotification('🛒 Votre panier est vide', 'error');
        return;
    }

    // Vérifier l'authentification
    if (!authService.isAuthenticated()) {
        showNotification('🔐 Connexion requise pour commander', 'warning');

        // Sauvegarder l'intention de paiement et rediriger
        localStorage.setItem('pending_checkout', JSON.stringify({
            cart: cart,
            timestamp: Date.now()
        }));

        // Rediriger vers la page d'inscription avec contexte de checkout
        setTimeout(() => {
            window.location.href = '/bawol/register.html?redirect=checkout';
        }, 1500);
        return;
    }

    // Processus de checkout pour utilisateur connecté
    await processCheckout();
}

async function processCheckout() {
    try {
        const cart = cartService.getCart();

        // 1. Créer la commande
        const orderData = {
            items: cart.map(item => ({
                productId: parseInt(item.id),
                quantity: item.quantity
            })),
            shippingAddress: "Dakar, Sénégal" // À améliorer avec un formulaire d'adresse
        };

        console.log('📦 Envoi commande:', orderData);
        const order = await orderService.createOrder(orderData);

        if (order && order.id) {
            console.log('✅ Commande créée:', order);
            showNotification('✅ Commande créée avec succès!', 'success');

            // 2. Initier le paiement FusionPay
            const orderId = order.id;
            console.log('🔄 Initiation du paiement FusionPay pour la commande:', orderId);

            try {
                const paymentResult = await paymentService.initiatePayment(orderId);
                console.log('💰 Réponse paiement:', paymentResult);

                if (paymentResult.success && paymentResult.paymentUrl) {
                    // 3. Rediriger vers FusionPay
                    console.log('🔗 Redirection vers FusionPay:', paymentResult.paymentUrl);

                    // Vider le panier avant redirection
                    cartService.clearCart();
                    toggleCart();

                    // Redirection vers FusionPay
                    setTimeout(() => {
                        window.location.href = paymentResult.paymentUrl;
                    }, 2000);

                } else {
                    throw new Error(paymentResult.message || 'Erreur lors de l\'initiation du paiement');
                }

            } catch (paymentError) {
                console.error('❌ Erreur paiement:', paymentError);
                showNotification('❌ Erreur lors du paiement: ' + paymentError.message, 'error');
            }

        } else {
            throw new Error('Réponse de commande invalide');
        }
    } catch (error) {
        console.error('❌ Erreur commande:', error);

        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            showNotification('🔐 Session expirée, veuillez vous reconnecter', 'error');
            authService.logout();
        } else {
            showNotification('❌ Erreur lors de la commande: ' + error.message, 'error');
        }
    }
}

// ✅ SYSTÈME DE NOTIFICATIONS
function showNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    // Icône selon le type
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${icon} ${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto-suppression après 5 secondes
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);

    // Bouton de fermeture
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    });
}

// Utilitaires
function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR').format(price);
}

// Gestion du rechargement de page et des redirections
window.addEventListener('load', function () {
    // Vérifier s'il y a un checkout en attente après une authentification
    const pendingCheckout = localStorage.getItem('pending_checkout');
    const isAuthenticated = authService.isAuthenticated();

    if (pendingCheckout && isAuthenticated && window.location.pathname.includes('app.html')) {
        const checkoutData = JSON.parse(pendingCheckout);
        const timeElapsed = Date.now() - checkoutData.timestamp;

        // Supprimer si trop vieux (30 minutes)
        if (timeElapsed > 30 * 60 * 1000) {
            localStorage.removeItem('pending_checkout');
        } else {
            showNotification('🛒 Retour au panier pour finaliser votre commande', 'info');
            toggleCart();
            localStorage.removeItem('pending_checkout');
        }
    }
});
