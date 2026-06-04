"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./button";
import { IoCloudUploadOutline } from "react-icons/io5";
import Image from "next/image";
import { X } from "lucide-react";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setLoading(true);
      const file = acceptedFiles[0];
      
      // Simulate upload and get object URL for preview
      const fakeUrl = URL.createObjectURL(file);
      
      // In a real app, you would upload to Cloudinary / S3 here
      setTimeout(() => {
        onChange(fakeUrl);
        setLoading(false);
      }, 1000);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxFiles: 1,
  });

  if (value) {
    return (
      <div className="relative w-full h-48 border border-border rounded-lg overflow-hidden group">
        <Image src={value} alt="Uploaded" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button type="button" variant="destructive" size="sm" onClick={() => onChange(null)}>
            <X className="size-4 mr-1" /> Hapus
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
        isDragActive ? "border-accent bg-accent/5" : "border-muted-foreground/25 hover:border-accent/50 hover:bg-accent/5"
      }`}
    >
      <input {...getInputProps()} />
      <IoCloudUploadOutline className="size-8 text-muted-foreground mb-3" />
      <p className="text-sm font-medium text-foreground text-center">
        {isDragActive ? "Drop gambar di sini..." : "Drag & drop gambar, atau klik"}
      </p>
      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP maks 5MB</p>
      {loading && <p className="text-xs text-accent mt-2 animate-pulse">Mengupload...</p>}
    </div>
  );
}
