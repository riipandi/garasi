import { QueryClient, useMutation } from '@tanstack/react-query'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { fetcher } from '~/app/fetcher'
import type { ConnectNodeResponse } from './types'

interface ConnectNodesDialogProps {
  isOpen: boolean
  onClose: () => void
  queryClient: QueryClient
}

export function ConnectNodesDialog({ isOpen, onClose, queryClient }: ConnectNodesDialogProps) {
  const [nodes, setNodes] = React.useState<string[]>([''])
  const [errors, setErrors] = React.useState<Record<number, string>>({})

  const connectMutation = useMutation({
    mutationFn: (nodeList: string[]) =>
      fetcher<{ success: boolean; data: ConnectNodeResponse[] }>('/cluster/connect-nodes', {
        method: 'POST',
        body: { nodes: nodeList.filter((n) => n.trim() !== '') }
      }),
    onSuccess: () => {
      // Invalidate cluster queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['cluster', 'health'] })
      queryClient.invalidateQueries({ queryKey: ['cluster', 'status'] })
      queryClient.invalidateQueries({ queryKey: ['cluster', 'statistics'] })
      onClose()
    },
    onError: (error) => {
      console.error('Failed to connect nodes:', error)
    }
  })

  const handleNodeChange = (index: number, value: string) => {
    const newNodes = [...nodes]
    newNodes[index] = value
    setNodes(newNodes)

    // Clear error for this node if value is valid
    if (isValidNodeAddress(value)) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[index]
        return newErrors
      })
    }
  }

  const handleAddNode = () => {
    setNodes([...nodes, ''])
  }

  const handleRemoveNode = (index: number) => {
    if (nodes.length > 1) {
      const newNodes = nodes.filter((_, i) => i !== index)
      setNodes(newNodes)
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[index]
        return newErrors
      })
    }
  }

  const isValidNodeAddress = (address: string): boolean => {
    if (!address.trim()) return false
    // Validate format: node_id@net_address
    const regex = /^.+@.+$/i
    return regex.test(address.trim())
  }

  const validateAllNodes = (): boolean => {
    const newErrors: Record<number, string> = {}
    let isValid = true

    nodes.forEach((node, index) => {
      if (node.trim() && !isValidNodeAddress(node)) {
        newErrors[index] = 'Invalid format. Expected: node_id@net_address'
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleConnect = () => {
    if (validateAllNodes()) {
      const validNodes = nodes.filter((n) => n.trim() !== '')
      if (validNodes.length > 0) {
        connectMutation.mutate(validNodes)
      }
    }
  }

  const handleClose = () => {
    if (!connectMutation.isPending) {
      setNodes([''])
      setErrors({})
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className='animate-in zoom-in-95 fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm duration-200'>
      <div className='w-full max-w-lg rounded-lg border border-gray-200 bg-white p-4 shadow-lg sm:p-6'>
        <div className='mb-6'>
          <div className='mb-4 flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100'>
              <Lucide.Plus className='size-5 text-blue-600' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-gray-900 sm:text-xl'>
                Connect Cluster Nodes
              </h2>
              <p className='text-sm text-gray-500'>Add new nodes to your Garage cluster</p>
            </div>
          </div>

          <div className='mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3'>
            <div className='flex items-start gap-2'>
              <Lucide.Info className='mt-0.5 size-4 shrink-0 text-blue-600' />
              <p className='text-xs text-blue-800'>
                Enter node addresses in the format:{' '}
                <code className='rounded bg-blue-100 px-1 py-0.5'>node_id@net_address</code>
                <br />
                Example:{' '}
                <code className='rounded bg-blue-100 px-1 py-0.5'>node1@192.168.1.10:3901</code>
              </p>
            </div>
          </div>

          <div className='space-y-3'>
            {nodes.map((node, index) => (
              <div key={index} className='flex items-start gap-2'>
                <div className='flex-1'>
                  <label htmlFor={`node-${index}`} className='sr-only'>
                    Node Address
                  </label>
                  <input
                    id={`node-${index}`}
                    type='text'
                    value={node}
                    onChange={(e) => handleNodeChange(index, e.target.value)}
                    placeholder='node_id@net_address'
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
                      errors[index]
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                    disabled={connectMutation.isPending}
                  />
                  {errors[index] && <p className='mt-1 text-xs text-red-600'>{errors[index]}</p>}
                </div>
                {nodes.length > 1 && (
                  <button
                    type='button'
                    onClick={() => handleRemoveNode(index)}
                    disabled={connectMutation.isPending}
                    className='mt-1 rounded-md border border-gray-300 bg-white p-2 text-gray-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50'
                  >
                    <Lucide.X className='size-4' />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type='button'
            onClick={handleAddNode}
            disabled={connectMutation.isPending}
            className='mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-100 disabled:opacity-50'
          >
            <Lucide.Plus className='size-4' />
            Add Another Node
          </button>
        </div>

        <div className='flex justify-end gap-3'>
          <button
            type='button'
            onClick={handleClose}
            disabled={connectMutation.isPending}
            className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleConnect}
            disabled={connectMutation.isPending || nodes.every((n) => !n.trim())}
            className={`rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
              connectMutation.isPending ? 'animate-pulse' : ''
            }`}
          >
            {connectMutation.isPending ? (
              <span className='flex items-center gap-2'>
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
                Connecting...
              </span>
            ) : (
              'Connect Nodes'
            )}
          </button>
        </div>

        {/* Connection Results */}
        {connectMutation.data?.data && (
          <div className='mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3'>
            <h4 className='mb-2 text-sm font-medium text-gray-900'>Connection Results</h4>
            <div className='space-y-1'>
              {connectMutation.data.data.map((result, index) => (
                <div key={index} className='flex items-center gap-2 text-xs'>
                  {result.success ? (
                    <>
                      <Lucide.CheckCircle2 className='size-3.5 text-green-600' />
                      <span className='text-green-700'>Node connected successfully</span>
                    </>
                  ) : (
                    <>
                      <Lucide.XCircle className='size-3.5 text-red-600' />
                      <span className='text-red-700'>{result.error || 'Connection failed'}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
