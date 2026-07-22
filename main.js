// ============================================
// ARK ARCHIVE - Main JavaScript
// ============================================

// ===== DOM Elements =====
const elements = {
    navbar: document.getElementById('navbar'),
    mobileToggle: document.getElementById('mobileToggle'),
    mobileMenu: document.getElementById('mobileMenu'),
    donateBtn: document.getElementById('donateBtn'),
    donationDrawer: document.getElementById('donationDrawer'),
    missionGallery: document.getElementById('missionGallery'),
    donorGrid: document.getElementById('donorGrid'),
    donorCount: document.getElementById('donorCount'),
    
    // Stats
    statCollected: document.getElementById('statCollected'),
    statBought: document.getElementById('statBought'),
    statHanded: document.getElementById('statHanded'),
    heroCollected: document.getElementById('heroCollected'),
    heroTrees: document.getElementById('heroTrees'),
    aboutDonors: document.getElementById('aboutDonors'),
    aboutTrees: document.getElementById('aboutTrees'),
    
    // Donation
    donorName: document.getElementById('donorName'),
    donorEmail: document.getElementById('donorEmail'),
    treeQuantity: document.getElementById('treeQuantity'),
    paymentMethods: document.getElementById('paymentMethods'),
    congratsPopup: document.getElementById('congratsPopup'),
    congratsTitle: document.getElementById('congratsTitle'),
    congratsDesc: document.getElementById('congratsDesc'),
};

// ===== Navbar Scroll Effect =====
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        elements.navbar.classList.add('scrolled');
    } else {
        elements.navbar.classList.remove('scrolled');
    }
});

// ===== Mobile Menu Toggle =====
elements.mobileToggle.addEventListener('click', () => {
    elements.mobileMenu.classList.toggle('open');
});

// ===== Donation Drawer =====
window.toggleDrawer = function() {
    elements.donationDrawer.classList.toggle('open');
};

elements.donateBtn.addEventListener('click', window.toggleDrawer);

// Close drawer on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.donationDrawer.classList.contains('open')) {
        window.toggleDrawer();
    }
});

// ===== Copy Text =====
window.copyText = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied: ' + text);
    }).catch(() => {
        // Fallback
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('Copied: ' + text);
    });
};

// ===== Submit Donation =====
window.submitDonation = function() {
    const name = elements.donorName.value.trim();
    const email = elements.donorEmail.value.trim();
    const qty = elements.treeQuantity.value.trim();

    if (!name || !email || !qty) {
        alert('Please fill in all fields.');
        return;
    }

    if (isNaN(qty) || parseInt(qty) < 1) {
        alert('Please enter a valid number of trees.');
        return;
    }

    const donationData = {
        name: name,
        email: email,
        qty: parseInt(qty),
        timestamp: Date.now(),
        status: 'pending'
    };

    db.ref('donation_requests').push(donationData)
        .then(() => {
            elements.paymentMethods.style.display = 'block';
            elements.congratsTitle.textContent = `Congratulations, ${name}!`;
            elements.congratsDesc.textContent = `You've successfully requested to plant ${qty} trees!`;
            elements.congratsPopup.classList.add('active');
            
            // Confetti
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 200,
                    spread: 80,
                    origin: { y: 0.6 }
                });
            }
            
            // Reset form
            elements.donorName.value = '';
            elements.donorEmail.value = '';
            elements.treeQuantity.value = '';
        })
        .catch((error) => {
            alert('Submission failed: ' + error.message);
        });
};

// ===== Close Congrats =====
window.closeCongrats = function() {
    elements.congratsPopup.classList.remove('active');
};

// ===== Load Stats from Firebase =====
function loadStats() {
    db.ref('stats').on('value', (snapshot) => {
        const data = snapshot.val() || { collected: 0, bought: 0, delivered: 0 };
        
        // Update all stat displays
        const collected = '$' + data.collected;
        const bought = data.bought;
        const handed = data.delivered;
        
        elements.statCollected.textContent = collected;
        elements.statBought.textContent = bought;
        elements.statHanded.textContent = handed;
        elements.heroCollected.textContent = collected;
        elements.heroTrees.textContent = bought;
        elements.aboutTrees.textContent = bought;
    });
}

// ===== Load Gallery from Firebase =====
function loadGallery() {
    db.ref('gallery').on('value', (snapshot) => {
        const gallery = elements.missionGallery;
        gallery.innerHTML = '';
        
        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const item = child.val();
                const imageUrl = typeof item === 'object' ? item.image : item;
                const link = typeof item === 'object' ? item.link : null;
                
                const div = document.createElement('div');
                div.className = 'gallery-item';
                
                if (link && link !== '') {
                    const a = document.createElement('a');
                    a.href = link;
                    a.target = '_blank';
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.onerror = function() {
                        this.src = 'https://via.placeholder.com/400?text=Image+Error';
                    };
                    a.appendChild(img);
                    div.appendChild(a);
                } else {
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.onerror = function() {
                        this.src = 'https://via.placeholder.com/400?text=Image+Error';
                    };
                    div.appendChild(img);
                }
                
                gallery.appendChild(div);
            });
        } else {
            // Placeholder images
            for (let i = 1; i <= 8; i++) {
                const div = document.createElement('div');
                div.className = 'gallery-item';
                const img = document.createElement('img');
                img.src = `https://via.placeholder.com/400?text=Image+${i}`;
                div.appendChild(img);
                gallery.appendChild(div);
            }
        }
    });
}

// ===== Load Donors from Firebase =====
function loadDonors() {
    let donorCount = 0;
    
    db.ref('legacy_archive').on('value', (snapshot) => {
        const grid = elements.donorGrid;
        grid.innerHTML = '';
        donorCount = 0;
        
        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const donor = child.val();
                donorCount++;
                
                const container = document.createElement('div');
                container.className = 'donor-container';
                
                const link = donor.link || '#';
                const photo = donor.photo || 'https://via.placeholder.com/100';
                const name = donor.name || 'Anonymous';
                const trees = donor.trees || 0;
                
                container.innerHTML = `
                    <a href="${link}" target="_blank" style="text-decoration:none;">
                        <div class="donor-circle">
                            <img src="${photo}" onerror="this.src='https://via.placeholder.com/100'">
                        </div>
                        <span class="donor-name">${name}</span>
                        <span class="donor-qty">${trees} Trees</span>
                    </a>
                `;
                
                grid.appendChild(container);
            });
        }
        
        // Add placeholder plots
        const placeholderCount = Math.max(0, 120 - donorCount);
        for (let i = 0; i < placeholderCount; i++) {
            const container = document.createElement('div');
            container.className = 'donor-container';
            container.innerHTML = `
                <div class="donor-circle">
                    <i class="fas fa-tree" style="opacity:0.2; font-size:24px;"></i>
                </div>
                <span class="donor-name" style="opacity:0.3;">Plot #${donorCount + i + 1}</span>
            `;
            grid.appendChild(container);
        }
        
        // Update donor count
        elements.donorCount.textContent = `${donorCount} Donors`;
        elements.aboutDonors.textContent = donorCount;
    });
}

// ===== Load About Stats =====
function loadAboutStats() {
    db.ref('stats').on('value', (snapshot) => {
        const data = snapshot.val() || { bought: 0 };
        elements.aboutTrees.textContent = data.bought || 0;
    });
}

// ===== Init =====
function init() {
    loadStats();
    loadGallery();
    loadDonors();
    loadAboutStats();
}

// Run on page load
document.addEventListener('DOMContentLoaded', init);
