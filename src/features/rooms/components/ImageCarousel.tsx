import { useState } from "react";
import { Modal } from "@/components";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

interface Props {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  initialIndex?: number;
}

export function ImageCarousel({ images, isOpen, onClose, title, initialIndex = 0 }: Props) {
  const [current, setCurrent] = useState(initialIndex);

  if (images.length === 0) return null;

  const prev = () => setCurrent((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setCurrent((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <div className="flex flex-col items-center gap-4">
        {/* Main image */}
        <div className="relative w-full flex items-center justify-center bg-black rounded-xl overflow-hidden aspect-video">
          <img
            src={images[current]}
            alt={`Imagen ${current + 1}`}
            className="w-full h-full object-contain"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
              >
                <MdChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
              >
                <MdChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
            {current + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 justify-center overflow-x-auto pb-1">
            {images.map((url, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  i === current ? "border-accent-primary scale-105" : "border-border opacity-60 hover:opacity-90"
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
