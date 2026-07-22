// ============================================
// ARK ARCHIVE - Admin JavaScript
// ============================================

// ===== DOM Elements =====
const adminElements = {
    loginOverlay: document.getElementById('loginOverlay'),
    loginForm: document.getElementById('loginForm'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    loginMessage: document.getElementById('loginMessage'),
    logoutBtn: document.getElementById('logoutBtn'),
    adminEmail: document.getElementById('adminEmail'),
    sidebar: document.getElementById('adminSidebar'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    pageTitle: document.getElementById('pageTitle'),
    
    // Stats
    adminCollected: document.getElementById('adminCollected'),
    adminTrees: document.getElementById('adminTrees'),
    adminDonors: document.getElementById('adminDonors'),
    adminGallery: document.getElementById('adminGallery'),
    
    // Gallery
    adminGalleryGrid: document.getElementById('adminGalleryGrid'),
    gallerySearch: document.getElementById('gallerySearch'),
    
    // Donors
    donorTableBody: document.getElementById('donorTableBody'),
    donorSearch: document.getElementById('donorSearch'),
    
    // Requests
    requestList: document.getElementById('requestList'),
    
    // Settings
    statsCollected: document.getElementById('statsCollected'),
    statsBought: document.getElementById('statsBought'),
    statsHanded: document.getElementById('statsHanded'),
    statsForm: document.getElementById('statsForm'),
    settingsForm: document.getElementById('settingsForm'),
    
    // Modals
    uploadModal: document.getElementById('uploadModal'),
    donorModal: document.getElementById('donorModal'),
    donorModalTitle: document.getElementById('donorModalTitle'),
    donorEditKey: document.getElementById('donorEditKey'),
    donorNameInput: document.getElementById('donorNameInput'),
    donorTrees: document.getElementById('donorTrees'),
    donorPhoto: document.getElementById('donorPhoto'),
    donorLink: document.getElementById('donorLink'),
    imageFile: document.getElementById('imageFile'),
    imageLink: document.getElementById('imageLink'),
    uploadProgress: document.getElementById('uploadProgress'),
    progressFill: document.querySelector('.progress-fill'),
};

// ===== Auth State =====
let currentUser = null;

// ===== Check Auth State =====
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        adminElements.loginOverlay.classList.add('hidden');
        adminElements.adminEmail.textContent = user.email;
        loadAdminData();
    } else {
        currentUser = null;
        adminElements.loginOverlay.classList.remove('hidden');
    }
});

// ===== Login =====
adminElements.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = adminElements.loginEmail.value;
    const password = adminElements.loginPassword.value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            adminElements.loginMessage.className = 'login-message success';
            adminElements.loginMessage.textContent = 'Login successful!';
            adminElements.loginMessage.style.display = 'block';
        })
        .catch((error) => {
            adminElements.loginMessage.className = 'login-message error';
            adminElements.loginMessage.textContent = error.message;
            adminElements.loginMessage.style.display = 'block';
        });
});

// ===== Forgot Password =====
window.forgotPassword = function() {
    const email = prompt('Enter your email address:');
    if (email) {
        auth.sendPasswordResetEmail(email)
            .then(() => {
                alert('Password reset email sent! Check your inbox.');
            })
            .catch((error) => {
                alert('Error: ' + error.message);
            });
    }
};

// ===== Logout =====
adminElements.logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
        auth.signOut();
    }
});

// ===== Sidebar Toggle =====
adminElements.sidebarToggle.addEventListener('click', () => {
    adminElements.sidebar.classList.toggle('open');
});

// ===== Navigation =====
document.querySelectorAll('.sidebar-nav ul li').forEach((item) => {
    item.addEventListener('click', function() {
        const page = this.dataset.page;
        if (page) {
            navigateTo(page);
        }
    });
});

window.navigateTo = function(page) {
    // Update sidebar
    document.querySelectorAll('.sidebar-nav ul li').forEach((li) => {
        li.classList.remove('active');
        if (li.dataset.page === page) {
            li.classList.add('active');
        }
    });
    
    // Update pages
    document.querySelectorAll('.admin-page').forEach((p) => {
        p.classList.remove('active');
    });
    const targetPage = document.getElementById('page-' + page);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update title
    const titles = {
        dashboard: 'Dashboard',
        gallery: 'Gallery Management',
        donors: 'Donor Management',
        requests: 'Donation Requests',
        settings: 'Settings'
    };
    adminElements.pageTitle.textContent = titles[page] || page;
    
    // Close mobile sidebar
    adminElements.sidebar.classList.remove('open');
};

// ===== Load Admin Data =====
function loadAdminData() {
    loadAdminStats();
    loadAdminGallery();
    loadAdminDonors();
    loadAdminRequests();
    loadAdminSettings();
}

// ===== Load Admin Stats =====
function loadAdminStats() {
    db.ref('stats').on('value', (snapshot) => {
        const data = snapshot.val() || { collected: 0, bought: 0, delivered: 0 };
        adminElements.adminCollected.textContent = '$' + data.collected;
        adminElements.adminTrees.textContent = data.bought;
        
        // Count donors
        db.ref('legacy_archive').once('value', (donorSnap) => {
            adminElements.adminDonors.textContent = donorSnap.numChildren() || 0;
        });
        
        // Count gallery
        db.ref('gallery').once('value', (gallerySnap) => {
            adminElements.adminGallery.textContent = gallerySnap.numChildren() || 0;
        });
    });
}

