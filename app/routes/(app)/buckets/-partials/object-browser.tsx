import * as Lucide from 'lucide-react'
import * as React from 'react'

// Code split components using React.lazy
const DropdownMenu = React.lazy(() =>
  import('./dropdown-menu').then((m) => ({ default: m.DropdownMenu }))
)
const DropdownItem = React.lazy(() =>
  import('./dropdown-item').then((m) => ({ default: m.DropdownItem }))
)
const CreateFolderDialog = React.lazy(() =>
  import('./create-folder-dialog').then((m) => ({ default: m.CreateFolderDialog }))
)
const UploadFileDialog = React.lazy(() =>
  import('./upload-file-dialog').then((m) => ({ default: m.UploadFileDialog }))
)

// Dummy data types
interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: number
  modified: string
}

// Dummy data
const dummyFiles: FileItem[] = [
  { id: '1', name: 'documents', type: 'folder', modified: '2024-01-15T10:30:00Z' },
  { id: '2', name: 'images', type: 'folder', modified: '2024-01-14T14:20:00Z' },
  { id: '3', name: 'report.pdf', type: 'file', size: 1024000, modified: '2024-01-13T09:15:00Z' },
  { id: '4', name: 'data.json', type: 'file', size: 51200, modified: '2024-01-12T16:45:00Z' },
  { id: '5', name: 'backup.zip', type: 'file', size: 10485760, modified: '2024-01-11T11:00:00Z' },
  { id: '6', name: 'config.xml', type: 'file', size: 2048, modified: '2024-01-10T08:30:00Z' },
  { id: '7', name: 'videos', type: 'folder', modified: '2024-01-09T13:20:00Z' },
  { id: '8', name: 'readme.txt', type: 'file', size: 1024, modified: '2024-01-08T10:00:00Z' }
]

