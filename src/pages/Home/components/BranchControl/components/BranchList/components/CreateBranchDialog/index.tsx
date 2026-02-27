import type { Dispatch, SetStateAction } from "react"
import styles from "./index.module.css"

export interface CreateBranchDialogState {
  visible: boolean
  fromBranch: string
  branchName: string
  checkout: boolean
  force: boolean
  errorMessage: string | null
}

interface CreateBranchDialogProps {
  dialog: CreateBranchDialogState
  localBranches: string[]
  isBranchNameDuplicated: boolean
  onClose: () => void
  onSubmit: () => void
  setDialog: Dispatch<SetStateAction<CreateBranchDialogState>>
}

const CreateBranchDialog = ({
  dialog,
  localBranches,
  isBranchNameDuplicated,
  onClose,
  onSubmit,
  setDialog,
}: CreateBranchDialogProps) => {
  if (!dialog.visible) return null

  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialog} onClick={(event) => event.stopPropagation()}>
        <div className={styles.dialogTitle}>
          从 {dialog.fromBranch} 创建分支
        </div>
        <div className={styles.closeButton} onClick={onClose} />
        {dialog.errorMessage && (
          <div className={styles.dialogError}>{dialog.errorMessage}</div>
        )}
        <div className={styles.dialogInputContainer}>
          <label className={styles.dialogLabel} htmlFor="create-branch-input">分支名称:</label>
          <input
            id="create-branch-input"
            type="text"
            autoComplete="off"
            className={styles.dialogInput}
            value={dialog.branchName}
            onChange={(event) => {
              const nextBranchName = event.target.value
              const duplicated = localBranches.includes(nextBranchName.trim())
              setDialog((prev) => ({
                ...prev,
                branchName: nextBranchName,
                force: duplicated ? prev.force : false,
                errorMessage: null,
              }))
            }}
          />
        </div>

        <div className={styles.dialogCheckboxContainer}>
          <label className={styles.dialogCheckbox}>
            <input
              type="checkbox"
              className={styles.dialogCheckboxInput}
              checked={dialog.checkout}
              onChange={(event) => {
                setDialog((prev) => ({
                  ...prev,
                  checkout: event.target.checked,
                }))
              }}
            />
            <span>签出分支</span>
          </label>
          <label className={styles.dialogCheckbox}>
            <input
              type="checkbox"
              className={styles.dialogCheckboxInput}
              checked={dialog.force}
              disabled={!isBranchNameDuplicated}
              onChange={(event) => {
                setDialog((prev) => ({
                  ...prev,
                  force: event.target.checked,
                }))
              }}
            />
            <span>覆盖现有分支</span>
          </label>
        </div>

        <div className={styles.dialogActions}>
          <button type="button" className={styles.dialogCreateButton} onClick={onSubmit}>
            创建
          </button>
          <button type="button" className={styles.dialogCancelButton} onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateBranchDialog
