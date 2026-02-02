import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { folderAPI } from '../services/folderAPI';
import { fileAPI } from '../services/fileAPI';
import { shareAPI } from '../services/shareAPI';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading, logout } = useAuth();
  
  const [viewMode, setViewMode] = useState('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFileDetailsModal, setShowFileDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedFileDetails, setSelectedFileDetails] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameValue, setRenameValue] = useState('');
  
  // Navigation state for nested folders
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([{ id: null, name: 'Home' }]);
  
  // Real data from API
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  
  // Share state
  const [shareDuration, setShareDuration] = useState('7d');
  const [shareLink, setShareLink] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  
  // Storage state
  const [storageStats, setStorageStats] = useState(null);

  // Fetch folders and files when current folder changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchFolders();
      fetchFiles();
      fetchStorageStats();
    }
  }, [isAuthenticated, currentFolderId]);

  const fetchStorageStats = async () => {
    try {
      const response = await fileAPI.getStorageStats();
      setStorageStats(response.storage);
    } catch (err) {
      console.error('Error fetching storage stats:', err);
    }
  };

  const fetchFolders = async () => {
    try {
      setLoadingFolders(true);
      const response = await folderAPI.getFolders(currentFolderId || 'root');
      setFolders(response.folders || []);
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError(err.message);
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleNavigateToFolder = async (folder) => {
    setCurrentFolderId(folder.id);
    setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
  };

  const handleNavigateToBreadcrumb = (index) => {
    const newPath = folderPath.slice(0, index + 1);
    const targetFolder = newPath[newPath.length - 1];
    setCurrentFolderId(targetFolder.id);
    setFolderPath(newPath);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      setOperationLoading(true);
      setError('');
      await folderAPI.createFolder(newFolderName.trim(), currentFolderId);
      setNewFolderName('');
      setShowCreateFolderModal(false);
      await fetchFolders();
    } catch (err) {
      setError(err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleRenameFolder = async () => {
    if (!renameValue.trim() || !selectedItem) return;
    
    try {
      setOperationLoading(true);
      setError('');
      await folderAPI.renameFolder(selectedItem.id, renameValue.trim());
      setShowRenameModal(false);
      setSelectedItem(null);
      setRenameValue('');
      await fetchFolders();
    } catch (err) {
      setError(err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!selectedItem) return;
    
    try {
      setOperationLoading(true);
      setError('');
      await folderAPI.deleteFolder(selectedItem.id);
      setShowDeleteModal(false);
      setSelectedItem(null);
      await fetchFolders();
    } catch (err) {
      setError(err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      setLoadingFiles(true);
      const response = await fileAPI.getFiles(currentFolderId || 'root');
      setFiles(response.files || []);
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setOperationLoading(true);
      setError('');
      setUploadProgress(10);
      
      await fileAPI.uploadFile(file, currentFolderId);
      
      setUploadProgress(100);
      setShowUploadModal(false);
      setUploadProgress(0);
      await fetchFiles();
      await fetchStorageStats(); // Refresh storage after upload
    } catch (err) {
      setError(err.message);
      setUploadProgress(0);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      setOperationLoading(true);
      setError('');
      await fileAPI.deleteFile(fileId);
      await fetchFiles();
      await fetchStorageStats(); // Refresh storage after delete
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message);
      alert(`Failed to delete file: ${err.message}`);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleViewFileDetails = async (fileId) => {
    try {
      setOperationLoading(true);
      const response = await fileAPI.getFileById(fileId);
      setSelectedFileDetails(response.file);
      setShowFileDetailsModal(true);
    } catch (err) {
      console.error('Error fetching file details:', err);
      alert(`Failed to load file details: ${err.message}`);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDownloadFile = (fileUrl, fileName) => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateShareLink = async () => {
    if (!selectedItem) return;
    
    try {
      setShareLoading(true);
      setError('');
      const response = await shareAPI.createShareLink(selectedItem.id, shareDuration);
      setShareLink(response.shareLink.url);
    } catch (err) {
      console.error('Error creating share link:', err);
      setError(err.message);
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#29C762] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#818897]">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      {/* Header */}
      <header className="relative top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 mb-5">
        <div className="border border-white/10  rounded-4xl px-6 py-2">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className='flex gap-2 items-center'>
              <div className="w-10 h-10 rounded-xl bg-[#29C762] flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
              </div>
              <span className="text-xl font-semibold text-[#FFFFFF]">
                Rosync
              </span>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-[#FFFFFF]">{user?.name || 'User'}</p>
                <p className="text-xs text-[#818897]">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-[#FFFFFF] bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Storage Info & Actions */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Storage Card */}
          <div className="flex-1 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-[#818897] text-sm mb-2">Storage Used</h3>
            {storageStats ? (
              <>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-[#FFFFFF]">{storageStats.usedMB}</span>
                  <span className="text-[#818897]">MB of {storageStats.limitMB} MB</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      parseFloat(storageStats.percentageUsed) > 80 
                        ? 'bg-gradient-to-r from-red-500 to-red-400' 
                        : parseFloat(storageStats.percentageUsed) > 60
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                        : 'bg-gradient-to-r from-[#29C762] to-green-400'
                    }`}
                    style={{ width: `${Math.min(storageStats.percentageUsed, 100)}%` }}
                  ></div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#29C762] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[#818897]">Loading...</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-[#29C762] text-[#0B0B0F] font-semibold rounded-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload
            </button>
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="px-6 py-3 border border-white/10 text-[#FFFFFF] font-semibold rounded-xl hover:border-[#29C762] transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Folder
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#FFFFFF]">My Files</h2>
          <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#29C762] text-[#0B0B0F]' : 'text-[#818897] hover:text-[#FFFFFF]'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#29C762] text-[#0B0B0F]' : 'text-[#818897] hover:text-[#FFFFFF]'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          {folderPath.map((folder, index) => (
            <div key={index} className="flex items-center gap-2">
              <button
                onClick={() => handleNavigateToBreadcrumb(index)}
                className={`${
                  index === folderPath.length - 1
                    ? 'text-[#29C762] font-semibold'
                    : 'text-[#818897] hover:text-[#FFFFFF]'
                } transition-colors`}
              >
                {folder.name}
              </button>
              {index < folderPath.length - 1 && (
                <svg className="w-4 h-4 text-[#818897]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Folders */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[#FFFFFF] mb-4">Folders</h3>
          {loadingFolders ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-[#29C762] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#818897]">Loading folders...</p>
            </div>
          ) : folders.length === 0 ? (
            <div className="text-center py-12 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl">
              <div className="p-4 bg-[#29C762]/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#29C762]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <p className="text-[#FFFFFF] font-medium mb-2">No folders yet</p>
              <p className="text-[#818897] text-sm">Create your first folder to get started</p>
            </div>
          ) : (
            <motion.div 
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            key={currentFolderId}
          >
              {folders.map((folder) => (
              <motion.div
                key={folder.id}
                variants={fadeInUp}
                onDoubleClick={() => handleNavigateToFolder(folder)}
                className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-5 hover:border-[#29C762]/50 transition-all duration-200 group cursor-pointer"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#29C762]/10 rounded-lg">
                      <svg className="w-6 h-6 text-[#29C762]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#FFFFFF]">{folder.name}</h4>
                      <p className="text-sm text-[#818897]">{folder._count?.files || 0} files</p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      setSelectedItem(folder);
                      setRenameValue(folder.name);
                      setShowRenameModal(true);
                    }}
                    className="flex-1 px-3 py-2 text-xs text-[#818897] hover:text-[#FFFFFF] hover:bg-white/5 rounded-lg transition-all"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      setSelectedItem(folder);
                      setShowShareModal(true);
                    }}
                    className="flex-1 px-3 py-2 text-xs text-[#818897] hover:text-[#FFFFFF] hover:bg-white/5 rounded-lg transition-all"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => {
                      setSelectedItem(folder);
                      setShowDeleteModal(true);
                    }}
                    className="flex-1 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Files */}
        <div>
          <h3 className="text-lg font-semibold text-[#FFFFFF] mb-4">Files</h3>
          {loadingFiles ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-[#29C762] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#818897]">Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl">
              <p className="text-[#818897]">No files in this folder</p>
            </div>
          ) : (
            <motion.div 
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' : 'space-y-3'}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            key={currentFolderId + '-files'}
          >
              {files.map((file) => (
              <motion.div
                key={file.id}
                variants={fadeInUp}
                className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#29C762]/50 transition-all duration-200"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
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
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleViewFileDetails(file.id)}
                    className="flex-1 py-2 text-xs text-[#29C762] hover:text-[#FFFFFF] hover:bg-[#29C762]/10 rounded-lg transition-all"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="flex-1 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      </div>

      {/* Modals */}
      {showUploadModal && (
        <Modal title="Upload Files" onClose={() => setShowUploadModal(false)}>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <div className="text-center">
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 hover:border-[#29C762]/50 transition-all">
                  <svg className="w-12 h-12 text-[#818897] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-[#FFFFFF] mb-2">Click to select file</p>
                  <p className="text-sm text-[#818897]">Max file size: 50MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={operationLoading}
                />
              </label>
              {uploadProgress > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-[#29C762] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-[#818897] mt-2">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {showCreateFolderModal && (
        <Modal title="Create New Folder" onClose={() => setShowCreateFolderModal(false)}>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#C3C2C4] mb-2">Folder Name</label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="w-full px-4 py-3 bg-[#0B0B0F] border border-white/10 rounded-xl text-[#FFFFFF] placeholder-[#818897] focus:outline-none focus:border-[#29C762]"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                autoFocus
              />
            </div>
            <button 
              onClick={handleCreateFolder}
              disabled={operationLoading || !newFolderName.trim()}
              className="w-full py-3 bg-[#29C762] text-[#0B0B0F] font-semibold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {operationLoading ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </Modal>
      )}

      {showRenameModal && selectedItem && (
        <Modal title="Rename Folder" onClose={() => setShowRenameModal(false)}>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#C3C2C4] mb-2">New Name</label>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0B0F] border border-white/10 rounded-xl text-[#FFFFFF] placeholder-[#818897] focus:outline-none focus:border-[#29C762]"
                onKeyDown={(e) => e.key === 'Enter' && handleRenameFolder()}
                autoFocus
              />
            </div>
            <button 
              onClick={handleRenameFolder}
              disabled={operationLoading || !renameValue.trim()}
              className="w-full py-3 bg-[#29C762] text-[#0B0B0F] font-semibold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {operationLoading ? 'Renaming...' : 'Rename'}
            </button>
          </div>
        </Modal>
      )}

      {showDeleteModal && selectedItem && (
        <Modal title="Delete Folder" onClose={() => setShowDeleteModal(false)}>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <p className="text-[#C3C2C4]">
              Are you sure you want to delete <span className="text-[#FFFFFF] font-semibold">"{selectedItem.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={operationLoading}
                className="flex-1 py-3 border border-white/10 text-[#FFFFFF] font-semibold rounded-xl hover:border-[#29C762] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteFolder}
                disabled={operationLoading}
                className="flex-1 py-3 bg-red-500 text-[#FFFFFF] font-semibold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50">
                {operationLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showFileDetailsModal && selectedFileDetails && (
        <Modal title="File Details" onClose={() => {
          setShowFileDetailsModal(false);
          setSelectedFileDetails(null);
        }}>
          <div className="space-y-4">
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#FFFFFF] break-all">{selectedFileDetails.name}</h3>
                  <p className="text-sm text-[#818897]">{selectedFileDetails.mimeType}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-[#818897]">Size</span>
                  <span className="text-[#FFFFFF] font-medium">{(selectedFileDetails.size / 1024).toFixed(2)} KB</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-[#818897]">Uploaded</span>
                  <span className="text-[#FFFFFF] font-medium">
                    {new Date(selectedFileDetails.createdAt).toLocaleString()}
                  </span>
                </div>
                {selectedFileDetails.folder && (
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-[#818897]">Folder</span>
                    <span className="text-[#FFFFFF] font-medium">{selectedFileDetails.folder.name}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => handleDownloadFile(selectedFileDetails.url, selectedFileDetails.name)}
              className="w-full py-3 bg-[#29C762] text-[#0B0B0F] font-semibold rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download File
            </button>
          </div>
        </Modal>
      )}

      {showShareModal && selectedItem && (
        <Modal title="Share Folder" onClose={() => {
          setShowShareModal(false);
          setShareLink('');
          setSelectedItem(null);
        }}>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-[#C3C2C4] mb-2">
                Link Duration
              </label>
              <select
                value={shareDuration}
                onChange={(e) => setShareDuration(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0B0F] border border-white/10 rounded-xl text-[#FFFFFF] focus:outline-none focus:border-[#29C762]"
              >
                <option value="1d">1 Day</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
              </select>
            </div>

            {!shareLink ? (
              <button
                onClick={handleCreateShareLink}
                disabled={shareLoading}
                className="w-full py-3 bg-[#29C762] text-[#0B0B0F] font-semibold rounded-xl hover:scale-105 transition-all disabled:opacity-50"
              >
                {shareLoading ? 'Generating...' : 'Generate Share Link'}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-xs text-[#818897] mb-2">Share Link</p>
                  <p className="text-sm text-[#FFFFFF] break-all">{shareLink}</p>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="w-full py-3 bg-[#29C762] text-[#0B0B0F] font-semibold rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

// Modal Component with animation
const Modal = ({ title, children, onClose }) => {
  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div 
        className="backdrop-blur-md bg-[#0B0B0F] border border-white/10 rounded-2xl p-6 max-w-md w-full"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#FFFFFF]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#818897] hover:text-[#FFFFFF] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
