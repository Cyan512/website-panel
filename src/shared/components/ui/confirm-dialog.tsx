import { useState, useEffect } from "react";
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
  confirmationText?: string;
  confirmationLabel?: string;
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
  confirmationText,
  confirmationLabel,
  onConfirm,
}: ConfirmDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const isConfirmed = confirmationText ? inputValue.trim().toLowerCase() === confirmationText.toLowerCase() : true;

  useEffect(() => {
    if (!isOpen) setInputValue("");
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        {description && <p className="text-base text-text-muted">{description}</p>}
        {confirmationText && (
          <div className="space-y-2">
            {confirmationLabel && (
              <label className="block text-sm font-medium text-text-secondary">
                {confirmationLabel}
              </label>
            )}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Escribe "${confirmationText}" para confirmar`}
              className="field-input w-full rounded-xl py-2.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50"
              autoFocus
            />
          </div>
        )}
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={isConfirmLoading}>
          {cancelText}
        </Button>
        <Button
          variant={confirmVariant}
          onClick={() => void onConfirm()}
          isLoading={isConfirmLoading}
          disabled={!isConfirmed}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