export function ObjectBrowser() {
  const [filterText, setFilterText] = React.useState('')
  const [showCreateFolderDialog, setShowCreateFolderDialog] = React.useState(false)
  const [showUploadFileDialog, setShowUploadFileDialog] = React.useState(false)
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null)
  const [isCreatingFolder, setIsCreatingFolder] = React.useState(false)
  const [isUploadingFile, setIsUploadingFile] = React.useState(false)

  // Filter files based on search text
  const filteredFiles = React.useMemo(() => {
    if (!filterText) return dummyFiles
    const lowerFilter = filterText.toLowerCase()
    return dummyFiles.filter((file) => file.name.toLowerCase().includes(lowerFilter))
  }, [filterText])

  // Separate folders and files
  const folders = filteredFiles.filter((file) => file.type === 'folder')
  const files = filteredFiles.filter((file) => file.type === 'file')

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleShare = (item: FileItem) => {
    console.log('Share', item)
    setActiveDropdown(null)
  }

  const handleDownload = (item: FileItem) => {
    console.log('Download', item)
    setActiveDropdown(null)
  }

  const handleDelete = (item: FileItem) => {
    console.log('Delete', item)
    setActiveDropdown(null)
  }

  const handleCreateFolder = async (folderName: string) => {
    setIsCreatingFolder(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsCreatingFolder(false)
    setShowCreateFolderDialog(false)
    console.log('Creating folder:', folderName)
  }

  const handleUploadFiles = async (files: File[]) => {
    setIsUploadingFile(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsUploadingFile(false)
    setShowUploadFileDialog(false)
    console.log('Uploading files:', files)
  }

  return (
    <div className='space-y-4'>
      {/* Toolbar */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        {/* Search/Filter */}
        <div className='relative min-w-64 flex-1'>
          <div className='pointer-events-none absolute left-3 flex h-full items-center'>
            <Lucide.Search className='size-4 text-gray-400' />
          </div>
          <input
            type='text'
            placeholder='Search files and folders...'
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className='w-full rounded-md border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
          />
          {filterText && (
            <button
              type='button'
              onClick={() => setFilterText('')}
              className='absolute top-1.5 right-2 rounded p-1 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
              title='Clear search'
            >
              <Lucide.X className='size-4' />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={() => setShowCreateFolderDialog(true)}
            className='flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
          >
            <Lucide.FolderPlus className='size-4' />
            Create Folder
          </button>
          <button
            type='button'
            onClick={() => setShowUploadFileDialog(true)}
            className='flex items-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
          >
            <Lucide.Upload className='size-4' />
            Upload File
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className='flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm shadow-xs'>
        <button className='flex items-center gap-2 rounded-md px-2 py-1 text-gray-600 transition-all hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'>
          <Lucide.Home className='size-4' />
          <span className='font-medium'>Root</span>
        </button>
      </div>

      {/* File List */}
      <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xs'>
        {/* Table Header */}
        <div className='grid grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50 px-6 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase'>
          <div className='col-span-6'>Name</div>
          <div className='col-span-3'>Size</div>
          <div className='col-span-3'>Last Modified</div>
        </div>

        {/* Folders */}
        {folders.length > 0 && (
          <div className='divide-y divide-gray-200'>
            {folders.map((folder) => (
              <div
                key={folder.id}
                className='relative grid cursor-pointer grid-cols-12 items-center gap-4 px-6 py-3 transition-all hover:bg-gray-50'
              >
                <div className='col-span-6 flex items-center gap-3'>
                  <Lucide.Folder className='size-5 text-blue-500' />
                  <span className='text-sm text-gray-900'>{folder.name}</span>
                </div>
                <div className='col-span-3 text-sm text-gray-500'>-</div>
                <div className='col-span-3 text-sm text-gray-500'>
                  {formatDate(folder.modified)}
                </div>
                {/* Action Menu Button */}
                <div className='absolute top-1/2 right-2 -translate-y-1/2'>
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveDropdown(activeDropdown === folder.id ? null : folder.id)
                    }}
                    className='rounded p-1 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
                    title='Actions'
                  >
                    <Lucide.MoreVertical className='size-4' />
                  </button>
                  <React.Suspense
                    fallback={
                      <div className='absolute top-full right-0 z-50 mt-1'>
                        <svg className='size-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          />
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          />
                        </svg>
                      </div>
                    }
                  >
                    <DropdownMenu
                      isOpen={activeDropdown === folder.id}
                      onClose={() => setActiveDropdown(null)}
                    >
                      <DropdownItem icon={Lucide.Share} onClick={() => handleShare(folder)}>
                        Share
                      </DropdownItem>
                      <DropdownItem
                        icon={Lucide.Trash2}
                        onClick={() => handleDelete(folder)}
                        danger
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </React.Suspense>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Divider between folders and files */}
        {folders.length > 0 && files.length > 0 && <div className='border-b border-gray-200' />}

        {/* Files */}
        {files.length > 0 && (
          <div className='divide-y divide-gray-200'>
            {files.map((file) => (
              <div
                key={file.id}
                className='relative grid cursor-pointer grid-cols-12 items-center gap-4 px-6 py-3 transition-all hover:bg-gray-50'
              >
                <div className='col-span-6 flex items-center gap-3'>
                  <Lucide.File className='size-5 text-gray-400' />
                  <span className='text-sm text-gray-900'>{file.name}</span>
                </div>
                <div className='col-span-3 text-sm text-gray-500'>{formatFileSize(file.size)}</div>
                <div className='col-span-3 text-sm text-gray-500'>{formatDate(file.modified)}</div>
                {/* Action Menu Button */}
                <div className='absolute top-1/2 right-2 -translate-y-1/2'>
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveDropdown(activeDropdown === file.id ? null : file.id)
                    }}
                    className='rounded p-1 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
                    title='Actions'
                  >
                    <Lucide.MoreVertical className='size-4' />
                  </button>
                  <React.Suspense
                    fallback={
                      <div className='absolute top-full right-0 z-50 mt-1'>
                        <svg className='size-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          />
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          />
                        </svg>
                      </div>
                    }
                  >
                    <DropdownMenu
                      isOpen={activeDropdown === file.id}
                      onClose={() => setActiveDropdown(null)}
                    >
                      <DropdownItem icon={Lucide.Download} onClick={() => handleDownload(file)}>
                        Download
                      </DropdownItem>
                      <DropdownItem icon={Lucide.Share} onClick={() => handleShare(file)}>
                        Share
                      </DropdownItem>
                      <DropdownItem icon={Lucide.Trash2} onClick={() => handleDelete(file)} danger>
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </React.Suspense>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredFiles.length === 0 && (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <Lucide.FolderOpen className='size-12 text-gray-400' />
            <p className='mt-4 text-sm font-medium text-gray-700'>No files or folders found</p>
            <p className='mt-1 text-xs text-gray-500'>
              {filterText
                ? 'Try adjusting your search'
                : 'Upload files or create folders to get started'}
            </p>
          </div>
        )}
      </div>

      {/* Create Folder Dialog */}
      <React.Suspense
        fallback={
          <div className='animate-in fade-in flex items-center justify-center py-8'>
            <div className='flex flex-col items-center'>
              <svg className='size-6 animate-spin' fill='none' viewBox='0 0 24 24'>
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
              <p className='mt-4 text-sm text-gray-600'>Loading dialog...</p>
            </div>
          </div>
        }
      >
        <CreateFolderDialog
          isOpen={showCreateFolderDialog}
          onClose={() => setShowCreateFolderDialog(false)}
          onCreate={handleCreateFolder}
          isSubmitting={isCreatingFolder}
        />
      </React.Suspense>

      {/* Upload File Dialog */}
      <React.Suspense
        fallback={
          <div className='animate-in fade-in flex items-center justify-center py-8'>
            <div className='flex flex-col items-center'>
              <svg className='size-6 animate-spin' fill='none' viewBox='0 0 24 24'>
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
              <p className='mt-4 text-sm text-gray-600'>Loading dialog...</p>
            </div>
          </div>
        }
      >
        <UploadFileDialog
          isOpen={showUploadFileDialog}
          onClose={() => setShowUploadFileDialog(false)}
          onUpload={handleUploadFiles}
          isSubmitting={isUploadingFile}
        />
      </React.Suspense>
    </div>
  )
}
