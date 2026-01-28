import { useSuspenseQuery, useMutation, QueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { createFolder, listBucketObjects, uploadFile } from '~/app/services/objects.service'
import type { GetBucketInfoResponse } from '~/shared/schemas/bucket.schema'
import { DropdownMenu } from './dropdown-menu'
import { DropdownItem } from './dropdown-item'
import { CreateFolderDialog } from './create-folder-dialog'
import { UploadFileDialog } from './upload-file-dialog'
import { IconBox } from '~/app/components/icon-box'
import { InputGroup, InputGroupAddon } from '~/app/components/input-group'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/text'
import { Button } from '~/app/components/button'
import { TextLink } from '~/app/components/text'

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  size?: number
  modified: string
}

interface ObjectBrowserProps {
  queryClient: QueryClient
  bucket: GetBucketInfoResponse
  prefix?: string | null
  key?: string | null
  bucketId: string
}

export function ObjectBrowser({ queryClient, bucket, prefix, key, bucketId }: ObjectBrowserProps) {
  const bucketParam =
    bucket.globalAliases && bucket.globalAliases.length > 0 && bucket.globalAliases[0]
      ? bucket.globalAliases[0]
      : bucket.id

  const hasAccessKeys = bucket.keys && bucket.keys.length > 0

  const objectsQuery = useSuspenseQuery({
    queryKey: ['objects', bucket.id, prefix, key],
    queryFn: async () => {
      if (!hasAccessKeys) {
        return { data: { commonPrefixes: [], contents: [] } }
      }
      return listBucketObjects({ bucket: bucketParam, prefix: prefix || undefined })
    }
  })

  const createFolderMutation = useMutation({
    mutationFn: async (folderName: string) => {
      return createFolder(
        { bucket: bucketParam, prefix: prefix || undefined },
        { name: folderName }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objects', bucket.id, prefix, key] })
    },
    onError: (error) => {
      console.error('Failed to create folder:', error)
    }
  })

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      return uploadFile({ bucket: bucketParam }, { file })
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

  const fileItems: FileItem[] = React.useMemo(() => {
    const commonPrefixes = objectsQuery.data?.data?.commonPrefixes || []
    const contents = objectsQuery.data?.data?.contents || []

    const folderItemsFromPrefixes = commonPrefixes
      .filter((folder: any) => folder.prefix !== prefix)
      .map((folder: any) => ({
        id: folder.prefix,
        name: folder.prefix.replace(/\/$/, '').replace(prefix || '', ''),
        type: 'folder' as const,
        size: 0,
        modified: new Date().toISOString()
      }))

    const emptyFolders = contents
      .filter((obj: any) => obj.key.endsWith('/') && obj.key !== prefix)
      .map((obj: any) => ({
        id: obj.key,
        name: obj.key.replace(/\/$/, '').replace(prefix || '', ''),
        type: 'folder' as const,
        size: 0,
        modified: obj.lastModified || new Date().toISOString()
      }))

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

  const filteredFiles = React.useMemo(() => {
    if (!filterText) return fileItems
    const lowerFilter = filterText.toLowerCase()
    return fileItems.filter((file) => file.name.toLowerCase().includes(lowerFilter))
  }, [filterText, fileItems])

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
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <InputGroup className='min-w-64 flex-1'>
          <InputGroupAddon align='start'>
            <Lucide.Search className='size-4 text-muted-foreground' />
          </InputGroupAddon>
          <input
            type='text'
            placeholder='Search files and folders...'
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className='bg-transparent py-2 pr-4 pl-2 text-sm outline-none'
          />
          {filterText && (
            <InputGroupAddon align='end'>
              <Button type='button' variant='plain' size='xs-icon' onClick={() => setFilterText('')}>
                <Lucide.X className='size-4' />
              </Button>
            </InputGroupAddon>
          )}
        </InputGroup>

        <Stack direction='row'>
          <Button type='button' variant='outline' onClick={() => setShowCreateFolderDialog(true)} disabled={!hasAccessKeys}>
            <Lucide.FolderPlus className='size-4' />
            Create Folder
          </Button>
          <Button type='button' variant='primary' onClick={() => setShowUploadFileDialog(true)} disabled={!hasAccessKeys}>
            <Lucide.Upload className='size-4' />
            Upload File
          </Button>
        </Stack>
      </div>

      <div className='flex items-center gap-2 rounded-md border-border bg-background px-2 py-1.5'>
        <Link to='/buckets/$id' params={{ id: bucketId }} search={{ prefix: undefined, key: undefined }}>
          <Button variant='plain' size='sm'>
            <Lucide.Home className='size-4' />
          </Button>
        </Link>
        {breadcrumbSegments.length > 0 && (
          <>
            {breadcrumbSegments.map((segment, index) => (
              <React.Fragment key={segment.path}>
                <Lucide.ChevronRight className='size-4 text-muted-foreground' />
                <Link to='/buckets/$id' params={{ id: bucketId }} search={{ prefix: segment.path, key: undefined }}>
                  <Button variant='plain' size='sm'>
                    <TextLink className={index === breadcrumbSegments.length - 1 ? 'font-semibold' : ''}>
                      {segment.name}
                    </TextLink>
                  </Button>
                </Link>
              </React.Fragment>
            ))}
          </>
        )}
      </div>

      <div className='overflow-hidden rounded-lg border-border bg-background'>
        <div className='grid grid-cols-12 gap-4 border-b border-border bg-muted/30 px-6 py-3'>
          <Text className='col-span-6 text-xs font-medium tracking-wider text-muted-foreground uppercase'>
            Name
          </Text>
          <Text className='col-span-3 text-xs font-medium tracking-wider text-muted-foreground uppercase'>
            Size
          </Text>
          <Text className='col-span-3 text-xs font-medium tracking-wider text-muted-foreground uppercase'>
            Last Modified
          </Text>
        </div>

        {folders.length > 0 && (
          <div className='divide-y divide-border'>
            {folders.map((folder) => (
              <Link
                key={folder.id}
                to='/buckets/$id'
                params={{ id: bucketId }}
                search={{ prefix: folder.id, key: undefined }}
                className='relative grid grid-cols-12 items-center gap-4 px-6 py-3 transition-all hover:bg-muted/50'
              >
                <div className='col-span-6 flex items-center gap-3'>
                  <IconBox variant='info' size='sm'>
                    <Lucide.Folder className='size-5' />
                  </IconBox>
                  <Text className='text-sm font-medium'>{folder.name}</Text>
                </div>
                <div className='col-span-3 text-sm text-muted-foreground'>-</div>
                <div className='col-span-3 text-sm text-muted-foreground'>
                  {formatDate(folder.modified)}
                </div>
                <div className='absolute top-1/2 right-2 -translate-y-1/2'>
                  <DropdownMenu
                    isOpen={activeDropdown === folder.id}
                    onClose={() => setActiveDropdown(null)}
                  >
                    <DropdownItem icon={Lucide.Share} onClick={() => handleShare(folder)}>
                      Share
                    </DropdownItem>
                    <DropdownItem icon={Lucide.Trash2} onClick={() => handleDelete(folder)} danger>
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                </div>
              </Link>
            ))}
          </div>
        )}

        {folders.length > 0 && files.length > 0 && <div className='border-b border-border' />}

        {files.length > 0 && (
          <div className='divide-y divide-border'>
            {files.map((file) => (
              <div
                key={file.id}
                className='relative grid grid-cols-12 items-center gap-4 px-6 py-3 transition-all hover:bg-muted/50 cursor-pointer'
              >
                <div className='col-span-6 flex items-center gap-3'>
                  <IconBox variant='tertiary-subtle' size='sm'>
                    <Lucide.File className='size-5' />
                  </IconBox>
                  <Text className='text-sm font-medium'>{file.name}</Text>
                </div>
                <div className='col-span-3 text-sm text-muted-foreground'>{formatFileSize(file.size)}</div>
                <div className='col-span-3 text-sm text-muted-foreground'>{formatDate(file.modified)}</div>
                <div className='absolute top-1/2 right-2 -translate-y-1/2'>
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
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredFiles.length === 0 && (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            {!hasAccessKeys ? (
              <>
                <IconBox variant='tertiary-subtle' size='lg' circle>
                  <Lucide.Lock className='size-12' />
                </IconBox>
                <Stack>
                  <Text className='text-base font-medium'>No access keys assigned</Text>
                  <Text className='text-sm text-muted-foreground'>
                    Assign access keys to this bucket to view and manage objects
                  </Text>
                </Stack>
              </>
            ) : (
              <>
                <IconBox variant='tertiary-subtle' size='lg' circle>
                  <Lucide.FolderOpen className='size-12' />
                </IconBox>
                <Stack>
                  <Text className='text-base font-medium'>No files or folders found</Text>
                  <Text className='text-sm text-muted-foreground'>
                    {filterText
                      ? 'Try adjusting your search'
                      : 'Upload files or create folders to get started'}
                  </Text>
                </Stack>
              </>
            )}
          </div>
        )}
      </div>

      <React.Suspense
        fallback={
          <div className='animate-in fade-in flex items-center justify-center py-8'>
            <div className='flex flex-col items-center'>
              <svg className='size-6 animate-spin' fill='none' viewBox='0 0 24 24' data-slot='spinner'>
                <path d='M21 12a9 9 0 1 1-6.219' />
              </svg>
              <Text className='mt-4 text-sm text-muted-foreground'>Loading folder...</Text>
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

      <React.Suspense
        fallback={
          <div className='animate-in fade-in flex items-center justify-center py-8'>
            <div className='flex flex-col items-center'>
              <svg className='size-6 animate-spin' fill='none' viewBox='0 0 24 24' data-slot='spinner'>
                <path d='M21 12a9 9 0 1 1-6.219' />
              </svg>
              <Text className='mt-4 text-sm text-muted-foreground'>Loading upload dialog...</Text>
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
