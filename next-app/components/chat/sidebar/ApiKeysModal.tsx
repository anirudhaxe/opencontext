"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Key, Check, Trash2, AlertTriangle } from "lucide-react";
import { trpc } from "@/trpc/client";

interface ApiKeysModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiKeysModal({ open, onOpenChange }: ApiKeysModalProps) {
  const [copied, setCopied] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const { data: apiKeyData, isLoading: isLoadingKey } =
    trpc.apiKey.getApiKey.useQuery(undefined, {
      enabled: open && !newlyCreatedKey,
    });

  const { mutate: createApiKey, isPending: isCreating } =
    trpc.apiKey.createApiKey.useMutation({
      onSuccess: async (data) => {
        if (data?.apiKey) {
          setNewlyCreatedKey(data.apiKey);
        }
        await utils.apiKey.getApiKey.invalidate();
      },
    });

  const { mutate: deleteApiKey, isPending: isDeleting } =
    trpc.apiKey.deleteApiKey.useMutation({
      onSuccess: async () => {
        await utils.apiKey.getApiKey.invalidate();
      },
    });

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateKey = () => {
    createApiKey();
  };

  const handleDeleteKey = () => {
    deleteApiKey(undefined, {
      onSuccess: () => {
        setNewlyCreatedKey(null);
      },
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setNewlyCreatedKey(null);
      setCopied(false);
    }
    onOpenChange(newOpen);
  };

  const hasApiKey = !!apiKeyData?.apiKeyDisplay;
  const hasNewlyCreatedKey = !!newlyCreatedKey;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys
          </DialogTitle>
          <DialogDescription>
            Manage your API keys for accessing OpenContext services
          </DialogDescription>
        </DialogHeader>

        {isLoadingKey || isCreating || isDeleting ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              <p className="text-sm text-muted-foreground">
                {isDeleting ? "Deleting API key..." : "Loading..."}
              </p>
            </div>
          </div>
        ) : hasNewlyCreatedKey ? (
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    API Key Created Successfully
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    This is the only time you&apos;ll see this key. Copy it now
                    and store it securely.
                  </p>
                </div>
              </div>
              <div className="bg-background rounded border p-3 flex items-center gap-2">
                <code className="flex-1 text-xs break-all font-mono">
                  {newlyCreatedKey}
                </code>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleCopyToClipboard(newlyCreatedKey)}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : hasApiKey ? (
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">API Key</span>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  {apiKeyData.apiKeyDisplay}
                </span>
              </div>
              {apiKeyData.createdAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-xs">
                    {new Date(apiKeyData.createdAt).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </span>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Lost Your API Key?
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    For security reasons, we cannot retrieve your full API key.
                    You&apos;ll need to delete this key and create a new one.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Key className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">No API Key Found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Create an API key to authenticate your requests to OpenContext
                services.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {hasNewlyCreatedKey ? (
            <Button
              className="cursor-pointer"
              onClick={() => {
                handleOpenChange(false);
                setNewlyCreatedKey(null);
              }}
            >
              Done
            </Button>
          ) : hasApiKey ? (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="flex-1 sm:flex-none cursor-pointer"
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteKey}
                disabled={isDeleting}
                className="flex-1 sm:flex-none cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Key
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleCreateKey}
              disabled={isCreating}
              className="w-full cursor-pointer"
            >
              <Key className="w-4 h-4 mr-2" />
              {isCreating ? "Creating..." : "Create API Key"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
