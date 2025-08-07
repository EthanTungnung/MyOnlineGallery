document.addEventListener('DOMContentLoaded', () => {
    const categories = ["All", "Nature", "Abstract", "City", "Animals", "Food", "People", "Travel", "Art", "Technology"];
    const categoryTabs = document.getElementById('category-tabs');
    const galleryContainer = document.getElementById('gallery-container');
    let currentCategory = 'All';

    // Load images from localStorage or initialize if not present
    let images = JSON.parse(localStorage.getItem('imageGallery')) || {
        "All": [],
        "Nature": [],
        "Abstract": [],
        "City": [],
        "Animals": [],
        "Food": [],
        "People": [],
        "Travel": [],
        "Art": [],
        "Technology": []
    };

    // Function to save images to localStorage
    function saveImages() {
        localStorage.setItem('imageGallery', JSON.stringify(images));
    }

    // Function to render categories
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

    // Function to render gallery
    function renderGallery() {
        galleryContainer.innerHTML = '';

        // Add upload button as the first item
        const uploadGridItem = document.createElement('div');
        uploadGridItem.classList.add('upload-grid-item');
        uploadGridItem.innerHTML = `
            <input type="file" id="image-upload" accept="image/*" multiple>
            <label for="image-upload">+</label>
            <p>Upload Image</p>
        `;
        galleryContainer.appendChild(uploadGridItem);

        const imageUploadInput = uploadGridItem.querySelector('#image-upload');
        imageUploadInput.addEventListener('change', handleImageUpload);

        // Display images for the current category
        const categoryImages = images[currentCategory];
        categoryImages.forEach(imageData => {
            const imgItem = document.createElement('div');
            imgItem.classList.add('image-grid-item');
            const img = document.createElement('img');
            img.src = imageData.src;
            img.alt = imageData.name;
            imgItem.appendChild(img);
            galleryContainer.appendChild(imgItem);
        });
    }

    // Function to handle image upload
    function handleImageUpload(event) {
        const files = event.target.files;
        if (files.length > 0) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageData = {
                        src: e.target.result,
                        name: file.name,
                        category: currentCategory === 'All' ? 'Uncategorized' : currentCategory // Assign to current category or 'Uncategorized'
                    };

                    // Add image to the specific category and 'All' category
                    if (currentCategory !== 'All') {
                        images[currentCategory].push(imageData);
                    }
                    images['All'].push(imageData);

                    saveImages(); // Save images after upload
                    renderGallery(); // Re-render to show the new image
                };
                reader.readAsDataURL(file);
            });
        }
    }

    // Initial render
    renderCategories();
    renderGallery();
});
