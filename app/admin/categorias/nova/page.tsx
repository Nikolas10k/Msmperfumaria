import type { Metadata } from "next";
import { CategoryForm } from "../category-form";

export const metadata: Metadata = { title: "Nova categoria" };

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif-display text-2xl text-text-primary">Nova categoria</h1>
      <CategoryForm />
    </div>
  );
}
