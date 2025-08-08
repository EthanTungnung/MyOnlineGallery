document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const categoryTabs = document.getElementById('category-tabs');
    const galleryContainer = document.getElementById('gallery-container');
    const authContainer = document.getElementById('auth-container');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const userProfile = document.getElementById('user-profile');
    const userNameSpan = document.getElementById('user-name');
    const logoutBtn = document.getElementById('logout-btn');
    const searchBar = document.getElementById('search-bar');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');

    // App State
    let token = localStorage.getItem('token');
    let user = JSON.parse(localStorage.getItem('user'));
    let images = [];
    let currentCategory = 'All';
    const categories = ["All", "Nature", "Abstract", "City", "Animals", "Food", "People", "Travel", "Art", "Technology"];

    // --- AUTHENTICATION --- //

    const updateUI = () => {
        if (token) {
            authContainer.style.display = 'none';
            userProfile.style.display = 'block';
            galleryContainer.style.display = 'grid';
            userNameSpan.textContent = user.name;
            renderCategories();
            fetchImages();
        } else {
            authContainer.style.display = 'flex';
            userProfile.style.display = 'none';
            galleryContainer.style.display = 'none';
            categoryTabs.innerHTML = '';
        }
    };

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const res = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            if (!res.ok) throw new Error('Registration failed');
            alert('Registration successful! Please log in.');
            registerForm.reset();
        } catch (error) {
            alert(error.message);
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!res.ok) throw new Error('Login failed');
            const data = await res.json();
            token = data.token;
            user = data.user;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            updateUI();
        } catch (error) {
            alert(error.message);
        }
    });

    logoutBtn.addEventListener('click', () => {
        token = null;
        user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        updateUI();
    });

    // --- GALLERY --- //

    const fetchImages = async () => {
        try {
            const res = await fetch('/api/images', {
                headers: { 'x-auth-token': token }
            });
            if (!res.ok) throw new Error('Failed to fetch images');
            images = await res.json();
            renderGallery();
        } catch (error) {
            alert(error.message);
        }
    };

    function renderCategories() {
        categoryTabs.innerHTML = '';
        categories.forEach(category => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = "#";
            a.textContent = category;
            a.classList.add('category-tab');
            if (category === currentCategory) {
                a.classList.add('active');
            }
            a.addEventListener('click', (e) => {
                e.preventDefault();
                currentCategory = category;
                renderCategories();
                renderGallery();
            });
            li.appendChild(a);
            categoryTabs.appendChild(li);
        });
    }

    function renderGallery() {
        galleryContainer.innerHTML = '';

        const uploadGridItem = document.createElement('div');
        uploadGridItem.classList.add('upload-grid-item');
        uploadGridItem.innerHTML = `
            <input type="file" id="image-upload" accept="image/*">
            <label for="image-upload">+</label>
            <p>Upload Image</p>
        `;
        galleryContainer.appendChild(uploadGridItem);
        uploadGridItem.querySelector('#image-upload').addEventListener('change', handleImageUpload);

        

        const searchTerm = searchBar.value.toLowerCase();
        let filteredImages = images
            .filter(img => currentCategory === 'All' || img.category === currentCategory)
            .filter(img => img.filename.toLowerCase().includes(searchTerm));

        filteredImages.forEach(imageData => {
            const imgItem = document.createElement('div');
            imgItem.classList.add('image-grid-item');
            imgItem.innerHTML = `
                <img src="${imageData.url}" alt="${imageData.filename}">
                <div class="image-overlay">
                    <button class="edit-btn" data-id="${imageData._id}">Edit</button>
                    <button class="delete-btn" data-id="${imageData._id}">Delete</button>
                </div>
            `;
            galleryContainer.appendChild(imgItem);
        });
    }

    async function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('category', currentCategory);

        try {
            const res = await fetch('/api/images/upload', {
                method: 'POST',
                headers: { 'x-auth-token': token },
                body: formData
            });
            if (!res.ok) throw new Error('Upload failed');
            fetchImages(); // Refresh gallery
        } catch (error) {
            alert(error.message);
        }
    }

    searchBar.addEventListener('input', renderGallery);

    galleryContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const imageId = e.target.dataset.id;
            const newCategory = prompt('Enter new category:', 'Nature');
            if (newCategory && categories.includes(newCategory)) {
                try {
                    const res = await fetch(`/api/images/${imageId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        },
                        body: JSON.stringify({ category: newCategory })
                    });
                    if (!res.ok) throw new Error('Update failed');
                    fetchImages(); // Refresh gallery
                } catch (error) {
                    alert(error.message);
                }
            }
        }
        if (e.target.classList.contains('delete-btn')) {
            const imageId = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this image?')) {
                try {
                    const res = await fetch(`/api/images/${imageId}`, {
                        method: 'DELETE',
                        headers: { 'x-auth-token': token }
                    });
                    if (!res.ok) throw new Error('Delete failed');
                    fetchImages(); // Refresh gallery
                } catch (error) {
                    alert(error.message);
                }
            }
        }
    });

    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    });

    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
    });

    // Initial Load
    updateUI();
});
