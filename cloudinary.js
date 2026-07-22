// ============================================
// Cloudinary Configuration
// ============================================

const CLOUDINARY_CONFIG = {
    cloudName: 'qq3tygjl',
    uploadPreset: 'gallery_upload',
    apiKey: '649921912794173'
};

// ===== Upload Image to Cloudinary =====
window.uploadToCloudinary = async function(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    
    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const data = await response.json();
        return {
            success: true,
            url: data.secure_url,
            publicId: data.public_id,
            width: data.width,
            height: data.height
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// ===== Delete Image from Cloudinary =====
window.deleteFromCloudinary = async function(publicId) {
    // Note: This requires a backend API for security
    // For now, we'll just log it
    console.log('Delete image:', publicId);
    return { success: true };
};
