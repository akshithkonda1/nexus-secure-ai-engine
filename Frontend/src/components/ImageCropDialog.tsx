import { Dialog, Transition } from "@headlessui/react";
import Cropper from "react-easy-crop";
import React, { Fragment, useCallback, useState } from "react";

type Props = {
  open: boolean;
  src: string;                 // data URL to crop
  onClose: () => void;
  onCropped: (dataUrl: string) => void;
  square?: boolean;
};

export default function ImageCropDialog({ open, src, onClose, onCropped, square = true }: Props) {
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState<{x:number;y:number}>({ x:0, y:0 });
  const [area, setArea] = useState<any>(null);

  const aspect = square ? 1 : 4/3;

  const createCrop = useCallback(async () => {
    if (!area) return;
    const image = new Image();
    image.src = src;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width  = area.width;
    canvas.height = area.height;
    const ctx = canvas.getContext("2d")!;

    const scaleX = image.naturalWidth  / (area?.naturalWidth ?? image.naturalWidth);
    const scaleY = image.naturalHeight / (area?.naturalHeight ?? image.naturalHeight);

    ctx.drawImage(
      image,
      area.x * scaleX, area.y * scaleY,
      area.width * scaleX, area.height * scaleY,
      0, 0, area.width, area.height
    );
    const cropped = canvas.toDataURL("image/jpeg", 0.92);
    onCropped(cropped);
    onClose();
  }, [area, onClose, onCropped, src]);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[110]" onClose={onClose}>
        <Transition.Child as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-[rgba(3,7,18,0.55)] backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-[120] grid place-items-center p-4">
          <Transition.Child as={Fragment}
            enter="ease-out duration-200" enterFrom="translate-y-6 opacity-0" enterTo="translate-y-0 opacity-100"
            leave="ease-in duration-150"  leaveFrom="translate-y-0 opacity-100" leaveTo="translate-y-4 opacity-0">
            <Dialog.Panel className="panel w-full max-w-2xl overflow-hidden p-0">
              <div className="relative h-[420px] bg-black/40">
                <Cropper
                  image={src}
                  aspect={aspect}
                  crop={crop}
                  zoom={zoom}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, areaPixels) => setArea(areaPixels)}
                  restrictPosition
                  showGrid
                />
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <input
                  aria-label="Zoom"
                  type="range" min={1} max={3} step={0.01}
                  value={zoom} onChange={(e)=>setZoom(Number(e.target.value))}
                  className="w-48"
                />
                <div className="flex gap-2">
                  <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                  <button className="btn btn-primary" onClick={createCrop}>Save crop</button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
