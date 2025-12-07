const API_BASE_URL = (function () {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        console.log('🔧 Mode développement local');
        return 'http://localhost:5206/api';
    } else {
        console.log('🚀 Mode production Render');
        return 'https://bawolshop-api.onrender.com/api'; // ⭐ NOUVELLE URL
    }
})();

console.log('🔧 URL API configurée:', API_BASE_URL);

// Gestion du token JWT
let authToken = localStorage.getItem('bawolshop_token');

function getHeaders() {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    // Vérifier et rafraîchir le token
    authToken = localStorage.getItem('bawolshop_token');

    if (authToken) {
        // Vérifier si le token est expiré
        try {
            const payload = JSON.parse(atob(authToken.split('.')[1]));
            const expiration = payload.exp * 1000;
            const now = Date.now();

            if (now >= expiration) {
                console.log('🔄 Token expiré, déconnexion...');
                authService.logout();
                return headers;
            }

            headers['Authorization'] = 'Bearer ' + authToken;
            console.log('🔑 Token JWT ajouté aux headers - Expire dans:', Math.round((expiration - now) / 1000 / 60) + ' minutes');

        } catch (error) {
            console.error('❌ Erreur décodage token:', error);
            authService.logout();
        }
    } else {
        console.log('⚠ Aucun token trouvé');
    }

    return headers;
}

// Service d'authentification
const authService = {
    async register(userData) {
        console.log('🔄 Tentative d inscription...', userData);
        try {
            const response = await fetch(API_BASE_URL + '/auth/register', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Erreur inscription:', error);
            throw error;
        }
    },

    async login(phoneNumber, password) {
        console.log('🔄 Tentative de connexion...');
        try {
            const response = await fetch(API_BASE_URL + '/auth/login', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ phoneNumber: phoneNumber, password: password })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            const result = await response.json();

            if (result.token) {
                this.saveAuthData(result.token, result.user);
                console.log('✅ Utilisateur connecté:', result.user);

                // Mettre à jour l'interface utilisateur
                this.updateUI();
            }

            return result;
        } catch (error) {
            console.error('❌ Erreur connexion:', error);
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('bawolshop_token');
        localStorage.removeItem('bawolshop_user');
        localStorage.removeItem('pending_checkout');
        authToken = null;
        console.log('🚪 Utilisateur déconnecté');

        // Mettre à jour l'interface utilisateur
        this.updateUI();

        // Rediriger si on est sur une page protégée
        if (window.location.pathname.includes('admin.html')) {
            window.location.href = '/bawol/index.html';
        }
    },

    saveAuthData(token, user) {
        authToken = token;
        localStorage.setItem('bawolshop_token', token);
        localStorage.setItem('bawolshop_user', JSON.stringify(user));
        console.log('💾 Données auth sauvegardées');
    },

    getCurrentUser() {
        const user = localStorage.getItem('bawolshop_user');
        return user ? JSON.parse(user) : null;
    },

    isTokenValid() {
        const token = localStorage.getItem('bawolshop_token');
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiration = payload.exp * 1000;
            return Date.now() < expiration;
        } catch (error) {
            console.error('Erreur vérification token:', error);
            return false;
        }
    },

    isAuthenticated() {
        const authenticated = this.isTokenValid();
        console.log('🔐 Authentifié:', authenticated);
        return authenticated;
    },

    isAdmin() {
        const user = this.getCurrentUser();
        const isAdmin = user && user.role === 'Admin';
        console.log('👑 Admin:', isAdmin);
        return isAdmin;
    },

    updateUI() {
        // Mettre à jour l'interface en fonction de l'état de connexion
        const user = this.getCurrentUser();
        const userInfo = document.getElementById('userInfo');
        const loginLink = document.getElementById('loginLink');
        const registerLink = document.getElementById('registerLink');
        const adminLink = document.getElementById('adminLink');
        const logoutLink = document.getElementById('logoutLink');

        if (userInfo && loginLink && registerLink && adminLink && logoutLink) {
            if (user) {
                userInfo.innerHTML = `<i class="fas fa-user-circle"></i> ${user.firstName} ${user.lastName}`;
                loginLink.style.display = 'none';
                registerLink.style.display = 'none';
                logoutLink.style.display = 'block';

                if (this.isAdmin()) {
                    adminLink.style.display = 'block';
                } else {
                    adminLink.style.display = 'none';
                }
            } else {
                userInfo.innerHTML = '<i class="fas fa-user-circle"></i> Non connecté';
                loginLink.style.display = 'block';
                registerLink.style.display = 'block';
                adminLink.style.display = 'none';
                logoutLink.style.display = 'none';
            }
        }
    }
};

