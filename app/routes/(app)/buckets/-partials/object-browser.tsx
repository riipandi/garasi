import { useSuspenseQuery, useMutation, QueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { createFolder, listObjects, uploadFile } from '~/app/services'
import type { Bucket } from './types'

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

// File item types
interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: number
  modified: string
}

interface ObjectBrowserProps {
  queryClient: QueryClient
  bucket: Bucket
  prefix?: string | null
  key?: string | null
  bucketId: string
}

export function ObjectBrowser({ queryClient, bucket, prefix, key, bucketId }: ObjectBrowserProps) {
  const bucketParam = bucket.globalAliases[0] || bucket.id

  // Query to fetch bucket objects with prefix and key support
  const objectsQuery = useSuspenseQuery({
    queryKey: ['objects', bucket.id, prefix, key],
    queryFn: async () => listObjects(bucketParam, prefix, key)
  })

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (folderName: string) => {
      // Prepend prefix to folder name if we're in a subdirectory
      const fullFolderName = prefix ? `${prefix}${folderName}/` : `${folderName}/`
      return createFolder(bucketParam, fullFolderName)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objects', bucket.id, prefix, key] })
    },
    onError: (error) => {
      console.error('Failed to create folder:', error)
    }
  })

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      return uploadFile(bucketParam, file, prefix || undefined)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objects', bucket.id, prefix, key] })
    },
    onError: (error) => {
      console.error('Failed to upload file:', error)
    }
  })

  const [filterText, setFilterText] = React.useState('')
  const [showCreateFolderDialog, setShowCreateFolderDialog] = React.useState(false)
  const [showUploadFileDialog, setShowUploadFileDialog] = React.useState(false)
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null)
  const [isCreatingFolder, setIsCreatingFolder] = React.useState(false)
  const [isUploadingFile, setIsUploadingFile] = React.useState(false)

  // Transform API data to FileItem format
  // In S3 with delimiter, folders are in commonPrefixes and files are in contents
  // Empty folders (folder markers) may also appear in contents with trailing slash
  const fileItems: FileItem[] = React.useMemo(() => {
    const commonPrefixes = objectsQuery.data?.commonPrefixes || []
    const contents = objectsQuery.data?.contents || []

    // Get folders from commonPrefixes (folders with content)
    // Filter out the current prefix to avoid showing the selected folder itself
    const folderItemsFromPrefixes = commonPrefixes
      .filter((folder: any) => folder.prefix !== prefix)
      .map((folder: any) => ({
        id: folder.prefix,
        name: folder.prefix.replace(/\/$/, '').replace(prefix || '', ''), // Remove prefix and trailing slash for display
        type: 'folder' as const,
        size: 0,
        modified: new Date().toISOString() // Folders don't have lastModified in S3
      }))

    // Get empty folders from contents (folder markers with trailing slash)
    // Filter out the current prefix to avoid showing the selected folder itself
    const emptyFolders = contents
      .filter((obj: any) => obj.key.endsWith('/') && obj.key !== prefix)
      .map((obj: any) => ({
        id: obj.key,
        name: obj.key.replace(/\/$/, '').replace(prefix || '', ''),
        type: 'folder' as const,
        size: 0,
        modified: obj.lastModified || new Date().toISOString()
      }))

    // Get files (exclude folder markers)
    const fileItems = contents
      .filter((obj: any) => !obj.key.endsWith('/'))
      .map((obj: any) => ({
        id: obj.key,
        name: obj.key.replace(prefix || '', ''),
        type: 'file' as const,
        size: obj.size,
        modified: obj.lastModified
      }))

    return [...folderItemsFromPrefixes, ...emptyFolders, ...fileItems]
  }, [objectsQuery.data, prefix])

  // Filter files based on search text
  const filteredFiles = React.useMemo(() => {
    if (!filterText) return fileItems
    const lowerFilter = filterText.toLowerCase()
    return fileItems.filter((file) => file.name.toLowerCase().includes(lowerFilter))
  }, [filterText, fileItems])

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
    try {
      await createFolderMutation.mutateAsync(folderName)
      setShowCreateFolderDialog(false)
    } finally {
      setIsCreatingFolder(false)
    }
  }

  const handleUploadFiles = async (files: File[]) => {
    setIsUploadingFile(true)
    try {
      // Upload files one by one
      for (const file of files) {
        await uploadFileMutation.mutateAsync(file)
      }
      setShowUploadFileDialog(false)
    } catch (error) {
      console.error('Failed to upload files:', error)
    } finally {
      setIsUploadingFile(false)
    }
  }

  // Generate breadcrumb path segments
  const breadcrumbSegments = React.useMemo(() => {
    if (!prefix) return []
    const segments = prefix.split('/').filter(Boolean)
    return segments.map((segment, index) => ({
      name: segment,
      path: segments.slice(0, index + 1).join('/') + '/'
    }))
  }, [prefix])

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
        <Link
          to='/buckets/$id'
          params={{ id: bucketId }}
          search={{ prefix: undefined, key: undefined }}
          className='flex items-center gap-2 rounded-md px-2 py-1 text-gray-600 transition-all hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
        >
          <Lucide.Home className='size-4' />
          <span className='font-medium'>Root</span>
        </Link>
        {breadcrumbSegments.length > 0 && (
          <>
            {breadcrumbSegments.map((segment, index) => (
              <React.Fragment key={segment.path}>
                <Lucide.ChevronRight className='size-4 text-gray-400' />
                <Link
                  to='/buckets/$id'
                  params={{ id: bucketId }}
                  search={{ prefix: segment.path, key: undefined }}
                  className='flex items-center gap-2 rounded-md px-2 py-1 text-gray-600 transition-all hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
                >
                  <span
                    className={
                      index === breadcrumbSegments.length - 1 ? 'font-medium text-gray-900' : ''
                    }
                  >
                    {segment.name}
                  </span>
                </Link>
              </React.Fragment>
            ))}
          </>
        )}
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
              <Link
                key={folder.id}
                to='/buckets/$id'
                params={{ id: bucketId }}
                search={{ prefix: folder.id, key: undefined }}
                className='relative grid grid-cols-12 items-center gap-4 px-6 py-3 transition-all hover:bg-gray-50'
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
                <div
                  className='absolute top-1/2 right-2 -translate-y-1/2'
                  onClick={(e) => e.preventDefault()}
                >
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
              </Link>
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
