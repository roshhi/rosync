import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { shareAPI } from '../services/shareAPI';

const SharedFolder = () => {
  const { shareId } = useParams();
  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);

  useEffect(() => {
    fetchSharedFolder();
  }, [shareId]);

  const fetchSharedFolder = async () => {
    try {
      setLoading(true);
      const response = await shareAPI.getSharedFolder(shareId);
      setFolder(response.folder);
      setExpiresAt(response.expiresAt);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0B0F] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#29C762] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#FFFFFF] text-lg">Loading shared folder...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0B0F] via-[#1a1a2e] to-[#16213e] flex items-center justify-center p-6">
        <div className="max-w-md w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#FFFFFF] mb-2">Access Error</h2>
          <p className="text-[#818897] mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-[#29C762] text-[#0B0B0F] font-semibold rounded-xl hover:scale-105 transition-all"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0F] via-[#1a1a2e] to-[#16213e] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2">{folder?.name}</h1>
              <p className="text-[#818897]">
                Shared folder • Expires {new Date(expiresAt).toLocaleDateString()}
              </p>
            </div>
            <div className="p-4 bg-[#29C762]/10 rounded-xl">
              <svg className="w-8 h-8 text-[#29C762]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Subfolders */}
        {folder?.children && folder.children.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#FFFFFF] mb-4">Folders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folder.children.map((subfolder) => (
                <div
                  key={subfolder.id}
                  className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#29C762]/10 rounded-lg">
                      <svg className="w-6 h-6 text-[#29C762]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#FFFFFF]">{subfolder.name}</h4>
                      <p className="text-sm text-[#818897]">Folder</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        {folder?.files && folder.files.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold text-[#FFFFFF] mb-4">Files</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {folder.files.map((file) => (
                <div
                  key={file.id}
                  className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[#FFFFFF] truncate">{file.name}</h4>
                      <p className="text-xs text-[#818897]">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(file.url, file.name)}
                    className="w-full py-2 text-xs text-[#29C762] hover:text-[#FFFFFF] hover:bg-[#29C762]/10 rounded-lg transition-all"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl">
            <p className="text-[#818897]">No files in this folder</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedFolder;
