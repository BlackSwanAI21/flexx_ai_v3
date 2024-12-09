import React, { useState } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { Share2, Copy, Check } from 'lucide-react';
import { useAuth } from '../lib/auth-context';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentId: string;
}

export function ShareDialog({ isOpen, onClose, agentName }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const shareUrl = `${window.location.origin}/${user?.name}/${agentName.toLowerCase().replace(/\s+/g, '-')}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Share with Client">
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Share this link with your client to let them chat directly with {agentName}:
        </p>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 rounded-md border-gray-300 bg-gray-50 text-sm"
          />
          <Button
            onClick={handleCopy}
            type="button"
            className="inline-flex items-center px-3 py-2"
          >
            {copied ? (
              <Check className="h-4 w-4 text-white" />
            ) : (
              <Copy className="h-4 w-4 text-white" />
            )}
          </Button>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>Anyone with this link can chat with your AI agent.</p>
        </div>
      </div>
    </Dialog>
  );
}