// ===== Load Admin Gallery =====
function loadAdminGallery() {
    db.ref('gallery').on('value', (snapshot) => {
        const grid = adminElements.adminGalleryGrid;
        grid.innerHTML = '';
        
        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const item = child.val();
                const key = child.key;
                const imageUrl = typeof item === 'object' ? item.image : item;
                const link = typeof item === 'object' ? item.link : '';
                
                const div = document.createElement('div');
                div.className = 'gallery-item-admin';
                div.innerHTML = `
                    <img src="${imageUrl}" onerror="this.src='https://via.placeholder.com/200'">
                    <div class="item-overlay">
                        <button class="btn-delete" onclick="deleteGalleryItem('${key}')">Delete</button>
                        ${link ? `<button class="btn-edit" onclick="editGalleryLink('${key}')">Edit Link</button>` : ''}
                    </div>
                `;
                grid.appendChild(div);
            });
        } else {
            grid.innerHTML = '<p class="empty-state">No images in gallery</p>';
        }
    });
}

// ===== Delete Gallery Item =====
window.deleteGalleryItem = function(key) {
    if (confirm('Delete this image?')) {
        db.ref('gallery/' + key).remove()
            .then(() => alert('Deleted successfully!'))
            .catch((error) => alert('Error: ' + error.message));
    }
};

// ===== Edit Gallery Link =====
window.editGalleryLink = function(key) {
    const newLink = prompt('Enter new redirect link:');
    if (newLink !== null) {
        db.ref('gallery/' + key + '/link').set(newLink)
            .then(() => alert('Link updated!'))
            .catch((error) => alert('Error: ' + error.message));
    }
};

// ===== Load Admin Donors =====
function loadAdminDonors() {
    db.ref('legacy_archive').on('value', (snapshot) => {
        const tbody = adminElements.donorTableBody;
        tbody.innerHTML = '';
        
        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const donor = child.val();
                const key = child.key;
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <img src="${donor.photo || 'https://via.placeholder.com/40'}" 
                             class="donor-avatar" 
                             onerror="this.src='https://via.placeholder.com/40'">
                    </td>
                    <td><strong>${donor.name || 'Anonymous'}</strong></td>
                    <td>${donor.trees || 0}</td>
                    <td><a href="${donor.link || '#'}" target="_blank">${donor.link ? 'Link' : '-'}</a></td>
                    <td>
                        <button class="btn-edit" onclick="editDonor('${key}')">Edit</button>
                        <button class="btn-delete" onclick="deleteDonor('${key}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--gray-400);">No donors yet</td></tr>';
        }
    });
}

// ===== Delete Donor =====
window.deleteDonor = function(key) {
    if (confirm('Delete this donor?')) {
        db.ref('legacy_archive/' + key).remove()
            .then(() => alert('Donor deleted!'))
            .catch((error) => alert('Error: ' + error.message));
    }
};

// ===== Edit Donor =====
window.editDonor = function(key) {
    db.ref('legacy_archive/' + key).once('value', (snapshot) => {
        const donor = snapshot.val();
        if (donor) {
            adminElements.donorModalTitle.textContent = 'Edit Donor';
            adminElements.donorEditKey.value = key;
            adminElements.donorNameInput.value = donor.name || '';
            adminElements.donorTrees.value = donor.trees || '';
            adminElements.donorPhoto.value = donor.photo || '';
            adminElements.donorLink.value = donor.link || '';
            openDonorModal();
        }
    });
};

// ===== Open Donor Modal =====
window.openDonorModal = function() {
    adminElements.donorModal.classList.add('open');
};

// ===== Close Donor Modal =====
window.closeDonorModal = function() {
    adminElements.donorModal.classList.remove('open');
    adminElements.donorModalTitle.textContent = 'Add Donor';
    adminElements.donorEditKey.value = '';
    adminElements.donorNameInput.value = '';
    adminElements.donorTrees.value = '';
    adminElements.donorPhoto.value = '';
    adminElements.donorLink.value = '';
};

// ===== Save Donor =====
window.saveDonor = function() {
    const key = adminElements.donorEditKey.value;
    const data = {
        name: adminElements.donorNameInput.value.trim(),
        trees: parseInt(adminElements.donorTrees.value) || 0,
        photo: adminElements.donorPhoto.value.trim() || 'https://via.placeholder.com/100',
        link: adminElements.donorLink.value.trim() || '#'
    };
    
    if (!data.name) {
        alert('Please enter donor name.');
        return;
    }
    
    const ref = key ? db.ref('legacy_archive/' + key) : db.ref('legacy_archive').push();
    ref.set(data)
        .then(() => {
            alert(key ? 'Donor updated!' : 'Donor added!');
            closeDonorModal();
        })
        .catch((error) => alert('Error: ' + error.message));
};

