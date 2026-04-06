import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'

export function ConfirmDeleteModal({
  open,
  title = 'Are you sure?',
  onCancel,
  onConfirm,
}: {
  open: boolean
  title?: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onClose={onCancel} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
          <DialogTitle as={DialogTitle} className="text-base font-semibold text-slate-900">
            {title}
          </DialogTitle>
          <p className="mt-2 text-sm text-slate-700">Are you sure? This cannot be undone.</p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="rounded-md border px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

