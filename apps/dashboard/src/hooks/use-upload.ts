import { createClient } from "@travelese/supabase/client";
import { upload } from "@travelese/supabase/storage";
import { useState } from "react";

export function useUpload() {
  const supabase = createClient();
  const [isLoading, setLoading] = useState(false);

  const uploadFile = async ({ file, path, bucket }) => {
    setLoading(true);

    const url = await upload(supabase, {
      path,
      file,
      bucket,
    });

    setLoading(false);

    return {
      url,
      path,
    };
  };

  return {
    uploadFile,
    isLoading,
  };
}
