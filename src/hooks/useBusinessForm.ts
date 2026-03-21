import { useState, useCallback } from "react";
import type { BizFormData } from "@/types/biz";
import { BIZ_FORM_INITIAL } from "@/types/biz";
import { useCreatebusiness } from "./useCreateShop";
import { useUpdatebusiness } from "./useUpdateShop";

interface UseBusinessFormOptions {
  initial?: BizFormData;
}

export const useBusinessForm = (options?: UseBusinessFormOptions) => {
  const [form, setForm] = useState<BizFormData>(options?.initial ?? BIZ_FORM_INITIAL);

  const { mutate: createBusiness, isPending: isCreating } = useCreatebusiness();
  const { mutate: updateBusiness, isPending: isUpdating } = useUpdatebusiness();

  const isNew = !form.id && !localStorage.getItem("biz_id");
  const isPending = isCreating || isUpdating;

  const update = useCallback(
    (patch: Partial<BizFormData>) => setForm((prev) => ({ ...prev, ...patch })),
    []
  );

  const save = useCallback(
    (callbacks?: { onSuccess?: () => void; onError?: () => void }) => {
      const businessId = form.id ?? localStorage.getItem("biz_id");

      if (businessId) {
        // useUpdatebusiness toasts AppSync errors + uses lazy GraphQL client after auth
        updateBusiness(
          { businessId, form },
          { onSuccess: callbacks?.onSuccess, onError: callbacks?.onError }
        );
      } else {
        // useCreatebusiness toasts errors; navigates on success
        createBusiness(form, {
          onSuccess: callbacks?.onSuccess,
          onError: callbacks?.onError,
        });
      }
    },
    [form, createBusiness, updateBusiness]
  );

  return { form, setForm, update, save, isNew, isPending };
};
