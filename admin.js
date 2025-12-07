// Administration Bawol Shop avec gestion d'images - VERSION COMPLÈTE CORRIGÉE
class AdminApp {
    constructor() {
        console.log('🔧 Constructeur AdminApp appelé');
        this.currentTab = 'dashboard';
        this.products = [];
        this.orders = [];
        this.users = [];
        this.selectedImage = null;
        this.uploadedFile = null;
        this.availableImages = [
            {
                name: "Smartphone",
                url: "https://picsum.photos/300/200?random=1"
            },
            {
                name: "Casque Audio",
                url: "https://picsum.photos/300/200?random=2"
            },
            {
                name: "Montre Connectée",
                url: "https://picsum.photos/300/200?random=3"
            },
            {
                name: "Ordinateur Portable",
                url: "https://picsum.photos/300/200?random=4"
            },
            {
                name: "Camera",
                url: "https://picsum.photos/300/200?random=5"
            },
            {
                name: "Enceinte Bluetooth",
                url: "https://picsum.photos/300/200?random=6"
            }
        ];
        this.init();
    }

    init() {
        console.log('👑 Initialisation administration Bawol Shop');

        if (!this.checkAdminRights()) {
            return;
        }

        this.setupEventListeners();
        this.loadUserInfo();
        this.loadDashboardData();
        console.log('✅ AdminApp initialisé');
    }

    checkAdminRights() {
        if (!authService.isAuthenticated()) {
            this.redirectToLogin();
            return false;
        }

        if (!authService.isAdmin()) {
            showNotification('❌ Accès réservé aux administrateurs', 'error');
            setTimeout(() => window.location.href = '/bawol/app.html', 2000);
            return false;
        }

        return true;
    }

    redirectToLogin() {
        showNotification('🔐 Veuillez vous connecter', 'warning');
        setTimeout(() => {
            window.location.href = '/bawol/login.html?redirect=admin';
        }, 1500);
    }