// ===== Load Admin Requests =====
function loadAdminRequests() {
    db.ref('donation_requests').on('value', (snapshot) => {
        const list = adminElements.requestList;
        list.innerHTML = '';
        
        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const request = child.val();
                const key = child.key;
                
                const div = document.createElement('div');
                div.className = 'request-item';
                div.innerHTML = `
                    <div class="request-info">
                        <span class="name">${request.name}</span>
                        <span class="email">${request.email}</span>
                        <span class="qty">${request.qty} trees requested</span>
                    </div>
                    <div class="request-actions">
                        <button class="approve" onclick="approveRequest('${key}')">Approve</button>
                        <button class="reject" onclick="deleteRequest('${key}')">Reject</button>
                    </div>
                `;
                list.appendChild(div);
            });
        } else {
            list.innerHTML = '<p class="empty-state">No pending requests</p>';
        }
    });
}

// ===== Approve Request =====
window.approveRequest = function(key) {
    db.ref('donation_requests/' + key).once('value', (snapshot) => {
        const request = snapshot.val();
        if (request) {
            const donorData = {
                name: request.name,
                trees: request.qty || 1,
                photo: 'https://via.placeholder.com/100',
                link: '#'
            };
            
            db.ref('legacy_archive').push(donorData)
                .then(() => {
                    return db.ref('donation_requests/' + key).remove();
                })
                .then(() => {
                    alert('Request approved and donor added to archive!');
                })
                .catch((error) => alert('Error: ' + error.message));
        }
    });
};

// ===== Delete Request =====
window.deleteRequest = function(key) {
    if (confirm('Reject this request?')) {
        db.ref('donation_requests/' + key).remove()
            .then(() => alert('Request rejected!'))
            .catch((error) => alert('Error: ' + error.message));
    }
};

// ===== Refresh Requests =====
window.refreshRequests = function() {
    loadAdminRequests();
};

// ===== Load Admin Settings =====
function loadAdminSettings() {
    db.ref('stats').once('value', (snapshot) => {
        const data = snapshot.val() || {};
        adminElements.statsCollected.value = data.collected || 0;
        adminElements.statsBought.value = data.bought || 0;
        adminElements.statsHanded.value = data.delivered || 0;
    });
}

// ===== Update Stats =====
adminElements.statsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const data = {
        collected: parseInt(adminElements.statsCollected.value) || 0,
        bought: parseInt(adminElements.statsBought.value) || 0,
        delivered: parseInt(adminElements.statsHanded.value) || 0
    };
    
    db.ref('stats').set(data)
        .then(() => alert('Stats updated successfully!'))
        .catch((error) => alert('Error: ' + error.message));
});

// ===== Save Settings =====
adminElements.settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Settings are currently stored in HTML, but can be extended to Firebase
    alert('Settings saved! (This is a demo)');
});

// ===== Open Upload Modal =====
window.openUploadModal = function() {
    adminElements.uploadModal.classList.add('open');
    adminElements.imageFile.value = '';
    adminElements.imageLink.value = '';
    adminElements.uploadProgress.style.display = 'none';
    adminElements.progressFill.style.width = '0%';
};

// ===== Close Upload Modal =====
window.closeUploadModal = function() {
    adminElements.uploadModal.classList.remove('open');
};

// ===== File Input Preview =====
adminElements.imageFile.addEventListener('change', function() {
    const preview = document.querySelector('.upload-preview');
    if (this.files.length > 0) {
        const file = this.files[0];
        preview.innerHTML = `
            <i class="fas fa-check-circle" style="color: var(--success);"></i>
            <p>${file.name} (${(file.size / 1024).toFixed(1)} KB)</p>
        `;
    }
});

// ===== Upload Images =====
window.uploadImages = function() {
    const files = adminElements.imageFile.files;
    const link = adminElements.imageLink.value.trim();
    
    if (files.length === 0) {
        alert('Please select an image to upload.');
        return;
    }
    
    const progressBar = adminElements.uploadProgress;
    const progressFill = adminElements.progressFill;
    progressBar.style.display = 'block';
    
    let uploaded = 0;
    const total = files.length;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'gallery_upload');
        
        fetch('https://api.cloudinary.com/v1_1/qq3tygjl/image/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.secure_url) {
                // Save to Firebase
                const galleryData = {
                    image: data.secure_url,
                    link: link || '',
                    uploadedAt: Date.now()
                };
                
                return db.ref('gallery').push(galleryData);
            } else {
                throw new Error('Upload failed');
            }
        })
        .then(() => {
            uploaded++;
            const progress = (uploaded / total) * 100;
            progressFill.style.width = progress + '%';
            
            if (uploaded === total) {
                setTimeout(() => {
                    alert('All images uploaded successfully!');
                    closeUploadModal();
                    progressBar.style.display = 'none';
                    progressFill.style.width = '0%';
                }, 500);
            }
        })
        .catch((error) => {
            alert('Upload failed: ' + error.message);
            progressBar.style.display = 'none';
        });
    }
};

// ===== Close modals on outside click =====
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('open');
    }
});

// ===== Keyboard shortcuts =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.open').forEach((modal) => {
            modal.classList.remove('open');
        });
    }
});