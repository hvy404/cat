"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, Edit2, User, X, RefreshCw } from "lucide-react";
import Cropper from "react-easy-crop";
import { uploadProfilePicture } from "@/lib/workers/profile-picture-upload";
import { checkProfilePicture } from "@/lib/workers/profile-picture-check-existing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProfilePictureUploadProps {
  userId: string;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  userId,
}) => {
  const [uploading, setUploading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      const pictureUrl = await checkProfilePicture(userId);
      if (pictureUrl) {
        setProfilePicture(pictureUrl);
      }
    };

    fetchProfilePicture();
  }, [userId]);

  const handleFileChange = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = reader.result as string;
      setOriginalImage(imageDataUrl);
      setCroppedImage(null);
      setDialogOpen(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileChange(acceptedFiles[0]);
    }
  }, [handleFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const onCropComplete = useCallback(
    (croppedArea: CropArea, croppedAreaPixels: CropArea) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: CropArea) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    const size = 256;
    canvas.width = size;
    canvas.height = size;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      size,
      size
    );

    ctx.globalCompositeOperation = "destination-in";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    return new Promise<string>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedImageUrl = URL.createObjectURL(blob);
          resolve(croppedImageUrl);
        }
      }, "image/png");
    });
  };

  const handleCrop = async () => {
    if (originalImage && croppedAreaPixels) {
      const croppedImageUrl = await getCroppedImg(
        originalImage,
        croppedAreaPixels
      );
      if (croppedImageUrl) {
        setCroppedImage(croppedImageUrl);
        setDialogOpen(false);
      }
    }
  };

  const handleUpload = async () => {
    if (croppedImage) {
      setUploading(true);
      try {
        const response = await fetch(croppedImage);
        const blob = await response.blob();
        const file = new File([blob], "cropped-image.png", {
          type: "image/png",
        });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", userId);

        const result = await uploadProfilePicture(formData);

        if (result.success && result.publicURL) {
          setProfilePicture(result.publicURL);
          setCroppedImage(null);
          setOriginalImage(null);
        } else {
          throw new Error(result.message || "Upload failed");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleReplace = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const cancelEdit = () => {
    setCroppedImage(null);
    setOriginalImage(null);
  };

  return (
    <TooltipProvider>
      <Card className="w-full h-full bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center">
            <User className="w-4 h-4 mr-2 text-gray-500" />
            <span>Profile Photo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[180px]">
            <div className="flex flex-col items-center justify-center p-4">
              <div className="relative mt-2">
                <div {...getRootProps()} className="cursor-pointer">
                  <input {...getInputProps()} />
                  {profilePicture || croppedImage ? (
                    <img
                      src={croppedImage || profilePicture!}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <Camera className="text-gray-400" size={32} />
                    </div>
                  )}
                </div>
                {profilePicture && !croppedImage && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleReplace}
                        className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md"
                        title="Replace picture"
                      >
                        <RefreshCw size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-0">
                      <p>Replace picture</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {croppedImage && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setDialogOpen(true)}
                        className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md"
                        title="Edit picture"
                      >
                        <Edit2 size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-0">
                      <p>Edit picture</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              {!profilePicture && !croppedImage && (
                <p className="text-sm text-gray-600 mt-2">
                  {isDragActive
                    ? "Drop the file here"
                    : "Click or drag to upload"}
                </p>
              )}
              {croppedImage && (
                <div className="mt-4 flex space-x-2">
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    variant="ghost"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                  <Button onClick={cancelEdit} variant="outline">
                    <X size={16} className="mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
          accept="image/*"
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Slide to zoom</DialogTitle>
            </DialogHeader>
            {originalImage && (
              <div className="w-full">
                <div className="relative h-64 w-full overflow-hidden rounded-lg">
                  <Cropper
                    image={originalImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700">Zoom</div>
                  <Slider
                    value={[zoom]}
                    min={1}
                    max={3}
                    step={0.1}
                    onValueChange={(value) => setZoom(value[0])}
                    className="mt-2"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCrop}>Crop</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </Card>
    </TooltipProvider>
  );
};

export default ProfilePictureUpload;