
import * as React from 'react';
import { AlertCircle, UploadCloud, FileImage, X } from 'lucide-react';

interface GCashPaymentProps {
  totalAmount: number;
  orderNumber: string;
  receipt: File | null;
  onReceiptUpload: (file: File | null) => void;
}

const GCashPayment: React.FC<GCashPaymentProps> = ({
  totalAmount,
  orderNumber,
  receipt,
  onReceiptUpload,
}) => {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!receipt) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(receipt);
    setPreviewUrl(objectUrl);

    // Free memory when the component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [receipt]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onReceiptUpload(event.target.files[0]);
    }
     // Reset the input value to allow re-uploading the same file
    event.target.value = '';
  };

  const handleRemoveReceipt = () => {
    onReceiptUpload(null);
  };
  
  const triggerFileInput = () => {
    document.getElementById('receipt-upload')?.click();
  };


  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-4" role="alert">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Please scan the QR code, complete the payment, and upload a screenshot of your receipt.
            </p>
          </div>
        </div>
      </div>
      
      {/* QR Code Section */}
      <div className="text-center">
        <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-xl border-4 border-primary-600 bg-white p-4 shadow-lg">
           {/* Mock QR Pattern */}
          <div className="relative flex h-full w-full items-center justify-center bg-[radial-gradient(#1e1612_1px,transparent_1px),radial-gradient(#1e1612_1px,transparent_1px)] bg-[length:12px_12px] bg-[position:0_0,6px_6px]">
            <div className="bg-white p-2 font-mono text-sm font-bold text-coffee-900">{orderNumber}</div>
          </div>
        </div>
        <p className="mt-4 text-sm font-medium text-gray-600">Merchant: <span className="font-bold text-coffee-900">Rush Coffee</span></p>
        <p className="font-display text-3xl font-bold text-primary-600">₱{totalAmount.toFixed(2)}</p>
      </div>

       {/* File Upload Section */}
      <div className="mt-4">
        <input
            type="file"
            id="receipt-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
        />
        {!receipt ? (
            <label
                htmlFor="receipt-upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:bg-gray-100"
            >
                <UploadCloud className="h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm font-semibold text-gray-600">Upload Receipt</span>
                <span className="mt-1 block text-xs text-gray-500">PNG, JPG, GIF up to 10MB</span>
            </label>
        ) : (
             <div className="relative rounded-lg border border-gray-300 bg-white p-4">
                <div className="flex items-center gap-4">
                    {previewUrl ? (
                        <img src={previewUrl} alt="Receipt preview" className="h-16 w-16 flex-shrink-0 rounded-md object-cover" />
                    ) : (
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md bg-gray-100">
                            <FileImage className="h-8 w-8 text-gray-400" />
                        </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium text-gray-800">{receipt.name}</p>
                        <p className="text-xs text-gray-500">{(receipt.size / 1024).toFixed(2)} KB</p>
                    </div>
                </div>
                <button
                    onClick={handleRemoveReceipt}
                    className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white transition-transform hover:scale-110"
                    aria-label="Remove receipt"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default GCashPayment;