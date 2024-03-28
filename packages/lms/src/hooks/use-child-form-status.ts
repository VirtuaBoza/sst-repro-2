import { useCallback, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

export function useChildFormStatus() {
  const [status, setStatus] = useState<ReturnType<typeof useFormStatus>>({
    action: null,
    data: null,
    method: null,
    pending: false,
  });
  const Listener = useCallback(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const currentStatus = useFormStatus();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      setStatus(currentStatus);
    }, [currentStatus]);
    return null;
  }, []);
  return { Listener, status };
}