    setupEventListeners() {
        console.log('🔧 Configuration des événements');

        // Navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        // Déconnexion
        document.getElementById('logoutBtn').addEventListener('click', () => {
            authService.logout();
            showNotification('👋 Déconnexion réussie', 'success');
        });

        // Produits
        document.getElementById('addProductBtn').addEventListener('click', () => {
            this.openProductModal();
        });

        document.getElementById('closeProductModal').addEventListener('click', () => {
            this.closeProductModal();
        });

        document.getElementById('cancelProductBtn').addEventListener('click', () => {
            this.closeProductModal();
        });

        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });

        // Boutons images
        document.getElementById('openImageGallery').addEventListener('click', () => {
            console.log('🖼️ Ouverture galerie d\'images');
            this.openImageGallery();
        });

        document.getElementById('uploadImageBtn').addEventListener('click', () => {
            console.log('📤 Upload direct - Ouverture explorateur');
            document.getElementById('fileInput').click();
        });

        // Gestion galerie
        document.getElementById('closeImageGallery').addEventListener('click', () => {
            this.closeImageGallery();
        });

        document.getElementById('cancelImageSelection').addEventListener('click', () => {
            this.closeImageGallery();
        });

        document.getElementById('confirmImageSelection').addEventListener('click', () => {
            this.confirmImageSelection();
        });

        // Onglets galerie
        document.querySelectorAll('.gallery-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchGalleryTab(tabName);
            });
        });

        // Upload dans galerie
        document.getElementById('browseFilesBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        document.getElementById('confirmUpload').addEventListener('click', () => {
            this.confirmUpload();
        });

        document.getElementById('cancelUpload').addEventListener('click', () => {
            this.resetUploadTab();
        });

        // Drag and drop
        this.setupDragAndDrop();

        console.log('✅ Événements configurés');
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('highlight');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('highlight');
            }, false);
        });

        uploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFiles(files);
            }
        }, false);

        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // ✅ MÉTHODE MANQUANTE : Chargement des infos utilisateur
    loadUserInfo() {
        const user = authService.getCurrentUser();
        if (user) {
            document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
            document.getElementById('userRole').textContent = user.role;
            document.getElementById('userAvatar').textContent = user.firstName.charAt(0).toUpperCase();
        }
    }

    // ✅ MÉTHODE MANQUANTE : Changement d'onglet principal
    switchTab(tabName) {
        console.log('📑 Changement onglet principal:', tabName);

        // Mettre à jour la navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Mettre à jour le contenu
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

        // Charger les données spécifiques à l'onglet
        switch (tabName) {
            case 'products':
                this.loadProducts();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'dashboard':
                this.loadDashboardData();
                break;
        }
    }

    // ✅ MÉTHODE MANQUANTE : Chargement dashboard
    async loadDashboardData() {
        try {
            // Charger les statistiques
            const [products, orders] = await Promise.all([
                productService.getAllProducts(),
                orderService.getAllOrders()
            ]);

            this.updateStats(products, orders);
            this.displayRecentOrders(orders);

        } catch (error) {
            console.error('Erreur chargement dashboard:', error);
            showNotification('❌ Erreur lors du chargement des données', 'error');
        }
    }

    // ✅ MÉTHODE MANQUANTE : Mise à jour statistiques
    updateStats(products, orders) {
        // Produits
        document.getElementById('statsProducts').textContent = products.length;

        // Commandes
        const totalOrders = orders.length;
        document.getElementById('statsOrders').textContent = totalOrders;

        // Revenus
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        document.getElementById('statsRevenue').textContent = this.formatPrice(totalRevenue);

        // Utilisateurs (estimation)
        document.getElementById('statsUsers').textContent = Math.floor(totalOrders * 1.5);
    }

    // ✅ MÉTHODE MANQUANTE : Affichage commandes récentes
    displayRecentOrders(orders) {
        const container = document.getElementById('recentOrders');
        const recentOrders = orders.slice(0, 5);

        if (recentOrders.length === 0) {
            container.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: var(--gray-color);">
                    <i class="fas fa-receipt fa-2x" style="margin-bottom: 1rem;"></i>
                    <p>Aucune commande récente</p>
                </div>
            `;
            return;
        }

        const ordersHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Commande</th>
                        <th>Client</th>
                        <th>Montant</th>
                        <th>Statut</th>
                    </tr>
                </thead>
                <tbody>
                    ${recentOrders.map(order => `
                        <tr>
                            <td>${order.orderNumber}</td>
                            <td>${order.customerFullName}</td>
                            <td>${this.formatPrice(order.totalAmount)} FCFA</td>
                            <td>
                                <span class="status-badge ${order.paymentStatus === 'Payée' ? 'status-active' : 'status-pending'
            }">
                                    ${order.paymentStatus}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = ordersHTML;
    }

    // ✅ MÉTHODE MANQUANTE : Chargement produits
    async loadProducts() {
        try {
            this.products = await productService.getAllProducts();
            this.displayProducts();
        } catch (error) {
            console.error('Erreur chargement produits:', error);
            showNotification('❌ Erreur lors du chargement des produits', 'error');
        }
    }

    // ✅ MÉTHODE MANQUANTE : Affichage produits
    displayProducts() {
        const container = document.getElementById('productsList');

        if (this.products.length === 0) {
            container.innerHTML = `
                <div style="padding: 3rem; text-align: center; color: var(--gray-color);">
                    <i class="fas fa-box-open fa-3x" style="margin-bottom: 1rem;"></i>
                    <p>Aucun produit trouvé</p>
                </div>
            `;
            return;
        }

        const productsHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th>Prix</th>
                        <th>Stock</th>
                        <th>Catégorie</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.products.map(product => `
                        <tr>
                            <td>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <img src="${product.imageUrl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=50&h=50&fit=crop'}" 
                                         alt="${product.name}" 
                                         style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;"
                                         onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=50&h=50&fit=crop'">
                                    <div>
                                        <div style="font-weight: 500;">${product.name}</div>
                                        <div style="font-size: 0.8rem; color: var(--gray-color);">${product.description.substring(0, 50)}...</div>
                                    </div>
                                </div>
                            </td>
                            <td>${this.formatPrice(product.price)} FCFA</td>
                            <td>${product.stock}</td>
                            <td>${product.category}</td>
                            <td>
                                <span class="status-badge ${product.isActive ? 'status-active' : 'status-inactive'}">
                                    ${product.isActive ? 'Actif' : 'Inactif'}
                                </span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-icon btn-edit" onclick="adminApp.editProduct(${product.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon btn-delete" onclick="adminApp.deleteProduct(${product.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = productsHTML;
    }

    // ✅ MÉTHODE MANQUANTE : Chargement commandes
    async loadOrders() {
        try {
            this.orders = await orderService.getAllOrders();
            this.displayOrders();
        } catch (error) {
            console.error('Erreur chargement commandes:', error);
            showNotification('❌ Erreur lors du chargement des commandes', 'error');
        }
    }

    // ✅ MÉTHODE MANQUANTE : Affichage commandes
    displayOrders() {
        const container = document.getElementById('ordersList');

        if (this.orders.length === 0) {
            container.innerHTML = `
                <div style="padding: 3rem; text-align: center; color: var(--gray-color);">
                    <i class="fas fa-receipt fa-3x" style="margin-bottom: 1rem;"></i>
                    <p>Aucune commande trouvée</p>
                </div>
            `;
            return;
        }

        const ordersHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Commande</th>
                        <th>Client</th>
                        <th>Montant</th>
                        <th>Statut</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.orders.map(order => `
                        <tr>
                            <td>
                                <div style="font-weight: 500;">${order.orderNumber}</div>
                                <div style="font-size: 0.8rem; color: var(--gray-color);">
                                    ${order.items.length} article(s)
                                </div>
                            </td>
                            <td>
                                <div>${order.customerFullName}</div>
                                <div style="font-size: 0.8rem; color: var(--gray-color);">${order.customerPhone}</div>
                            </td>
                            <td>${this.formatPrice(order.totalAmount)} FCFA</td>
                            <td>
                                <span class="status-badge ${order.paymentStatus === 'Payée' ? 'status-active' :
                order.paymentStatus === 'En attente' ? 'status-pending' : 'status-inactive'
            }">
                                    ${order.paymentStatus}
                                </span>
                            </td>
                            <td>${new Date(order.orderDate).toLocaleDateString('fr-FR')}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-icon btn-view" onclick="adminApp.viewOrder(${order.id})">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = ordersHTML;
    }

    // ✅ MÉTHODE MANQUANTE : Chargement utilisateurs
    loadUsers() {
        document.getElementById('usersList').innerHTML = `
            <div style="padding: 3rem; text-align: center; color: var(--gray-color);">
                <i class="fas fa-users fa-3x" style="margin-bottom: 1rem;"></i>
                <p>Gestion des utilisateurs à venir</p>
                <p style="font-size: 0.9rem; margin-top: 1rem;">
                    Cette fonctionnalité sera disponible dans une prochaine mise à jour
                </p>
            </div>
        `;
    }

    // GESTION DES FICHIERS (déjà présentes)
    handleFileSelect(e) {
        const files = e.target.files;
        console.log('📄 Fichiers sélectionnés:', files.length);

        if (files.length > 0) {
            this.handleFiles(files);
            e.target.value = '';
        }
    }

    handleFiles(files) {
        const file = files[0];
        console.log('📁 Traitement fichier:', file.name, file.type, file.size);

        if (!file.type.match('image.*')) {
            showNotification('❌ Veuillez sélectionner une image valide', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showNotification('❌ L\'image ne doit pas dépasser 5MB', 'error');
            return;
        }

        this.uploadedFile = file;
        console.log('✅ Fichier validé pour upload');
        this.uploadAndSelectImage();
    }

    async uploadAndSelectImage() {
        if (!this.uploadedFile) {
            showNotification('❌ Aucun fichier sélectionné', 'error');
            return;
        }

        const uploadBtn = document.getElementById('uploadImageBtn');
        const originalHTML = uploadBtn.innerHTML;

        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<div class="loading-spinner"></div> Upload en cours...';

        try {
            console.log('🔼 Début upload direct...');
            const result = await imageUploadService.uploadProductImage(this.uploadedFile);

            if (result.success) {
                console.log('✅ Upload réussi:', result.imageUrl);
                this.selectedImage = result.imageUrl;
                document.getElementById('productImage').value = this.selectedImage;
                this.updateImagePreview(this.selectedImage);
                showNotification('✅ Image uploadée et sélectionnée avec succès', 'success');
            } else {
                throw new Error(result.message || 'Erreur inconnue lors de l\'upload');
            }

        } catch (error) {
            console.error('❌ Erreur upload:', error);
            let errorMessage = 'Erreur lors de l\'upload';

            if (error.message.includes('Format')) errorMessage = 'Format d\'image non supporté';
            else if (error.message.includes('5MB')) errorMessage = 'L\'image est trop volumineuse (max 5MB)';
            else if (error.message.includes('401') || error.message.includes('403')) errorMessage = 'Vous n\'êtes pas autorisé à uploader des images';
            else errorMessage = error.message;

            showNotification('❌ ' + errorMessage, 'error');
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = originalHTML;
            this.uploadedFile = null;
        }
    }

    // GALERIE D'IMAGES (déjà présentes)
    openImageGallery() {
        console.log('🎨 Ouverture galerie d\'images');
        const modal = document.getElementById('imageGalleryModal');

        this.loadPredefinedGallery();
        this.loadUploadedImages();
        modal.classList.add('active');

        console.log('✅ Galerie ouverte');
    }

    closeImageGallery() {
        document.getElementById('imageGalleryModal').classList.remove('active');
        this.selectedImage = null;
    }

    loadPredefinedGallery() {
        console.log('🖼️ Chargement galerie prédéfinie');
        const galleryGrid = document.getElementById('predefinedGalleryGrid');

        if (!galleryGrid) {
            console.error('❌ Element predefinedGalleryGrid non trouvé');
            return;
        }

        // ✅ DIAGNOSTIC COMPLET AVEC VALEURS RÉELLES
        console.log('🔍 Diagnostic hiérarchie complète:');
        let currentElement = galleryGrid;
        let level = 0;

        while (currentElement && currentElement !== document.body) {
            const style = window.getComputedStyle(currentElement);
            console.log(`Level ${level}:`, {
                tag: currentElement.tagName,
                id: currentElement.id || '(no id)',
                class: currentElement.className || '(no class)',
                display: style.display,
                height: currentElement.offsetHeight + 'px',
                maxHeight: style.maxHeight,
                overflow: style.overflow,
                visibility: style.visibility,
                position: style.position
            });
            currentElement = currentElement.parentElement;
            level++;
        }

        // Le reste du code reste identique...
        console.log('📸 Images disponibles:', this.availableImages.length);
        galleryGrid.innerHTML = this.availableImages.map((image, index) => `
    <div class="gallery-item" data-image-url="${image.url}" data-image-name="${image.name}">
        <img src="${image.url}" alt="${image.name}" 
             onerror="console.error('❌ Image failed to load:', this.src); this.src='https://picsum.photos/150/120?random=' + Date.now()">
        <div class="gallery-item-name">${image.name}</div>
    </div>
`).join('');

        console.log('✅ HTML injecté dans predefinedGalleryGrid');
    }

    openImageGallery() {
        console.log('🎨 Ouverture galerie d\'images');
        const modal = document.getElementById('imageGalleryModal');

        this.loadPredefinedGallery();
        this.loadUploadedImages();
        modal.classList.add('active');

        // ✅ CORRECTION : S'assurer que le tab-content est visible
        const tabContent = document.querySelector('.tab-content');
        if (tabContent) {
            tabContent.style.display = 'block';
        }

        // Forcer l'affichage de l'onglet prédéfini
        setTimeout(() => {
            this.switchGalleryTab('predefined');
        }, 100);

        console.log('✅ Galerie ouverte');
    }

    async loadUploadedImages() {
        const container = document.getElementById('uploadedImagesContainer');
        container.innerHTML = '<p style="text-align: center; color: var(--gray-color); padding: 1rem;">Chargement...</p>';

        try {
            const images = await imageUploadService.getUploadedImages();
            console.log('📸 Images uploadées récupérées:', images.length);

            if (images.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; color: var(--gray-color); padding: 2rem;">
                        <i class="fas fa-images fa-2x"></i>
                        <p>Aucune image uploadée</p>
                        <p style="font-size: 0.9rem;">Utilisez le bouton "Uploader" pour ajouter vos images</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div class="gallery-grid">
                    ${images.map(image => `
                        <div class="gallery-item" data-image-url="${image.url}" data-image-name="${image.name}">
                            <img src="${image.url}" alt="${image.name}"
                                 onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=120&fit=crop'">
                            <div class="gallery-item-name">${image.name}</div>
                            <div style="font-size: 0.7rem; color: var(--gray-color); margin-top: 0.25rem;">
                                ${new Date(image.uploadDate).toLocaleDateString('fr-FR')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            container.querySelectorAll('.gallery-item').forEach(item => {
                item.addEventListener('click', () => {
                    console.log('🖱️ Image uploadée cliquée:', item.getAttribute('data-image-url'));
                    this.selectGalleryItem(item);
                });
            });

        } catch (error) {
            console.error('❌ Erreur chargement images uploadées:', error);
            container.innerHTML = '<p style="text-align: center; color: var(--danger-color); padding: 1rem;">Erreur de chargement</p>';
        }
    }

    selectGalleryItem(item) {
        console.log('✅ Image sélectionnée dans galerie:', item.getAttribute('data-image-url'));

        document.querySelectorAll('.gallery-item').forEach(i => {
            i.classList.remove('selected');
        });

        item.classList.add('selected');
        this.selectedImage = item.getAttribute('data-image-url');
    }

    confirmImageSelection() {
        console.log('🔍 Vérification sélection image:', this.selectedImage);

        if (this.selectedImage && this.selectedImage !== 'string') {
            if (this.selectedImage.startsWith('http') || this.selectedImage.startsWith('/uploads/')) {
                console.log('✅ Image valide sélectionnée:', this.selectedImage);
                document.getElementById('productImage').value = this.selectedImage;
                this.updateImagePreview(this.selectedImage);
                this.closeImageGallery();
                showNotification('✅ Image sélectionnée avec succès', 'success');
            } else {
                console.error('❌ Format URL invalide:', this.selectedImage);
                showNotification('❌ Format d\'image invalide', 'error');
            }
        } else {
            console.error('❌ Aucune image valide sélectionnée:', this.selectedImage);
            showNotification('⚠️ Veuillez sélectionner une image valide', 'warning');
        }
    }

    switchGalleryTab(tabName) {
        console.log('📑 Changement onglet galerie:', tabName);

        // Mettre à jour les onglets
        document.querySelectorAll('.gallery-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Mettre à jour le contenu - CORRECTION CRITIQUE
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
            pane.style.display = 'none'; // ✅ S'assurer qu'ils sont cachés
        });

        const activePane = document.getElementById(tabName + 'Tab');
        activePane.classList.add('active');
        activePane.style.display = 'block'; // ✅ FORCER l'affichage

        // ✅ S'assurer que le tab-content parent est visible
        const tabContent = document.querySelector('.tab-content');
        if (tabContent) {
            tabContent.style.display = 'block';
        }

        console.log('🔍 État après changement:', {
            tab: tabName,
            display: window.getComputedStyle(activePane).display,
            height: activePane.offsetHeight
        });

        if (tabName === 'uploaded') {
            this.loadUploadedImages();
        }
    }


    previewUploadedFile(file) {
        console.log('👀 Création aperçu fichier pour galerie');
        const reader = new FileReader();

        reader.onload = (e) => {
            console.log('✅ Aperçu créé');
            document.getElementById('uploadedImagePreview').src = e.target.result;
            document.getElementById('fileName').textContent = `Nom: ${file.name}`;
            document.getElementById('fileSize').textContent = `Taille: ${this.formatFileSize(file.size)}`;

            document.getElementById('uploadPreview').style.display = 'block';
            document.getElementById('confirmUpload').style.display = 'inline-block';
            document.getElementById('uploadArea').classList.add('active');
        };

        reader.onerror = (e) => {
            console.error('❌ Erreur lecture fichier:', e);
            showNotification('❌ Erreur lors de la lecture du fichier', 'error');
        };

        reader.readAsDataURL(file);
    }

    async confirmUpload() {
        if (!this.uploadedFile) {
            showNotification('❌ Aucun fichier à uploader', 'error');
            return;
        }

        const confirmBtn = document.getElementById('confirmUpload');
        const originalHTML = confirmBtn.innerHTML;

        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<div class="loading-spinner"></div> Upload...';

        try {
            console.log('🔼 Upload depuis galerie...');
            const result = await imageUploadService.uploadProductImage(this.uploadedFile);

            if (result.success) {
                console.log('✅ Upload réussi depuis galerie:', result.imageUrl);
                showNotification('✅ Image uploadée avec succès', 'success');

                await this.loadUploadedImages();
                this.switchGalleryTab('uploaded');
                this.resetUploadTab();
            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            console.error('❌ Erreur upload galerie:', error);
            showNotification('❌ Erreur lors de l\'upload: ' + error.message, 'error');
        } finally {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = originalHTML;
        }
    }

    resetUploadTab() {
        this.uploadedFile = null;
        document.getElementById('uploadPreview').style.display = 'none';
        document.getElementById('confirmUpload').style.display = 'none';
        document.getElementById('uploadArea').classList.remove('active');
        document.getElementById('fileInput').value = '';
    }

    // GESTION DES PRODUITS
    openProductModal(product = null) {
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        const form = document.getElementById('productForm');

        if (product) {
            title.textContent = 'Modifier le produit';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productStock').value = product.stock;

            if (product.imageUrl) {
                document.getElementById('productImage').value = product.imageUrl;
                this.selectedImage = product.imageUrl;
                this.updateImagePreview(product.imageUrl);
            } else {
                document.getElementById('productImage').value = '';
                this.selectedImage = null;
                this.updateImagePreview(null);
            }
        } else {
            title.textContent = 'Nouveau produit';
            form.reset();
            document.getElementById('productId').value = '';
            this.selectedImage = null;
            this.updateImagePreview(null);
        }

        modal.classList.add('active');
    }

    closeProductModal() {
        document.getElementById('productModal').classList.remove('active');
    }

    async saveProduct() {
        const saveBtn = document.getElementById('saveProductBtn');
        const btnText = saveBtn.querySelector('.btn-text');
        const spinner = saveBtn.querySelector('.loading-spinner');
        const productId = document.getElementById('productId').value;

        const productData = {
            id: productId ? parseInt(productId) : 0, // ✅ AJOUTEZ CETTE LIGNE
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            category: document.getElementById('productCategory').value,
            stock: parseInt(document.getElementById('productStock').value),
            imageUrl: document.getElementById('productImage').value || '/images/default-product.jpg',
            isActive: true
        };

        if (productData.imageUrl === 'string') {
            showNotification('❌ URL d\'image invalide', 'error');
            return;
        }

        if (!productData.name || !productData.description || !productData.price || !productData.category || !productData.stock) {
            showNotification('❌ Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }

        saveBtn.disabled = true;
        btnText.textContent = 'Enregistrement...';
        spinner.style.display = 'inline-block';

        try {
            let result;
            if (productId) {
                result = await productService.updateProduct(productId, productData);
                showNotification('✅ Produit mis à jour avec succès', 'success');
            } else {
                result = await productService.createProduct(productData);
                showNotification('✅ Produit créé avec succès', 'success');
            }

            this.closeProductModal();
            this.loadProducts();

        } catch (error) {
            console.error('Erreur sauvegarde produit:', error);
            showNotification('❌ Erreur lors de la sauvegarde: ' + error.message, 'error');
        } finally {
            saveBtn.disabled = false;
            btnText.textContent = 'Enregistrer';
            spinner.style.display = 'none';
        }
    }

    // ✅ MÉTHODES MANQUANTES : Édition et suppression
    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            this.openProductModal(product);
        }
    }

    async deleteProduct(productId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            return;
        }

        try {
            await productService.deleteProduct(productId);
            showNotification('✅ Produit supprimé avec succès', 'success');
            this.loadProducts();
        } catch (error) {
            console.error('Erreur suppression produit:', error);
            showNotification('❌ Erreur lors de la suppression: ' + error.message, 'error');
        }
    }

    viewOrder(orderId) {
        showNotification('👁️ Détails de commande à venir', 'info');
    }

    updateImagePreview(imageUrl) {
        console.log('👀 Mise à jour aperçu image:', imageUrl);
        const imagePreview = document.getElementById('imagePreview');
        const noImagePreview = document.getElementById('noImagePreview');

        if (imageUrl && imageUrl !== 'string' && (imageUrl.startsWith('http') || imageUrl.startsWith('/uploads/'))) {
            imagePreview.src = imageUrl;
            imagePreview.style.display = 'block';
            noImagePreview.style.display = 'none';
            console.log('✅ Aperçu mis à jour avec image valide');
        } else {
            imagePreview.style.display = 'none';
            noImagePreview.style.display = 'block';
            console.log('❌ URL image invalide, affichage état vide');
        }
    }

    // ✅ MÉTHODE MANQUANTE : Formatage prix
    formatPrice(price) {
        return new Intl.NumberFormat('fr-FR').format(price);
    }

    // ✅ MÉTHODE MANQUANTE : Formatage taille fichier
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Fonction de notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

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

    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);

    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    });
}

// Initialisation
let adminApp;
document.addEventListener('DOMContentLoaded', function () {
    console.log('📄 DOM chargé - Initialisation AdminApp');
    adminApp = new AdminApp();
});