// Service des produits
const productService = {
    async getAllProducts() {
        console.log('🔄 Tentative de récupération des produits...');
        try {
            const response = await fetch(API_BASE_URL + '/products', {
                method: 'GET',
                headers: getHeaders()
            });

            console.log('📡 Statut de la réponse:', response.status);
            console.log('📡 URL appelée:', API_BASE_URL + '/products');

            if (!response.ok) {
                throw new Error('Erreur HTTP: ' + response.status + ' - ' + response.statusText);
            }

            const products = await response.json();
            console.log('✅ Produits récupérés:', products);
            return products;

        } catch (error) {
            console.error('❌ Erreur lors de la récupération des produits:', error);
            console.log('💡 Conseil: Vérifiez que le backend est démarré sur le port 5206');
            return [];
        }
    },

    async getProductById(id) {
        console.log('🔄 Tentative de récupération du produit ' + id + '...');
        try {
            const response = await fetch(API_BASE_URL + '/products/' + id, {
                method: 'GET',
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error('Erreur HTTP: ' + response.status);
            }

            return await response.json();

        } catch (error) {
            console.error('❌ Erreur produit ' + id + ':', error);
            return null;
        }
    },

    // Méthodes admin pour la gestion des produits
    async createProduct(productData) {
        console.log('🔄 Création produit...', productData);
        try {
            const response = await fetch(API_BASE_URL + '/products', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Erreur ' + response.status + ': ' + errorText);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Erreur création produit:', error);
            throw error;
        }
    },

    async updateProduct(id, productData) {
        console.log('🔄 Mise à jour produit ' + id + '...', productData);
        try {
            const response = await fetch(API_BASE_URL + '/products/' + id, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Erreur ' + response.status + ': ' + errorText);
            }

            // ✅ CORRECTION : Vérifier si la réponse a du contenu avant de parser JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                // Pour les réponses NoContent (204) sans body
                console.log('✅ Produit mis à jour - réponse NoContent');
                return { success: true, message: "Produit mis à jour avec succès" };
            }
        } catch (error) {
            console.error('❌ Erreur mise à jour produit:', error);
            throw error;
        }
    },

    async deleteProduct(id) {
        console.log('🔄 Suppression produit ' + id + '...');
        try {
            const response = await fetch(API_BASE_URL + '/products/' + id, {
                method: 'DELETE',
                headers: getHeaders()
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Erreur ' + response.status + ': ' + errorText);
            }

            return true;
        } catch (error) {
            console.error('❌ Erreur suppression produit:', error);
            throw error;
        }
    }
};

// Service des commandes
const orderService = {
    async createOrder(orderData) {
        console.log('🔄 Création de commande...', orderData);
        try {
            const response = await fetch(API_BASE_URL + '/orders', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(orderData)
            });

            console.log('📡 Statut réponse commande:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Erreur ' + response.status + ': ' + errorText);
            }

            const result = await response.json();
            console.log('✅ Commande créée:', result);
            return result;

        } catch (error) {
            console.error('❌ Erreur création commande:', error);
            throw error;
        }
    },

    async getUserOrders() {
        console.log('🔄 Récupération des commandes utilisateur...');
        try {
            const response = await fetch(API_BASE_URL + '/orders', {
                method: 'GET',
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error('Erreur HTTP: ' + response.status);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Erreur récupération commandes:', error);
            throw error;
        }
    },

    // Méthodes admin
    async getAllOrders() {
        console.log('🔄 Récupération de toutes les commandes (Admin)...');
        try {
            const response = await fetch(API_BASE_URL + '/orders/admin', {
                method: 'GET',
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error('Erreur HTTP: ' + response.status);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Erreur récupération commandes admin:', error);
            throw error;
        }
    }
};

// Service de paiement
const paymentService = {
    async initiatePayment(orderId) {
        console.log('🔄 Initiation paiement pour commande:', orderId);
        try {
            const response = await fetch(API_BASE_URL + '/payment/initiate/' + orderId, {
                method: 'POST',
                headers: getHeaders()
            });

            console.log('📡 Statut réponse paiement:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Erreur ' + response.status + ': ' + errorText);
            }

            const result = await response.json();
            console.log('✅ Paiement initié:', result);
            return result;

        } catch (error) {
            console.error('❌ Erreur initiation paiement:', error);
            throw error;
        }
    }
};

// Gestion du panier
const cartService = {
    getCart() {
        const cart = JSON.parse(localStorage.getItem('bawolshop_cart') || '[]');
        console.log('🛒 Panier actuel:', cart);
        return cart;
    },

    addToCart(product, quantity = 1) {
        console.log('➕ Ajout au panier:', product);
        const cart = this.getCart();
        const existingItem = cart.find(item => item.id == product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
            console.log('📦 Quantité mise à jour:', existingItem.quantity);
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.imageUrl,
                quantity: quantity
            });
            console.log('🎁 Nouveau produit ajouté');
        }

        this.saveCart(cart);
        this.updateCartCount();
    },

    removeFromCart(productId) {
        console.log('🗑 Suppression du produit:', productId);
        const cart = this.getCart().filter(item => item.id != productId);
        this.saveCart(cart);
        this.updateCartCount();
    },

    updateQuantity(productId, quantity) {
        console.log('📊 Mise à jour quantité:', productId, quantity);
        const cart = this.getCart();
        const item = cart.find(item => item.id == productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
            }
        }
        this.saveCart(cart);
        this.updateCartCount();
    },

    clearCart() {
        console.log('🧹 Panier vidé');
        this.saveCart([]);
        this.updateCartCount();
    },

    getTotal() {
        const cart = this.getCart();
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        console.log('💰 Total panier:', total);
        return total;
    },

    saveCart(cart) {
        localStorage.setItem('bawolshop_cart', JSON.stringify(cart));
        console.log('💾 Panier sauvegardé');
    },

    updateCartCount() {
        const cart = this.getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const elements = document.querySelectorAll('.cart-count');
        elements.forEach(el => {
            el.textContent = totalItems;
        });
        console.log('🔢 Compteur panier mis à jour:', totalItems);
    }
};

