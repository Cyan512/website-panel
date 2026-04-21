import { Button } from "./button";
import { Modal, ModalFooter } from "./modal";

type ConfirmVariant = "danger" | "primary";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ConfirmVariant;
  isConfirmLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmVariant = "primary",
  isConfirmLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-3">
        {description && <p className="text-base text-text-muted">{description}</p>}
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={isConfirmLoading}>
          {cancelText}
        </Button>
        <Button
          variant={confirmVariant}
          onClick={() => void onConfirm()}
          isLoading={isConfirmLoading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

