import cloudinary from '../config/cloudinary.js';
import { env } from './env.js';

function safeName(original) {
    const base = (original || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${base}`;
}

export async function uploadToCloudinary(fileBuffer, originalName, folder) {
    // If Cloudinary is not configured, use dummy values
    if (!env.cloudinary.cloudName) {
        const publicId = safeName(originalName);
        return {
            cloudUrl: `/uploads/${folder}/${publicId}`,
            publicId: publicId,
            folder: folder,
            bytes: fileBuffer.length,
            format: originalName.split('.').pop() || 'bin'
        };
    }

    // Otherwise use real Cloudinary
    const publicId = safeName(originalName);
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: publicId,
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        cloudUrl: result.secure_url,
                        publicId: result.public_id,
                        folder: result.folder || folder,
                        bytes: result.bytes,
                        format: result.format || 'bin'
                    });
                }
            }
        );
        stream.end(fileBuffer);
    });
}

export async function deleteFromCloudinary(publicId) {
    // If Cloudinary is not configured, skip deletion
    if (!env.cloudinary.cloudName) return;
    await cloudinary.uploader.destroy(publicId);
}
