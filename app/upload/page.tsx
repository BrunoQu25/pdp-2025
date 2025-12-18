'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { DRINK_POINTS } from '@/types';
import { clientLogger } from '@/lib/client-logger';

type DrinkSize = 'small' | 'medium' | 'large' | 'extra-large';

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<DrinkSize | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      clientLogger.action('File selected for upload', 'Upload', {
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        fileType: file.type
      });
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSize || !selectedFile) {
      clientLogger.warn('Submit attempt without size or file', 'Upload', { selectedSize, hasFile: !!selectedFile });
      alert('¡Por favor selecciona un tamaño de bebida y toma una foto!');
      return;
    }

    clientLogger.action('Starting drink upload', 'Upload', { size: selectedSize, points: DRINK_POINTS[selectedSize as keyof typeof DRINK_POINTS] });
    setIsUploading(true);

    try {
      // Upload photo to Azure
      const formData = new FormData();
      formData.append('file', selectedFile);

      clientLogger.apiCall('POST', '/api/upload', { fileSize: `${(selectedFile.size / 1024).toFixed(2)} KB` });
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        clientLogger.apiError('POST', '/api/upload', await uploadResponse.text());
        throw new Error('Failed to upload photo');
      }

      const { url: photoUrl } = await uploadResponse.json();
      clientLogger.apiSuccess('POST', '/api/upload', { photoUrl: photoUrl.substring(0, 50) + '...' });

      // Create drink record
      clientLogger.apiCall('POST', '/api/drinks', { size: selectedSize });
      const drinkResponse = await fetch('/api/drinks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          size: selectedSize,
          photoUrl
        })
      });

      if (!drinkResponse.ok) {
        clientLogger.apiError('POST', '/api/drinks', await drinkResponse.text());
        throw new Error('Failed to record drink');
      }

      const drink = await drinkResponse.json();
      clientLogger.apiSuccess('POST', '/api/drinks', { drinkId: drink.id, points: drink.points });

      // Success!
      clientLogger.info(`Drink uploaded successfully! ${DRINK_POINTS[selectedSize as keyof typeof DRINK_POINTS]} points earned`, 'Upload');
      setEarnedPoints(DRINK_POINTS[selectedSize as keyof typeof DRINK_POINTS]);
      setShowSuccessModal(true);
      setIsUploading(false);
      
      // Auto close modal and redirect after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        router.push('/');
      }, 3000);
    } catch (error) {
      clientLogger.error('Error uploading drink', 'Upload', error);
      alert('Error al subir la bebida. Por favor intenta de nuevo.');
      setIsUploading(false);
    }
  };

  const drinkSizes = [
    { value: 'Cervecita', label: 'Cervecita', emoji: '🍺', points: 1 },
    { value: 'Caipi/Daiki', label: 'Caipi/Daiki', emoji: '🍋🍓', points: 1.5 },
    { value: 'Cerveza', label: 'Cerveza', emoji: '🍻', points: 2 },
    { value: 'Trago', label: 'Trago', emoji: '🍸', points: 2 },
    { value: 'Loca Shot', label: 'Loca Shot', emoji: '☠️', points: 3 },
    { value: 'Triple Loca Shot', label: 'Triple Loca Shot', emoji: '☠️☠️☠️', points: 12 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-orange-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
            <span>📸</span>
            Sube tu Bebida
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Drink Size Selection */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Selecciona el Tamaño
              </label>
              <div className="grid grid-cols-2 gap-3">
                {drinkSizes.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => setSelectedSize(size.value as DrinkSize)}
                    className={`p-4 rounded-2xl border-2 transition-all shadow-sm ${
                      selectedSize === size.value
                        ? 'border-orange-400 bg-gradient-to-br from-blue-50 to-orange-50 shadow-lg scale-105'
                        : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{size.emoji}</div>
                    <div className="font-semibold text-gray-800">{size.label}</div>
                    <div className="text-sm text-orange-600 font-medium">
                      +{size.points} pts
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Toma una Foto de Prueba
              </label>

              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full rounded-2xl shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                    }}
                    className="absolute top-3 right-3 bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-orange-600 transition-colors shadow-lg"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="border-4 border-dashed border-gray-200 rounded-2xl p-12 text-center cursor-pointer hover:border-orange-300 hover:bg-gray-50 transition-colors bg-white">
                    <div className="text-6xl mb-4">📷</div>
                    <p className="text-lg font-medium text-gray-700">
                      Toca para tomar foto
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      ¡Muéstranos tu bebida!
                    </p>
                  </div>
                </label>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!selectedSize || !selectedFile || isUploading}
                className="flex-1 bg-gradient-to-r from-blue-500 via-orange-500 to-orange-600 text-white py-4 rounded-2xl font-semibold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Subiendo...
                  </span>
                ) : (
                  'Subir Bebida 🍺'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-in zoom-in-95 duration-300">
            {/* Animated Icon */}
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-orange-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <span className="text-5xl animate-bounce">🎉</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-orange-600 to-blue-600 bg-clip-text text-transparent mb-3">
              ¡Felicitaciones!
            </h2>

            {/* Message */}
            <p className="text-gray-600 text-lg mb-4">
              Tu bebida ha sido registrada exitosamente
            </p>

            {/* Points Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 via-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg mb-4">
              <span>+{earnedPoints}</span>
              <span className="text-2xl">🍺</span>
              <span>puntos</span>
            </div>

            {/* Auto-close indicator */}
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-2">
                Redirigiendo al inicio en 3 segundos...
              </p>
              <div className="flex gap-1 justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0ms]"></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:150ms]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:300ms]"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
