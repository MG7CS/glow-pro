import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RECRUITER_REF_STORAGE_KEY } from "@/lib/recruiterRef";

export default function JoinRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem(RECRUITER_REF_STORAGE_KEY, ref);
    }
    navigate("/register", { replace: true });
  }, [searchParams, navigate]);

  return null;
}
