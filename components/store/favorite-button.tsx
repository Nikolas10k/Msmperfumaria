"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavoriteAction } from "@/lib/favorites/actions";

export function FavoriteButton({
  productId,
  initialFavorited,
  isAuthenticated,
}: {
  productId: string;
  initialFavorited: boolean;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!isAuthenticated) {
          router.push(`/entrar?proximo=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        startTransition(async () => {
          const result = await toggleFavoriteAction(productId);
          setFavorited(result.favorited);
          router.refresh();
        });
      }}
      className="flex items-center gap-2 text-sm text-text-secondary hover:text-rose"
    >
      <Heart size={18} className={favorited ? "fill-rose text-rose" : ""} />
      {favorited ? "Nos favoritos" : "Salvar nos favoritos"}
    </button>
  );
}
