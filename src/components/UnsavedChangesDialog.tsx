export type UnsavedChangesChoice = "save" | "discard" | "cancel";

interface UnsavedChangesDialogProps {
  fileName: string;
  onChoice: (choice: UnsavedChangesChoice) => void;
}

export function UnsavedChangesDialog({ fileName, onChoice }: UnsavedChangesDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unsaved-changes-title"
        className="w-[420px] rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-elevated)]"
      >
        <h2 id="unsaved-changes-title" className="text-[15px] font-semibold text-[var(--text-primary)]">
          Save changes to {fileName}?
        </h2>
        <p className="mt-1.5 text-[13px] text-[var(--text-secondary)]">
          Your changes will be lost if you don't save them.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onChoice("cancel")}
            className="rounded-md px-3.5 py-1.5 text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onChoice("discard")}
            className="rounded-md px-3.5 py-1.5 text-[13px] font-medium text-[var(--danger)] hover:bg-[var(--danger-soft)]"
          >
            Don't Save
          </button>
          <button
            type="button"
            onClick={() => onChoice("save")}
            className="rounded-md bg-[var(--accent)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)]"
            autoFocus
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
