import React, { useEffect } from 'react';
import { X, Box } from 'lucide-react';
import '@google/model-viewer';
import './Model3DViewerModal.css';

const Model3DViewerModal = ({ modelUrl, onClose }) => {
  // Close on escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    // document.body.style.overflow = 'hidden'; 
    // Commented out to prevent conflict with underlying modal's overflow reset

    return () => {
      document.removeEventListener('keydown', handler);
      // Let the underlying modal handle body overflow
    };
  }, [onClose]);

  return (
    <div className="model3d-backdrop" onClick={onClose}>
      <div className="model3d-modal glass" onClick={e => e.stopPropagation()}>
        <button className="model3d-close" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="model3d-header">
          <Box size={18} className="model3d-icon" />
          <span>Interactive 3D Viewer</span>
        </div>
        <div className="model3d-container">
          {modelUrl ? (
            <model-viewer
              src={modelUrl}
              camera-controls
              auto-rotate
              ar
              shadow-intensity="1"
              touch-action="pan-y"
              style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
            >
              <div className="model3d-progress-bar" slot="progress-bar">
                <div className="model3d-update-bar"></div>
              </div>
            </model-viewer>
          ) : (
            <div className="model3d-error">
              <p>Model not available.</p>
            </div>
          )}
        </div>
        <div className="model3d-footer">
          <p>Drag to rotate &bull; Pinch to zoom</p>
        </div>
      </div>
    </div>
  );
};

export default Model3DViewerModal;
