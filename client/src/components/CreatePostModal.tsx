import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "./ObjectUploader";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import type { UploadResult } from "@uppy/core";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostModal({ open, onOpenChange }: CreatePostModalProps) {
  const [caption, setCaption] = useState("");
  const [isSubscriberOnly, setIsSubscriberOnly] = useState(false);
  const [mediaURL, setMediaURL] = useState("");
  const [mediaPreview, setMediaPreview] = useState("");
  const { toast } = useToast();

  const createPostMutation = useMutation({
    mutationFn: async (data: { caption: string; mediaURL?: string; isSubscriberOnly: boolean }) => {
      const response = await apiRequest("POST", "/api/posts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post created",
        description: "Your post has been published successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/explore"] });
      setCaption("");
      setMediaURL("");
      setMediaPreview("");
      setIsSubscriberOnly(false);
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedURL = result.successful[0].uploadURL || "";
      
      // Store the raw upload URL - we'll set ACL when post is submitted
      setMediaURL(uploadedURL);
      setMediaPreview(uploadedURL);
      toast({
        title: "Upload complete",
        description: "Your image has been uploaded successfully. ACL will be set when you post.",
      });
    }
  };

  const handleSubmit = async () => {
    if (!caption.trim() && !mediaURL) {
      toast({
        title: "Error",
        description: "Please add a caption or upload an image.",
        variant: "destructive",
      });
      return;
    }

    let finalMediaURL = mediaURL;

    // Set ACL policy for uploaded media if there is one
    if (mediaURL) {
      try {
        const response = await apiRequest("PUT", "/api/objects/media", {
          mediaURL: mediaURL,
          isPublic: !isSubscriberOnly,
        });

        const data = await response.json();
        finalMediaURL = data.objectPath || mediaURL;
      } catch (error) {
        console.error("Error setting media ACL:", error);
        toast({
          title: "Error",
          description: "Failed to set media permissions. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    createPostMutation.mutate({
      caption: caption.trim(),
      mediaURL: finalMediaURL || undefined,
      isSubscriberOnly,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="modal-create-post">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Textarea
              placeholder="What's on your mind?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[100px]"
              data-testid="input-caption"
            />
          </div>

          {mediaPreview && (
            <div className="relative">
              <img
                src={mediaPreview}
                alt="Preview"
                className="w-full rounded-md"
                data-testid="img-preview"
              />
            </div>
          )}

          <div>
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={10485760}
              onGetUploadParameters={handleGetUploadParameters}
              onComplete={handleUploadComplete}
              buttonClassName="w-full"
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>{mediaURL ? "Change Image" : "Add Image"}</span>
              </div>
            </ObjectUploader>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="subscriber-only">Subscribers Only</Label>
              <p className="text-sm text-muted-foreground">
                Only your subscribers can see this post
              </p>
            </div>
            <Switch
              id="subscriber-only"
              checked={isSubscriberOnly}
              onCheckedChange={setIsSubscriberOnly}
              data-testid="switch-subscriber-only"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createPostMutation.isPending}
              className="flex-1"
              data-testid="button-submit-post"
            >
              {createPostMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
