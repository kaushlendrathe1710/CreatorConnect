import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import type { UploadResult } from "@uppy/core";
import AwsS3 from "@uppy/aws-s3";
import Dashboard from "@uppy/dashboard";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760,
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
      },
      autoProceed: false,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: onGetUploadParameters,
      })
      .on("complete", (result) => {
        onComplete?.(result);
        setShowModal(false);
      })
  );

  useEffect(() => {
    if (dashboardRef.current && showModal) {
      uppy.use(Dashboard, {
        target: dashboardRef.current,
        inline: true,
        proudlyDisplayPoweredByUppy: false,
      });
    }

    return () => {
      if (uppy.getPlugin("Dashboard")) {
        uppy.removePlugin(uppy.getPlugin("Dashboard")!);
      }
    };
  }, [showModal, uppy]);

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className={buttonClassName} data-testid="button-upload">
        {children}
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl">
          <div ref={dashboardRef} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