console.log('🚀 API Service initialisé!');
// Service d'upload d'images
const imageUploadService = {
    async uploadProductImage(file) {
        console.log('🔼 Upload image produit...', file.name);

        // Créer FormData pour l'upload
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(API_BASE_URL + '/imageupload/product', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('bawolshop_token')
                    // NE PAS mettre Content-Type, le navigateur le fera automatiquement avec FormData
                },
                body: formData
            });

            console.log('📡 Statut réponse upload:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            const result = await response.json();
            console.log('✅ Image uploadée:', result);
            return result;

        } catch (error) {
            console.error('❌ Erreur upload image:', error);
            throw error;
        }
    },

    async deleteProductImage(imageUrl) {
        console.log('🗑️ Suppression image...', imageUrl);

        try {
            const response = await fetch(API_BASE_URL + '/imageupload/product', {
                method: 'DELETE',
                headers: getHeaders(),
                body: JSON.stringify({ imageUrl: imageUrl })
            });

            if (!response.ok) {
                throw new Error('Erreur suppression image');
            }

            console.log('✅ Image supprimée');
            return true;

        } catch (error) {
            console.error('❌ Erreur suppression image:', error);
            throw error;
        }
    },

    async getUploadedImages() {
        console.log('🔄 Récupération des images uploadées...');

        try {
            const response = await fetch(API_BASE_URL + '/imageupload/images', {
                method: 'GET',
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error('Erreur récupération images');
            }

            const images = await response.json();
            console.log('✅ Images récupérées:', images.length);
            return images;

        } catch (error) {
            console.error('❌ Erreur récupération images:', error);
            return [];
        }
    }
};
// Initialiser l'interface utilisateur au chargement
document.addEventListener('DOMContentLoaded', function () {
    authService.updateUI();
});
